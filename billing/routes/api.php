<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==================== AUTH ====================
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!\Illuminate\Support\Facades\Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    $user = \Illuminate\Support\Facades\Auth::user();
    
    \App\Services\AuditService::log('login', 'Auth', "User {$user->email} logged in");

    return response()->json([
        'message' => 'Login berhasil',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ],
    ]);
});

Route::post('/logout', function (Request $request) {
    if ($request->hasSession()) {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
    if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
        $token = $request->user()->currentAccessToken();
        if ($token) $token->delete();
    }
    \Illuminate\Support\Facades\Auth::guard('web')->logout();
    return response()->json(['message' => 'Logged out']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ==================== FEATURE FLAGS ====================
use App\Http\Controllers\Api\FeatureFlagController;

Route::get('/features', [FeatureFlagController::class, 'index']);
Route::put('/features/{key}', [FeatureFlagController::class, 'update']);

// ==================== MODULE: AUTO SUSPEND ====================
use App\Http\Controllers\Api\AutoSuspendController;
Route::get('/auto-suspend/config', [AutoSuspendController::class, 'getConfig']);
Route::put('/auto-suspend/config', [AutoSuspendController::class, 'updateConfig']);
Route::get('/auto-suspend/logs', [AutoSuspendController::class, 'getLogs']);
Route::post('/auto-suspend/run', [AutoSuspendController::class, 'run']);

// ==================== MODULE: PAYMENT GATEWAY ====================
use App\Http\Controllers\Api\PaymentGatewayController;
Route::get('/payment-gateway/config', [PaymentGatewayController::class, 'getConfig']);
Route::put('/payment-gateway/config', [PaymentGatewayController::class, 'updateConfig']);
Route::get('/payment-gateway/transactions', [PaymentGatewayController::class, 'getTransactions']);

// ==================== MODULE: CLIENT PORTAL ====================
use App\Http\Controllers\Api\ClientPortalController;
Route::get('/client-portal/config', [ClientPortalController::class, 'getConfig']);
Route::put('/client-portal/config', [ClientPortalController::class, 'updateConfig']);
Route::get('/client-portal/stats', [ClientPortalController::class, 'getStats']);

// ==================== MODULE: NMS ====================
use App\Http\Controllers\Api\NmsController;
Route::get('/nms/devices', [NmsController::class, 'getDevices']);
Route::get('/nms/alerts', [NmsController::class, 'getAlerts']);
Route::post('/nms/check-status', [NmsController::class, 'checkStatus']);

// ==================== AUDIT LOGS ====================
use App\Http\Controllers\Api\AuditLogController;

Route::get('/audit-logs', [AuditLogController::class, 'index']);

// ==================== DATABASE BACKUP ====================
use App\Http\Controllers\Api\DatabaseBackupController;

Route::get('/backups', [DatabaseBackupController::class, 'index']);
Route::post('/backups', [DatabaseBackupController::class, 'create']);
Route::get('/backups/{filename}/download', [DatabaseBackupController::class, 'download']);
Route::delete('/backups/{filename}', [DatabaseBackupController::class, 'delete']);

// ==================== ISP SETTINGS ====================
use App\Http\Controllers\Api\IspSettingController;

Route::get('/settings/isp', [IspSettingController::class, 'show']);
Route::put('/settings/isp', [IspSettingController::class, 'update']);
Route::post('/settings/isp/logo', [IspSettingController::class, 'uploadLogo']);

// ==================== EXPORT CSV ====================
use App\Http\Controllers\Api\ExportController;

Route::get('/export/customers', [ExportController::class, 'customers']);
Route::get('/export/invoices', [ExportController::class, 'invoices']);

// ==================== INVOICE PDF ====================
use App\Http\Controllers\Api\InvoicePdfController;

Route::get('/invoices/{invoice}/pdf', [InvoicePdfController::class, 'download']);
Route::get('/invoices/{invoice}/pdf-preview', [InvoicePdfController::class, 'preview']);

// ==================== DASHBOARD ====================
use App\Http\Controllers\Api\DashboardController;

Route::get('/dashboard-summary', [DashboardController::class, 'index']);

// ==================== FORM OPTIONS ====================
use App\Http\Controllers\Api\FormOptionsController;

Route::get('/form-options', [FormOptionsController::class, 'getOptions']);

// ==================== DASHBOARD & STATS ====================
Route::get('/dashboard-summary', [DashboardController::class, 'index']);

// ==================== CUSTOMERS ====================
use App\Http\Controllers\Api\CustomerController;

Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::get('/customers/{customer}', [CustomerController::class, 'show']);
Route::put('/customers/{customer}', [CustomerController::class, 'update']);
Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

// ==================== INVOICES ====================
use App\Http\Controllers\Api\InvoiceController;

Route::get('/invoices', [InvoiceController::class, 'index']);
Route::post('/invoices/generate', [InvoiceController::class, 'generate']);
Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'pay']);
Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
Route::post('/invoices/{invoice}/remind', [InvoiceController::class, 'remind']);

// ==================== NETWORK & ROUTERS ====================
use App\Http\Controllers\Api\RouterController;

Route::get('/network/map', [\App\Http\Controllers\Api\MapController::class, 'getMapData']);

// ==================== GENIEACS (TR-069) ====================
use App\Http\Controllers\Api\AcsController;
Route::get('/acs/device/{customer_id}', [AcsController::class, 'status']);
Route::post('/acs/device/{customer_id}/reboot', [AcsController::class, 'reboot']);
Route::put('/acs/device/{customer_id}/wifi', [AcsController::class, 'updateWifi']);

Route::get('/routers', [RouterController::class, 'index']);
Route::post('/routers', [RouterController::class, 'store']);
Route::put('/routers/{router}', [RouterController::class, 'update']);
Route::delete('/routers/{router}', [RouterController::class, 'destroy']);

// ==================== PACKAGES ====================
use App\Http\Controllers\Api\PackageController;

Route::get('/packages', [PackageController::class, 'index']);
Route::post('/packages', [PackageController::class, 'store']);
Route::put('/packages/{package}', [PackageController::class, 'update']);
Route::delete('/packages/{package}', [PackageController::class, 'destroy']);

// ==================== REGIONS ====================
use App\Http\Controllers\Api\RegionController;

Route::get('/regions', [RegionController::class, 'index']);
Route::post('/regions', [RegionController::class, 'store']);
Route::put('/regions/{region}', [RegionController::class, 'update']);
Route::delete('/regions/{region}', [RegionController::class, 'destroy']);

// ==================== OLTs ====================
use App\Http\Controllers\Api\OltController;

Route::get('/olts', [OltController::class, 'index']);
Route::post('/olts', [OltController::class, 'store']);
Route::put('/olts/{olt}', [OltController::class, 'update']);
Route::delete('/olts/{olt}', [OltController::class, 'destroy']);

// ==================== DISTRIBUTION POINTS (ODP) ====================
use App\Http\Controllers\Api\DistributionPointController;

Route::get('/distribution-points', [DistributionPointController::class, 'index']);
Route::post('/distribution-points', [DistributionPointController::class, 'store']);
Route::put('/distribution-points/{dp}', [DistributionPointController::class, 'update']);
Route::delete('/distribution-points/{dp}', [DistributionPointController::class, 'destroy']);

// ==================== USERS ====================
use App\Http\Controllers\Api\UserController;

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);

