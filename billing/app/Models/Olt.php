<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Olt extends Model
{
    protected $guarded = [];

    public function region() {
        return $this->belongsTo(Region::class);
    }
    
    public function router() {
        return $this->belongsTo(Router::class);
    }

    public function distributionPoints() {
        return $this->hasMany(DistributionPoint::class);
    }
}
