<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleConfig extends Model
{
    protected $guarded = [];

    /**
     * Get config array for a specific module
     */
    public static function getForModule($module, $defaults = [])
    {
        $configs = self::where('module', $module)->pluck('value', 'key')->toArray();
        return array_merge($defaults, $configs);
    }

    /**
     * Update configs for a specific module
     */
    public static function updateForModule($module, array $data)
    {
        foreach ($data as $key => $value) {
            self::updateOrCreate(
                ['module' => $module, 'key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }
    }
}
