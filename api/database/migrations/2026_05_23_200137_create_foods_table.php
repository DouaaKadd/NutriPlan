<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->decimal('kcal_per_100g', 7, 2);
            $table->decimal('proteins_per_100g', 6, 2)->default(0);
            $table->decimal('carbs_per_100g', 6, 2)->default(0);
            $table->decimal('fats_per_100g', 6, 2)->default(0);
            $table->decimal('fiber_per_100g', 6, 2)->nullable();
            $table->decimal('sugar_per_100g', 6, 2)->nullable();
            $table->enum('source', ['off', 'manual'])->default('manual');
            $table->string('external_id')->nullable()->index();
            $table->string('image_url', 500)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['source', 'external_id']);
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
