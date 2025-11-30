import { DailyLog, Insight } from '@/types';
import { calculateMean, calculateStreaks, findCorrelations } from './statistics';

export const generateInsights = (logs: DailyLog[]): Insight[] => {
  const insights: Insight[] = [];
  
  if (logs.length < 3) {
    return [{
      id: 'welcome',
      title: 'Welcome to Your Wellness Journey',
      description: 'Start logging your daily habits to unlock personalized insights and track your progress.',
      type: 'info',
    }];
  }
  
  const recentLogs = logs.slice(-7);
  const streak = calculateStreaks(logs);
  
  // Streak insight
  if (streak >= 7) {
    insights.push({
      id: 'streak-champion',
      title: '🔥 Consistency Champion',
      description: `Amazing! You've maintained a ${streak}-day logging streak. Your dedication is building lasting habits.`,
      type: 'positive',
      badge: `${streak} Day Streak`,
    });
  } else if (streak >= 3) {
    insights.push({
      id: 'building-momentum',
      title: '💪 Building Momentum',
      description: `${streak} days in a row! Keep it up - consistency is the key to meaningful change.`,
      type: 'positive',
      badge: `${streak} Day Streak`,
    });
  }
  
  // Sleep analysis
  const avgSleep = calculateMean(recentLogs.map(log => log.sleepHours));
  if (avgSleep < 6) {
    insights.push({
      id: 'sleep-warning',
      title: '😴 Sleep Attention Needed',
      description: `Your average sleep is ${avgSleep.toFixed(1)} hours. Aim for 7-9 hours to improve mood and performance.`,
      type: 'warning',
    });
  } else if (avgSleep >= 7 && avgSleep <= 9) {
    insights.push({
      id: 'sleep-optimal',
      title: '✨ Excellent Sleep Pattern',
      description: `Your ${avgSleep.toFixed(1)} hour average is in the optimal range. Quality rest fuels your success!`,
      type: 'positive',
    });
  }
  
  // Mood and exercise correlation
  const correlations = findCorrelations(recentLogs);
  const exerciseMoodCorr = correlations.find(c => 
    (c.field1 === 'Exercise' && c.field2 === 'Mood') ||
    (c.field1 === 'Mood' && c.field2 === 'Exercise')
  );
  
  if (exerciseMoodCorr && exerciseMoodCorr.coefficient > 0.4) {
    insights.push({
      id: 'exercise-mood-link',
      title: '🏃 Movement = Happiness',
      description: 'Your data shows exercise strongly boosts your mood. Keep moving to keep smiling!',
      type: 'positive',
    });
  }
  
  // Water intake
  const avgWater = calculateMean(recentLogs.map(log => log.waterIntake));
  if (avgWater < 6) {
    insights.push({
      id: 'hydration-reminder',
      title: '💧 Hydration Matters',
      description: `You're averaging ${avgWater.toFixed(1)} glasses daily. Try reaching 8 glasses for better energy.`,
      type: 'info',
    });
  }
  
  // Study consistency
  const studyDays = recentLogs.filter(log => log.studyHours > 0).length;
  if (studyDays === recentLogs.length) {
    insights.push({
      id: 'study-consistent',
      title: '📚 Learning Champion',
      description: 'You studied every day this week! Your consistent effort will compound into mastery.',
      type: 'positive',
    });
  }
  
  // Screen time check
  const avgScreen = calculateMean(recentLogs.map(log => log.screenTime));
  if (avgScreen > 8) {
    insights.push({
      id: 'screen-time-high',
      title: '📱 Digital Balance Check',
      description: `${avgScreen.toFixed(1)} hours average screen time. Consider mindful breaks for better wellbeing.`,
      type: 'warning',
    });
  }
  
  // Overall wellness score
  const moodScores = recentLogs.map(log => log.mood);
  const avgMood = calculateMean(moodScores);
  const moodTrend = moodScores.length >= 3 
    ? moodScores[moodScores.length - 1] - moodScores[0]
    : 0;
  
  if (avgMood >= 8) {
    insights.push({
      id: 'wellness-excellent',
      title: '🌟 Thriving State',
      description: `Your average mood score of ${avgMood.toFixed(1)}/10 indicates excellent wellbeing. You're doing great!`,
      type: 'positive',
    });
  } else if (moodTrend > 2) {
    insights.push({
      id: 'mood-improving',
      title: '📈 Positive Trajectory',
      description: 'Your mood has been improving! Your healthy habits are paying off.',
      type: 'positive',
    });
  }
  
  return insights;
};

export const calculateWellnessScore = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;
  
  const recentLogs = logs.slice(-7);
  
  const factors = [
    { value: calculateMean(recentLogs.map(l => l.sleepHours)), target: 8, weight: 20 },
    { value: calculateMean(recentLogs.map(l => l.mood)), target: 10, weight: 25 },
    { value: calculateMean(recentLogs.map(l => l.exerciseMinutes)), target: 30, weight: 15 },
    { value: calculateMean(recentLogs.map(l => l.waterIntake)), target: 8, weight: 10 },
    { value: calculateMean(recentLogs.map(l => l.mealQuality)), target: 10, weight: 15 },
    { value: calculateMean(recentLogs.map(l => l.studyHours)), target: 4, weight: 15 },
  ];
  
  const score = factors.reduce((total, factor) => {
    const percentage = Math.min(factor.value / factor.target, 1);
    return total + (percentage * factor.weight);
  }, 0);
  
  return Math.round(score);
};
