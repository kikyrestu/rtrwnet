<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotspot_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('router_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('rate_limit')->nullable(); // e.g. "5M/5M"
            $table->integer('shared_users')->default(1);
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('validity_hours')->default(24); // durasi voucher dalam jam
            $table->timestamps();
        });

        Schema::create('hotspot_vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('hotspot_profiles')->cascadeOnDelete();
            $table->string('code')->unique(); // kode voucher yg dicetak
            $table->string('username')->unique();
            $table->string('password');
            $table->enum('status', ['unused', 'active', 'expired', 'used'])->default('unused');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotspot_vouchers');
        Schema::dropIfExists('hotspot_profiles');
    }
};
