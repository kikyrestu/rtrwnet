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
    // ==================== CONFIG ====================

    public function getConfig()
    {
        $config = \App\Models\ModuleConfig::getForModule('whatsapp', [
            'provider' => 'log',
            'fonnte_token' => '',
            'ruangwa_token' => ''
        ]);
        return response()->json($config);
    }

    public function updateConfig(Request $request)
    {
        \App\Models\ModuleConfig::updateForModule('whatsapp', $request->all());
        return response()->json(['message' => 'Konfigurasi WA berhasil disimpan']);
    }

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
            'delay' => 'nullable|string',
            'schedule' => 'nullable|date',
        ]);

        $template = WaTemplate::findOrFail($request->template_id);
        $customers = Customer::whereIn('id', $request->customer_ids)->whereNotNull('phone')->get();

        $messagesData = [];
        $logs = [];

        $scheduleUnix = $request->schedule ? strtotime($request->schedule) : null;

        foreach ($customers as $customer) {
            $message = $this->parsePlaceholders($template->body, $customer);

            $log = WaBroadcastLog::create([
                'template_id' => $template->id,
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'message' => $message,
                'status' => 'pending',
                'schedule_time' => $request->schedule,
            ]);

            $logs[] = $log;

            $msgData = [
                'target' => $customer->phone,
                'message' => $message,
            ];
            if ($scheduleUnix) {
                $msgData['schedule'] = $scheduleUnix;
            }
            $messagesData[] = $msgData;
        }

        try {
            $delay = $request->delay ?: '2-5';
            $response = WhatsAppService::sendBatch($messagesData, $delay);

            if (isset($response['status']) && $response['status'] === true && isset($response['id'])) {
                foreach ($logs as $index => $log) {
                    $log->update([
                        'status' => $scheduleUnix ? 'pending' : 'sent',
                        'sent_at' => $scheduleUnix ? null : now(),
                        'fonnte_message_id' => $response['id'][$index] ?? null,
                    ]);
                }
                return response()->json([
                    'message' => "Broadcast berhasil diantrekan/dikirim.",
                    'sent' => count($logs),
                    'failed' => 0,
                    'fonnte_response' => $response
                ]);
            } else {
                foreach ($logs as $log) {
                    $log->update([
                        'status' => 'failed',
                        'error_message' => $response['reason'] ?? 'Gagal dari API Provider'
                    ]);
                }
                return response()->json([
                    'message' => "Gagal mengirim broadcast.",
                    'sent' => 0,
                    'failed' => count($logs),
                    'fonnte_response' => $response
                ], 400);
            }
        } catch (\Exception $e) {
            foreach ($logs as $log) {
                $log->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            }
            return response()->json([
                'message' => "Terjadi kesalahan sistem.",
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reschedule(Request $request)
    {
        $request->validate([
            'log_ids' => 'required|array|min:1',
            'log_ids.*' => 'exists:wa_broadcast_logs,id',
            'new_schedule' => 'required|date',
            'delay' => 'nullable|string'
        ]);

        $logs = WaBroadcastLog::whereIn('id', $request->log_ids)
            ->whereNotNull('fonnte_message_id')
            ->where('status', 'pending')
            ->get();

        if ($logs->isEmpty()) {
            return response()->json(['message' => 'Tidak ada pesan tertunda dengan Fonnte ID yang valid.'], 400);
        }

        $newScheduleUnix = strtotime($request->new_schedule);
        $successCount = 0;
        $failedCount = 0;
        $delay = $request->delay;

        foreach ($logs as $log) {
            $response = WhatsAppService::reschedule((int)$log->fonnte_message_id, $newScheduleUnix, $delay);

            if (isset($response['status']) && $response['status'] === true) {
                $log->update(['schedule_time' => $request->new_schedule]);
                $successCount++;
            } else {
                $failedCount++;
            }
        }

        return response()->json([
            'message' => "Proses reschedule selesai.",
            'success' => $successCount,
            'failed' => $failedCount
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
