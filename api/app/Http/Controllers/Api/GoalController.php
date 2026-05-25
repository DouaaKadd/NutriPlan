<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $goal = $request->user()->goal ?? Goal::create(['user_id' => $request->user()->id]);

        return response()->json($goal);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kcal_target' => ['required', 'integer', 'min:800', 'max:6000'],
            'proteins_g_target' => ['required', 'integer', 'min:20', 'max:400'],
            'carbs_g_target' => ['required', 'integer', 'min:20', 'max:800'],
            'fats_g_target' => ['required', 'integer', 'min:10', 'max:300'],
            'water_ml_target' => ['nullable', 'integer', 'min:500', 'max:8000'],
            'weight_kg_target' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'activity_level' => ['required', 'in:sedentary,light,moderate,active,very_active'],
        ]);

        $goal = Goal::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data,
        );

        return response()->json($goal);
    }
}
