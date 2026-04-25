<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Wilayah / Cabang ISP (Banyuwangi, Jember, Lumajang)
        Schema::create("regions", function (Blueprint $table) {
            $table->id();
            $table->string("code", 10)->unique(); // e.g., BWI, JBR, LMJ
            $table->string("name");
            $table->timestamps();
        });

        // 2. Optical Line Terminal (Pusat Fiber Optic)
        Schema::create("olts", function (Blueprint $table) {
            $table->id();
            $table->foreignId("region_id")->constrained("regions")->cascadeOnDelete();
            $table->string("name"); // e.g., OLT ZTE C320 Banyuwangi
            $table->string("brand")->nullable(); // e.g., ZTE, Huawei, Hioso
            $table->string("ip_address")->nullable();
            $table->string("host_username")->nullable();
            $table->string("host_password")->nullable();
            $table->integer("total_pon_ports")->default(8); // e.g., 8 PON, 16 PON
            $table->timestamps();
        });

        // 3. Optical Distribution Point (Kotak Tiang)
        Schema::create("distribution_points", function (Blueprint $table) {
            $table->id();
            $table->foreignId("olt_id")->constrained("olts")->cascadeOnDelete();
            $table->string("olt_pon_port")->nullable(); // e.g., PON-1, PON-2
            $table->string("name"); // e.g., ODP-BWI-Mawar-01
            $table->integer("total_ports")->default(8); // 8, 16, 24
            $table->decimal("latitude", 10, 8)->nullable();
            $table->decimal("longitude", 11, 8)->nullable();
            $table->text("address")->nullable();
            $table->timestamps();
        });

        // 4. Update Customers Table
        Schema::table("customers", function (Blueprint $table) {
            $table->foreignId("region_id")->nullable()->constrained("regions")->nullOnDelete();
            $table->string("ont_sn")->nullable()->comment("Serial Number Modem/ONT");
            $table->string("ont_merk")->nullable()->comment("Merk Modem, misal ZTE F609");
            
            // Re-adding Foreign Key constraint for existing distribution_point_id
            $table->foreign("distribution_point_id")->references("id")->on("distribution_points")->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table("customers", function (Blueprint $table) {
            $table->dropForeign(["region_id"]);
            $table->dropForeign(["distribution_point_id"]);
            $table->dropColumn(["region_id", "ont_sn", "ont_merk"]);
        });

        Schema::dropIfExists("distribution_points");
        Schema::dropIfExists("olts");
        Schema::dropIfExists("regions");
    }
};
