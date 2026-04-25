@extends("layouts.app")
@section("content")
<form action="{{ route("olts.update", $data) }}" method="POST">@csrf @method("PUT")
Wilayah: <select name="region_id">@foreach($regions as $rg)<option value="{{ $rg->id }}" {{ $data->region_id == $rg->id ? "selected" : "" }}>{{ $rg->name }}</option>@endforeach</select> | Router/Mikrotik Induk: <select name="router_id">@foreach($routers as $rt)<option value="{{ $rt->id }}" {{ $data->router_id == $rt->id ? "selected" : "" }}>{{ $rt->name }} ({{ $rt->host }})</option>@endforeach</select><br>
Nama: <input name="name" value="{{ $data->name }}" required> Brand: <input name="brand" value="{{ $data->brand }}"><br>
IP: <input name="ip_address" value="{{ $data->ip_address }}"> PON: <input type="number" name="total_pon_ports" value="{{ $data->total_pon_ports }}"><button>Update</button></form>
@endsection