import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix Neon ENETUNREACH IPv6 issue in Node.js 20+ environments
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const { Pool } = pkg;

// Parse Neon DB URL to extract endpoint ID if it's a Neon URL
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes("neon.tech")) {
  try {
    const url = new URL(dbUrl);
    const hostParts = url.hostname.split('.');
    if (hostParts.length > 0) {
      const endpointId = hostParts[0];
      // Append endpoint options to support Neon Serverless SNI routing better 
      if (!url.searchParams.has("options")) {
        url.searchParams.set("options", `project=${endpointId}`);
      }
      dbUrl = url.toString();
    }
  } catch(e) {}
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }, // Required for most managed Postgres services like Neon
  // @ts-ignore: pg passes this to net.Socket to force IPv4
  family: 4 
});

// --- DATABASE SCHEMA ---
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        year TEXT PRIMARY KEY,
        is_current INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT DEFAULT 'member', 
        status TEXT DEFAULT 'active',
        academic_year TEXT NOT NULL,
        university_year INTEGER DEFAULT 1,
        phone TEXT,
        student_id TEXT,
        department TEXT,
        class_name TEXT,
        birthday TEXT,
        gender TEXT,
        hometown TEXT,
        bio TEXT,
        avatar_url TEXT,
        line_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, academic_year),
        FOREIGN KEY (academic_year) REFERENCES academic_years(year)
      );

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location TEXT,
        notes TEXT,
        capacity INTEGER,
        status TEXT DEFAULT 'open',
        academic_year TEXT NOT NULL,
        google_form_link TEXT,
        registration_deadline TIMESTAMP,
        files TEXT,
        image_url TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (academic_year) REFERENCES academic_years(year),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attendance_status TEXT DEFAULT 'pending',
        note TEXT,
        UNIQUE(user_id, activity_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
      );
    `);

    // Migrations ignoring errors if columns already exist
    try { await pool.query("ALTER TABLE activities ADD COLUMN image_url TEXT"); } catch (e) {}
    try { await pool.query("ALTER TABLE users ADD COLUMN line_name TEXT"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN note TEXT"); } catch (e) {}

    console.log("✅ Database schema initialized.");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  }
};

// --- SEEDING LOGIC ---
const seed = async () => {
  try {
    const res = await pool.query("SELECT COUNT(*) as count FROM academic_years");
    if (parseInt(res.rows[0].count) > 0) return;

    console.log("🌱 Seeding database from scratch...");

    const years = ["2023-2024", "2024-2025", "2025-2026"];
    for (let i = 0; i < years.length; i++) {
      await pool.query(
        "INSERT INTO academic_years (year, is_current) VALUES ($1, $2)", 
        [years[i], i === years.length - 1 ? 1 : 0]
      );
    }

    // Admin
    const adminRes = await pool.query(`
      INSERT INTO users (full_name, email, role, status, academic_year, university_year) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, ["System Admin", "admin@example.com", "admin", "active", "2025-2026", 1]);
    const adminId = adminRes.rows[0].id;

    // Test Users
    await pool.query(`
      INSERT INTO users (full_name, email, role, status, academic_year, university_year, department, student_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, ["Test User 1", "user1@example.com", "member", "active", "2025-2026", 2, "CNTT", "SV001"]);

    await pool.query(`
      INSERT INTO users (full_name, email, role, status, academic_year, university_year, department, student_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, ["Test User 2", "user2@example.com", "member", "active", "2025-2026", 3, "Kinh tế", "SV002"]);

    const depts = ["CNTT", "Kinh tế", "Cơ khí", "Điện tử", "Ngôn ngữ Anh", "Luật", "Y đa khoa"];
    const roles = ["member", "member", "member", "board", "member"];

    for (let yIdx = 0; yIdx < years.length; yIdx++) {
      const year = years[yIdx];
      // 30 members per year
      for (let i = 1; i <= 30; i++) {
        const email = `user${i}.${year.replace('-', '')}@example.com`;
        const uniYear = Math.floor(Math.random() * 4) + 1;
        await pool.query(`
          INSERT INTO users (full_name, email, role, status, academic_year, university_year, department, student_id, phone, hometown)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          `Thành viên ${i} (${year})`, email, roles[i % roles.length], "active", year, uniYear,
          depts[i % depts.length], `SV${2000 + i + yIdx * 100}`, `090${Math.floor(1000000 + Math.random() * 9000000)}`, "Hà Nội"
        ]);
      }

      // 15 activities per year
      const startYear = parseInt(year.split('-')[0]);
      for (let i = 1; i <= 15; i++) {
        const date = new Date(startYear, 8 + Math.floor(i / 2), (i % 28) + 1, 14, 0);
        const deadline = new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000);
        const isPast = date < new Date();

        await pool.query(`
          INSERT INTO activities (title, description, date, location, capacity, status, academic_year, google_form_link, registration_deadline, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          `Sự kiện ${i} - ${year}`, `Mô tả cho sự kiện tình nguyện số ${i} trong năm học ${year}.`,
          date.toISOString(), `Địa điểm ${i}`, 30 + Math.floor(Math.random() * 50),
          isPast ? "completed" : "open", year, `https://forms.gle/sample${startYear}${i}`,
          deadline.toISOString(), adminId
        ]);
      }
    }

    // Random registrations
    const usersRes = await pool.query("SELECT id, academic_year FROM users WHERE role != 'admin'");
    const allUsers = usersRes.rows;
    const activitiesRes = await pool.query("SELECT id, academic_year FROM activities");
    const allActivities = activitiesRes.rows;

    for (const act of allActivities) {
      const yearUsers = allUsers.filter(u => u.academic_year === act.academic_year);
      const regCount = 5 + Math.floor(Math.random() * 15);
      const selected = yearUsers.sort(() => 0.5 - Math.random()).slice(0, regCount);

      for (const u of selected) {
        await pool.query(
          "INSERT INTO registrations (user_id, activity_id, attendance_status) VALUES ($1, $2, $3)",
          [u.id, act.id, Math.random() > 0.2 ? 'present' : 'absent']
        );
      }
    }

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
};

