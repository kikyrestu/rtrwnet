<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = [];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function router()
    {
        return $this->belongsTo(Router::class);
    }

    public function dp()
    {
        return $this->belongsTo(DistributionPoint::class, 'distribution_point_id');
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
