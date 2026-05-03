<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Olt;

class OltController extends Controller
{
    public function index()
    {
        return response()->json(Olt::with(['region', 'router'])->withCount('distributionPoints')->get());
    }

    public function store(Request $request)
    {
        $olt = Olt::create($request->all());
        return response()->json($olt->load(['region', 'router']), 201);
    }

    public function update(Request $request, Olt $olt)
    {
        $olt->update($request->all());
        return response()->json($olt->load(['region', 'router']));
    }

    public function destroy(Olt $olt)
    {
        $olt->delete();
        return response()->json(['message' => 'OLT deleted']);
    }
}
