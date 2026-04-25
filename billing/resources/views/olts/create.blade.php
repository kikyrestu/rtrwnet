@extends("layouts.app")
@section("content")
<form action="{{ route("olts.store") }}" method="POST">@csrf
Wilayah: <select name="region_id">@foreach($regions as $rg)<option value="{{ $rg->id }}">{{ $rg->name }}</option>@endforeach</select> | Router/Mikrotik Induk: <select name="router_id">@foreach($routers as $rt)<option value="{{ $rt->id }}">{{ $rt->name }} ({{ $rt->host }})</option>@endforeach</select><br>
Nama: <input name="name" required> Brand: <input name="brand"><br>
IP: <input name="ip_address"> PON: <input type="number" name="total_pon_ports" value="8"><button>Simpan</button></form>
@endsection