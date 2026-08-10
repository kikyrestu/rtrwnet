<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wa_broadcast_logs', function (Blueprint $table) {
            $table->string('fonnte_message_id')->nullable()->after('message');
            $table->timestamp('schedule_time')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wa_broadcast_logs', function (Blueprint $table) {
            $table->dropColumn(['fonnte_message_id', 'schedule_time']);
        });
    }
};
