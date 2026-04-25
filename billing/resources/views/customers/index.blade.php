@extends('layouts.app')
@section('title', 'Customers')
@section('content')
@if(in_array(Auth::user()->role, ['admin', 'sales']))
<a href="{{ route('customers.create') }}"><button>Tambah Customer</button></a>
<br><br>
@endif
<table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr><th>ID</th><th>Nama/NIK</th><th>Paket</th><th>Router (DP)</th><th>ONU/Modem</th><th>Mikrotik User</th><th>Status</th><th>Tagihan tgl</th><th>Aksi</th></tr>
    </thead>
    <tbody>
        @foreach($customers as $c)
        <tr>
            <td>{{ $c->id }}</td>
            <td>{{ $c->name }} ({{ $c->nik }})</td>
            <td>{{ $c->package->name ?? '-' }}</td>
            <td>{{ $c->router->name ?? '-' }} ({{ $c->dp->name ?? '-' }})</td>
            <td>{{ $c->ont_merk ?? '-' }}<br><small>{{ $c->ont_sn }}</small></td>
            <td>{{ $c->mikrotik_username }}</td>
            <td>{{ $c->status }}</td>
            <td>{{ $c->billing_cycle_date }}</td>
            <td>
                @if(in_array(Auth::user()->role, ['admin', 'technician']))
                <a href="{{ route('mikrotik.debug', ['type' => 'customer', 'id' => $c->id]) }}" target="_blank">Cek Secret Mikrotik</a> |
                @endif
                @if(Auth::user()->role == 'admin')
                <a href="{{ route('customers.edit', $c) }}">Edit</a> |
                <form action="{{ route('customers.destroy', $c) }}" method="POST" style="display:inline;">
                    @csrf @method('DELETE')
                    <button type="submit" onclick="return confirm('Hapus?')">Hapus</button>
                </form>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endsection