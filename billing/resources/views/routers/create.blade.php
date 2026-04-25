@extends('layouts.app')
@section('title', 'Tambah Router')
@section('content')
<form action="{{ route('routers.store') }}" method="POST">
    @csrf
    <p>Nama: <input type="text" name="name" required></p>
    <p>Host: <input type="text" name="host" required></p>
    <p>API Username: <input type="text" name="api_username" required></p>
    <p>API Password: <input type="text" name="api_password" required></p>
    <p>API Port: <input type="number" name="api_port" value="8728" required></p>
    <button type="submit">Simpan</button>
</form>
@endsection