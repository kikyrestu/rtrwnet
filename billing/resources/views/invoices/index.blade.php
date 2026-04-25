@extends('layouts.app')
@section('title', 'Data Tagihan (Invoices)')
@section('content')
<h1>Data Tagihan Bulan Ini</h1>

@if(Auth::user()->role == 'admin')
<form action="{{ route('invoices.generate') }}" method="POST">
    @csrf 
    <button type="submit">Generate Tagihan Bulanan (Cron Manual)</button>
</form>
@endif

<br>
<table border="1">
<tr><th>ID</th><th>Pelanggan</th><th>Bulan</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr>
@foreach($invoices as $i)
<tr>
    <td>INV-{{ Str::padLeft($i->id, 5, '0') }}</td>
    <td>{{ $i->customer->name ?? '-' }} ({{ $i->customer->nik }})</td>
    <td>{{ $i->billing_period }}</td>
    <td>Rp {{ number_format($i->amount, 0, ',', '.') }}</td>
    <td>{{ $i->due_date->format('d M Y') }}</td>
    <td>{{ $i->status == 'paid' ? 'LUNAS' : 'BELUM BAYAR' }}</td>
    <td>
        @if($i->status != 'paid')
        <form action="{{ route('invoices.pay', $i) }}" method="POST" style="display:inline">
            @csrf <button type="submit">Bayar Lunas</button>
        </form>
        @else
        ? Terbayar pada {{ $i->paid_at->format('d M Y H:i') }}
        @endif
    </td>
</tr>
@endforeach
</table>
@endsection
