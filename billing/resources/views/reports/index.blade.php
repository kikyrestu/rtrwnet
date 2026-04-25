@extends("layouts.app")
@section("title", "Laporan Pendapatan")
@section("content")
<h1>Laporan Keuangan & Pendapatan</h1>

<h2>Bulan Berjalan ({{ $currentMonth->format("F Y") }})</h2>
<table border="1" cellpadding="10" cellspacing="0" style="margin-bottom: 20px;">
    <tr>
        <th style="background-color: #d4edda;">Total LUNAS (Kas Masuk)</th>
        <th style="background-color: #f8d7da;">Total NUNGGAK (Piutang)</th>
    </tr>
    <tr>
        <td style="font-size: 24px; font-weight: bold; text-align: center; color: green;">
            Rp {{ number_format($totalPaidThisMonth, 0, ",", ".") }}
        </td>
        <td style="font-size: 24px; font-weight: bold; text-align: center; color: red;">
            Rp {{ number_format($totalUnpaidThisMonth, 0, ",", ".") }}
        </td>
    </tr>
</table>

<h2>Riwayat Pendapatan Kas Masuk</h2>
<table border="1" cellpadding="10" cellspacing="0">
    <tr>
        <th>Periode Bulan</th>
        <th>Total RP Masuk</th>
    </tr>
    @forelse($revenuePerMonth as $rev)
    <tr>
        <td>{{ $rev->months }}</td>
        <td>Rp {{ number_format($rev->sums, 0, ",", ".") }}</td>
    </tr>
    @empty
    <tr>
        <td colspan="2">Belum ada riwayat pendapatan (Lunas).</td>
    </tr>
    @endforelse
</table>
@endsection
