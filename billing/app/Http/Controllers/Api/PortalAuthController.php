<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Invoice;

class PortalAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'customer_id' => 'required',
            'password' => 'required'
        ]);

        // Simulasikan validasi ID: misal CUST-001 berarti ID 1.
        $id = str_replace('CUST-', '', $request->customer_id);
        $customer = Customer::find((int)$id);

        if (!$customer || $request->password !== 'pass') {
            return response()->json(['message' => 'ID Pelanggan atau Password salah.'], 401);
        }

        return response()->json([
            'message' => 'Login berhasil',
            'customer' => $customer,
            'token' => 'mock-token-'.$customer->id
        ]);
    }

    public function dashboard(Request $request)
    {
        // Dalam implementasi nyata, ID didapat dari middleware auth token (Sanctum/JWT)
        $customerId = $request->query('customer_id');
        
        $customer = Customer::with('package')->find($customerId);
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $currentInvoice = Invoice::where('customer_id', $customerId)
            ->whereIn('status', ['unpaid', 'overdue'])
            ->latest()
            ->first();

        $history = Invoice::where('customer_id', $customerId)
            ->where('status', 'paid')
            ->latest('paid_at')
            ->take(5)
            ->get();

        return response()->json([
            'customer' => [
                'id' => 'CUST-' . str_pad($customer->id, 3, '0', STR_PAD_LEFT),
                'name' => $customer->name,
                'status' => $customer->status,
                'package' => $customer->package ? $customer->package->name : 'Unknown',
                'address' => $customer->address,
            ],
            'current_invoice' => $currentInvoice,
            'history' => $history
        ]);
    }
    public function packages()
    {
        $packages = \App\Models\Package::where('is_visible', true)
            ->orderBy('price', 'asc')
            ->get();
            
        return response()->json(['packages' => $packages]);
    }

    public function requestUpgrade(Request $request)
    {
        $request->validate([
            'customer_id' => 'required',
            'package_id' => 'required|exists:packages,id'
        ]);

        $customerId = str_replace('CUST-', '', $request->customer_id);
        $customer = Customer::find((int)$customerId);
        $targetPackage = \App\Models\Package::find($request->package_id);

        if (!$customer || !$targetPackage) {
            return response()->json(['message' => 'Data tidak valid'], 400);
        }

        // Create a ticket
        $ticket = \App\Models\Ticket::create([
            'customer_id' => $customer->id,
            'ticket_number' => 'TKT-' . date('Ymd') . '-' . rand(1000, 9999),
            'subject' => 'Permintaan Upgrade: ' . $targetPackage->name,
            'description' => "Pelanggan meminta upgrade/perubahan paket ke {$targetPackage->name} (Rp " . number_format($targetPackage->price, 0, ',', '.') . ").\nMohon segera di-follow up untuk penyesuaian billing dan mikrotik.",
            'category' => 'permintaan',
            'priority' => 'medium',
            'status' => 'open'
        ]);

        return response()->json([
            'message' => 'Permintaan upgrade berhasil dikirim. Tim kami akan segera menghubungi Anda.',
            'ticket' => $ticket
        ]);
    }
}
