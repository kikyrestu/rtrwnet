<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['reminder', 'payment_confirm', 'gangguan', 'welcome', 'custom'])->default('custom');
            $table->text('body'); // bisa pakai placeholder {nama}, {tagihan}, {periode}
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('wa_broadcast_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->nullable()->constrained('wa_templates')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('phone');
            $table->text('message');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_broadcast_logs');
        Schema::dropIfExists('wa_templates');
    }
};
