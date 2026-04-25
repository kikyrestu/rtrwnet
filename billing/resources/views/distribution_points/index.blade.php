@extends("layouts.app")
@section("content")
<h2>Data ODP (Tiang)</h2><a href="{{ route("distribution_points.create") }}">Tambah</a>
<ul>
@foreach($data as $r)
<li>{{ $r->name }} [{{ $r->olt->name ?? "-" }} Port {{ $r->olt_pon_port }}] (Colokan: {{ $r->total_ports }}) - <a href="{{ route("distribution_points.edit", $r) }}">Edit</a>
<form action="{{ route("distribution_points.destroy", $r) }}" method="POST" style="display:inline;">@csrf @method("DELETE") <button>Hapus</button></form></li>
@endforeach
</ul>
@endsection