'use client';

import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapInput = dynamic(() => import('./MapInput'), { ssr: false });

interface LocationPickerProps {
    onLocationSelect: (lat: string, lng: string) => void;
    initialLat?: string;
    initialLng?: string;
}

export default function LocationPicker({ onLocationSelect, initialLat = '', initialLng = '' }: LocationPickerProps) {
    const [lat, setLat] = useState(initialLat);
    const [lng, setLng] = useState(initialLng);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('Browser tidak mendukung akses GPS/Lokasi.');
            return;
        }

        setIsLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude.toString());
                setLng(longitude.toString());
                onLocationSelect(latitude.toString(), longitude.toString());
                setIsLoading(false);
            },
            (err) => {
                let errorMsg = 'Gagal mendapatkan lokasi.';
                if (err.code === 1) errorMsg = 'Akses lokasi ditolak oleh browser/perangkat.';
                if (err.code === 2) errorMsg = 'Sinyal GPS tidak ditemukan.';
                if (err.code === 3) errorMsg = 'Waktu pengambilan lokasi habis (timeout).';
                setError(errorMsg);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleMapDrag = (newLat: number, newLng: number) => {
        setLat(newLat.toString());
        setLng(newLng.toString());
        onLocationSelect(newLat.toString(), newLng.toString());
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="text-teal-400" size={20} />
                    <h3 className="font-semibold text-white">Titik Koordinasi Pelanggan</h3>
                </div>
            </div>

            {/* Map Placeholder */}
            <MapInput 
                lat={parseFloat(lat) || -6.200000} 
                lng={parseFloat(lng) || 106.816666} 
                onChange={handleMapDrag} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Latitude</label>
                    <input 
                        type="text" value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        readOnly
                        placeholder="-6.200000"
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Longitude</label>
                    <input 
                        type="text" value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        readOnly
                        placeholder="106.816666"
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                    />
                </div>
            </div>

            {error && (
                <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    {error}
                </div>
            )}

            <button 
                type="button"
                onClick={handleGetLocation}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isLoading 
                        ? 'bg-blue-600/20 text-blue-400/60 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                }`}
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                <span>{isLoading ? 'Melacak...' : 'Get Current Location (GPS)'}</span>
            </button>
            <p className="text-xs text-gray-600 text-center">Gunakan tombol GPS atau geser pin di peta untuk presisi.</p>
        </div>
    );
}