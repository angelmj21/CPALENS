import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/stats/StatCard';
import InsightCard from '@/components/insights/InsightCard';
import { DailyLog, TrendData } from '@/types';
import { getDailyLogs } from '@/lib/api';   // ✅ use backend logs
import { calculateMean, calculateMovingAverage, findCorrelations, calculateStreaks } from '@/utils/statistics';
import { generateInsights, calculateWellnessScore } from '@/utils/insights';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Moon, Smile, TrendingUp, Award, Droplet } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getDailyLogs();  // ✅ fetch from MySQL backend
        setLogs(data);

        if (data.length > 0) {
          const sorted = [...data].sort((a, b) => a.log_date.getTime() - b.log_date.getTime());

          const trends: TrendData[] = sorted.map(log => ({
            date: format(log.log_date, 'MMM dd'),
            value: log.mood
          }));

          const withMA = calculateMovingAverage(trends, 3);
          setTrendData(withMA);
        }
      } catch (error) {
        console.error("Failed to load logs:", error);
      }
    };

    fetchLogs();
  }, []);

  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Data Yet</h2>
        <p className="mt-2 text-muted-foreground">
          Start logging your daily habits to see your wellness dashboard
        </p>
      </Card>
    );
  }

  const recentLogs = logs.slice(-7);
  const avgMood = calculateMean(recentLogs.map(l => l.mood));
  const avgSleep = calculateMean(recentLogs.map(l => l.sleepHours));
  const avgExercise = calculateMean(recentLogs.map(l => l.exerciseMinutes));
  const avgWater = calculateMean(recentLogs.map(l => l.waterIntake));
  const streak = calculateStreaks(logs);
  const wellnessScore = calculateWellnessScore(logs);
  const insights = generateInsights(logs);
  const correlations = findCorrelations(recentLogs);

  const chartData = recentLogs.map(log => ({
    date: format(log.log_date, 'MMM dd'),
    mood: log.mood,
    sleep: log.sleepHours,
    exercise: log.exerciseMinutes / 10
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Your wellness trends and patterns at a glance</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Wellness Score" value={`${wellnessScore}%`} icon={<Award />} description="Overall wellness index" />
        <StatCard title="Current Streak" value={`${streak} days`} icon={<TrendingUp />} description="Consecutive logging days" />
        <StatCard title="Avg Mood" value={`${avgMood.toFixed(1)}/10`} icon={<Smile />} description="Last 7 days" />
        <StatCard title="Avg Sleep" value={`${avgSleep.toFixed(1)}h`} icon={<Moon />} description="Last 7 days" />
      </div>

      {/* Mood Trend */}
      <Card className="card-elevated p-6">
        <h2 className="mb-6 text-xl font-semibold">Mood Trend & Moving Average</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Mood Score" />
            <Line type="monotone" dataKey="movingAverage" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" name="3-Day Avg" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Weekly Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated p-6">
          <h2 className="mb-6 text-xl font-semibold">Weekly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mood" fill="hsl(var(--chart-1))" />
              <Bar dataKey="sleep" fill="hsl(var(--chart-2))" />
              <Bar dataKey="exercise" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Correlations */}
        <Card className="card-elevated p-6">
          <h2 className="mb-6 text-xl font-semibold">Habit Correlations</h2>
          {correlations.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <p>Not enough data to show correlations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {correlations.slice(0, 5).map((c, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{c.field1} ↔ {c.field2}</p>
                      <p className="text-sm text-muted-foreground">{c.strength} correlation</p>
                    </div>
                    <div className={`text-lg font-bold ${c.coefficient > 0 ? "text-success" : "text-destructive"}`}>
                      {c.coefficient > 0 ? "+" : ""}{(c.coefficient * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`${c.coefficient > 0 ? "bg-success" : "bg-destructive"}`} style={{ width: `${Math.abs(c.coefficient) * 100}%, height: "100%"` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Personalized Insights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map(item => <InsightCard key={item.id} insight={item} />)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Avg Exercise" value={`${avgExercise.toFixed(0)} min`} icon={<Activity />} description="Last 7 days" />
        <StatCard title="Avg Water" value={`${avgWater.toFixed(1)} glasses`} icon={<Droplet />} description="Last 7 days" />
        <StatCard title="Total Logs" value={logs.length} icon={<TrendingUp />} description="All time entries" />
      </div>
    </div>
  );
};

export default Dashboard;