<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $guarded = [];

    public function olts() {
        return $this->hasMany(Olt::class);
    }

    public function routers() {
        return $this->hasMany(Router::class);
    }

    public function customers() {
        return $this->hasMany(Customer::class);
    }
}
