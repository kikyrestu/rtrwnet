@extends('layouts.app')

@section('title', 'Mikrotik Debug Result')

@section('content')
<h2>Hasil Debug: {{ $type }} (ID: {{ $id }})</h2>

@if(isset($data['status']) && $data['status'] === 'OK')
    <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>Berhasil terhubung ke Mikrotik!</strong><br>
        Aksi: {{ $data['action'] ?? '' }}
    </div>
@else
    <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>Gagal!</strong><br>
        Status: {{ $data['status'] ?? 'UNKNOWN' }}<br>
        Pesan: {{ $data['message'] ?? 'Tidak diketahui' }}
    </div>
@endif

<h3>Raw Response:</h3>
<div style="background: #2d2d2d; color: #00ff00; padding: 15px; overflow-x: auto; border-radius: 4px;">
    <pre>{{ json_encode($data['mikrotik_response'] ?? [], JSON_PRETTY_PRINT) }}</pre>
</div>
<br>
<button onclick="window.close()" style="padding: 8px 16px; cursor: pointer;">Tutup Halaman</button>
@endsection
