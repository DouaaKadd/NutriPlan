<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('kcal_target')->default(2000);
            $table->unsignedSmallInteger('proteins_g_target')->default(120);
            $table->unsignedSmallInteger('carbs_g_target')->default(250);
            $table->unsignedSmallInteger('fats_g_target')->default(70);
            $table->unsignedInteger('water_ml_target')->default(2000);
            $table->decimal('weight_kg_target', 5, 2)->nullable();
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'active', 'very_active'])->default('moderate');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
