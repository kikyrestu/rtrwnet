@extends("layouts.app")
@section("content")
<form action="{{ route("regions.store") }}" method="POST">@csrf
Kode: <input name="code" required> Nama: <input name="name" required><button>Simpan</button></form>
@endsection