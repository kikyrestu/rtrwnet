<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistributionPoint extends Model
{
    protected $guarded = [];

    public function olt() {
        return $this->belongsTo(Olt::class);
    }

    public function customers() {
        return $this->hasMany(Customer::class);
    }
}
