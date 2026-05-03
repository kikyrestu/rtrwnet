<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotspotVoucher extends Model
{
    protected $guarded = [];

    protected $casts = [
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function profile()
    {
        return $this->belongsTo(HotspotProfile::class, 'profile_id');
    }

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
