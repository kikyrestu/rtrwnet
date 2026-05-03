<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaTemplate extends Model
{
    protected $table = 'wa_templates';
    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function logs()
    {
        return $this->hasMany(WaBroadcastLog::class, 'template_id');
    }
}
