import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",           // your MySQL username
  password: "Angel#2025",       // your MySQL password (or "")
  database: "cognitive_app"
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});