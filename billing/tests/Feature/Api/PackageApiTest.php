<?php

namespace Tests\Feature\Api;

use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SyncPackageJob;
use Tests\TestCase;

class PackageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake(); // Prevent actual mikrotik sync during API tests
    }

    public function test_can_list_all_packages()
    {
        Package::create(['name' => 'Paket A', 'price' => 100000, 'rate_limit' => '10M/10M', 'mikrotik_profile_name' => 'paket-a']);
        Package::create(['name' => 'Paket B', 'price' => 150000, 'rate_limit' => '20M/20M', 'mikrotik_profile_name' => 'paket-b']);
        Package::create(['name' => 'Paket C', 'price' => 200000, 'rate_limit' => '30M/30M', 'mikrotik_profile_name' => 'paket-c']);

        $response = $this->getJson('/api/packages');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_a_package()
    {
        $payload = [
            'name' => 'Premium Plan',
            'price' => 250000,
            'rate_limit' => '20M/20M',
            'mikrotik_profile_name' => 'premium'
        ];

        $response = $this->postJson('/api/packages', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Premium Plan']);

        $this->assertDatabaseHas('packages', ['name' => 'Premium Plan']);
        Queue::assertPushed(SyncPackageJob::class);
    }

    public function test_can_update_a_package()
    {
        $package = Package::create([
            'name' => 'Standard Plan',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => 'standard'
        ]);

        $payload = [
            'name' => 'Standard Plan Pro',
            'price' => 175000,
            'rate_limit' => '20M/20M',
            'mikrotik_profile_name' => 'standard-pro'
        ];

        $response = $this->putJson("/api/packages/{$package->id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Standard Plan Pro']);

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'name' => 'Standard Plan Pro',
            'price' => 175000
        ]);
        
        Queue::assertPushed(SyncPackageJob::class);
        $this->assertDatabaseHas('audit_logs', ['action' => 'update', 'module' => 'Package']);
    }

    public function test_can_delete_a_package()
    {
        $package = Package::create([
            'name' => 'To Be Deleted',
            'price' => 50000,
            'rate_limit' => '5M/5M',
            'mikrotik_profile_name' => 'delete-me'
        ]);

        $response = $this->deleteJson("/api/packages/{$package->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('packages', ['id' => $package->id]);
        
        Queue::assertPushed(SyncPackageJob::class);
    }
}
