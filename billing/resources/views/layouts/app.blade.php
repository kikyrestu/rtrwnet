<!DOCTYPE html>
<html>
<head>
    <title>RT/RW Net System</title>
</head>
<body style="font-family: sans-serif; padding: 20px;">
    @auth
    <div style="background: #eee; padding: 10px; margin-bottom: 20px; display: flex; justify-content: space-between;">
        <span>Login sebagai: <b>{{ Auth::user()->name }}</b> (Role: <span style="color: blue;">{{ strtoupper(Auth::user()->role) }}</span>)</span>
        <form method="POST" action="{{ route('logout') }}" style="margin: 0;">
            @csrf
            <button type="submit" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Logout</button>
        </form>
    </div>
    <nav style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
        @if(in_array(Auth::user()->role, ['admin', 'technician']))
        <a href="{{ route('routers.index') }}">Routers</a> | 
        <a href="{{ route('olts.index') }}">OLT Induk</a> | 
        <a href="{{ route('distribution_points.index') }}">Data ODP/Tiang</a> | 
        <a href="{{ route('sync.index') }}" style="color: red; font-weight: bold;">Auto-Sync</a> |
        @endif
        
        @if(Auth::user()->role == 'admin')
        <a href="{{ route('regions.index') }}">Wilayah</a> | 
        <a href="{{ route('packages.index') }}">Packages</a> | 
        <a href="{{ route('users.index') }}" style="color: purple; font-weight: bold;">Users & RBAC</a> | 
        @endif

        @if(in_array(Auth::user()->role, ['admin', 'technician', 'sales']))
        <a href="{{ route('customers.index') }}">Customers</a> |
        @endif

        @if(in_array(Auth::user()->role, ['admin', 'collector']))
        <a href="{{ route('invoices.index') }}" style="color: blue; font-weight: bold;">Billings / Tagihan (Rp)</a> |
        @endif

        @if(in_array(Auth::user()->role, ['admin', 'collector', 'sales']))
        <a href="{{ route('reports.index') }}" style="color: green; font-weight: bold;">Laporan Pendapatan</a>
        @endif
    </nav>
    @endauth

    <main>
        <h3>@yield('title')</h3>
        @yield('content')
    </main>
</body>
</html>
