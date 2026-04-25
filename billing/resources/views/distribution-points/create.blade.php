@extends('layouts.app')
@section('title', 'Tambah Distribution Point')
@section('content')
<form action="{{ route('distribution-points.store') }}" method="POST">
    @csrf
    <p>Router: 
        <select name="router_id" required>
            @foreach(\App\Models\Router::all() as $r)
                <option value="{{ $r->id }}">{{ $r->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Nama DP: <input type="text" name="name" required></p>
    <p>Tipe: 
        <select name="type" required>
            <option value="fiber">Fiber</option>
            <option value="wireless">Wireless</option>
        </select>
    </p>
    <p>Total Ports: <input type="number" name="total_ports" value="8" required></p>
    <p>Lat/Lng: <input type="text" name="latitude" placeholder="Latitude"> <input type="text" name="longitude" placeholder="Longitude"></p>
    <button type="submit">Simpan</button>
</form>
@endsection