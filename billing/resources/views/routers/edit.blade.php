@extends('layouts.app')
@section('title', 'Edit Router')
@section('content')
<form action="{{ route('routers.update', $router) }}" method="POST">
    @csrf @method('PUT')
    <p>Nama: <input type="text" name="name" value="{{ $router->name }}" required></p>
    <p>Host: <input type="text" name="host" value="{{ $router->host }}" required></p>
    <p>API Username: <input type="text" name="api_username" value="{{ $router->api_username }}" required></p>
    <p>API Password: <input type="text" name="api_password" value="{{ $router->api_password }}" required></p>
    <p>API Port: <input type="number" name="api_port" value="{{ $router->api_port }}" required></p>
    <button type="submit">Update</button>
</form>
@endsection