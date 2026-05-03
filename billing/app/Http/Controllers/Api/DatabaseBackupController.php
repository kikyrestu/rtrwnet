<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Ifsnop\Mysqldump as IMysqldump;
use Illuminate\Support\Facades\DB;
use App\Services\AuditService;

class DatabaseBackupController extends Controller
{
    public function index()
    {
        $files = Storage::disk('local')->files('backups');
        $backups = collect($files)->map(function ($file) {
            return [
                'name' => basename($file),
                'size' => round(Storage::disk('local')->size($file) / 1024, 2) . ' KB',
                'date' => date('Y-m-d H:i:s', Storage::disk('local')->lastModified($file)),
                'path' => $file,
            ];
        })->sortByDesc('date')->values();

        return response()->json($backups);
    }

    public function create()
    {
        try {
            Storage::disk('local')->makeDirectory('backups');
            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            $path = storage_path('app/backups/' . $filename);

            $dump = new IMysqldump\Mysqldump(
                'mysql:host=' . env('DB_HOST') . ';dbname=' . env('DB_DATABASE'),
                env('DB_USERNAME'),
                env('DB_PASSWORD')
            );
            $dump->start($path);

            AuditService::log('created', 'Backup', "Admin created database backup: {$filename}");

            return response()->json(['message' => 'Backup berhasil dibuat', 'filename' => $filename]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membuat backup: ' . $e->getMessage()], 500);
        }
    }

    public function download($filename)
    {
        $path = 'backups/' . $filename;
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        AuditService::log('downloaded', 'Backup', "Admin downloaded database backup: {$filename}");

        return Storage::disk('local')->download($path);
    }

    public function delete($filename)
    {
        $path = 'backups/' . $filename;
        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
            AuditService::log('deleted', 'Backup', "Admin deleted database backup: {$filename}");
            return response()->json(['message' => 'Backup dihapus']);
        }
        return response()->json(['message' => 'File tidak ditemukan'], 404);
    }
}
