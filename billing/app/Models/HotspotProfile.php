<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotspotProfile extends Model
{
    protected $guarded = [];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function router()
    {
        return $this->belongsTo(Router::class);
    }

    public function vouchers()
    {
        return $this->hasMany(HotspotVoucher::class, 'profile_id');
    }
}
