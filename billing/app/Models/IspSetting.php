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
        $attributes = Cache::remember('isp_settings_attrs', 3600, function () {
            $setting = static::first();
            return $setting ? $setting->getAttributes() : [
                'company_name' => 'RT/RW Net',
                'invoice_prefix' => 'INV',
                'due_day' => 10,
            ];
        });

        $model = new static();
        $model->setRawAttributes($attributes, true);
        $model->exists = isset($attributes['id']);
        return $model;
    }

    public static function clearCache(): void
    {
        Cache::forget('isp_settings_attrs');
        Cache::forget('isp_settings'); // legacy cleanup
    }
}
