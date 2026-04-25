<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RouterController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\DistributionPointController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\OltController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MikrotikMonitorController;
use App\Http\Controllers\AuthController;

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });

    // === ROLE: ADMIN (Bisa semua) ===
    Route::middleware('role:admin')->group(function() {
        Route::resource('users', \App\Http\Controllers\UserController::class);
        Route::resource('packages', PackageController::class);
        Route::resource('regions', RegionController::class);
        // Admin regis customer di sini juga, tapi route resource dibikin custom di bawah
        Route::delete('/routers/{router}', [RouterController::class, 'destroy'])->name('routers.destroy');
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy'); // dummy kalau ada delete
    });

    // === ROLE: ADMIN & TECHNICIAN === //
    Route::middleware('role:admin,technician')->group(function() {
        Route::resource('routers', RouterController::class)->except(['destroy']);
        Route::resource('olts', OltController::class);
        Route::resource('distribution-points', DistributionPointController::class);
        Route::resource('distribution_points', DistributionPointController::class); // Alias
        
        Route::get('/mikrotik/debug/{type}/{id}', [\App\Http\Controllers\MikrotikDebugController::class, 'debug'])->name('mikrotik.debug');
        Route::get('/routers/{router}/monitor', [MikrotikMonitorController::class, 'index'])->name('routers.monitor');
        Route::get('/routers/{router}/traffic', [MikrotikMonitorController::class, 'traffic'])->name('routers.traffic');

        Route::get('/sync', [SyncController::class, 'index'])->name('sync.index');
        Route::post('/sync', [SyncController::class, 'process'])->name('sync.process');
    });

    // === ROLE: ADMIN & SALES === //
    // Sales cuma bisa register / read user. Ngga bisa otak atik router.
    Route::middleware('role:admin,sales,technician')->group(function() {
        Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    });

    Route::middleware('role:admin,sales')->group(function() {
        Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
        Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    });

    Route::middleware('role:admin')->group(function() {
        Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
        Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    });

    // === ROLE: ADMIN & COLLECTOR === //
    Route::middleware('role:admin,collector')->group(function() {
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::post('/invoices/generate', [InvoiceController::class, 'generate'])->name('invoices.generate');
        Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'pay'])->name('invoices.pay');
    });

    // Laporan untuk Admin, Sales, dan Collector
    Route::middleware('role:admin,sales,collector')->group(function() {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });
});
