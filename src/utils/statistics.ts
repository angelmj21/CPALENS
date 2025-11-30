import { DailyLog, Statistics, TrendData, Correlation } from '@/types';

export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

export const calculateVariance = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
};

export const calculateStdDev = (values: number[]): number => {
  return Math.sqrt(calculateVariance(values));
};

export const calculateStatistics = (values: number[]): Statistics => {
  return {
    mean: calculateMean(values),
    median: calculateMedian(values),
    variance: calculateVariance(values),
    stdDev: calculateStdDev(values),
  };
};

export const calculateMovingAverage = (data: TrendData[], window: number = 7): TrendData[] => {
  return data.map((item, index) => {
    const start = Math.max(0, index - window + 1);
    const subset = data.slice(start, index + 1);
    const avg = calculateMean(subset.map(d => d.value));
    return {
      ...item,
      movingAverage: avg,
    };
  });
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
};

export const getCorrelationStrength = (coefficient: number): string => {
  const abs = Math.abs(coefficient);
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'Very Weak';
};

export const findCorrelations = (logs: DailyLog[]): Correlation[] => {
  if (logs.length < 3) return [];
  
  const fields = [
    { key: 'moodScore', label: 'Mood' },
    { key: 'sleepHours', label: 'Sleep' },
    { key: 'exerciseMinutes', label: 'Exercise' },
    { key: 'studyHours', label: 'Study' },
    { key: 'screenTime', label: 'Screen Time' },
    { key: 'waterIntake', label: 'Water Intake' },
    { key: 'mealQuality', label: 'Meal Quality' },
  ];
  
  const correlations: Correlation[] = [];
  
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i];
      const field2 = fields[j];
      
      const values1 = logs.map(log => log[field1.key as keyof DailyLog] as number);
      const values2 = logs.map(log => log[field2.key as keyof DailyLog] as number);
      
      const coefficient = calculateCorrelation(values1, values2);
      
      if (Math.abs(coefficient) >= 0.3) {
        correlations.push({
          field1: field1.label,
          field2: field2.label,
          coefficient,
          strength: getCorrelationStrength(coefficient),
        });
      }
    }
  }
  
  return correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
};

export const calculateStreaks = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
  );

  let streak = 1;
  let prevDate = new Date(sortedLogs[0].log_date);
  prevDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedLogs.length; i++) {
    const currentDate = new Date(sortedLogs[i].log_date);
    currentDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break; // streak broken
    }

    prevDate = currentDate;
  }

  return streak;
};