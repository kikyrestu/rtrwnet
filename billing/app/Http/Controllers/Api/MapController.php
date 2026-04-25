<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DistributionPoint;
use App\Models\Customer;

class MapController extends Controller
{
    public function getMapData()
    {
        $distributionPoints = DistributionPoint::all();
        $customers = Customer::whereNotNull('latitude')->whereNotNull('longitude')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'odps' => $distributionPoints,
                'customers' => $customers
            ]
        ]);
    }
}
