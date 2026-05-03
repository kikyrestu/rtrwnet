<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .company-info { }
        .company-name { font-size: 22px; font-weight: bold; color: #1e40af; margin-bottom: 4px; }
        .company-tagline { font-size: 11px; color: #6b7280; font-style: italic; margin-bottom: 8px; }
        .company-detail { font-size: 10px; color: #6b7280; line-height: 1.6; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 28px; color: #1e40af; letter-spacing: 2px; }
        .invoice-number { font-size: 11px; color: #6b7280; margin-top: 4px; }

        /* Info Section */
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-block { }
        .info-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: bold; }
        .info-value { font-size: 12px; color: #1f2937; line-height: 1.6; }
        .info-value strong { color: #111827; }

        /* Status Badge */
        .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-unpaid { background: #fef3c7; color: #92400e; }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1e40af; color: white; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        tr:nth-child(even) td { background: #f9fafb; }

        /* Totals */
        .totals { text-align: right; margin-bottom: 30px; }
        .totals table { width: 300px; margin-left: auto; }
        .totals td { border: none; padding: 6px 12px; }
        .totals .total-row { font-size: 16px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af; }

        /* Bank Info */
        .bank-info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        .bank-info h3 { font-size: 11px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .bank-detail { font-size: 12px; line-height: 1.8; }

        /* Footer */
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; line-height: 1.6; }
    </style>
</head>
<body>
<div class="invoice-box">
    <!-- Header -->
    <table style="width:100%; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
        <tr>
            <td style="border:none; padding: 0 0 15px 0; vertical-align: top;">
                <div class="company-name">{{ $settings->company_name }}</div>
                @if($settings->company_tagline)
                    <div class="company-tagline">{{ $settings->company_tagline }}</div>
                @endif
                <div class="company-detail">
                    @if($settings->address){{ $settings->address }}<br>@endif
                    @if($settings->phone)📞 {{ $settings->phone }}@endif
                    @if($settings->email) &nbsp;|&nbsp; ✉ {{ $settings->email }}@endif
                </div>
            </td>
            <td style="border:none; padding: 0 0 15px 0; text-align: right; vertical-align: top;">
                <div style="font-size: 28px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">INVOICE</div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">#{{ $settings->invoice_prefix }}-{{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</div>
                <div style="margin-top: 8px;">
                    <span class="status-badge {{ $invoice->status === 'paid' ? 'status-paid' : 'status-unpaid' }}">
                        {{ $invoice->status === 'paid' ? '✓ LUNAS' : 'BELUM BAYAR' }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Customer & Invoice Info -->
    <table style="width:100%; margin-bottom: 30px;">
        <tr>
            <td style="border:none; padding:0; vertical-align: top; width: 50%;">
                <div class="info-label">Tagihan Untuk</div>
                <div class="info-value">
                    <strong>{{ $invoice->customer->name }}</strong><br>
                    {{ $invoice->customer->address ?? '-' }}<br>
                    📞 {{ $invoice->customer->phone ?? '-' }}
                </div>
            </td>
            <td style="border:none; padding:0; vertical-align: top; text-align: right;">
                <div class="info-label">Detail Tagihan</div>
                <div class="info-value">
                    Periode: <strong>{{ $invoice->billing_period }}</strong><br>
                    Jatuh Tempo: <strong>{{ \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') }}</strong><br>
                    @if($invoice->paid_at)
                        Dibayar: <strong>{{ \Carbon\Carbon::parse($invoice->paid_at)->format('d M Y') }}</strong>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Invoice Items -->
    <table>
        <thead>
            <tr>
                <th style="width: 50%;">Deskripsi</th>
                <th>Paket</th>
                <th style="text-align: right;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Layanan Internet - {{ $invoice->billing_period }}</td>
                <td>{{ $invoice->customer->package->name ?? '-' }}</td>
                <td style="text-align: right; font-weight: bold;">Rp {{ number_format($invoice->amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
        <table>
            <tr>
                <td style="color: #6b7280;">Subtotal</td>
                <td style="text-align: right;">Rp {{ number_format($invoice->amount, 0, ',', '.') }}</td>
            </tr>
            <tr class="total-row">
                <td style="padding-top: 10px;">TOTAL</td>
                <td style="text-align: right; padding-top: 10px;">Rp {{ number_format($invoice->amount, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <!-- Bank Info -->
    @if($settings->bank_name)
    <div class="bank-info">
        <h3>Informasi Pembayaran</h3>
        <div class="bank-detail">
            Bank: <strong>{{ $settings->bank_name }}</strong><br>
            No. Rekening: <strong>{{ $settings->bank_account_number }}</strong><br>
            Atas Nama: <strong>{{ $settings->bank_account_name }}</strong>
        </div>
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        @if($settings->invoice_footer_note)
            {{ $settings->invoice_footer_note }}<br>
        @endif
        Dicetak pada {{ now()->format('d M Y H:i') }} — {{ $settings->company_name }}
    </div>
</div>
</body>
</html>
