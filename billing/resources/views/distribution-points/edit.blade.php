@extends('layouts.app')
@section('title', 'Edit Distribution Point')
@section('content')
<form action="{{ route('distribution-points.update', $dp) }}" method="POST">
    @csrf @method('PUT')
    <p>Router: 
        <select name="router_id" required>
            @foreach(\App\Models\Router::all() as $r)
                <option value="{{ $r->id }}" {{ $dp->router_id == $r->id ? 'selected' : '' }}>{{ $r->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Nama DP: <input type="text" name="name" value="{{ $dp->name }}" required></p>
    <p>Tipe: 
        <select name="type" required>
            <option value="fiber" {{ $dp->type == 'fiber' ? 'selected' : '' }}>Fiber</option>
            <option value="wireless" {{ $dp->type == 'wireless' ? 'selected' : '' }}>Wireless</option>
        </select>
    </p>
    <p>Total Ports: <input type="number" name="total_ports" value="{{ $dp->total_ports }}" required></p>
    <p>Available Ports: <input type="number" name="available_ports" value="{{ $dp->available_ports }}" required></p>
    <p>Lat/Lng: <input type="text" name="latitude" value="{{ $dp->latitude }}" placeholder="Latitude"> <input type="text" name="longitude" value="{{ $dp->longitude }}" placeholder="Longitude"></p>
    <button type="submit">Update</button>
</form>
@endsection