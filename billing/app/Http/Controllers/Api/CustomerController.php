<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Jobs\SyncCustomerJob;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with(['package', 'router', 'dp', 'region']);
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('mikrotik_username', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $customer = Customer::create($request->all());
        SyncCustomerJob::dispatch($customer, 'add');
        return response()->json($customer->load(['package', 'router', 'dp']), 201);
    }

    public function show(Customer $customer)
    {
        return response()->json($customer->load(['package', 'router', 'dp', 'region', 'invoices']));
    }

    public function update(Request $request, Customer $customer)
    {
        $oldUsername = $customer->mikrotik_username;
        $customer->update($request->all());
        $customer->load('package', 'router');
        SyncCustomerJob::dispatch($customer, 'set', $oldUsername);
        return response()->json($customer->load(['package', 'router', 'dp']));
    }

    public function destroy(Customer $customer)
    {
        SyncCustomerJob::dispatch($customer, 'remove');
        $customer->delete();
        return response()->json(['message' => 'Customer deleted']);
    }
}
