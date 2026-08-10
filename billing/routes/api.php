<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FeatureFlagController;
use App\Http\Controllers\Api\AutoSuspendController;
use App\Http\Controllers\Api\PaymentGatewayController;
use App\Http\Controllers\Api\ClientPortalController;
use App\Http\Controllers\Api\NmsController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\DatabaseBackupController;
use App\Http\Controllers\Api\IspSettingController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\InvoicePdfController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FormOptionsController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\MapController;
use App\Http\Controllers\Api\AcsController;
use App\Http\Controllers\Api\RouterController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\OltController;
use App\Http\Controllers\Api\DistributionPointController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\MonitorController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\HotspotController;
use App\Http\Controllers\Api\WhatsAppController;
use App\Http\Controllers\Api\PortalAuthController;
use App\Http\Controllers\Api\PaymentWebhookController;

// ==================== AUTH (PUBLIC) ====================
Route::post('/login', function (Request $request) {
    $request->validate(['email' => 'required|email', 'password' => 'required']);
    if (!\Illuminate\Support\Facades\Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }
    $user = \Illuminate\Support\Facades\Auth::user();
    \App\Services\AuditService::log('login', 'Auth', "User {$user->email} logged in");
    return response()->json([
        'message' => 'Login berhasil',
        'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
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

// ==================== PORTAL PELANGGAN & WEBHOOK (PUBLIC) ====================
Route::post('/portal/login', [PortalAuthController::class, 'login']);
Route::get('/portal/dashboard', [PortalAuthController::class, 'dashboard']); // Ideally should have its own portal auth middleware, but keeping original logic
Route::get('/portal/packages', [PortalAuthController::class, 'packages']);
Route::post('/portal/request-upgrade', [PortalAuthController::class, 'requestUpgrade']);
Route::post('/payment/webhook', [PaymentWebhookController::class, 'handle']);


// ==================== PROTECTED ROUTES ====================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ---------------- COMMON (All Authenticated Roles) ----------------
    Route::get('/dashboard-summary', [DashboardController::class, 'index']);
    Route::get('/form-options', [FormOptionsController::class, 'getOptions']);
    Route::get('/inventory/summary', [InventoryController::class, 'summary']);
    Route::get('/inventory/categories', [InventoryController::class, 'categoryIndex']);
    Route::get('/inventory/items', [InventoryController::class, 'itemIndex']);
    Route::get('/inventory/items/{item}', [InventoryController::class, 'itemShow']);
    Route::get('/inventory/items/{item}/transactions', [InventoryController::class, 'itemTransactions']);
    Route::get('/network/map', [MapController::class, 'getMapData']);
    Route::get('/features', [FeatureFlagController::class, 'index']);
    
    // ---------------- TICKETING (Admin, Technician, Sales) ----------------
    Route::middleware('feature:ticketing')->group(function () {
        Route::get('/tickets/summary', [TicketController::class, 'summary']);
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
        Route::post('/tickets', [TicketController::class, 'store']);
        Route::put('/tickets/{ticket}', [TicketController::class, 'update']);
        Route::delete('/tickets/{ticket}', [TicketController::class, 'destroy']);
        Route::post('/tickets/{ticket}/comments', [TicketController::class, 'addComment']);
    });

    // ---------------- CUSTOMERS (Admin, Technician, Sales) ----------------
    Route::middleware('role:admin,technician,sales')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);
        Route::put('/customers/{customer}', [CustomerController::class, 'update']);
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
    });

    // ---------------- HOTSPOT (Admin, Sales) ----------------
    Route::middleware(['feature:hotspot', 'role:admin,sales'])->group(function () {
        Route::get('/hotspot/summary', [HotspotController::class, 'summary']);
        Route::get('/hotspot/profiles', [HotspotController::class, 'profileIndex']);
        Route::post('/hotspot/profiles', [HotspotController::class, 'profileStore']);
        Route::put('/hotspot/profiles/{profile}', [HotspotController::class, 'profileUpdate']);
        Route::delete('/hotspot/profiles/{profile}', [HotspotController::class, 'profileDestroy']);
        Route::get('/hotspot/vouchers', [HotspotController::class, 'voucherIndex']);
        Route::post('/hotspot/vouchers/generate', [HotspotController::class, 'generate']);
        Route::delete('/hotspot/vouchers/{voucher}', [HotspotController::class, 'voucherDestroy']);
    });

    // ---------------- BILLING / INVOICES (Admin, Collector) ----------------
    Route::middleware('role:admin,collector')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::post('/invoices/generate', [InvoiceController::class, 'generate']);
        Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'pay']);
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
        Route::post('/invoices/{invoice}/remind', [InvoiceController::class, 'remind']);
        Route::get('/invoices/{invoice}/pdf', [InvoicePdfController::class, 'download']);
        Route::get('/invoices/{invoice}/pdf-preview', [InvoicePdfController::class, 'preview']);
    });

    // ---------------- NETWORK & INVENTORY MANAGEMENT (Admin, Technician) ----------------
    Route::middleware('role:admin,technician')->group(function () {
        // Inventory Management
        Route::post('/inventory/categories', [InventoryController::class, 'categoryStore']);
        Route::put('/inventory/categories/{category}', [InventoryController::class, 'categoryUpdate']);
        Route::delete('/inventory/categories/{category}', [InventoryController::class, 'categoryDestroy']);
        Route::post('/inventory/items', [InventoryController::class, 'itemStore']);
        Route::put('/inventory/items/{item}', [InventoryController::class, 'itemUpdate']);
        Route::delete('/inventory/items/{item}', [InventoryController::class, 'itemDestroy']);
        Route::post('/inventory/items/{item}/stock-in', [InventoryController::class, 'stockIn']);
        Route::post('/inventory/items/{item}/stock-out', [InventoryController::class, 'stockOut']);
        
        // Routers, OLTs, ODPs
        Route::get('/routers', [RouterController::class, 'index']);
        Route::post('/routers', [RouterController::class, 'store']);
        Route::put('/routers/{router}', [RouterController::class, 'update']);
        Route::delete('/routers/{router}', [RouterController::class, 'destroy']);
        
        Route::get('/olts', [OltController::class, 'index']);
        Route::post('/olts', [OltController::class, 'store']);
        Route::put('/olts/{olt}', [OltController::class, 'update']);
        Route::delete('/olts/{olt}', [OltController::class, 'destroy']);
        
        Route::get('/distribution-points', [DistributionPointController::class, 'index']);
        Route::post('/distribution-points', [DistributionPointController::class, 'store']);
        Route::put('/distribution-points/{dp}', [DistributionPointController::class, 'update']);
        Route::delete('/distribution-points/{dp}', [DistributionPointController::class, 'destroy']);
        
        // Monitoring & TR-069
        Route::post('/sync', [SyncController::class, 'process']);
        Route::get('/monitor/{router}', [MonitorController::class, 'monitorRouter']);
        Route::get('/monitor/customers/active', [MonitorController::class, 'getActiveSessionsAll']);
        Route::get('/acs/device/{customer_id}', [AcsController::class, 'status']);
        Route::post('/acs/device/{customer_id}/reboot', [AcsController::class, 'reboot']);
        Route::put('/acs/device/{customer_id}/wifi', [AcsController::class, 'updateWifi']);
        Route::get('/nms/devices', [NmsController::class, 'getDevices']);
        Route::get('/nms/alerts', [NmsController::class, 'getAlerts']);
        Route::post('/nms/check-status', [NmsController::class, 'checkStatus']);
    });

    // ---------------- REPORTS (Admin, Sales, Collector) ----------------
    Route::middleware('role:admin,sales,collector')->group(function () {
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/export/customers', [ExportController::class, 'customers']);
        Route::get('/export/invoices', [ExportController::class, 'invoices']);
    });

    // ---------------- ADMIN EXCLUSIVE ----------------
    Route::middleware('role:admin')->group(function () {
        // Users & RBAC
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        
        // Settings
        Route::get('/settings/isp', [IspSettingController::class, 'show']);
        Route::put('/settings/isp', [IspSettingController::class, 'update']);
        Route::post('/settings/isp/logo', [IspSettingController::class, 'uploadLogo']);
        Route::get('/regions', [RegionController::class, 'index']);
        Route::post('/regions', [RegionController::class, 'store']);
        Route::put('/regions/{region}', [RegionController::class, 'update']);
        Route::delete('/regions/{region}', [RegionController::class, 'destroy']);
        Route::get('/packages', [PackageController::class, 'index']);
        Route::post('/packages', [PackageController::class, 'store']);
        Route::put('/packages/{package}', [PackageController::class, 'update']);
        Route::delete('/packages/{package}', [PackageController::class, 'destroy']);
        
        // Features & Modules
        Route::put('/features/{key}', [FeatureFlagController::class, 'update']);
        Route::get('/auto-suspend/config', [AutoSuspendController::class, 'getConfig']);
        Route::put('/auto-suspend/config', [AutoSuspendController::class, 'updateConfig']);
        Route::get('/auto-suspend/logs', [AutoSuspendController::class, 'getLogs']);
        Route::post('/auto-suspend/run', [AutoSuspendController::class, 'run']);
        Route::get('/payment-gateway/config', [PaymentGatewayController::class, 'getConfig']);
        Route::put('/payment-gateway/config', [PaymentGatewayController::class, 'updateConfig']);
        Route::get('/payment-gateway/transactions', [PaymentGatewayController::class, 'getTransactions']);
        Route::get('/client-portal/config', [ClientPortalController::class, 'getConfig']);
        Route::put('/client-portal/config', [ClientPortalController::class, 'updateConfig']);
        Route::get('/client-portal/stats', [ClientPortalController::class, 'getStats']);
        
        // Audit Logs & Backups
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/backups', [DatabaseBackupController::class, 'index']);
        Route::post('/backups', [DatabaseBackupController::class, 'create']);
        Route::get('/backups/{filename}/download', [DatabaseBackupController::class, 'download']);
        Route::delete('/backups/{filename}', [DatabaseBackupController::class, 'delete']);
        
        // WhatsApp
        Route::middleware('feature:whatsapp')->group(function () {
            Route::get('/whatsapp/config', [WhatsAppController::class, 'getConfig']);
            Route::put('/whatsapp/config', [WhatsAppController::class, 'updateConfig']);
            Route::get('/whatsapp/summary', [WhatsAppController::class, 'summary']);
            Route::get('/whatsapp/templates', [WhatsAppController::class, 'templateIndex']);
            Route::post('/whatsapp/templates', [WhatsAppController::class, 'templateStore']);
            Route::put('/whatsapp/templates/{template}', [WhatsAppController::class, 'templateUpdate']);
            Route::delete('/whatsapp/templates/{template}', [WhatsAppController::class, 'templateDestroy']);
            Route::post('/whatsapp/broadcast', [WhatsAppController::class, 'broadcast']);
            Route::post('/whatsapp/broadcast/reschedule', [WhatsAppController::class, 'reschedule']);
            Route::get('/whatsapp/logs', [WhatsAppController::class, 'logs']);
        });
    });

});
