@extends('layouts.app')
@section('title', 'Login')
@section('content')
<div style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; background: #fff;">
    <h2 style="text-align: center;">Login Admin Panel</h2>
    
    @if($errors->any())
        <div style="color: red; margin-bottom: 10px;">
            <ul style="margin: 0; padding-left: 20px;">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}">
        @csrf
        <p>Email:<br>
        <input type="email" name="email" value="{{ old('email') }}" required style="width: 100%; padding: 8px; box-sizing: border-box;"></p>
        
        <p>Password:<br>
        <input type="password" name="password" required style="width: 100%; padding: 8px; box-sizing: border-box;"></p>
        
        <p><button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer;">Login</button></p>
    </form>
</div>
@endsection
