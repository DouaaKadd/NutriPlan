<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealItem extends Model
{
    protected $fillable = [
        'meal_id',
        'food_id',
        'grams',
    ];

    protected function casts(): array
    {
        return [
            'grams' => 'decimal:2',
        ];
    }

    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class);
    }

    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }

    public function getKcalAttribute(): float
    {
        return round($this->food->kcal_per_100g * $this->grams / 100, 2);
    }

    public function getProteinsAttribute(): float
    {
        return round($this->food->proteins_per_100g * $this->grams / 100, 2);
    }

    public function getCarbsAttribute(): float
    {
        return round($this->food->carbs_per_100g * $this->grams / 100, 2);
    }

    public function getFatsAttribute(): float
    {
        return round($this->food->fats_per_100g * $this->grams / 100, 2);
    }
}
