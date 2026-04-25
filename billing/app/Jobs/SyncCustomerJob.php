<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use App\Models\Customer;
use App\Services\MikrotikService;

class SyncCustomerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 60; // Wait 60 seconds before retrying

    protected $customer;
    protected $action;
    protected $oldUsername;

    /**
     * Create a new job instance.
     */
    public function __construct(Customer $customer, string $action = 'add', string $oldUsername = null)
    {
        $this->customer = $customer;
        $this->action = $action;
        $this->oldUsername = $oldUsername;
    }

    /**
     * Execute the job.
     */
    public function handle(MikrotikService $mikrotikService): void
    {
        $success = $mikrotikService->syncCustomerSecret($this->action, $this->customer, $this->oldUsername);

        if (!$success) {
            $this->release($this->backoff); // Release the job back to the queue
        }
    }
}