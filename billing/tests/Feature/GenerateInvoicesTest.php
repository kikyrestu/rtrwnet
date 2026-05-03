<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Router;
use App\Models\Invoice;
use Carbon\Carbon;

class GenerateInvoicesTest extends TestCase
{
    use RefreshDatabase;

    private function setupData()
    {
        $package = Package::create([
            'name' => '10 Mbps',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => '10M_Profile'
        ]);

        $router = Router::create([
            'name' => 'Main Router',
            'host' => '127.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin'
        ]);

        Customer::create([
            'name' => 'Active Customer',
            'mikrotik_username' => 'active_cust',
            'mikrotik_password' => 'pass',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'status' => 'active'
        ]);

        Customer::create([
            'name' => 'Inactive Customer',
            'mikrotik_username' => 'inactive_cust',
            'mikrotik_password' => 'pass',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'status' => 'inactive'
        ]);
    }

    public function test_generates_invoices_for_active_customers_only()
    {
        $this->setupData();
        
        $currentPeriod = Carbon::now()->format('Y-m');

        // Assert 0 invoices before running
        $this->assertEquals(0, Invoice::count());

        $this->artisan('billing:generate-invoices')
             ->expectsOutputToContain("Generated 1 new invoices. Skipped 0 duplicates.")
             ->assertExitCode(0);

        // Assert 1 invoice created for active customer
        $this->assertEquals(1, Invoice::count());
        $invoice = Invoice::first();
        
        $this->assertEquals(150000, $invoice->amount);
        $this->assertEquals('unpaid', $invoice->status);
        $this->assertEquals($currentPeriod, $invoice->billing_period);
    }

    public function test_does_not_create_duplicate_invoices()
    {
        $this->setupData();

        // Run first time
        $this->artisan('billing:generate-invoices');
        $this->assertEquals(1, Invoice::count());

        // Run second time in the same month
        $this->artisan('billing:generate-invoices')
             ->expectsOutputToContain("Generated 0 new invoices. Skipped 1 duplicates.")
             ->assertExitCode(0);

        // Assert still 1 invoice
        $this->assertEquals(1, Invoice::count());
    }
}
