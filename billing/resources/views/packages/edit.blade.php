@extends('layouts.app')
@section('title', 'Edit Package')
@section('content')
<form action="{{ route('packages.update', $package) }}" method="POST">
    @csrf @method('PUT')
    <p>Nama Paket: <input type="text" name="name" value="{{ $package->name }}" required></p>
    <p>Harga: <input type="number" step="0.01" name="price" value="{{ $package->price }}" required></p>
    <p>Nama Profil Mikrotik: <input type="text" name="mikrotik_profile_name" value="{{ $package->mikrotik_profile_name }}" required></p>
    <p>Rate Limit (Upload/Download): <input type="text" name="rate_limit" value="{{ $package->rate_limit }}" placeholder="10M/10M"></p>
    <p>Local Address (IP Gateway): 
        <select onchange="document.getElementById('local_address').value = this.value">
            <option value="">-- Kosongkan --</option>
            @foreach($addresses as $ip => $label)
                <option value="{{ $ip }}" {{ $package->local_address == $ip ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
        Atau ketik: <input type="text" id="local_address" name="local_address" value="{{ $package->local_address }}" placeholder="192.168.100.1">
    </p>
    <p>Remote Address (IP Pool): 
        <select onchange="document.getElementById('remote_address').value = this.value">
            <option value="">-- Kosongkan --</option>
            @foreach($pools as $name => $label)
                <option value="{{ $name }}" {{ $package->remote_address == $name ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
        Atau ketik: <input type="text" id="remote_address" name="remote_address" value="{{ $package->remote_address }}" placeholder="pool-pppoe">
    </p>
    <button type="submit">Update</button>
</form>
@endsection