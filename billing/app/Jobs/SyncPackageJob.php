<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use App\Models\Package;
use App\Services\MikrotikService;

class SyncPackageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 60;

    protected $package;
    protected $action;
    protected $oldProfileName;

    /**
     * Create a new job instance.
     */
    public function __construct(Package $package, string $action = 'add', string $oldProfileName = null)
    {
        $this->package = $package;
        $this->action = $action;
        $this->oldProfileName = $oldProfileName;
    }

    /**
     * Execute the job.
     */
    public function handle(MikrotikService $mikrotikService): void
    {
        $success = $mikrotikService->syncProfile($this->action, $this->package, $this->oldProfileName);
        
        if (!$success) {
            $this->release($this->backoff);
        }
    }
}