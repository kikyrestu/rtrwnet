<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Invoice;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function customers(Request $request): StreamedResponse
    {
        $customers = Customer::with(['package', 'router', 'region', 'dp'])->get();

        return new StreamedResponse(function () use ($customers) {
            $handle = fopen('php://output', 'w');
            // BOM for UTF-8 Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, [
                'ID', 'Nama', 'No HP', 'Alamat', 'Username Mikrotik',
                'Paket', 'Harga Paket', 'Router', 'Wilayah', 'ODP',
                'Status', 'Tanggal Daftar',
            ]);

            foreach ($customers as $c) {
                fputcsv($handle, [
                    $c->id,
                    $c->name,
                    $c->phone,
                    $c->address,
                    $c->mikrotik_username,
                    $c->package?->name ?? '-',
                    $c->package?->price ?? 0,
                    $c->router?->name ?? '-',
                    $c->region?->name ?? '-',
                    $c->dp?->name ?? '-',
                    $c->status,
                    $c->created_at?->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="pelanggan_' . date('Ymd') . '.csv"',
        ]);
    }

    public function invoices(Request $request): StreamedResponse
    {
        $query = Invoice::with(['customer.package']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('period') && $request->period) {
            $query->where('billing_period', $request->period);
        }

        $invoices = $query->latest()->get();

        return new StreamedResponse(function () use ($invoices) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, [
                'ID', 'Pelanggan', 'Paket', 'Periode', 'Jatuh Tempo',
                'Nominal', 'Status', 'Tanggal Bayar',
            ]);

            foreach ($invoices as $inv) {
                fputcsv($handle, [
                    $inv->id,
                    $inv->customer?->name ?? '-',
                    $inv->customer?->package?->name ?? '-',
                    $inv->billing_period,
                    $inv->due_date,
                    $inv->amount,
                    $inv->status === 'paid' ? 'Lunas' : 'Belum Bayar',
                    $inv->paid_at?->format('Y-m-d') ?? '-',
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="tagihan_' . date('Ymd') . '.csv"',
        ]);
    }
}
