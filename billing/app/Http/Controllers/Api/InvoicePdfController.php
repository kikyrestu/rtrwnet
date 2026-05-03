<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\IspSetting;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoicePdfController extends Controller
{
    public function download(Invoice $invoice)
    {
        $invoice->load(['customer.package']);
        $settings = IspSetting::instance();

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'settings' => $settings,
        ]);

        $filename = strtolower($settings->invoice_prefix) . '_' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($filename);
    }

    public function preview(Invoice $invoice)
    {
        $invoice->load(['customer.package']);
        $settings = IspSetting::instance();

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'settings' => $settings,
        ]);

        return $pdf->stream();
    }
}
