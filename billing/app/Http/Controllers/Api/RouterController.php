<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Router;

class RouterController extends Controller
{
    public function index()
    {
        return response()->json(Router::with('region')->get());
    }

    public function store(Request $request)
    {
        $router = Router::create($request->all());
        return response()->json($router, 201);
    }

    public function update(Request $request, Router $router)
    {
        $router->update($request->all());
        return response()->json($router);
    }

    public function destroy(Router $router)
    {
        $router->delete();
        return response()->json(['message' => 'Router deleted']);
    }
}
