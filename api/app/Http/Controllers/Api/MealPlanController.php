<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Models\MealPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MealPlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->mealPlans()->orderByDesc('week_start')->limit(10)->get(),
        );
    }

    public function show(Request $request, MealPlan $mealPlan): JsonResponse
    {
        abort_if($mealPlan->user_id !== $request->user()->id, 403);

        return response()->json($mealPlan);
    }

    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'week_start' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $goal = $user->goal;
        abort_unless($goal, 422, 'Define tus objetivos primero');

        $weekStart = Carbon::parse($data['week_start'] ?? Carbon::today()->startOfWeek()->toDateString());

        $foodPool = Food::query()
            ->whereNotNull('kcal_per_100g')
            ->inRandomOrder()
            ->limit(60)
            ->get();

        abort_if($foodPool->isEmpty(), 422, 'Necesitas alimentos en la biblioteca para generar un plan');

        $mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
        $mealShares = ['breakfast' => 0.25, 'lunch' => 0.35, 'snack' => 0.10, 'dinner' => 0.30];

        $plan = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $weekStart->copy()->addDays($i);
            $dayMeals = [];
            foreach ($mealTypes as $type) {
                $targetKcal = $goal->kcal_target * $mealShares[$type];
                $picks = $foodPool->random(min(3, $foodPool->count()))->map(function ($food) use ($targetKcal) {
                    $grams = $food->kcal_per_100g > 0
                        ? round(($targetKcal / 3) / $food->kcal_per_100g * 100, 0)
                        : 100;
                    return [
                        'food_id' => $food->id,
                        'name' => $food->name,
                        'brand' => $food->brand,
                        'grams' => max(10, min(400, $grams)),
                    ];
                })->all();

                $dayMeals[$type] = $picks;
            }
            $plan[$day->toDateString()] = $dayMeals;
        }

        $mealPlan = MealPlan::updateOrCreate(
            ['user_id' => $user->id, 'week_start' => $weekStart->toDateString()],
            ['generated_at' => now(), 'data' => $plan],
        );

        return response()->json($mealPlan, 201);
    }

    public function destroy(Request $request, MealPlan $mealPlan): JsonResponse
    {
        abort_if($mealPlan->user_id !== $request->user()->id, 403);
        $mealPlan->delete();

        return response()->json(['message' => 'OK']);
    }
}
