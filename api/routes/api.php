<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\MealController;
use App\Http\Controllers\Api\MealItemController;
use App\Http\Controllers\Api\MealPlanController;
use App\Http\Controllers\Api\SummaryController;
use App\Http\Controllers\Api\WeightLogController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/goal', [GoalController::class, 'show']);
    Route::put('/goal', [GoalController::class, 'update']);

    Route::get('/foods/search', [FoodController::class, 'search']);
    Route::get('/foods/{food}', [FoodController::class, 'show']);
    Route::post('/foods', [FoodController::class, 'store']);

    Route::apiResource('meals', MealController::class);
    Route::post('meals/{meal}/items', [MealItemController::class, 'store']);
    Route::put('meals/{meal}/items/{item}', [MealItemController::class, 'update']);
    Route::delete('meals/{meal}/items/{item}', [MealItemController::class, 'destroy']);

    Route::get('/weight-logs', [WeightLogController::class, 'index']);
    Route::post('/weight-logs', [WeightLogController::class, 'store']);
    Route::delete('/weight-logs/{weightLog}', [WeightLogController::class, 'destroy']);

    Route::get('/summary/day', [SummaryController::class, 'day']);
    Route::get('/summary/week', [SummaryController::class, 'week']);

    Route::get('/meal-plans', [MealPlanController::class, 'index']);
    Route::post('/meal-plans/generate', [MealPlanController::class, 'generate']);
    Route::get('/meal-plans/{mealPlan}', [MealPlanController::class, 'show']);
    Route::delete('/meal-plans/{mealPlan}', [MealPlanController::class, 'destroy']);
});
