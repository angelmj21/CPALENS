import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  DailyLog as DailyLogType,
  getDailyLogs,
  createDailyLog,
  updateDailyLog,
  deleteDailyLog,
  generateDailyAlerts,
} from "@/lib/api";

const DailyLog = () => {
  const [logs, setLogs] = useState<DailyLogType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    studyHours: "",
    sleepHours: "",
    mealCount: "",
    mealQuality: "",
    screenTime: "",
    waterIntake: "",
    mood: "",
    exerciseMinutes: "",
    exerciseType: "",
    daily_note: "",
  });

  // Load logs and show alerts for latest log
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const savedLogs = await getDailyLogs();
      const sortedLogs = savedLogs.sort(
        (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
      );
      setLogs(sortedLogs);

      // Show alerts for the latest log
      if (sortedLogs.length > 0) {
        const latestLog = sortedLogs[0];
        const alerts = generateDailyAlerts(latestLog);
        alerts.forEach((alert) => {
          if (alert.type === "warning") toast.error(alert.message);
          else if (alert.type === "info") toast.info(alert.message);
          else toast.success(alert.message);
        });
      }
    } catch (err) {
      toast.error("Failed to load logs");
    }
  };

  const resetForm = () => {
    setFormData({
      studyHours: "",
      sleepHours: "",
      mealCount: "",
      mealQuality: "",
      screenTime: "",
      waterIntake: "",
      mood: "",
      exerciseMinutes: "",
      exerciseType: "",
      daily_note: "",
    });
    setSelectedDate(new Date());
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.sleepHours || !formData.mood) {
      toast.error("Please fill Sleep Hours & Mood");
      return;
    }

    const logData: DailyLogType = {
      id: editingId || 0,
      log_date: selectedDate,
      studyHours: parseFloat(formData.studyHours) || 0,
      sleepHours: parseFloat(formData.sleepHours),
      mealCount: parseInt(formData.mealCount) || 0,
      mealQuality: parseInt(formData.mealQuality) || 0,
      screenTime: parseFloat(formData.screenTime) || 0,
      waterIntake: parseFloat(formData.waterIntake) || 0,
      mood: parseInt(formData.mood),
      exerciseMinutes: parseInt(formData.exerciseMinutes) || 0,
      exerciseType: formData.exerciseType,
      daily_note: formData.daily_note,
    };

    try {
      if (editingId) {
        await updateDailyLog(editingId, logData);
        toast.success("Log updated");
      } else {
        await createDailyLog(logData);
        toast.success("Log added");
      }

      // Show alerts for the saved log
      const alerts = generateDailyAlerts(logData);
      alerts.forEach((alert) => {
        if (alert.type === "warning") toast.error(alert.message);
        else if (alert.type === "info") toast.info(alert.message);
        else toast.success(alert.message);
      });

      resetForm();
      loadLogs();
    } catch (err) {
      toast.error("Failed to save log");
    }
  };

  const handleEdit = (log: DailyLogType) => {
    setEditingId(log.id);
    setSelectedDate(new Date(log.log_date));
    setIsAdding(true);
    setFormData({
      studyHours: log.studyHours.toString(),
      sleepHours: log.sleepHours.toString(),
      mealCount: log.mealCount.toString(),
      mealQuality: log.mealQuality.toString(),
      screenTime: log.screenTime.toString(),
      waterIntake: log.waterIntake.toString(),
      mood: log.mood.toString(),
      exerciseMinutes: log.exerciseMinutes.toString(),
      exerciseType: log.exerciseType,
      daily_note: log.daily_note,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDailyLog(id);
      toast.success("Log deleted");
      loadLogs();
    } catch {
      toast.error("Failed to delete log");
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return "😊";
    if (score >= 7) return "🙂";
    if (score >= 5) return "😐";
    if (score >= 3) return "😕";
    return "😢";
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Daily Logs</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Log
          </Button>
        )}
      </div>

      {/* Form */}
      {isAdding && (
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selected={selectedDate}
                    mode="single"
                    onSelect={(d: any) => setSelectedDate(d)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Inputs */}
            {[
              ["studyHours", "Study Hours"],
              ["sleepHours", "Sleep Hours"],
              ["mealCount", "Meals"],
              ["mealQuality", "Meal Quality (1-5)"],
              ["screenTime", "Screen Time (hrs)"],
              ["waterIntake", "Water Intake (L)"],
              ["mood", "Mood (1-10)"],
              ["exerciseMinutes", "Exercise (mins)"],
              ["exerciseType", "Exercise Type"],
            ].map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  value={(formData as any)[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}

            {/* Daily Note */}
            <div className="sm:col-span-2">
              <Label>Reflection / Notes</Label>
              <Textarea
                value={formData.daily_note}
                onChange={(e) =>
                  setFormData({ ...formData, daily_note: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Log History */}
      <h2 className="text-xl font-semibold mb-4">Log History</h2>
      {logs.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No logs yet — start tracking!
        </Card>
      ) : (
        logs.map((log) => (
          <Card key={log.id} className="p-6 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {format(new Date(log.log_date), "MMMM d, yyyy")}
                </h3>
                <p className="text-sm opacity-70 mb-2">{log.daily_note}</p>
                <Badge className="text-xl">
                  {getMoodEmoji(log.mood)} {log.mood}/10
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(log)}>
                  <Edit size={16} />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(log.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default DailyLog;