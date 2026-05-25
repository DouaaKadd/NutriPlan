<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    public function __construct(private OpenFoodFactsService $off) {}

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));
        $source = $request->query('source', 'all');

        if ($query === '') {
            return response()->json(['local' => [], 'remote' => []]);
        }

        $local = Food::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('brand', 'like', "%{$query}%")
            ->limit(15)
            ->get();

        $remote = [];
        if ($source !== 'local') {
            $remote = $this->off->search($query, 1, 15)['products'];
        }

        return response()->json([
            'local' => $local,
            'remote' => $remote,
        ]);
    }

    public function show(Food $food): JsonResponse
    {
        return response()->json($food);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'brand' => ['nullable', 'string', 'max:120'],
            'kcal_per_100g' => ['required', 'numeric', 'min:0', 'max:1000'],
            'proteins_per_100g' => ['required', 'numeric', 'min:0', 'max:100'],
            'carbs_per_100g' => ['required', 'numeric', 'min:0', 'max:100'],
            'fats_per_100g' => ['required', 'numeric', 'min:0', 'max:100'],
            'fiber_per_100g' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sugar_per_100g' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'external_id' => ['nullable', 'string', 'max:100'],
            'source' => ['nullable', 'in:off,manual'],
        ]);

        $data['source'] ??= 'manual';
        $data['created_by'] = $request->user()->id;

        if ($data['source'] === 'off' && ! empty($data['external_id'])) {
            $existing = Food::where('source', 'off')->where('external_id', $data['external_id'])->first();
            if ($existing) {
                return response()->json($existing);
            }
        }

        $food = Food::create($data);

        return response()->json($food, 201);
    }
}
