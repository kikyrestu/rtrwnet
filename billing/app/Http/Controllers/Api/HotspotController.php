<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HotspotProfile;
use App\Models\HotspotVoucher;
use Illuminate\Support\Str;

class HotspotController extends Controller
{
    // ==================== PROFILES ====================

    public function profileIndex()
    {
        return response()->json(
            HotspotProfile::with('router')->withCount('vouchers')->get()
        );
    }

    public function profileStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'router_id' => 'nullable|exists:routers,id',
            'rate_limit' => 'nullable|string',
            'shared_users' => 'integer|min:1',
            'price' => 'numeric|min:0',
            'validity_hours' => 'integer|min:1',
        ]);

        $profile = HotspotProfile::create($request->all());
        return response()->json($profile->load('router'), 201);
    }

    public function profileUpdate(Request $request, HotspotProfile $profile)
    {
        $profile->update($request->all());
        return response()->json($profile->load('router'));
    }

    public function profileDestroy(HotspotProfile $profile)
    {
        $profile->delete();
        return response()->json(['message' => 'Profil hotspot berhasil dihapus.']);
    }

    // ==================== VOUCHERS ====================

    public function voucherIndex(Request $request)
    {
        $query = HotspotVoucher::with(['profile', 'generator']);

        if ($request->has('profile_id') && $request->profile_id) {
            $query->where('profile_id', $request->profile_id);
        }
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    public function generate(Request $request)
    {
        $request->validate([
            'profile_id' => 'required|exists:hotspot_profiles,id',
            'quantity' => 'required|integer|min:1|max:100',
            'prefix' => 'nullable|string|max:10',
        ]);

        $profile = HotspotProfile::findOrFail($request->profile_id);
        $prefix = $request->prefix ?: 'HS';
        $vouchers = [];

        for ($i = 0; $i < $request->quantity; $i++) {
            $code = strtoupper($prefix . '-' . Str::random(3) . '-' . Str::random(3));
            $username = 'hs_' . strtolower(Str::random(8));
            $password = strtolower(Str::random(6));

            $vouchers[] = HotspotVoucher::create([
                'profile_id' => $profile->id,
                'code' => $code,
                'username' => $username,
                'password' => $password,
                'status' => 'unused',
                'generated_by' => auth()->id(),
            ]);
        }

        return response()->json([
            'message' => "Berhasil generate {$request->quantity} voucher.",
            'vouchers' => HotspotVoucher::with('profile')
                ->whereIn('id', collect($vouchers)->pluck('id'))
                ->get(),
        ], 201);
    }

    public function voucherDestroy(HotspotVoucher $voucher)
    {
        $voucher->delete();
        return response()->json(['message' => 'Voucher berhasil dihapus.']);
    }

    public function summary()
    {
        return response()->json([
            'total_profiles' => HotspotProfile::count(),
            'total_vouchers' => HotspotVoucher::count(),
            'unused' => HotspotVoucher::where('status', 'unused')->count(),
            'active' => HotspotVoucher::where('status', 'active')->count(),
            'used' => HotspotVoucher::where('status', 'used')->count(),
        ]);
    }
}
