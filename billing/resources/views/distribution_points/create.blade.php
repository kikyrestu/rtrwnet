@extends("layouts.app")
@section("content")
<form action="{{ route("distribution_points.store") }}" method="POST">@csrf
OLT Induk: <select name="olt_id">@foreach($olts as $o)<option value="{{ $o->id }}">{{ $o->name }} ({{ $o->region->name ?? "" }})</option>@endforeach</select><br>
Port PON OLT (Contoh: PON-1): <input name="olt_pon_port"><br>
Nama ODP: <input name="name" required> Total Colokan ODP: <input type="number" name="total_ports" value="8"><br><button>Simpan</button></form>
@endsection