<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Router;
use App\Models\AuditLog; // Can reuse audit log or a dedicated NmsAlert table. Assuming NMS controller creates AuditLog for now.

class NmsAlertTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create system user
        \App\Models\User::create([
            'id' => 1,
            'name' => 'System',
            'email' => 'system@local',
            'password' => bcrypt('password')
        ]);
    }

    public function test_device_down_creates_critical_alert()
    {
        // Setup Router
        $router = Router::create([
            'name' => 'Main Router',
            'host' => '127.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin',
            'status' => 'online'
        ]);

        // Mock ping service directly in test by binding a closure or mock object
        $this->instance(\App\Services\PingService::class, \Mockery::mock(\App\Services\PingService::class, function ($mock) {
            $mock->shouldReceive('ping')->andReturn(false); // Simulate offline
        }));

        // Execute NMS check endpoint
        $response = $this->postJson('/api/nms/check-status');

        $response->assertStatus(200);

        // Assert Router status changed to offline
        $this->assertDatabaseHas('routers', [
            'id' => $router->id,
            'status' => 'offline'
        ]);

        // Assert Alert was created
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'nms_alert',
            'description' => "Device Main Router is DOWN (Offline)."
        ]);
    }

    public function test_device_recovery_creates_info_alert()
    {
        // Setup Router initially offline
        $router = Router::create([
            'name' => 'Main Router',
            'host' => '127.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin',
            'status' => 'offline'
        ]);

        // Simulate online
        $this->instance(\App\Services\PingService::class, \Mockery::mock(\App\Services\PingService::class, function ($mock) {
            $mock->shouldReceive('ping')->andReturn(true); 
        }));

        $this->postJson('/api/nms/check-status');

        // Assert Router status changed to online
        $this->assertDatabaseHas('routers', [
            'id' => $router->id,
            'status' => 'online'
        ]);

        // Assert Alert was created
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'nms_alert',
            'description' => "Device Main Router RECOVERED (Online)."
        ]);
    }
}
