@extends('layouts.app')
@section('title', 'Tambah Package')
@section('content')
<form action="{{ route('packages.store') }}" method="POST">
    @csrf
    <p>Nama Paket: <input type="text" name="name" required></p>
    <p>Harga: <input type="number" step="0.01" name="price" required></p>
    <p>Nama Profil Mikrotik: <input type="text" name="mikrotik_profile_name" required></p>
    <p>Rate Limit (Upload/Download, misal: 10M/10M): <input type="text" name="rate_limit" placeholder="10M/10M"></p>
    <p>Local Address (IP Gateway): 
        <select onchange="document.getElementById('local_address').value = this.value">
            <option value="">-- Kosongkan / Input Manual --</option>
            @foreach($addresses as $ip => $label)
                <option value="{{ $ip }}">{{ $label }}</option>
            @endforeach
        </select>
        Atau ketik: <input type="text" id="local_address" name="local_address" placeholder="192.168.100.1">
    </p>
    <p>Remote Address (IP Pool): 
        <select onchange="document.getElementById('remote_address').value = this.value">
            <option value="">-- Kosongkan / Pilih Pool --</option>
            @foreach($pools as $name => $label)
                <option value="{{ $name }}">{{ $label }}</option>
            @endforeach
        </select>
        Atau ketik: <input type="text" id="remote_address" name="remote_address" placeholder="pool-pppoe">
    </p>
    <button type="submit">Simpan</button>
</form>
@endsection