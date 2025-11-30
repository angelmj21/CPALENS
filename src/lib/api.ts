export const API_URL = "http://localhost:5000";

// ------------------- DAILY LOGS -------------------

interface DailyLogResponse {
  id: number;
  log_date: string;
  study_hours: number;
  sleep_hours: number;
  meal_count: number;
  meal_quality: number;
  screen_time: number;
  water_intake: number;
  mood: number;
  exercise_minutes: number;
  exercise_type: string;
  daily_note: string;
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

// GET all daily logs
export const getDailyLogs = async (): Promise<DailyLog[]> => {
  const res = await fetch(`${API_URL}/daily-logs`);
  if (!res.ok) throw new Error("Failed to fetch daily logs");
  const data: DailyLogResponse[] = await res.json();
  return data.map((log) => ({
    id: log.id,
    log_date: new Date(log.log_date),
    studyHours: log.study_hours,
    sleepHours: log.sleep_hours,
    mealCount: log.meal_count,
    mealQuality: log.meal_quality,
    screenTime: log.screen_time,
    waterIntake: log.water_intake,
    mood: log.mood,
    exerciseMinutes: log.exercise_minutes,
    exerciseType: log.exercise_type,
    daily_note: log.daily_note,
  }));
};

// CREATE new daily log
export const createDailyLog = async (log: DailyLog) => {
  const res = await fetch(`${API_URL}/daily-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log_date: log.log_date.toISOString().split("T")[0],
      study_hours: log.studyHours,
      sleep_hours: log.sleepHours,
      meal_count: log.mealCount,
      meal_quality: log.mealQuality,
      screen_time: log.screenTime,
      water_intake: log.waterIntake,
      mood: log.mood,
      exercise_minutes: log.exerciseMinutes,
      exercise_type: log.exerciseType,
      daily_note: log.daily_note,
    }),
  });
  if (!res.ok) throw new Error("Failed to create daily log");
  return res.json();
};

// UPDATE daily log
export const updateDailyLog = async (id: number, log: DailyLog) => {
  const res = await fetch(`${API_URL}/daily-logs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log_date: log.log_date.toISOString().split("T")[0],
      study_hours: log.studyHours,
      sleep_hours: log.sleepHours,
      meal_count: log.mealCount,
      meal_quality: log.mealQuality,
      screen_time: log.screenTime,
      water_intake: log.waterIntake,
      mood: log.mood,
      exercise_minutes: log.exerciseMinutes,
      exercise_type: log.exerciseType,
      daily_note: log.daily_note,
    }),
  });
  if (!res.ok) throw new Error("Failed to update daily log");
  return res.json();
};

// DELETE daily log
export const deleteDailyLog = async (id: number) => {
  const res = await fetch(`${API_URL}/daily-logs/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete daily log");
  return res.json();
};

// ------------------- PROFILE API -------------------

export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  gender: string;
  goals: string;
  notes: string;
}

// GET profile (returns null if none exists)
export const getProfile = async (): Promise<UserProfile | null> => {
  const res = await fetch(`${API_URL}/profile`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data: UserProfile[] = await res.json();
  if (!data || data.length === 0) return null;
  return data[0];
};

// CREATE profile (only if none exists)
export const createProfile = async (profile: UserProfile) => {
  const existing = await getProfile();
  if (existing) throw new Error("Profile already exists");

  const res = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to create profile");
  return res.json();
};

// UPDATE profile
export const updateProfile = async (id: number, profile: UserProfile) => {
  const res = await fetch(`${API_URL}/profile/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};

// DELETE profile
export const deleteProfile = async (id: number) => {
  const res = await fetch(`${API_URL}/profile/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete profile");
  return res.json();
};

// ------------------- ALERTS API -------------------

export interface DailyAlert {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
}

export const generateDailyAlerts = (log: DailyLog): DailyAlert[] => {
  const alerts: DailyAlert[] = [];

  if (log.screenTime > 6)
    alerts.push({
      id: "screenTime",
      type: "warning",
      message: `⚠ Too much screen time today! You've spent ${log.screenTime} hrs on screens. Take a break!`,
    });

  if (log.sleepHours < 6)
    alerts.push({
      id: "sleepHours",
      type: "warning",
      message: `😴 Sleep alert! Only ${log.sleepHours} hrs of rest. Aim for at least 7-8 hrs!`,
    });

  if (log.waterIntake < 1.5)
    alerts.push({
      id: "waterIntake",
      type: "warning",
      message: `💧 Drink more water! You only had ${log.waterIntake}L today.`,
    });

  if (log.mealQuality < 3)
    alerts.push({
      id: "mealQuality",
      type: "warning",
      message: `🍎 Meal quality low: ${log.mealQuality}/5. Try for a healthier meal next time.`,
    });

  if (log.exerciseMinutes < 20)
    alerts.push({
      id: "exerciseMinutes",
      type: "info",
      message: `🏃‍♂ Exercise alert! Only ${log.exerciseMinutes} mins. Move your body!`,
    });

  if (log.mood < 4)
    alerts.push({
      id: "moodLow",
      type: "warning",
      message: `😟 Mood is low: ${log.mood}/10. Take a break or do something uplifting!`,
    });

  if (log.mood >= 8)
    alerts.push({
      id: "moodHigh",
      type: "success",
      message: `😄 Great mood today: ${log.mood}/10. Keep up the positivity!`,
    });

  return alerts;
};