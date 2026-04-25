@extends("layouts.app")
@section("content")
<form action="{{ route("regions.update", $data) }}" method="POST">@csrf @method("PUT")
Kode: <input name="code" value="{{ $data->code }}" required> Nama: <input name="name" value="{{ $data->name }}" required><button>Update</button></form>
@endsection