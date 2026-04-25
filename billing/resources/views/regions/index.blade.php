@extends("layouts.app")
@section("content")
<h2>Wilayah/Cabang</h2><a href="{{ route("regions.create") }}">Tambah</a>
<ul>
@foreach($data as $r)
<li>{{ $r->name }} ({{ $r->code }}) - <a href="{{ route("regions.edit", $r) }}">Edit</a>
<form action="{{ route("regions.destroy", $r) }}" method="POST" style="display:inline;">@csrf @method("DELETE") <button>Hapus</button></form></li>
@endforeach
</ul>
@endsection