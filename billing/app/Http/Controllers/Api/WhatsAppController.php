<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WaTemplate;
use App\Models\WaBroadcastLog;
use App\Models\Customer;
use App\Services\WhatsAppService;

class WhatsAppController extends Controller
{
    // ==================== TEMPLATES ====================

    public function templateIndex()
    {
        return response()->json(WaTemplate::withCount('logs')->latest()->get());
    }

    public function templateStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:reminder,payment_confirm,gangguan,welcome,custom',
            'body' => 'required|string',
        ]);

        $template = WaTemplate::create($request->all());
        return response()->json($template, 201);
    }

    public function templateUpdate(Request $request, WaTemplate $template)
    {
        $template->update($request->only(['name', 'type', 'body', 'is_active']));
        return response()->json($template);
    }

    public function templateDestroy(WaTemplate $template)
    {
        $template->delete();
        return response()->json(['message' => 'Template berhasil dihapus.']);
    }

    // ==================== BROADCAST ====================

    public function broadcast(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:wa_templates,id',
            'customer_ids' => 'required|array|min:1',
            'customer_ids.*' => 'exists:customers,id',
        ]);

        $template = WaTemplate::findOrFail($request->template_id);
        $customers = Customer::whereIn('id', $request->customer_ids)->whereNotNull('phone')->get();

        $sent = 0;
        $failed = 0;

        foreach ($customers as $customer) {
            $message = $this->parsePlaceholders($template->body, $customer);

            $log = WaBroadcastLog::create([
                'template_id' => $template->id,
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'message' => $message,
                'status' => 'pending',
            ]);

            try {
                $success = WhatsAppService::send($customer->phone, $message);
                $log->update([
                    'status' => $success ? 'sent' : 'failed',
                    'sent_at' => $success ? now() : null,
                    'error_message' => $success ? null : 'Gagal mengirim pesan',
                ]);
                $success ? $sent++ : $failed++;
            } catch (\Exception $e) {
                $log->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
                $failed++;
            }
        }

        return response()->json([
            'message' => "Broadcast selesai. $sent terkirim, $failed gagal.",
            'sent' => $sent,
            'failed' => $failed,
        ]);
    }

    public function logs(Request $request)
    {
        $query = WaBroadcastLog::with(['template', 'customer']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->take(200)->get());
    }

    public function summary()
    {
        return response()->json([
            'total_templates' => WaTemplate::count(),
            'total_sent' => WaBroadcastLog::where('status', 'sent')->count(),
            'total_failed' => WaBroadcastLog::where('status', 'failed')->count(),
            'total_pending' => WaBroadcastLog::where('status', 'pending')->count(),
        ]);
    }

    // ==================== HELPERS ====================

    private function parsePlaceholders(string $body, Customer $customer): string
    {
        $lastInvoice = $customer->invoices()->where('status', 'unpaid')->latest()->first();

        return str_replace(
            ['{nama}', '{tagihan}', '{periode}', '{paket}'],
            [
                $customer->name,
                $lastInvoice ? 'Rp ' . number_format($lastInvoice->amount, 0, ',', '.') : '-',
                $lastInvoice ? $lastInvoice->billing_period : '-',
                $customer->package ? $customer->package->name : '-',
            ],
            $body
        );
    }
}
