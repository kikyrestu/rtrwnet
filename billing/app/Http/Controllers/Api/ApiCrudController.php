<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Router;
use App\Models\Package;
use App\Models\Region;
use App\Models\Olt;
use App\Models\DistributionPoint;
use App\Models\User;
use App\Services\RouterosAPI;
use App\Services\MikrotikService;
use App\Jobs\SyncCustomerJob;
use App\Jobs\SyncPackageJob;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Services\WhatsAppService;

class ApiCrudController extends Controller
{
    // ==================== CUSTOMERS ====================
    public function customerIndex(Request $request)
    {
        $query = Customer::with(['package', 'router', 'dp', 'region']);
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('mikrotik_username', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function customerStore(Request $request)
    {
        $customer = Customer::create($request->all());
        SyncCustomerJob::dispatch($customer, 'add');
        return response()->json($customer->load(['package', 'router', 'dp']), 201);
    }

    public function customerShow(Customer $customer)
    {
        return response()->json($customer->load(['package', 'router', 'dp', 'region', 'invoices']));
    }

    public function customerUpdate(Request $request, Customer $customer)
    {
        $oldUsername = $customer->mikrotik_username;
        $customer->update($request->all());
        $customer->load('package', 'router');
        SyncCustomerJob::dispatch($customer, 'set', $oldUsername);
        return response()->json($customer->load(['package', 'router', 'dp']));
    }

    public function customerDestroy(Customer $customer)
    {
        SyncCustomerJob::dispatch($customer, 'remove');
        $customer->delete();
        return response()->json(['message' => 'Customer deleted']);
    }

    // ==================== INVOICES ====================
    public function invoiceIndex(Request $request)
    {
        $query = Invoice::with(['customer.package', 'customer.region']);
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function invoiceGenerate()
    {
        $currentMonth = Carbon::now()->format('F Y');
        $customers = Customer::where('status', 'active')->get();
        $count = 0;

        foreach ($customers as $customer) {
            $amount = $customer->package->price ?? 0;
            if ($amount <= 0) continue;

            $exists = Invoice::where('customer_id', $customer->id)
                ->where('billing_period', $currentMonth)
                ->exists();

            if (!$exists) {
                $dueDate = Carbon::now()->setDay($customer->billing_cycle_date);
                if ($dueDate->isPast()) $dueDate->addMonth();

                Invoice::create([
                    'customer_id' => $customer->id,
                    'amount' => $amount,
                    'billing_period' => $currentMonth,
                    'due_date' => $dueDate,
                    'status' => 'unpaid'
                ]);
                $count++;
            }
        }

        return response()->json(['message' => "Berhasil generate $count tagihan baru.", 'count' => $count]);
    }

    public function invoicePay(Invoice $invoice)
    {
        if ($invoice->status == 'paid') {
            return response()->json(['message' => 'Tagihan sudah lunas sebelumnya.'], 400);
        }

        $invoice->update(['status' => 'paid', 'paid_at' => Carbon::now()]);

        if ($invoice->customer->status == 'isolated') {
            $invoice->customer->update(['status' => 'active']);
            SyncCustomerJob::dispatch($invoice->customer, 'set'); // Will enable it via MikrotikService
        }

        if ($invoice->customer->phone) {
            try {
                WhatsAppService::send($invoice->customer->phone, "Terima kasih, pembayaran Rp " . number_format($invoice->amount, 0, ',', '.') . " telah kami terima.");
            } catch (\Exception $e) {}
        }

        return response()->json(['message' => 'Pembayaran diterima & isolir dibuka (bila terisolir).']);
    }

    public function invoiceShow(Invoice $invoice)
    {
        return response()->json($invoice->load('customer.package'));
    }

    public function invoiceRemind(Invoice $invoice)
    {
        if (!$invoice->customer || !$invoice->customer->phone) {
            return response()->json(['message' => 'Pelanggan tidak memiliki nomor WhatsApp.'], 400);
        }

        if ($invoice->status == 'paid') {
            return response()->json(['message' => 'Tagihan sudah lunas, tidak perlu diingatkan.'], 400);
        }

        $phone = $invoice->customer->phone;
        $amount = number_format($invoice->amount, 0, ',', '.');
        $month = $invoice->billing_period;
        $name = $invoice->customer->name;
        
        $msg = "Halo $name, \n\nIni adalah pengingat tagihan internet Anda untuk periode $month sebesar Rp $amount. Mohon segera melakukan pembayaran agar koneksi tetap lancar.\n\nTerima kasih.";

        try {
            WhatsAppService::send($phone, $msg);
            return response()->json(['message' => 'Reminder WhatsApp berhasil dikirim.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim WA: ' . $e->getMessage()], 500);
        }
    }

    // ==================== ROUTERS ====================
    public function routerIndex()
    {
        return response()->json(Router::with('region')->get());
    }

    public function routerStore(Request $request)
    {
        $router = Router::create($request->all());
        return response()->json($router, 201);
    }

    public function routerUpdate(Request $request, Router $router)
    {
        $router->update($request->all());
        return response()->json($router);
    }

    public function routerDestroy(Router $router)
    {
        $router->delete();
        return response()->json(['message' => 'Router deleted']);
    }

    // ==================== PACKAGES ====================
    public function packageIndex()
    {
        return response()->json(Package::all());
    }

    public function packageStore(Request $request)
    {
        $package = Package::create($request->all());
        SyncPackageJob::dispatch($package, 'add');
        return response()->json($package, 201);
    }

    public function packageUpdate(Request $request, Package $package)
    {
        $oldProfileName = $package->mikrotik_profile_name;
        $package->update($request->all());
        SyncPackageJob::dispatch($package, 'set', $oldProfileName);
        return response()->json($package);
    }

    public function packageDestroy(Package $package)
    {
        SyncPackageJob::dispatch($package, 'remove');
        $package->delete();
        return response()->json(['message' => 'Package deleted']);
    }

    // ==================== REGIONS ====================
    public function regionIndex()
    {
        return response()->json(Region::withCount('customers')->get());
    }

    public function regionStore(Request $request)
    {
        $region = Region::create($request->all());
        return response()->json($region, 201);
    }

    public function regionUpdate(Request $request, Region $region)
    {
        $region->update($request->all());
        return response()->json($region);
    }

    public function regionDestroy(Region $region)
    {
        $region->delete();
        return response()->json(['message' => 'Region deleted']);
    }

    // ==================== OLTs ====================
    public function oltIndex()
    {
        return response()->json(Olt::with(['region', 'router'])->withCount('distributionPoints')->get());
    }

    public function oltStore(Request $request)
    {
        $olt = Olt::create($request->all());
        return response()->json($olt->load(['region', 'router']), 201);
    }

    public function oltUpdate(Request $request, Olt $olt)
    {
        $olt->update($request->all());
        return response()->json($olt->load(['region', 'router']));
    }

    public function oltDestroy(Olt $olt)
    {
        $olt->delete();
        return response()->json(['message' => 'OLT deleted']);
    }

    // ==================== DISTRIBUTION POINTS (ODP) ====================
    public function dpIndex()
    {
        return response()->json(DistributionPoint::with('olt')->get());
    }

    public function dpStore(Request $request)
    {
        $dp = DistributionPoint::create($request->all());
        return response()->json($dp->load('olt'), 201);
    }

    public function dpUpdate(Request $request, DistributionPoint $dp)
    {
        $dp->update($request->all());
        return response()->json($dp->load('olt'));
    }

    public function dpDestroy(DistributionPoint $dp)
    {
        $dp->delete();
        return response()->json(['message' => 'Distribution Point deleted']);
    }

    // ==================== USERS ====================
    public function userIndex()
    {
        return response()->json(User::with('region')->get());
    }

    public function userStore(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,technician,sales,collector',
            'region_id' => 'nullable|exists:regions,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'region_id' => $request->region_id,
        ]);

        return response()->json($user->load('region'), 201);
    }

    public function userUpdate(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role' => 'required|in:admin,technician,sales,collector',
            'region_id' => 'nullable|exists:regions,id',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'region_id' => $request->region_id,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json($user->load('region'));
    }

    public function userDestroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    // ==================== REPORTS ====================
    public function reportIndex()
    {
        $currentMonth = Carbon::now()->startOfMonth();

        $totalPaidThisMonth = Invoice::where('status', 'paid')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->sum('amount');

        $totalUnpaidThisMonth = Invoice::whereIn('status', ['unpaid', 'overdue'])
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->sum('amount');

        $revenuePerMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $amount = Invoice::where('status', 'paid')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount');
            $revenuePerMonth[] = [
                'name' => $date->translatedFormat('M Y'),
                'amount' => (float) $amount
            ];
        }

        $paidInvoices = Invoice::with('customer')
            ->where('status', 'paid')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->latest('paid_at')
            ->get()
            ->map(function($inv) {
                return [
                    'id' => $inv->id,
                    'customer_name' => $inv->customer ? $inv->customer->name : '-',
                    'amount' => $inv->amount,
                    'paid_at' => $inv->paid_at ? $inv->paid_at->format('d M Y') : '-',
                    'billing_period' => $inv->billing_period,
                ];
            });

        return response()->json([
            'total_paid' => (float) $totalPaidThisMonth,
            'total_unpaid' => (float) $totalUnpaidThisMonth,
            'revenue_chart' => $revenuePerMonth,
            'paid_invoices' => $paidInvoices,
            'current_month' => $currentMonth->format('F Y'),
        ]);
    }