// ==================== REPORTS ====================
use App\Http\Controllers\Api\ReportController;

Route::get('/reports', [ReportController::class, 'index']);

// ==================== SYNC MIKROTIK ====================
use App\Http\Controllers\Api\SyncController;

Route::post('/sync', [SyncController::class, 'process']);

// ==================== MONITOR MIKROTIK ====================
use App\Http\Controllers\Api\MonitorController;

Route::get('/monitor/{router}', [MonitorController::class, 'monitorRouter']);
Route::get('/monitor/customers/active', [MonitorController::class, 'getActiveSessionsAll']);

// ==================== INVENTORY (Core - Always Active) ====================
use App\Http\Controllers\Api\InventoryController;

Route::get('/inventory/summary', [InventoryController::class, 'summary']);
Route::get('/inventory/categories', [InventoryController::class, 'categoryIndex']);
Route::post('/inventory/categories', [InventoryController::class, 'categoryStore']);
Route::put('/inventory/categories/{category}', [InventoryController::class, 'categoryUpdate']);
Route::delete('/inventory/categories/{category}', [InventoryController::class, 'categoryDestroy']);
Route::get('/inventory/items', [InventoryController::class, 'itemIndex']);
Route::post('/inventory/items', [InventoryController::class, 'itemStore']);
Route::get('/inventory/items/{item}', [InventoryController::class, 'itemShow']);
Route::put('/inventory/items/{item}', [InventoryController::class, 'itemUpdate']);
Route::delete('/inventory/items/{item}', [InventoryController::class, 'itemDestroy']);
Route::post('/inventory/items/{item}/stock-in', [InventoryController::class, 'stockIn']);
Route::post('/inventory/items/{item}/stock-out', [InventoryController::class, 'stockOut']);
Route::get('/inventory/items/{item}/transactions', [InventoryController::class, 'itemTransactions']);

