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
     * Toggle a feature flag ON/OFF or update its config.
     */
    public function update(Request $request, string $key)
    {
        $flag = FeatureFlag::where('key', $key)->firstOrFail();
        $oldState = $flag->is_enabled;

        $request->validate([
            'is_enabled' => 'sometimes|boolean',
            'config' => 'sometimes|array',
        ]);

        $updates = [];
        if ($request->has('is_enabled')) {
            $updates['is_enabled'] = $request->is_enabled;
        }
        if ($request->has('config')) {
            $updates['config'] = $request->config;
        }

        $flag->update($updates);
        FeatureFlag::clearCache($key);

        if ($request->has('is_enabled')) {
            $action = $request->is_enabled ? 'enabled' : 'disabled';
            AuditService::log('updated', 'Settings', "Admin {$action} feature module: {$flag->name}");
            $message = $flag->name . ($flag->is_enabled ? ' diaktifkan.' : ' dinonaktifkan.');
        } else {
            AuditService::log('updated', 'Settings', "Admin updated config for feature module: {$flag->name}");
            $message = "Pengaturan {$flag->name} berhasil disimpan.";
        }

        return response()->json([
            'message' => $message,
            'feature' => $flag,
        ]);
    }
}
