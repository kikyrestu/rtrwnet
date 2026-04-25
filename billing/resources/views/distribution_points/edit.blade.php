@extends("layouts.app")
@section("content")
<form action="{{ route("distribution_points.update", $data) }}" method="POST">@csrf @method("PUT")
OLT Induk: <select name="olt_id">@foreach($olts as $o)<option value="{{ $o->id }}" {{ $data->olt_id == $o->id ? "selected" : "" }}>{{ $o->name }} ({{ $o->region->name ?? "" }})</option>@endforeach</select><br>
Port PON OLT: <input name="olt_pon_port" value="{{ $data->olt_pon_port }}"><br>
Nama ODP: <input name="name" value="{{ $data->name }}" required> Total Colokan ODP: <input type="number" name="total_ports" value="{{ $data->total_ports }}"><br><button>Update</button></form>
@endsection