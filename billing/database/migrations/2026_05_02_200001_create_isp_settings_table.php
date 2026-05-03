<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('isp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('RT/RW Net');
            $table->string('company_tagline')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('invoice_prefix')->default('INV');
            $table->text('invoice_footer_note')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->integer('due_day')->default(10); // tanggal jatuh tempo default
            $table->timestamps();
        });

        // Insert default row
        \DB::table('isp_settings')->insert([
            'company_name' => 'RT/RW Net',
            'company_tagline' => 'Internet Cepat & Stabil',
            'address' => 'Jl. Contoh No. 1, Kota',
            'phone' => '08123456789',
            'invoice_prefix' => 'INV',
            'invoice_footer_note' => 'Terima kasih telah menggunakan layanan kami. Pembayaran dapat dilakukan melalui transfer bank.',
            'due_day' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_settings');
    }
};
