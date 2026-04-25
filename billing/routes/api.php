<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Existing API endpoints
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\Api\MapController;
Route::get('/map-data', [MapController::class, 'getMapData']);

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FormOptionsController;
use App\Http\Controllers\Api\ApiCrudController;

Route::get('/dashboard-summary', [DashboardController::class, 'index']);
Route::get('/form-options', [FormOptionsController::class, 'getOptions']);

// ==================== CRUD API ROUTES ====================

// Customers
Route::get('/customers', [ApiCrudController::class, 'customerIndex']);
Route::post('/customers', [ApiCrudController::class, 'customerStore']);
Route::get('/customers/{customer}', [ApiCrudController::class, 'customerShow']);
Route::put('/customers/{customer}', [ApiCrudController::class, 'customerUpdate']);
Route::delete('/customers/{customer}', [ApiCrudController::class, 'customerDestroy']);

// Invoices
Route::get('/invoices', [ApiCrudController::class, 'invoiceIndex']);
Route::post('/invoices/generate', [ApiCrudController::class, 'invoiceGenerate']);
Route::post('/invoices/{invoice}/pay', [ApiCrudController::class, 'invoicePay']);
Route::get('/invoices/{invoice}', [ApiCrudController::class, 'invoiceShow']);
Route::post('/invoices/{invoice}/remind', [ApiCrudController::class, 'invoiceRemind']);

// Routers
Route::get('/routers', [ApiCrudController::class, 'routerIndex']);
Route::post('/routers', [ApiCrudController::class, 'routerStore']);
Route::put('/routers/{router}', [ApiCrudController::class, 'routerUpdate']);
Route::delete('/routers/{router}', [ApiCrudController::class, 'routerDestroy']);

// Packages
Route::get('/packages', [ApiCrudController::class, 'packageIndex']);
Route::post('/packages', [ApiCrudController::class, 'packageStore']);
Route::put('/packages/{package}', [ApiCrudController::class, 'packageUpdate']);
Route::delete('/packages/{package}', [ApiCrudController::class, 'packageDestroy']);

// Regions
Route::get('/regions', [ApiCrudController::class, 'regionIndex']);
Route::post('/regions', [ApiCrudController::class, 'regionStore']);
Route::put('/regions/{region}', [ApiCrudController::class, 'regionUpdate']);
Route::delete('/regions/{region}', [ApiCrudController::class, 'regionDestroy']);

// OLTs
Route::get('/olts', [ApiCrudController::class, 'oltIndex']);
Route::post('/olts', [ApiCrudController::class, 'oltStore']);
Route::put('/olts/{olt}', [ApiCrudController::class, 'oltUpdate']);
Route::delete('/olts/{olt}', [ApiCrudController::class, 'oltDestroy']);

// Distribution Points (ODP)
Route::get('/distribution-points', [ApiCrudController::class, 'dpIndex']);
Route::post('/distribution-points', [ApiCrudController::class, 'dpStore']);
Route::put('/distribution-points/{dp}', [ApiCrudController::class, 'dpUpdate']);
Route::delete('/distribution-points/{dp}', [ApiCrudController::class, 'dpDestroy']);

// Users
Route::get('/users', [ApiCrudController::class, 'userIndex']);
Route::post('/users', [ApiCrudController::class, 'userStore']);
Route::put('/users/{user}', [ApiCrudController::class, 'userUpdate']);
Route::delete('/users/{user}', [ApiCrudController::class, 'userDestroy']);

// Reports
Route::get('/reports', [ApiCrudController::class, 'reportIndex']);

// Sync Mikrotik
Route::post('/sync', [ApiCrudController::class, 'syncProcess']);

// Monitor Mikrotik
Route::get('/monitor/{router}', [ApiCrudController::class, 'monitorRouter']);
Route::get('/monitor/customers/active', [ApiCrudController::class, 'getActiveSessionsAll']);

// Auth
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!\Illuminate\Support\Facades\Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    $user = \Illuminate\Support\Facades\Auth::user();
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
    // Invalidate session if web-based
    if ($request->hasSession()) {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
    // Revoke Sanctum token if API-based
    if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
        $token = $request->user()->currentAccessToken();
        if ($token) $token->delete();
    }
    \Illuminate\Support\Facades\Auth::guard('web')->logout();
    return response()->json(['message' => 'Logged out']);
});

