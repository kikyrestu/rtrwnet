<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Services\GenieAcsService;

class AcsController extends Controller
{
    protected $acsService;

    public function __construct(GenieAcsService $acsService)
    {
        $this->acsService = $acsService;
    }

    private function getCustomerSn($customerId)
    {
        $customer = Customer::find($customerId);
        if (!$customer || !$customer->ont_sn) {
            return null;
        }
        return $customer->ont_sn;
    }

    public function status($customerId)
    {
        $sn = $this->getCustomerSn($customerId);
        if (!$sn) {
            return response()->json(['success' => false, 'message' => 'Perangkat ONT (SN) belum didaftarkan untuk pelanggan ini.'], 404);
        }

        $status = $this->acsService->getDeviceStatus($sn);
        return response()->json($status);
    }

    public function reboot($customerId)
    {
        $sn = $this->getCustomerSn($customerId);
        if (!$sn) {
            return response()->json(['success' => false, 'message' => 'Perangkat ONT (SN) belum didaftarkan untuk pelanggan ini.'], 404);
        }

        $result = $this->acsService->rebootDevice($sn);
        return response()->json($result);
    }

    public function updateWifi(Request $request, $customerId)
    {
        $request->validate([
            'ssid' => 'required|string|max:32',
            'password' => 'required|string|min:8'
        ]);

        $sn = $this->getCustomerSn($customerId);
        if (!$sn) {
            return response()->json(['success' => false, 'message' => 'Perangkat ONT (SN) belum didaftarkan untuk pelanggan ini.'], 404);
        }

        $result = $this->acsService->setWifiPassword($sn, $request->ssid, $request->password);
        return response()->json($result);
    }
}
