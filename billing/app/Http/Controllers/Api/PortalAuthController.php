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
}
