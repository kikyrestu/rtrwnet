@extends('layouts.app')
@section('title', 'Edit Customer')
@section('content')
<form action="{{ route('customers.update', $customer) }}" method="POST">
    @csrf @method('PUT')
    <p>NIK: <input type="text" name="nik" value="{{ $customer->nik }}"></p>
    <p>Nama: <input type="text" name="name" value="{{ $customer->name }}" required></p>
    <p>Phone Valid WA: <input type="text" name="phone" value="{{ $customer->phone }}"></p>
    <p>Alamat: <textarea name="address">{{ $customer->address }}</textarea></p>
    <p>Package: 
        <select name="package_id" required>
            @foreach(\App\Models\Package::all() as $p)
                <option value="{{ $p->id }}" {{ $customer->package_id == $p->id ? 'selected' : '' }}>{{ $p->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Wilayah: 
        <select name="region_id">
            <option value="">- Bebas -</option>
            @foreach(\App\Models\Region::all() as $reg)
                <option value="{{ $reg->id }}" {{ $customer->region_id == $reg->id ? 'selected' : '' }}>{{ $reg->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Customer Router: 
        <select name="router_id" required>
            @foreach(\App\Models\Router::all() as $r)
                <option value="{{ $r->id }}" {{ $customer->router_id == $r->id ? 'selected' : '' }}>{{ $r->name }}</option>
            @endforeach
        </select>
    </p>
    <p>Pilih ODP Utama: 
        <select name="distribution_point_id">
            <option value="">- Kosong / Belum Tarik Kabel -</option>
            @foreach(\App\Models\DistributionPoint::with('olt.region')->get() as $d)
                <option value="{{ $d->id }}" {{ $customer->distribution_point_id == $d->id ? 'selected' : '' }}>{{ $d->name }} ({{ $d->olt->region->name ?? 'Pusat' }} - Port OLT {{ $d->olt_pon_port }})</option>
            @endforeach
        </select>
    </p>
    <p>Status: 
        <select name="status" required>
            <option value="active" {{ $customer->status == 'active' ? 'selected' : '' }}>Active</option>
            <option value="isolated" {{ $customer->status == 'isolated' ? 'selected' : '' }}>Isolated</option>
            <option value="inactive" {{ $customer->status == 'inactive' ? 'selected' : '' }}>Inactive</option>
        </select>
    </p>
    <p>Pilih Lubang (Port) di ODP: <input type="number" min="1" max="24" name="dp_port_number" value="{{ $customer->dp_port_number }}" placeholder="Contoh: 3"></p>
    <p>Merk Modem (ONT): <select name="ont_merk"><option value="">- Kosong -</option><option value="ZTE" {{ $customer->ont_merk == 'ZTE' ? 'selected' : '' }}>ZTE</option><option value="Huawei" {{ $customer->ont_merk == 'Huawei' ? 'selected' : '' }}>Huawei</option><option value="Nokia" {{ $customer->ont_merk == 'Nokia' ? 'selected' : '' }}>Nokia / Alcatel</option><option value="Fiberhome" {{ $customer->ont_merk == 'Fiberhome' ? 'selected' : '' }}>Fiberhome</option></select></p>
    <p>Serial Number (SN) / MAC ONT: <input type="text" name="ont_sn" value="{{ $customer->ont_sn }}" placeholder="ZTEGXXXXXX / MAC Address"></p>
    <p>Mikrotik Username: <input type="text" name="mikrotik_username" value="{{ $customer->mikrotik_username }}" required></p>
    <p>Mikrotik Password: <input type="text" name="mikrotik_password" value="{{ $customer->mikrotik_password }}" required></p>
    <p>Cicilan Tanggal: <input type="number" min="1" max="31" name="billing_cycle_date" value="{{ $customer->billing_cycle_date }}"></p>
    <button type="submit">Update</button>
</form>
@endsection