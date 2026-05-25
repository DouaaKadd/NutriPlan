<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeightLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class WeightLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 90);
        $from = Carbon::today()->subDays($days);

        $logs = $request->user()->weightLogs()
            ->where('date', '>=', $from)
            ->orderBy('date')
            ->get();

        return response()->json($logs);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'weight_kg' => ['required', 'numeric', 'min:30', 'max:300'],
        ]);

        $log = WeightLog::updateOrCreate(
            ['user_id' => $request->user()->id, 'date' => $data['date']],
            ['weight_kg' => $data['weight_kg']],
        );

        return response()->json($log, 201);
    }

    public function destroy(Request $request, WeightLog $weightLog): JsonResponse
    {
        abort_if($weightLog->user_id !== $request->user()->id, 403);
        $weightLog->delete();

        return response()->json(['message' => 'OK']);
    }
}
