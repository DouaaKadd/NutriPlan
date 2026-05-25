# NutriPlan

> Aplicación full-stack de planificación nutricional. Registra tus comidas, calcula macros del día y genera planes semanales automáticos. Integrada con la API pública de Open Food Facts.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | **Laravel 12** · PHP 8.2 · Sanctum (tokens) · Eloquent ORM |
| Base de datos | **MySQL 8** (MariaDB compatible) |
| Frontend | **Angular 21** standalone · TypeScript · Signals · Reactive Forms |
| Estilos | **Tailwind CSS v4** · Material Design 3 (paleta verde) |
| Tipografía | Newsreader (serif) + Hanken Grotesk (sans) + Material Symbols |
| Gráficos | Chart.js + ng2-charts |
| Datos externos | Open Food Facts API |

## Funcionalidades

- **Auth** con tokens Sanctum (register / login / logout / me).
- **Dashboard "Hoy"** con resumen de calorías, proteínas, hidratos y grasas vs objetivo + restante por consumir + grid de comidas (desayuno / comida / snack / cena).
- **Diario**: navega cualquier fecha pasada y consulta o edita lo que comiste.
- **Buscador de alimentos** con debounce. Mezcla biblioteca local + Open Food Facts en tiempo real. Guardar un producto OFF en tu biblioteca con un clic.
- **Biblioteca de alimentos** con CRUD manual (nombre, marca, kcal y macros por 100 g).
- **Objetivos** editables: kcal, macros, agua, peso objetivo, nivel de actividad. Botones de reparto rápido (30/40/30, 40/30/30, 25/50/25).
- **Progreso** con tres gráficos:
  - Bar chart de kcal últimos 7 días vs objetivo
  - Donut de reparto de macros del día
  - Line chart de evolución del peso (con input para registrar pesos diarios)
- **Plan semanal**: generador automático de menú 7 días × 4 comidas según tu objetivo de kcal y los alimentos de tu biblioteca.
- **Material Design 3** con tipografía editorial y cards "bento".

## Estructura del repo

```
NutriPlan/
├── api/        # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Auth, Food, Goal, Meal, MealItem, MealPlan, Summary, WeightLog
│   │   ├── Models/                 # User, Food, Goal, Meal, MealItem, MealPlan, WeightLog
│   │   └── Services/OpenFoodFactsService.php
│   ├── database/migrations/
│   └── routes/api.php
└── web/        # Frontend Angular
    └── src/app/
        ├── core/
        │   ├── models/             # interfaces TypeScript
        │   ├── services/           # ApiFood, ApiMeal, ApiGoal, ApiSummary, ApiWeightLog, ApiMealPlan, Auth
        │   ├── guards/             # authGuard, guestGuard
        │   └── interceptors/       # tokenInterceptor (Bearer)
        └── features/
            ├── auth/login · auth/register
            ├── dashboard · diary · foods · progress · plan · goals
            └── shared/layout · shared/food-picker · shared/meal-card
```

## Cómo arrancarlo localmente

### Requisitos
- PHP 8.2+
- Composer 2.x
- Node 20+
- MySQL/MariaDB (XAMPP, Laragon o similar)

### Backend (Laravel)
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
# Configura DB_DATABASE, DB_USERNAME, DB_PASSWORD en .env
php artisan migrate
php artisan serve            # http://127.0.0.1:8000
```

### Frontend (Angular)
```bash
cd web
npm install
npm start                    # http://localhost:4200
```

El frontend espera la API en `http://127.0.0.1:8000/api` (configurable en [`web/src/environments/environment.ts`](web/src/environments/environment.ts)).

## Esquema de base de datos

| Tabla | Descripción |
|---|---|
| `users` | Usuarios autenticados |
| `goals` | Un objetivo por usuario (kcal, macros, agua, peso, nivel actividad) |
| `foods` | Catálogo de alimentos (origen `manual` o `off`) |
| `meals` | Comidas del día (breakfast / lunch / snack / dinner) |
| `meal_items` | Items dentro de cada comida (food + gramos) |
| `weight_logs` | Histórico de peso |
| `meal_plans` | Planes semanales generados (JSON con 7 días × 4 comidas) |

## Endpoints principales

```
POST   /api/register
POST   /api/login
GET    /api/me
POST   /api/logout

GET    /api/goal
PUT    /api/goal

GET    /api/foods/search?q=...        # local + Open Food Facts
POST   /api/foods
GET    /api/foods/{id}

GET    /api/meals?date=YYYY-MM-DD
POST   /api/meals
DELETE /api/meals/{id}
POST   /api/meals/{meal}/items
DELETE /api/meals/{meal}/items/{item}

GET    /api/weight-logs
POST   /api/weight-logs

GET    /api/summary/day?date=...
GET    /api/summary/week?end=...

GET    /api/meal-plans
POST   /api/meal-plans/generate
DELETE /api/meal-plans/{id}
```

## Decisiones técnicas destacables

- **Sanctum con tokens en `Authorization: Bearer`**, no sesiones SPA cookies — sin CSRF necesario, más simple para el frontend Angular.
- **`OpenFoodFactsService`** normaliza productos remotos al esquema interno (kcal/100g, macros) y los cachea en BD local cuando el usuario los añade.
- **Accessors computed** en `MealItem`: `kcal`, `proteins`, `carbs`, `fats` se calculan según los gramos y los valores por 100g del alimento — no se guardan duplicados.
- **Signals + computed** en el frontend (Angular 21) para reactividad sin RxJS Subjects manuales.
- **Lazy loading** de todas las rutas, chunks separados por feature.

## Autora

Douaa Kaddar · [GitHub](https://github.com/DouaaKadd) · [LinkedIn](https://www.linkedin.com/in/douaa-kaddar)

## Licencia

MIT
