<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FeatureFlag extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_enabled' => 'boolean',
        'config' => 'array',
    ];

    /**
     * Check if a feature is enabled.
     * Cached for 60 seconds to avoid repeated DB queries.
     */
    public static function isEnabled(string $key): bool
    {
        return Cache::remember("feature_flag_{$key}", 60, function () use ($key) {
            $flag = static::where('key', $key)->first();
            return $flag ? $flag->is_enabled : false;
        });
    }

    /**
     * Get feature config.
     * Cached for 60 seconds.
     */
    public static function getConfig(string $key): array
    {
        return Cache::remember("feature_config_{$key}", 60, function () use ($key) {
            $flag = static::where('key', $key)->first();
            return $flag && $flag->config ? $flag->config : [];
        });
    }

    /**
     * Clear cache when a feature flag is updated.
     */
    public static function clearCache(string $key): void
    {
        Cache::forget("feature_flag_{$key}");
        Cache::forget("feature_config_{$key}");
    }
}
