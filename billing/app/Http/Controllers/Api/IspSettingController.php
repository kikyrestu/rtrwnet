<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IspSetting;
use App\Services\AuditService;

class IspSettingController extends Controller
{
    public function show()
    {
        return response()->json(IspSetting::instance());
    }

    public function update(Request $request)
    {
        $setting = IspSetting::first();
        if (!$setting) {
            $setting = new IspSetting();
        }

        $oldValues = $setting->toArray();

        $setting->fill($request->only([
            'company_name', 'company_tagline', 'address', 'phone', 'email',
            'website', 'invoice_prefix', 'invoice_footer_note',
            'bank_name', 'bank_account_number', 'bank_account_name', 'due_day',
        ]));
        $setting->save();

        IspSetting::clearCache();

        AuditService::log('updated', 'Settings', 'Admin updated ISP profile and invoice settings', $oldValues, $setting->toArray());

        return response()->json($setting);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|max:2048']);

        $path = $request->file('logo')->store('logos', 'public');

        $setting = IspSetting::first();
        if ($setting) {
            $setting->update(['logo_path' => '/storage/' . $path]);
            IspSetting::clearCache();
        }

        return response()->json(['logo_path' => '/storage/' . $path]);
    }
}
