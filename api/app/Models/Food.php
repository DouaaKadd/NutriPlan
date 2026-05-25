<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Food extends Model
{
    protected $table = 'foods';

    protected $fillable = [
        'name',
        'brand',
        'kcal_per_100g',
        'proteins_per_100g',
        'carbs_per_100g',
        'fats_per_100g',
        'fiber_per_100g',
        'sugar_per_100g',
        'source',
        'external_id',
        'image_url',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'kcal_per_100g' => 'decimal:2',
            'proteins_per_100g' => 'decimal:2',
            'carbs_per_100g' => 'decimal:2',
            'fats_per_100g' => 'decimal:2',
            'fiber_per_100g' => 'decimal:2',
            'sugar_per_100g' => 'decimal:2',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function mealItems(): HasMany
    {
        return $this->hasMany(MealItem::class);
    }
}
