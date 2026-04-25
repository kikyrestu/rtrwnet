<?php
namespace App\Http\Controllers;
use App\Models\{DistributionPoint, Olt};
use Illuminate\Http\Request;
class DistributionPointController extends Controller {
 public function index() { return view("distribution_points.index", ["data" => DistributionPoint::with("olt.region")->get()]); }
 public function create() { return view("distribution_points.create", ["olts" => Olt::with("region")->get()]); }
 public function store(Request $request) { DistributionPoint::create($request->all()); return redirect()->route("distribution_points.index"); }
 public function edit(DistributionPoint $distribution_point) { return view("distribution_points.edit", ["data" => $distribution_point, "olts" => Olt::with("region")->get()]); }
 public function update(Request $request, DistributionPoint $distribution_point) { $distribution_point->update($request->all()); return redirect()->route("distribution_points.index"); }
 public function destroy(DistributionPoint $distribution_point) { $distribution_point->delete(); return redirect()->route("distribution_points.index"); }
}