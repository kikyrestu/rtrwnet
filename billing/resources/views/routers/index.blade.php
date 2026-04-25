@extends('layouts.app')
@section('title', 'Routers')
@section('content')
@if(Auth::user()->role == 'admin')
<a href="{{ route('routers.create') }}"><button>Tambah Router</button></a>
<br><br>
@endif
<table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr><th>ID</th><th>Name</th><th>Host</th><th>API Port</th><th>Aksi</th></tr>
    </thead>
    <tbody>
        @foreach($routers as $router)
        <tr>
            <td>{{ $router->id }}</td>
            <td>{{ $router->name }}</td>
            <td>{{ $router->host }}</td>
            <td>{{ $router->api_port }}</td>
            <td>
                <a href="{{ route('routers.monitor', $router->id) }}" style="color: green; font-weight: bold;">Monitor 📊</a> |
                <a href="{{ route('mikrotik.debug', ['type' => 'router', 'id' => $router->id]) }}" target="_blank">Debug</a> |
                @if(Auth::user()->role == 'admin')
                <a href="{{ route('routers.edit', $router) }}">Edit</a> |
                <form action="{{ route('routers.destroy', $router) }}" method="POST" style="display:inline;">
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