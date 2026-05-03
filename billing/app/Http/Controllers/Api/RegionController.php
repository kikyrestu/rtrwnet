<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Region;

class RegionController extends Controller
{
    public function index()
    {
        return response()->json(Region::withCount('customers')->get());
    }

    public function store(Request $request)
    {
        $region = Region::create($request->all());
        return response()->json($region, 201);
    }

    public function update(Request $request, Region $region)
    {
        $region->update($request->all());
        return response()->json($region);
    }

    public function destroy(Region $region)
    {
        $region->delete();
        return response()->json(['message' => 'Region deleted']);
    }
}
