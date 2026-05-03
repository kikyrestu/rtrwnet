<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('unit')->default('pcs'); // pcs, meter, unit, roll, buah
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('inventory_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('min_stock')->default(5);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->integer('quantity');
            $table->string('reference')->nullable(); // e.g. "Instalasi Customer #123"
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};
