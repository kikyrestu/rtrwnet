@extends("layouts.app")
@section("content")
<h2>Data OLT</h2><a href="{{ route("olts.create") }}">Tambah</a>
<ul>
@foreach($data as $r)
<li>{{ $r->name }} [{{ $r->region->name ?? "-" }}] | Induk: ({{ $r->router->name ?? "Belum Ada Mikrotik" }}) (PON: {{ $r->total_pon_ports }}) - <a href="{{ route("olts.edit", $r) }}">Edit</a>
<form action="{{ route("olts.destroy", $r) }}" method="POST" style="display:inline;">@csrf @method("DELETE") <button>Hapus</button></form></li>
@endforeach
</ul>
@endsection