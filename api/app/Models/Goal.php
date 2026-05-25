<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    protected $fillable = [
        'user_id',
        'kcal_target',
        'proteins_g_target',
        'carbs_g_target',
        'fats_g_target',
        'water_ml_target',
        'weight_kg_target',
        'activity_level',
    ];

    protected function casts(): array
    {
        return [
            'kcal_target' => 'integer',
            'proteins_g_target' => 'integer',
            'carbs_g_target' => 'integer',
            'fats_g_target' => 'integer',
            'water_ml_target' => 'integer',
            'weight_kg_target' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
