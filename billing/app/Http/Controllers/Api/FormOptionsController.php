<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Router;
use App\Models\DistributionPoint;

class FormOptionsController extends Controller
{
    public function getOptions()
    {
        return response()->json([
            'packages' => Package::select('id', 'name', 'price')->get(),
            'routers' => Router::select('id', 'name')->get(),
            'dps' => DistributionPoint::select('id', 'name')->get()
        ]);
    }
}
