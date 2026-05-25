<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenFoodFactsService
{
    private const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
    private const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product/';

    public function search(string $query, int $page = 1, int $pageSize = 20): array
    {
        $response = Http::timeout(8)
            ->withHeaders(['User-Agent' => 'NutriPlan/1.0 (https://github.com/DouaaKadd)'])
            ->get(self::SEARCH_URL, [
                'search_terms' => $query,
                'search_simple' => 1,
                'action' => 'process',
                'json' => 1,
                'page' => $page,
                'page_size' => $pageSize,
                'fields' => 'code,product_name,brands,nutriments,image_small_url,image_url',
            ]);

        if (! $response->successful()) {
            return ['products' => [], 'count' => 0];
        }

        $products = collect($response->json('products', []))
            ->map(fn ($p) => $this->normalize($p))
            ->filter(fn ($p) => $p !== null)
            ->values()
            ->all();

        return [
            'products' => $products,
            'count' => $response->json('count', 0),
        ];
    }

    public function byBarcode(string $barcode): ?array
    {
        $response = Http::timeout(8)
            ->withHeaders(['User-Agent' => 'NutriPlan/1.0'])
            ->get(self::PRODUCT_URL.$barcode.'.json');

        if (! $response->successful() || $response->json('status') !== 1) {
            return null;
        }

        return $this->normalize($response->json('product'));
    }

    private function normalize(?array $product): ?array
    {
        if (! $product || empty($product['product_name'])) {
            return null;
        }

        $n = $product['nutriments'] ?? [];

        $kcal = $n['energy-kcal_100g'] ?? ($n['energy_100g'] ?? null);
        if ($kcal === null && isset($n['energy_value'])) {
            $kcal = $n['energy_value'];
        }
        if ($kcal === null) {
            return null;
        }

        return [
            'external_id' => $product['code'] ?? null,
            'name' => trim($product['product_name']),
            'brand' => $product['brands'] ?? null,
            'kcal_per_100g' => round((float) $kcal, 2),
            'proteins_per_100g' => round((float) ($n['proteins_100g'] ?? 0), 2),
            'carbs_per_100g' => round((float) ($n['carbohydrates_100g'] ?? 0), 2),
            'fats_per_100g' => round((float) ($n['fat_100g'] ?? 0), 2),
            'fiber_per_100g' => isset($n['fiber_100g']) ? round((float) $n['fiber_100g'], 2) : null,
            'sugar_per_100g' => isset($n['sugars_100g']) ? round((float) $n['sugars_100g'], 2) : null,
            'image_url' => $product['image_small_url'] ?? ($product['image_url'] ?? null),
            'source' => 'off',
        ];
    }
}
