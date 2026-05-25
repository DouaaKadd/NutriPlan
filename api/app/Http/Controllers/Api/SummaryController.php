<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SummaryController extends Controller
{
    public function day(Request $request): JsonResponse
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        $user = $request->user();

        $meals = $user->meals()
            ->with('items.food')
            ->whereDate('date', $date)
            ->get();

        $totals = ['kcal' => 0, 'proteins' => 0, 'carbs' => 0, 'fats' => 0];

        foreach ($meals as $meal) {
            foreach ($meal->items as $item) {
                $totals['kcal'] += $item->kcal;
                $totals['proteins'] += $item->proteins;
                $totals['carbs'] += $item->carbs;
                $totals['fats'] += $item->fats;
            }
        }

        $totals = array_map(fn ($v) => round($v, 1), $totals);

        $goal = $user->goal;

        return response()->json([
            'date' => $date,
            'totals' => $totals,
            'goal' => $goal,
            'progress' => $goal ? [
                'kcal' => $goal->kcal_target ? round($totals['kcal'] / $goal->kcal_target * 100, 1) : null,
                'proteins' => $goal->proteins_g_target ? round($totals['proteins'] / $goal->proteins_g_target * 100, 1) : null,
                'carbs' => $goal->carbs_g_target ? round($totals['carbs'] / $goal->carbs_g_target * 100, 1) : null,
                'fats' => $goal->fats_g_target ? round($totals['fats'] / $goal->fats_g_target * 100, 1) : null,
            ] : null,
        ]);
    }

    public function week(Request $request): JsonResponse
    {
        $end = Carbon::parse($request->query('end', Carbon::today()->toDateString()));
        $start = $end->copy()->subDays(6);
        $user = $request->user();

        $meals = $user->meals()
            ->with('items.food')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy(fn ($m) => $m->date->toDateString());

        $days = [];
        for ($d = $start->copy(); $d <= $end; $d->addDay()) {
            $key = $d->toDateString();
            $totals = ['kcal' => 0, 'proteins' => 0, 'carbs' => 0, 'fats' => 0];
            foreach ($meals->get($key, collect()) as $meal) {
                foreach ($meal->items as $item) {
                    $totals['kcal'] += $item->kcal;
                    $totals['proteins'] += $item->proteins;
                    $totals['carbs'] += $item->carbs;
                    $totals['fats'] += $item->fats;
                }
            }
            $days[] = [
                'date' => $key,
                'totals' => array_map(fn ($v) => round($v, 1), $totals),
            ];
        }

        return response()->json([
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'days' => $days,
            'goal' => $user->goal,
        ]);
    }
}
