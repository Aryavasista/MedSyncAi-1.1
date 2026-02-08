export enum FormType {
  PILL = "pill",
  TABLET = "tablet",
  CAPSULE = "capsule",
  INHALER = "inhaler",
  SYRUP = "syrup",
  INJECTION = "injection",
  CREAM = "cream",
  DROPS = "drops",
  OTHER = "other"
}

export enum MealRelation {
  BEFORE = "Before Meal",
  AFTER = "After Meal",
  WITH = "With Meal",
  ANYTIME = "Anytime",
  EMPTY = "Empty Stomach"
}

export enum TimeOfDay {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  EVENING = "evening",
  NIGHT = "night"
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  formType: FormType;
  dosage: string;
  currentQuantity: number;
  initialQuantity: number;
  frequency: string; // e.g., "Daily", "2x Daily"
  mealRelation?: MealRelation; // New field
  instructions?: string;
  nextDose?: string; // ISO String
  imageUrl?: string;
  active: boolean;
}

export interface ScheduleItem {
  id: string;
  medicationId: string;
  time: string; // "08:00"
  status: 'pending' | 'taken' | 'skipped';
  date: string; // "2023-10-27"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}