<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MealController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', Carbon::today()->toDateString());

        $meals = $request->user()->meals()
            ->with('items.food')
            ->whereDate('date', $date)
            ->orderByRaw("FIELD(type, 'breakfast', 'lunch', 'snack', 'dinner')")
            ->get();

        return response()->json($meals);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'type' => ['required', 'in:breakfast,lunch,dinner,snack'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $meal = $request->user()->meals()->create($data);

        return response()->json($meal->load('items.food'), 201);
    }

    public function show(Request $request, Meal $meal): JsonResponse
    {
        $this->authorizeOwn($request, $meal);

        return response()->json($meal->load('items.food'));
    }

    public function update(Request $request, Meal $meal): JsonResponse
    {
        $this->authorizeOwn($request, $meal);

        $data = $request->validate([
            'date' => ['sometimes', 'date'],
            'type' => ['sometimes', 'in:breakfast,lunch,dinner,snack'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $meal->update($data);

        return response()->json($meal->load('items.food'));
    }

    public function destroy(Request $request, Meal $meal): JsonResponse
    {
        $this->authorizeOwn($request, $meal);

        $meal->delete();

        return response()->json(['message' => 'OK']);
    }

    private function authorizeOwn(Request $request, Meal $meal): void
    {
        abort_if($meal->user_id !== $request->user()->id, 403);
    }
}
