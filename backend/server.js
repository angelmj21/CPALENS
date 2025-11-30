import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------- Test DB Route ----------------------
app.get("/test", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) return res.send("❌ Database Error");
    res.send("✅ MySQL connection successful");
  });
});

// ---------------------- Daily Logs Routes ----------------------

// GET all logs
app.get("/daily-logs", (req, res) => {
  db.query("SELECT * FROM daily_logs ORDER BY log_date DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// POST new log
app.post("/daily-logs", (req, res) => {
  const {
    log_date,
    study_hours,
    sleep_hours,
    meal_count,
    meal_quality,
    screen_time,
    water_intake,
    mood,
    exercise_minutes,
    exercise_type,
    daily_note
  } = req.body;

  const sql = `
    INSERT INTO daily_logs 
    (log_date, study_hours, sleep_hours, meal_count, meal_quality, screen_time, water_intake, mood, exercise_minutes, exercise_type, daily_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      log_date,
      study_hours,
      sleep_hours,
      meal_count,
      meal_quality,
      screen_time,
      water_intake,
      mood,
      exercise_minutes,
      exercise_type,
      daily_note
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId });
    }
  );
});

// PUT update log
app.put("/daily-logs/:id", (req, res) => {
  const { id } = req.params;
  const {
    log_date,
    study_hours,
    sleep_hours,
    meal_count,
    meal_quality,
    screen_time,
    water_intake,
    mood,
    exercise_minutes,
    exercise_type,
    daily_note
  } = req.body;

  const sql = `
    UPDATE daily_logs
    SET log_date=?, study_hours=?, sleep_hours=?, meal_count=?, meal_quality=?, screen_time=?, water_intake=?, mood=?, exercise_minutes=?, exercise_type=?, daily_note=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      log_date,
      study_hours,
      sleep_hours,
      meal_count,
      meal_quality,
      screen_time,
      water_intake,
      mood,
      exercise_minutes,
      exercise_type,
      daily_note,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Updated successfully" });
    }
  );
});

// DELETE a log
app.delete("/daily-logs/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM daily_logs WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Deleted successfully" });
  });
});

// ---------------------- Profile Routes ----------------------

// GET profile (only one)
app.get("/profile", (req, res) => {
  db.query("SELECT * FROM user_profile LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// POST create profile (only if none exists)
app.post("/profile", (req, res) => {
  const { name, age, gender, goals, notes } = req.body;

  // Check if a profile already exists
  db.query("SELECT COUNT(*) AS count FROM user_profile", (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results[0].count > 0) {
      return res.status(400).json({ error: "Profile already exists" });
    }

    const sql = "INSERT INTO user_profile (name, age, gender, goals, notes) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, age, gender, goals, notes], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId });
    });
  });
});

// PUT update profile
app.put("/profile/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, gender, goals, notes } = req.body;

  const sql = `
    UPDATE user_profile
    SET name=?, age=?, gender=?, goals=?, notes=?
    WHERE id=?
  `;
  db.query(sql, [name, age, gender, goals, notes, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Profile updated successfully" });
  });
});

// DELETE profile
app.delete("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM user_profile WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Profile deleted successfully" });
  });
});

// ---------------------- Start Server ----------------------
app.listen(5000, () => {
  console.log("🚀 Backend server running on http://localhost:5000");
});