@extends('layouts.app')
@section('title', 'Distribution Points')
@section('content')
<a href="{{ route('distribution-points.create') }}"><button>Tambah DP</button></a>
<br><br>
<table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr><th>ID</th><th>Router</th><th>Nama DP</th><th>Tipe</th><th>Ports (Sisa)</th><th>Aksi</th></tr>
    </thead>
    <tbody>
        @foreach($dps as $dp)
        <tr>
            <td>{{ $dp->id }}</td>
            <td>{{ $dp->router->name ?? '-' }}</td>
            <td>{{ $dp->name }}</td>
            <td>{{ $dp->type }}</td>
            <td>{{ $dp->total_ports }} ({{ $dp->available_ports }})</td>
            <td>
                <a href="{{ route('distribution-points.edit', $dp) }}">Edit</a> |
                <form action="{{ route('distribution-points.destroy', $dp) }}" method="POST" style="display:inline;">
                    @csrf @method('DELETE')
                    <button type="submit" onclick="return confirm('Hapus?')">Hapus</button>
                </form>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endsection