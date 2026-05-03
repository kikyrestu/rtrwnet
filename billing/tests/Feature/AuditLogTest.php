<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Package;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_package_price_creates_audit_log()
    {
        $user = User::factory()->create();

        $package = Package::create([
            'name' => '10 Mbps',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => '10M_Profile'
        ]);

        $response = $this->actingAs($user)->putJson("/api/packages/{$package->id}", [
            'name' => '10 Mbps',
            'price' => 200000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => '10M_Profile'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'update',
            // Ideally we would assert the description contains 'Package 10 Mbps' or similar
        ]);
    }
}
