import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Meal, MealItem, MealType } from '../../../core/models/meal.model';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  snack: 'Snack',
  dinner: 'Cena',
};

@Component({
  selector: 'app-meal-card',
  imports: [],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.scss',
})
export class MealCard {
  @Input({ required: true }) type!: MealType;
  @Input() meal: Meal | null = null;

  @Output() readonly add = new EventEmitter<MealType>();
  @Output() readonly removeItem = new EventEmitter<{ meal: Meal; item: MealItem }>();
  @Output() readonly removeMeal = new EventEmitter<Meal>();

  get label(): string {
    return MEAL_LABELS[this.type];
  }

  itemKcal(item: MealItem): number {
    return item.food ? Math.round((item.food.kcal_per_100g * item.grams) / 100) : 0;
  }

  totalKcal(): number {
    if (!this.meal) return 0;
    return this.meal.items.reduce((sum, item) => sum + this.itemKcal(item), 0);
  }
}
