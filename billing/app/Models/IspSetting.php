<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class IspSetting extends Model
{
    protected $guarded = [];

    /**
     * Get the single settings instance (cached).
     */
    public static function instance(): self
    {
        return Cache::remember('isp_settings', 3600, function () {
            return static::first() ?? new static([
                'company_name' => 'RT/RW Net',
                'invoice_prefix' => 'INV',
                'due_day' => 10,
            ]);
        });
    }

    public static function clearCache(): void
    {
        Cache::forget('isp_settings');
    }
}
