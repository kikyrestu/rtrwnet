<?php
namespace App\Http\Controllers;
use App\Models\{Olt, Region, Router};
use Illuminate\Http\Request;
class OltController extends Controller {
 public function index() { return view("olts.index", ["data" => Olt::with(["region", "router"])->get()]); }
 public function create() { return view("olts.create", ["regions" => Region::all(), "routers" => Router::all()]); }
 public function store(Request $request) { Olt::create($request->all()); return redirect()->route("olts.index"); }
 public function edit(Olt $olt) { return view("olts.edit", ["data" => $olt, "regions" => Region::all(), "routers" => Router::all()]); }
 public function update(Request $request, Olt $olt) { $olt->update($request->all()); return redirect()->route("olts.index"); }
 public function destroy(Olt $olt) { $olt->delete(); return redirect()->route("olts.index"); }
}