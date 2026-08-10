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
        Schema::table('packages', function (Blueprint $table) {
            $table->text('description')->nullable()->after('price');
            $table->integer('speed_mbps')->nullable()->after('description');
            $table->boolean('is_visible')->default(true)->after('speed_mbps');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['description', 'speed_mbps', 'is_visible']);
        });
    }
};
