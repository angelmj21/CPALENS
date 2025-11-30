export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  goals: string;
  notes: string;
}

export interface DailyLog {
  id: number;
  log_date: Date;
  studyHours: number;
  sleepHours: number;
  mealCount: number;
  mealQuality: number;
  screenTime: number;
  waterIntake: number;
  mood: number;
  exerciseMinutes: number;
  exerciseType: string;
  daily_note: string;
}

export interface Statistics {
  mean: number;
  median: number;
  variance: number;
  stdDev: number;
}

export interface TrendData {
  date: string;
  value: number;
  movingAverage?: number;
}

export interface Correlation {
  field1: string;
  field2: string;
  coefficient: number;
  strength: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
  badge?: string;
}