const ensureUser = async (name: string, email: string, role: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const year = "2025-2026";
  
  try {
    const yearExists = await pool.query("SELECT year FROM academic_years WHERE year = $1", [year]);
    if (yearExists.rows.length === 0) {
      await pool.query("INSERT INTO academic_years (year, is_current) VALUES ($1, 1)", [year]);
    }

    const exists = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (full_name, email, role, status, academic_year, university_year, department, student_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [name, normalizedEmail, role, "active", year, 1, "CLB", "TEST_" + role.toUpperCase()]);
      console.log(`✅ Created test account: ${normalizedEmail}`);
    }
  } catch (e) {
    console.error(`❌ Failed to ensure user ${email}:`, e);
  }
};

// --- SERVER SETUP ---
async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT as string) || 3001;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Init DB and seed before full boot
  if(process.env.DATABASE_URL) {
    await initDB();
    await seed();
    await ensureUser("System Admin", "admin@example.com", "admin");
    await ensureUser("Test User 1", "user1@example.com", "member");
    await ensureUser("Test User 2", "user2@example.com", "member");
  } else {
    console.warn("⚠️ DATABASE_URL is not set. Database connection ignored for now.");
  }

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE LOWER(email) = $1 ORDER BY academic_year DESC LIMIT 1",
        [normalizedEmail]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(result.rows[0]);
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Years
  app.get("/api/years", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM academic_years ORDER BY year DESC");
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/years", async (req, res) => {
    const { year } = req.body;
    try {
      await pool.query("INSERT INTO academic_years (year, is_current) VALUES ($1, 0)", [year]);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Year already exists" });
    }
  });

  app.post("/api/years/duplicate", async (req, res) => {
    const { sourceYear, targetYear } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const exists = await client.query("SELECT * FROM academic_years WHERE year = $1", [targetYear]);
      if (exists.rows.length === 0) {
        await client.query("INSERT INTO academic_years (year, is_current) VALUES ($1, 0)", [targetYear]);
      }

      const usersResult = await client.query("SELECT * FROM users WHERE academic_year = $1", [sourceYear]);
      const users = usersResult.rows;

      for (const u of users) {
        if ((u.status === 'active' || u.role === 'board' || u.role === 'admin') && u.university_year < 4) {
          await client.query(`
            INSERT INTO users (full_name, email, role, status, academic_year, university_year, department, student_id, phone, bio, avatar_url, line_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [u.full_name, u.email, u.role, u.status, targetYear, u.university_year + 1, u.department, u.student_id, u.phone, u.bio, u.avatar_url, u.line_name]);
        }
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    const { year } = req.query;
    try {
      let query = "SELECT * FROM users";
      const params = [];
      if (year) {
        query += " WHERE academic_year = $1";
        params.push(year);
      }
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
      res.json(result.rows[0]);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/users/:id", async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("DELETE FROM registrations WHERE user_id = $1", [req.params.id]);
      await client.query("UPDATE activities SET created_by = NULL WHERE created_by = $1", [req.params.id]);
      await client.query("DELETE FROM users WHERE id = $1", [req.params.id]);
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.post("/api/users", async (req, res) => {
    const bodyArgs = req.body;
    const fields = Object.keys(bodyArgs);
    const placeholders = fields.map((_, i) => '$' + (i + 1));
    const values = fields.map(f => bodyArgs[f]);
    
    const query = `INSERT INTO users (${fields.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING id`;
    try {
      const result = await pool.query(query, values);
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    const bodyArgs = req.body;
    const fields = Object.keys(bodyArgs).filter(f => f !== 'id' && f !== 'created_at');
    const placeholders = fields.map((f, i) => `${f} = $${i + 1}`);
    const values = fields.map(f => bodyArgs[f]);
    values.push(req.params.id);
    
    const query = `UPDATE users SET ${placeholders.join(", ")} WHERE id = $${values.length}`;
    try {
      await pool.query(query, values);
      res.json({ success: true });
    } catch(e: any) { res.status(400).json({ error: e.message }); }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    const { year } = req.query;
    try {
      let query = `
        SELECT a.*, (SELECT COUNT(*)::int FROM registrations WHERE activity_id = a.id) as participant_count 
        FROM activities a
      `;
      const params = [];
      if (year) {
        query += " WHERE a.academic_year = $1";
        params.push(year);
      }
      query += " ORDER BY date DESC";
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/activities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    try {
      const result = await pool.query(`
        SELECT a.*, (SELECT COUNT(*)::int FROM registrations WHERE activity_id = a.id) as participant_count 
        FROM activities a WHERE a.id = $1
      `, [id]);
      res.json(result.rows[0]);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      await pool.query("DELETE FROM activities WHERE id = $1", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/activities", async (req, res) => {
    const bodyArgs = req.body;
    const fields = Object.keys(bodyArgs);
    const placeholders = fields.map((_, i) => '$' + (i + 1));
    const values = fields.map(f => bodyArgs[f]);

    const query = `INSERT INTO activities (${fields.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING id`;
    try {
      const result = await pool.query(query, values);
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    
    const bodyArgs = req.body;
    const fields = Object.keys(bodyArgs).filter(f => f !== 'id' && f !== 'created_at' && f !== 'participant_count');
    const placeholders = fields.map((f, i) => `${f} = $${i + 1}`);
    const values = fields.map(f => bodyArgs[f]);
    values.push(id.toString());
    
    const query = `UPDATE activities SET ${placeholders.join(", ")} WHERE id = $${values.length}`;
    try {
      await pool.query(query, values);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/activities/:id/participants", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.full_name, u.email, u.student_id, u.university_year, u.phone, u.line_name, r.registered_at, r.attendance_status, r.note, r.user_id
        FROM registrations r JOIN users u ON r.user_id = u.id
        WHERE r.activity_id = $1
      `, [req.params.id]);
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  // Registrations
  app.get("/api/registrations/user/:userId", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT r.*, a.title, a.date, a.location, a.status as activity_status
        FROM registrations r JOIN activities a ON r.activity_id = a.id
        WHERE r.user_id = $1 ORDER BY a.date DESC
      `, [req.params.userId]);
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/registrations", async (req, res) => {
    const { user_id, activity_id } = req.body;
    try {
      await pool.query("INSERT INTO registrations (user_id, activity_id) VALUES ($1, $2)", [user_id, activity_id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: "Already registered or error" });
    }
  });

  app.delete("/api/registrations", async (req, res) => {
    const { user_id, activity_id } = req.query;
    try {
      await pool.query("DELETE FROM registrations WHERE user_id = $1 AND activity_id = $2", [user_id, activity_id]);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.patch("/api/registrations/attendance", async (req, res) => {
    const { user_id, activity_id, attendance_status, note } = req.body;
    try {
      await pool.query(
        "UPDATE registrations SET attendance_status = $1, note = $2 WHERE user_id = $3 AND activity_id = $4",
        [attendance_status, note, user_id, activity_id]
      );
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to update attendance" });
    }
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    const { year } = req.query;
    try {
      const filter = year ? " WHERE academic_year = $1" : "";
      const p = year ? [year] : [];
      
      const members = await pool.query(`SELECT COUNT(*)::int as count FROM users ${filter}`, p);
      const activities = await pool.query(`SELECT COUNT(*)::int as count FROM activities ${filter}`, p);
      const regs = await pool.query(`SELECT COUNT(*)::int as count FROM registrations r JOIN activities a ON r.activity_id = a.id ${year ? "WHERE a.academic_year = $1" : ""}`, p);
      const upcoming = await pool.query(`SELECT COUNT(*)::int as count FROM activities WHERE date > CURRENT_TIMESTAMP ${year ? "AND academic_year = $1" : ""}`, p);

      res.json({
        totalMembers: members.rows[0].count,
        totalActivities: activities.rows[0].count,
        activeRegistrations: regs.rows[0].count,
        upcomingEvents: upcoming.rows[0].count
      });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/stats/historical", async (req, res) => {
    try {
      const yearsRes = await pool.query("SELECT year FROM academic_years ORDER BY year ASC");
      const result = [];
      
      for (const y of yearsRes.rows) {
        const memCount = await pool.query("SELECT COUNT(*)::int as count FROM users WHERE academic_year = $1", [y.year]);
        const actCount = await pool.query("SELECT COUNT(*)::int as count FROM activities WHERE academic_year = $1", [y.year]);
        
        result.push({
          year: y.year,
          members: memCount.rows[0].count,
          activities: actCount.rows[0].count
        });
      }
      res.json(result);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  // Export Data
  app.get("/api/export/members", async (req, res) => {
    const { year } = req.query;
    try {
      const result = await pool.query("SELECT * FROM users WHERE academic_year = $1 ORDER BY full_name ASC", [year]);
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/export/activities", async (req, res) => {
    const { year } = req.query;
    try {
      const query = `
        SELECT a.*, 
        (SELECT COUNT(*)::int FROM registrations WHERE activity_id = a.id AND attendance_status = 'present') as attended_count,
        (SELECT COUNT(*)::int FROM registrations WHERE activity_id = a.id AND attendance_status = 'absent') as absent_count
        FROM activities a WHERE a.academic_year = $1 ORDER BY a.date ASC
      `;
      const result = await pool.query(query, [year]);
      res.json(result.rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- VITE / STATIC ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
}

startServer();
