<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DistributionPoint;

class DistributionPointController extends Controller
{
    public function index()
    {
        return response()->json(DistributionPoint::with('olt')->get());
    }

    public function store(Request $request)
    {
        $dp = DistributionPoint::create($request->all());
        return response()->json($dp->load('olt'), 201);
    }

    public function update(Request $request, DistributionPoint $dp)
    {
        $dp->update($request->all());
        return response()->json($dp->load('olt'));
    }

    public function destroy(DistributionPoint $dp)
    {
        $dp->delete();
        return response()->json(['message' => 'Distribution Point deleted']);
    }
}
