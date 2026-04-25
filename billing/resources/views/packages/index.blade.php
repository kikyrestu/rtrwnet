@extends('layouts.app')
@section('title', 'Packages')
@section('content')
<a href="{{ route('packages.create') }}"><button>Tambah Package</button></a>
<br><br>
<table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr><th>ID</th><th>Nama Paket</th><th>Harga</th><th>Profil Mikrotik</th><th>Aksi</th></tr>
    </thead>
    <tbody>
        @foreach($packages as $package)
        <tr>
            <td>{{ $package->id }}</td>
            <td>{{ $package->name }}</td>
            <td>{{ $package->price }}</td>
            <td>{{ $package->mikrotik_profile_name }}</td>
            <td>
                <a href="{{ route('mikrotik.debug', ['type' => 'package', 'id' => $package->id]) }}" target="_blank">Debug Profil di DB Router</a> |
                <a href="{{ route('packages.edit', $package) }}">Edit</a> |
                <form action="{{ route('packages.destroy', $package) }}" method="POST" style="display:inline;">
                    @csrf @method('DELETE')
                    <button type="submit" onclick="return confirm('Hapus?')">Hapus</button>
                </form>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endsection