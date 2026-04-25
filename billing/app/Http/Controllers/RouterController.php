<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Router;

class RouterController extends Controller
{
    public function index() { return view('routers.index', ['routers' => Router::all()]); }
    public function create() { return view('routers.create'); }
    public function store(Request $request) { Router::create($request->all()); return redirect()->route('routers.index'); }
    public function show(Router $router) {}
    public function edit(Router $router) { return view('routers.edit', compact('router')); }
    public function update(Request $request, Router $router) { $router->update($request->all()); return redirect()->route('routers.index'); }
    public function destroy(Router $router) { $router->delete(); return redirect()->route('routers.index'); }
}
