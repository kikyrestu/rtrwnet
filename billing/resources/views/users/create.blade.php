@extends('layouts.app')

@section('content')
<div class="row mb-4">
    <div class="col-md-6">
        <h2>{{ isset($user) ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h2>
    </div>
    <div class="col-md-6 text-end">
        <a href="{{ route('users.index') }}" class="btn btn-secondary">Kembali</a>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <form action="{{ isset($user) ? route('users.update', $user->id) : route('users.store') }}" method="POST">
            @csrf
            @if(isset($user))
                @method('PUT')
            @endif

            <div class="mb-3">
                <label>Nama Lengkap</label>
                <input type="text" name="name" class="form-control" value="{{ old('name', $user->name ?? '') }}" required>
            </div>

            <div class="mb-3">
                <label>Email (Username Login)</label>
                <input type="email" name="email" class="form-control" value="{{ old('email', $user->email ?? '') }}" required>
            </div>

            <div class="mb-3">
                <label>Role</label>
                <select name="role" class="form-control">
                    <option value="admin" {{ (old('role', $user->role ?? '') == 'admin') ? 'selected' : '' }}>Admin (Full Access)</option>
                    <option value="technician" {{ (old('role', $user->role ?? '') == 'technician') ? 'selected' : '' }}>Teknisi</option>
                    <option value="sales" {{ (old('role', $user->role ?? '') == 'sales') ? 'selected' : '' }}>Sales</option>
                    <option value="collector" {{ (old('role', $user->role ?? '') == 'collector') ? 'selected' : '' }}>Kolektor Lapangan</option>
                </select>
            </div>

            <div class="mb-3">
                <label>Batasi Wilayah (Untuk Sales & Kolektor)</label>
                <select name="region_id" class="form-control">
                    <option value="">-- Semua Wilayah / Admin / Teknisi --</option>
                    @foreach($regions as $region)
                        <option value="{{ $region->id }}" {{ (old('region_id', $user->region_id ?? '') == $region->id) ? 'selected' : '' }}>
                            {{ $region->name }}
                        </option>
                    @endforeach
                </select>
                <small class="text-muted">Jika Role adalah Admin atau Teknisi, kosongkan ini.</small>
            </div>

            <div class="mb-3">
                <label>Password {{ isset($user) ? '(Kosongkan jika tidak ingin mengubah)' : '' }}</label>
                <input type="password" name="password" class="form-control" {{ isset($user) ? '' : 'required' }}>
            </div>

            <button type="submit" class="btn btn-primary">Simpan</button>
        </form>
    </div>
</div>
@endsection
