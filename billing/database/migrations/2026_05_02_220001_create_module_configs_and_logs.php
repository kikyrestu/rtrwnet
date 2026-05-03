<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_configs', function (Blueprint $table) {
            $table->id();
            $table->string('module')->index(); // 'auto_suspend', 'payment_gateway', 'client_portal'
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();
            
            $table->unique(['module', 'key']);
        });

        Schema::create('auto_suspend_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('action'); // 'suspend', 'unsuspend'
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auto_suspend_logs');
        Schema::dropIfExists('module_configs');
    }
};
