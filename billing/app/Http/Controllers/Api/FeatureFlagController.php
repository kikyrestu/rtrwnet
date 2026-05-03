<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FeatureFlag;
use App\Services\AuditService;

class FeatureFlagController extends Controller
{
    /**
     * List all feature flags.
     */
    public function index()
    {
        return response()->json(FeatureFlag::orderBy('category')->orderBy('name')->get());
    }

    /**
     * Toggle a feature flag ON/OFF.
     */
    public function update(Request $request, string $key)
    {
        $flag = FeatureFlag::where('key', $key)->firstOrFail();
        $oldState = $flag->is_enabled;

        $request->validate([
            'is_enabled' => 'required|boolean',
        ]);

        $flag->update(['is_enabled' => $request->is_enabled]);
        FeatureFlag::clearCache($key);

        $action = $request->is_enabled ? 'enabled' : 'disabled';
        AuditService::log('updated', 'Settings', "Admin {$action} feature module: {$flag->name}");

        return response()->json([
            'message' => $flag->name . ($flag->is_enabled ? ' diaktifkan.' : ' dinonaktifkan.'),
            'feature' => $flag,
        ]);
    }
}