// ==================== TICKETING / HELPDESK (Optional - Feature Flag) ====================
use App\Http\Controllers\Api\TicketController;

Route::middleware('feature:ticketing')->group(function () {
    Route::get('/tickets/summary', [TicketController::class, 'summary']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::put('/tickets/{ticket}', [TicketController::class, 'update']);
    Route::delete('/tickets/{ticket}', [TicketController::class, 'destroy']);
    Route::post('/tickets/{ticket}/comments', [TicketController::class, 'addComment']);
});

// ==================== HOTSPOT VOUCHER (Optional - Feature Flag) ====================
use App\Http\Controllers\Api\HotspotController;

Route::middleware('feature:hotspot')->group(function () {
    Route::get('/hotspot/summary', [HotspotController::class, 'summary']);
    Route::get('/hotspot/profiles', [HotspotController::class, 'profileIndex']);
    Route::post('/hotspot/profiles', [HotspotController::class, 'profileStore']);
    Route::put('/hotspot/profiles/{profile}', [HotspotController::class, 'profileUpdate']);
    Route::delete('/hotspot/profiles/{profile}', [HotspotController::class, 'profileDestroy']);
    Route::get('/hotspot/vouchers', [HotspotController::class, 'voucherIndex']);
    Route::post('/hotspot/vouchers/generate', [HotspotController::class, 'generate']);
    Route::delete('/hotspot/vouchers/{voucher}', [HotspotController::class, 'voucherDestroy']);
});

// ==================== WHATSAPP (Optional - Feature Flag) ====================
use App\Http\Controllers\Api\WhatsAppController;

Route::middleware('feature:whatsapp')->group(function () {
    Route::get('/whatsapp/summary', [WhatsAppController::class, 'summary']);
    Route::get('/whatsapp/templates', [WhatsAppController::class, 'templateIndex']);
    Route::post('/whatsapp/templates', [WhatsAppController::class, 'templateStore']);
    Route::put('/whatsapp/templates/{template}', [WhatsAppController::class, 'templateUpdate']);
    Route::delete('/whatsapp/templates/{template}', [WhatsAppController::class, 'templateDestroy']);
    Route::post('/whatsapp/broadcast', [WhatsAppController::class, 'broadcast']);
    Route::get('/whatsapp/logs', [WhatsAppController::class, 'logs']);
});
// ==================== PORTAL PELANGGAN ====================
use App\Http\Controllers\Api\PortalAuthController;
Route::post('/portal/login', [PortalAuthController::class, 'login']);
Route::get('/portal/dashboard', [PortalAuthController::class, 'dashboard']);

// ==================== PAYMENT WEBHOOK ====================
use App\Http\Controllers\Api\PaymentWebhookController;
Route::post('/payment/webhook', [PaymentWebhookController::class, 'handle']);
