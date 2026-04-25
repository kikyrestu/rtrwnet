@extends('layouts.app')

@section('title', 'Auto-Discovery & Sinkronisasi Mikrotik')

@section('content')

@if(session('success'))
    <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        {{ session('success') }}
    </div>
@endif

@if(session('error'))
    <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        {{ session('error') }}
    </div>
@endif

<div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 600px;">
    <h2>Tarik Data Massal dari Router Mikrotik</h2>
    <p>Fitur ini akan menyalin seluruh data Profile (ke tabel Packages) dan Secret (ke tabel Customers) yang saat ini sudah berjalan di Mikrotik ke dalam sistem web Billing.</p>
    
    <form action="{{ route('sync.process') }}" method="POST">
        @csrf
        <p>
            <strong>Pilih Router Target:</strong><br>
            <select name="router_id" required style="padding: 8px; margin-top: 5px; width: 100%;">
                <option value="">-- Pilih Mikrotik OLT --</option>
                @foreach($routers as $router)
                    <option value="{{ $router->id }}">{{ $router->name }} ({{ $router->host }})</option>
                @endforeach
            </select>
        </p>

        <button type="submit" style="padding: 10px 20px; font-weight: bold; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="return confirm('Yakin ingin menarik massal semua profil dan pengguna PPPoE? Data yang ada di billing akan tertimpa/ditambahkan jika namanya sama.')">
            Sinkronisasikan Sekarang!
        </button>
    </form>
</div>

@endsection