<?php

namespace Tests\Feature\Api;

use App\Models\Router;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouterApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_all_routers()
    {
        $region = Region::create(['code' => 'REG1', 'name' => 'Region 1']);
        
        Router::create([
            'name' => 'Router A',
            'host' => '192.168.1.1',
            'api_username' => 'admin',
            'api_password' => 'secret',
            'api_port' => 8728,
            'status' => 'online',
            'region_id' => $region->id,
        ]);

        $response = $this->getJson('/api/routers');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['name' => 'Router A']);
    }

    public function test_can_create_a_router()
    {
        $region = Region::create(['code' => 'REG2', 'name' => 'Region 2']);

        $payload = [
            'name' => 'Router B',
            'host' => '10.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin123',
            'api_port' => 8728,
            'status' => 'online',
            'region_id' => $region->id,
        ];

        $response = $this->postJson('/api/routers', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Router B']);

        $this->assertDatabaseHas('routers', ['name' => 'Router B']);
    }

    public function test_can_update_a_router()
    {
        $router = Router::create([
            'name' => 'Router Old',
            'host' => '192.168.2.1',
            'api_username' => 'admin',
            'api_password' => 'oldpass',
            'api_port' => 8728,
            'status' => 'offline',
        ]);

        $payload = [
            'name' => 'Router New',
            'status' => 'online',
        ];

        $response = $this->putJson("/api/routers/{$router->id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Router New']);

        $this->assertDatabaseHas('routers', [
            'id' => $router->id,
            'name' => 'Router New',
            'status' => 'online',
        ]);
    }

    public function test_can_delete_a_router()
    {
        $router = Router::create([
            'name' => 'To Be Deleted',
            'host' => '192.168.3.1',
            'api_username' => 'admin',
            'api_password' => 'nopass',
            'api_port' => 8728,
            'status' => 'online',
        ]);

        $response = $this->deleteJson("/api/routers/{$router->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('routers', ['id' => $router->id]);
    }
}
