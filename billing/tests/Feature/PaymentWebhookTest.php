<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Invoice;
use App\Models\Customer;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    private function generateSignature($payload)
    {
        return hash_hmac('sha256', json_encode($payload), 'dummy_secret_key');
    }

    public function test_webhook_successfully_processes_valid_payment(): void
    {
        // Setup
        $package = \App\Models\Package::create([
            'name' => 'Test Package',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => 'profile1'
        ]);

        $router = \App\Models\Router::create([
            'name' => 'Test Router',
            'host' => '127.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin',
            'api_port' => 8728
        ]);

        $customer = Customer::create([
            'id' => 1,
            'name' => 'Test Customer',
            'mikrotik_username' => 'testuser',
            'mikrotik_password' => 'testpass',
            'package_id' => $package->id,
            'router_id' => $router->id,
        ]);

        $invoice = Invoice::create([
            'id' => 123,
            'customer_id' => $customer->id,
            'amount' => 150000,
            'status' => 'unpaid',
            'billing_period' => '2026-05',
            'due_date' => '2026-05-10',
        ]);

        $payload = [
            'reference' => 'T12345',
            'merchant_ref' => 'INV-123',
            'status' => 'PAID',
            'amount' => 150000
        ];

        $signature = $this->generateSignature($payload);

        // Act
        $response = $this->postJson('/api/payment/webhook', $payload, [
            'X-Callback-Signature' => $signature
        ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJson(['success' => true, 'message' => 'Payment processed successfully']);

        $this->assertDatabaseHas('invoices', [
            'id' => 123,
            'status' => 'paid'
        ]);

        $this->assertDatabaseHas('payments', [
            'invoice_id' => 123,
            'amount_paid' => 150000
        ]);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = [
            'reference' => 'T12345',
            'merchant_ref' => 'INV-123',
            'status' => 'PAID',
            'amount' => 150000
        ];

        // Act with wrong signature
        $response = $this->postJson('/api/payment/webhook', $payload, [
            'X-Callback-Signature' => 'invalid-signature-123'
        ]);

        // Assert
        $response->assertStatus(401)
                 ->assertJson(['success' => false, 'message' => 'Invalid signature']);
    }
}
