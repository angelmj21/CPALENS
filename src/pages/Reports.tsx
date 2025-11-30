import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDailyLogs } from '@/lib/api';
import { DailyLog } from '@/types';
import { calculateStatistics, findCorrelations, calculateStreaks } from '@/utils/statistics';
import { calculateWellnessScore } from '@/utils/insights';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, isWithinInterval } from 'date-fns';

const Reports = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getDailyLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
        toast.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getFilteredLogs = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today

  const startDate = reportPeriod === 'week' ? subDays(today, 6) : subDays(today, 29);

  return logs.filter(log => {
    const logDate = new Date(log.log_date);
    logDate.setHours(0, 0, 0, 0); // normalize log date
    return logDate >= startDate && logDate <= today;
  });
};
  const filteredLogs = getFilteredLogs();

  const generateReport = () => {
    if (filteredLogs.length === 0) {
      toast.error('No data available for the selected period');
      return null;
    }

    // Use correct fields from your DailyLog type
    const moodStats = calculateStatistics(filteredLogs.map((l) => l.mood));
    const sleepStats = calculateStatistics(filteredLogs.map((l) => l.sleepHours));
    const exerciseStats = calculateStatistics(filteredLogs.map((l) => l.exerciseMinutes));
    const studyStats = calculateStatistics(filteredLogs.map((l) => l.studyHours));
    const waterStats = calculateStatistics(filteredLogs.map((l) => l.waterIntake));
    const screenStats = calculateStatistics(filteredLogs.map((l) => l.screenTime));

    const correlations = findCorrelations(filteredLogs);
    const streak = calculateStreaks(logs); // overall streak based on all logs
    const wellnessScore = calculateWellnessScore(logs);

    const reportContent = `
PERSONAL WELLNESS REPORT
${reportPeriod === 'week' ? 'Weekly' : 'Monthly'} Summary
Generated: ${format(new Date(), 'MMMM d, yyyy')}
Period: ${reportPeriod === 'week' ? 'Last 7 Days' : 'Last 30 Days'}

═══════════════════════════════════════════════════════════

WELLNESS OVERVIEW
─────────────────────────────────────────────────────────
Overall Wellness Score: ${wellnessScore}%
Current Logging Streak: ${streak} days
Total Entries This Period: ${filteredLogs.length}

═══════════════════════════════════════════════════════════

STATISTICAL SUMMARY
─────────────────────────────────────────────────────────

📊 Mood Score (1-10)
   Mean:     ${moodStats.mean.toFixed(2)}
   Median:   ${moodStats.median.toFixed(2)}
   Std Dev:  ${moodStats.stdDev.toFixed(2)}

😴 Sleep (hours)
   Mean:     ${sleepStats.mean.toFixed(2)}
   Median:   ${sleepStats.median.toFixed(2)}
   Std Dev:  ${sleepStats.stdDev.toFixed(2)}

🏃 Exercise (minutes)
   Mean:     ${exerciseStats.mean.toFixed(2)}
   Median:   ${exerciseStats.median.toFixed(2)}
   Std Dev:  ${exerciseStats.stdDev.toFixed(2)}

📚 Study (hours)
   Mean:     ${studyStats.mean.toFixed(2)}
   Median:   ${studyStats.median.toFixed(2)}
   Std Dev:  ${studyStats.stdDev.toFixed(2)}

💧 Water Intake (glasses)
   Mean:     ${waterStats.mean.toFixed(2)}
   Median:   ${waterStats.median.toFixed(2)}
   Std Dev:  ${waterStats.stdDev.toFixed(2)}

📱 Screen Time (hours)
   Mean:     ${screenStats.mean.toFixed(2)}
   Median:   ${screenStats.median.toFixed(2)}
   Std Dev:  ${screenStats.stdDev.toFixed(2)}

═══════════════════════════════════════════════════════════

HABIT CORRELATIONS
─────────────────────────────────────────────────────────
${correlations.length > 0 ? correlations.map((corr, i) =>
  `${i + 1}. ${corr.field1} ↔ ${corr.field2}
     Coefficient: ${corr.coefficient.toFixed(3)} (${corr.strength})
     ${corr.coefficient > 0 ? '↑ Positive' : '↓ Negative'} relationship
  `
).join('\n') : 'Not enough data to calculate correlations'}

═══════════════════════════════════════════════════════════

RECOMMENDATIONS
─────────────────────────────────────────────────────────
${sleepStats.mean < 7 ? '• Aim for 7-9 hours of sleep for optimal wellness' : '• Sleep is in the recommended range'}
${exerciseStats.mean < 30 ? '• Try to achieve 30+ minutes of exercise daily' : '• Exercise looks good'}
${waterStats.mean < 8 ? '• Increase water intake to 8+ glasses per day' : '• Water intake looks good'}
${moodStats.mean < 7 ? '• Consider activities that boost mood and wellbeing' : '• Mood looks stable'}
${screenStats.mean > 8 ? '• Reduce screen time for better mental health' : '• Screen time is reasonable'}

═══════════════════════════════════════════════════════════

Generated by Personal Cognitive Pattern Analyzer
`.trim();

    return reportContent;
  };

  const handleExportPDF = () => {
    const report = generateReport();
    if (!report) return;

    // Create downloadable txt as placeholder
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellness-report-${reportPeriod}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Generate and export your wellness reports
        </p>
      </div>

      <Card className="p-6 shadow-md rounded-xl border bg-card">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Report Period</h2>
            <div className="flex gap-3">
              <Button
                variant={reportPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => setReportPeriod('week')}
                className="flex-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Weekly (Last 7 Days)
              </Button>
              <Button
                variant={reportPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setReportPeriod('month')}
                className="flex-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Monthly (Last 30 Days)
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Loading...</h3>
              <p className="mt-2 text-sm text-muted-foreground">Fetching your logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Data Available</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no log entries for the selected period. Start logging to generate reports.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-4">Report Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">{reportPeriod === 'week' ? 'Last 7 Days' : 'Last 30 Days'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries:</span>
                    <span className="font-medium">{filteredLogs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wellness Score:</span>
                    <span className="font-medium">{calculateWellnessScore(logs)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Streak:</span>
                    <span className="font-medium">{calculateStreaks(logs)} days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">What's Included</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Statistical summary (mean, median, std dev) for tracked metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Habit correlation analysis showing relationships between behaviors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Wellness consistency index and progress indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Personalized recommendations based on your data patterns</span>
                  </li>
                </ul>
              </div>

              <Button onClick={handleExportPDF} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Report will be downloaded as a text file. For PDF export, a PDF generation library would be integrated in production.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;