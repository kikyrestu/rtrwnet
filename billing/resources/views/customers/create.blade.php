@extends('layouts.app')
@section('title', 'Tambah Customer')
@section('content')
<form action="{{ route('customers.store') }}" method="POST">
    @csrf
    <p>NIK: <input type="text" name="nik"></p>
    <p>Nama: <input type="text" name="name" required></p>
    <p>Phone Valid WA: <input type="text" name="phone"></p>
    <p>Alamat: <textarea name="address"></textarea></p>
    <p>Package: 
        <select name="package_id" required>
            @foreach(\App\Models\Package::all() as $p)
                <option value="{{ $p->id }}">{{ $p->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Wilayah: 
        <select name="region_id">
            <option value="">- Bebas -</option>
            @foreach(\App\Models\Region::all() as $reg)
                <option value="{{ $reg->id }}">{{ $reg->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Customer Router: 
        <select name="router_id" required>
            @foreach(\App\Models\Router::all() as $r)
                <option value="{{ $r->id }}">{{ $r->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Pilih ODP Utama: 
        <select name="distribution_point_id">
            <option value="">- Kosong / Belum Tarik Kabel -</option>
            @foreach(\App\Models\DistributionPoint::with('olt.region')->get() as $d)
                <option value="{{ $d->id }}">{{ $d->name }} ({{ $d->olt->region->name ?? 'Pusat' }} - Port OLT {{ $d->olt_pon_port }})</option>
            @endforeach
        </select>
    </p>
    <p>Pilih Lubang (Port) di ODP: <input type="number" min="1" max="24" name="dp_port_number" placeholder="Contoh: 3"></p>
    <p>Merk Modem (ONT): <select name="ont_merk"><option value="">- Kosong -</option><option value="ZTE">ZTE</option><option value="Huawei">Huawei</option><option value="Nokia">Nokia / Alcatel</option><option value="Fiberhome">Fiberhome</option></select></p>
    <p>Serial Number (SN) / MAC ONT: <input type="text" name="ont_sn" placeholder="ZTEGXXXXXX / MAC Address"></p>
    <p>Mikrotik Username: <input type="text" name="mikrotik_username" required></p>
    <p>Mikrotik Password: <input type="text" name="mikrotik_password" required></p>
    <p>Cicilan Tanggal: <input type="number" min="1" max="31" name="billing_cycle_date" value="1"></p>
    <button type="submit">Simpan</button>
</form>
@endsection