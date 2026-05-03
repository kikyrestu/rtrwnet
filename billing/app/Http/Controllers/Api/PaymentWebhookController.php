<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Dalam implementasi nyata, ini adalah payload dari Tripay/Midtrans.
        // Kita simulasikan dengan standar umum payload webhook:
        // {
        //    "reference": "T12345",
        //    "merchant_ref": "INV-123",
        //    "status": "PAID",
        //    "amount": 150000
        // }

        $payload = $request->all();

        // 1. Validasi Signature
        $signature = $request->header('X-Callback-Signature');
        $secretKey = env('PAYMENT_WEBHOOK_SECRET', 'dummy_secret_key');
        
        $expectedSignature = hash_hmac('sha256', json_encode($payload), $secretKey);
        
        if ($signature !== $expectedSignature) {
            Log::warning('Payment Webhook Failed: Invalid Signature', ['payload' => $payload, 'sig' => $signature]);
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 401);
        }
        
        Log::info('Payment Webhook Received', $payload);

        if (!isset($payload['merchant_ref']) || !isset($payload['status'])) {
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 400);
        }

        if ($payload['status'] !== 'PAID') {
            return response()->json(['success' => true, 'message' => 'Ignored, status not PAID']);
        }

        $invoiceIdStr = str_replace('INV-', '', $payload['merchant_ref']);
        $invoiceId = (int)$invoiceIdStr;

        $invoice = Invoice::find($invoiceId);
        
        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'Invoice not found'], 404);
        }

        if ($invoice->status === 'paid') {
            return response()->json(['success' => true, 'message' => 'Invoice already paid']);
        }

        // Update Invoice status
        $invoice->status = 'paid';
        $invoice->paid_at = now();
        $invoice->save();

        // Catat di tabel payments
        Payment::create([
            'invoice_id' => $invoice->id,
            'amount_paid' => $payload['amount'] ?? $invoice->amount,
            'payment_method' => $payload['payment_method'] ?? 'Payment Gateway',
            'verified_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Payment processed successfully']);
    }
}