    // ==================== SYNC MIKROTIK ====================
    public function syncProcess(Request $request)
    {
        $request->validate(['router_id' => 'required']);
        $router = Router::findOrFail($request->router_id);

        $api = new RouterosAPI();
        $api->debug = false;

        if (!$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            return response()->json(['message' => 'Gagal terkoneksi ke Router Mikrotik!'], 500);
        }

        $packagesCount = 0;
        $customersCount = 0;

        DB::beginTransaction();
        try {
            $profiles = $api->comm('/ppp/profile/print');
            foreach ($profiles as $profile) {
                if (!isset($profile['name'])) continue;
                $profName = $profile['name'];
                $package = Package::where('mikrotik_profile_name', $profName)->first();
                if (!$package) {
                    $package = new Package();
                    $package->mikrotik_profile_name = $profName;
                    $package->name = ($profName === 'default' || $profName === 'default-encryption') ? "Mikrotik $profName" : $profName;
                    $package->price = 0;
                }
                $package->rate_limit = $profile['rate-limit'] ?? null;
                $package->local_address = $profile['local-address'] ?? null;
                $package->remote_address = $profile['remote-address'] ?? null;
                $package->save();
                $packagesCount++;
            }

            $secrets = $api->comm('/ppp/secret/print');
            foreach ($secrets as $secret) {
                if (!isset($secret['name'])) continue;
                $username = $secret['name'];
                $password = $secret['password'] ?? '';
                $profileName = $secret['profile'] ?? 'default';
                // Mikrotik API returns 'disabled' as a string "true" or "false"
                $disabled = isset($secret['disabled']) && $secret['disabled'] === 'true';
                $package = Package::where('mikrotik_profile_name', $profileName)->first();
                if (!$package) $package = Package::where('mikrotik_profile_name', 'default')->first();

                $customer = Customer::where('mikrotik_username', $username)->first();
                if (!$customer) {
                    $customer = new Customer();
                    $customer->mikrotik_username = $username;
                    $customer->name = $username;
                    $customer->billing_cycle_date = 1;
                }
                $customer->mikrotik_password = $password;
                $customer->router_id = $router->id;
                if ($package) $customer->package_id = $package->id;
                
                // Fix: Sync should respect Active/Isolated/Inactive from system.
                // It maps Mikrotik 'disabled' to isolated or inactive correctly. 
                // But if the system already says 'active/isolated', we only update it if Mikrotik disagrees in a major way, 
                // OR we can just reliably set it like this:
                if ($disabled) {
                    // Only change to inactive if it was active, otherwise keep it (might be 'isolated' due to billing)
                    if ($customer->status === 'active') {
                        $customer->status = 'inactive';
                    }
                } else {
                    $customer->status = 'active'; 
                }

                if ($customer->package_id) {
                    $customer->save();
                    $customersCount++;
                }
            }

            DB::commit();
            $api->disconnect();
            return response()->json(['message' => "Sukses! $packagesCount Profil dan $customersCount Secret berhasil disinkronkan.", 'packages' => $packagesCount, 'customers' => $customersCount]);
        } catch (\Exception $e) {
            DB::rollBack();
            $api->disconnect();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    // ==================== PRIVATE HELPERS ====================
    private function syncMikrotikSecret($action, Customer $customer, $oldUsername = null)
    {
        $router = $customer->router;
        if (!$router) return;
        $package = $customer->package;
        $profileName = $package ? $package->mikrotik_profile_name : 'default';
        $api = new RouterosAPI();
        $api->debug = false;

        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            if ($action === 'add') {
                $api->comm('/ppp/secret/add', ['name' => $customer->mikrotik_username, 'password' => $customer->mikrotik_password, 'profile' => $profileName, 'service' => 'pppoe']);
            } elseif ($action === 'set') {
                $searchName = $oldUsername ?: $customer->mikrotik_username;
                $secrets = $api->comm('/ppp/secret/print', ['?name' => $searchName]);
                if (isset($secrets[0]['.id'])) {
                    $api->comm('/ppp/secret/set', ['.id' => $secrets[0]['.id'], 'name' => $customer->mikrotik_username, 'password' => $customer->mikrotik_password, 'profile' => $profileName]);
                } else {
                    $api->comm('/ppp/secret/add', ['name' => $customer->mikrotik_username, 'password' => $customer->mikrotik_password, 'profile' => $profileName, 'service' => 'pppoe']);
                }
            } elseif ($action === 'remove') {
                $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
                if (isset($secrets[0]['.id'])) $api->comm('/ppp/secret/remove', ['.id' => $secrets[0]['.id']]);
            }
            $api->disconnect();
        }
    }

    private function syncMikrotikProfile($action, Package $package, $oldProfileName = null)
    {
        $router = Router::first();
        if (!$router) return;
        $api = new RouterosAPI();
        $api->debug = false;
        $profileName = $package->mikrotik_profile_name;
        $params = ['name' => $profileName];
        if (!empty($package->local_address)) $params['local-address'] = $package->local_address;
        if (!empty($package->remote_address)) $params['remote-address'] = $package->remote_address;
        if (!empty($package->rate_limit)) $params['rate-limit'] = $package->rate_limit;

        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            if ($action === 'add') {
                $api->comm('/ppp/profile/add', $params);
            } elseif ($action === 'set') {
                $searchName = $oldProfileName ?: $profileName;
                $profiles = $api->comm('/ppp/profile/print', ['?name' => $searchName]);
                if (isset($profiles[0]['.id'])) { $params['.id'] = $profiles[0]['.id']; $api->comm('/ppp/profile/set', $params); }
                else { $api->comm('/ppp/profile/add', $params); }
            } elseif ($action === 'remove') {
                $profiles = $api->comm('/ppp/profile/print', ['?name' => $profileName]);
                if (isset($profiles[0]['.id'])) $api->comm('/ppp/profile/remove', ['.id' => $profiles[0]['.id']]);
            }
            $api->disconnect();
        }
    }

