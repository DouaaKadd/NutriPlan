<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use App\Models\MealItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MealItemController extends Controller
{
    public function store(Request $request, Meal $meal): JsonResponse
    {
        $this->authorizeMeal($request, $meal);

        $data = $request->validate([
            'food_id' => ['required', 'exists:foods,id'],
            'grams' => ['required', 'numeric', 'min:1', 'max:5000'],
        ]);

        $item = $meal->items()->create($data);

        return response()->json($item->load('food'), 201);
    }

    public function update(Request $request, Meal $meal, MealItem $item): JsonResponse
    {
        $this->authorizeMeal($request, $meal);
        abort_if($item->meal_id !== $meal->id, 404);

        $data = $request->validate([
            'grams' => ['required', 'numeric', 'min:1', 'max:5000'],
        ]);

        $item->update($data);

        return response()->json($item->load('food'));
    }

    public function destroy(Request $request, Meal $meal, MealItem $item): JsonResponse
    {
        $this->authorizeMeal($request, $meal);
        abort_if($item->meal_id !== $meal->id, 404);

        $item->delete();

        return response()->json(['message' => 'OK']);
    }

    private function authorizeMeal(Request $request, Meal $meal): void
    {
        abort_if($meal->user_id !== $request->user()->id, 403);
    }
}
