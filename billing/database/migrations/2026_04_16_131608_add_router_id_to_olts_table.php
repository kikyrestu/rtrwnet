<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table("olts", function (Blueprint $table) {
            $table->foreignId("router_id")->after("region_id")->nullable()->constrained("routers")->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::table("olts", function (Blueprint $table) {
            $table->dropForeign(["router_id"]);
            $table->dropColumn("router_id");
        });
    }
};