    private function enableCustomerMikrotik(Customer $customer)
    {
        $router = $customer->router;
        if (!$router) return;
        $api = new RouterosAPI();
        $api->debug = false;
        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
            if (isset($secrets[0]['.id'])) $api->comm('/ppp/secret/enable', ['.id' => $secrets[0]['.id']]);
            $api->disconnect();
        }
    }

    // ==================== MONITOR MIKROTIK ====================
    public function monitorRouter(Router $router)
    {
        $api = new RouterosAPI();
        $api->debug = false;

        if (!$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            return response()->json(['message' => 'Gagal terkoneksi ke Router!'], 500);
        }

        // System Resources
        $resources = $api->comm('/system/resource/print');
        $resource = $resources[0] ?? [];

        // Identity
        $identity = $api->comm('/system/identity/print');
        $routerName = $identity[0]['name'] ?? $router->name;

        // Active PPPoE
        $activeConnections = $api->comm('/ppp/active/print');
        $pppoeList = [];
        foreach ($activeConnections as $conn) {
            $pppoeList[] = [
                'name' => $conn['name'] ?? '-',
                'service' => $conn['service'] ?? '-',
                'caller_id' => $conn['caller-id'] ?? '-',
                'address' => $conn['address'] ?? '-',
                'uptime' => $conn['uptime'] ?? '-',
                'encoding' => $conn['encoding'] ?? '-',
            ];
        }

        // Interfaces
        $interfaces = $api->comm('/interface/print');
        $ifList = [];
        foreach ($interfaces as $iface) {
            $ifList[] = [
                'name' => $iface['name'] ?? '-',
                'type' => $iface['type'] ?? '-',
                'running' => ($iface['running'] ?? 'false') === 'true',
                'disabled' => ($iface['disabled'] ?? 'false') === 'true',
                'tx_byte' => (int) ($iface['tx-byte'] ?? 0),
                'rx_byte' => (int) ($iface['rx-byte'] ?? 0),
                'link_downs' => (int) ($iface['link-downs'] ?? 0),
            ];
        }

        $api->disconnect();

        // Parse memory
        $totalMem = (int) ($resource['total-memory'] ?? 0);
        $freeMem = (int) ($resource['free-memory'] ?? 0);
        $usedMem = $totalMem - $freeMem;

        // Parse HDD
        $totalHdd = (int) ($resource['total-hdd-space'] ?? 0);
        $freeHdd = (int) ($resource['free-hdd-space'] ?? 0);

        return response()->json([
            'router_name' => $routerName,
            'router_host' => $router->host,
            'system' => [
                'board_name' => $resource['board-name'] ?? '-',
                'architecture' => $resource['architecture-name'] ?? '-',
                'version' => $resource['version'] ?? '-',
                'uptime' => $resource['uptime'] ?? '-',
                'cpu_load' => (int) ($resource['cpu-load'] ?? 0),
                'cpu_count' => (int) ($resource['cpu-count'] ?? 1),
                'total_memory' => $totalMem,
                'used_memory' => $usedMem,
                'free_memory' => $freeMem,
                'total_hdd' => $totalHdd,
                'free_hdd' => $freeHdd,
            ],
            'active_pppoe' => $pppoeList,
            'interfaces' => $ifList,
        ]);
    }

    public function getActiveSessionsAll()
    {
        $routers = Router::all();
        $activeUsernames = [];

        foreach ($routers as $router) {
            $api = new RouterosAPI();
            $api->debug = false;
            
            if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
                $activeConnections = $api->comm('/ppp/active/print');
                foreach ($activeConnections as $conn) {
                    if (isset($conn['name'])) {
                        // Store the username as key for fast lookups
                        $activeUsernames[$conn['name']] = [
                            'uptime' => $conn['uptime'] ?? '-',
                            'address' => $conn['address'] ?? '-'
                        ];
                    }
                }
                $api->disconnect();
            }
        }

        return response()->json([
            'active_usernames' => $activeUsernames
        ]);
    }
}

