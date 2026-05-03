<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Package;
use App\Jobs\SyncPackageJob;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(Package::all());
    }

    public function store(Request $request)
    {
        $package = Package::create($request->all());
        SyncPackageJob::dispatch($package, 'add');
        return response()->json($package, 201);
    }

    public function update(Request $request, Package $package)
    {
        $oldProfileName = $package->mikrotik_profile_name;
        $oldData = $package->toArray();
        $package->update($request->all());
        
        \App\Services\AuditService::log(
            'update', 
            'Package', 
            "Package {$package->name} updated", 
            $oldData, 
            $package->toArray()
        );

        SyncPackageJob::dispatch($package, 'set', $oldProfileName);
        return response()->json($package);
    }

    public function destroy(Package $package)
    {
        SyncPackageJob::dispatch($package, 'remove');
        $package->delete();
        return response()->json(['message' => 'Package deleted']);
    }
}
