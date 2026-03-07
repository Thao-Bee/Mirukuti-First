import Database from "better-sqlite3";
import assert from "assert/strict";

const BASE_URL = "http://localhost:3001/api";

const log = (msg) => console.log(`👉 ${msg}`);
const success = (msg) => console.log(`✅ ${msg}`);
const error = (msg) => console.error(`❌ ${msg}`);

async function apiCall(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  const db = new Database("volunteer.db");
  log("Starting API and E2E Flow Tests...");

  try {
    // ============================================
    // 1. AUTHENTICATION FLOW
    // ============================================
    log("Testing Auth Flow...");
    
    // Invalid Login
    let res = await apiCall("/auth/login", "POST", { email: "invalid@example.com" });
    log(`Invalid login status: ${res.status}, data: ${JSON.stringify(res.data)}`);
    assert.equal(res.status, 404, "Invalid login should return 404");
    
    // Member Login
    res = await apiCall("/auth/login", "POST", { email: "user1@example.com" });
    assert.equal(res.status, 200, "Valid login should return 200");
    const user1 = res.data;
    assert.equal(user1.email, "user1@example.com");
    assert.equal(user1.role, "member");
    
    // Admin Login
    res = await apiCall("/auth/login", "POST", { email: "admin@example.com" });
    assert.equal(res.status, 200);
    const admin = res.data;
    assert.equal(admin.role, "admin");
    success("Auth Flow tests passed.");

    // ============================================
    // 2. ACTIVITY MANAGEMENT & CRUD
    // ============================================
    log("Testing Activity CRUD...");
    
    const newActivity = {
      title: "QA Test Event 2026",
      description: "Testing API and DB",
      date: new Date(Date.now() + 86400000).toISOString(),
      location: "QA Lab",
      capacity: 10,
      status: "open",
      academic_year: "2025-2026",
      created_by: admin.id
    };

    res = await apiCall("/activities", "POST", newActivity);
    assert.equal(res.status, 200);
    const activityId = res.data.id;
    assert.ok(activityId, "Should return new activity ID");

    // Verify in DB
    const dbActivity = db.prepare("SELECT * FROM activities WHERE id = ?").get(activityId);
    assert.equal(dbActivity.title, newActivity.title, "Database should store the exact title");
    success("Activity Created successfully.");

    // Update Activity
    res = await apiCall(`/activities/${activityId}`, "PUT", { location: "Updated Lab" });
    assert.equal(res.status, 200);
    const dbActivityUpdated = db.prepare("SELECT * FROM activities WHERE id = ?").get(activityId);
    assert.equal(dbActivityUpdated.location, "Updated Lab", "Location should be updated in DB");
    success("Activity Updated successfully.");

    // ============================================
    // 3. REGISTRATION FLOW
    // ============================================
    log("Testing Registration Flow...");
    
    // User registers for the activity
    res = await apiCall("/registrations", "POST", { user_id: user1.id, activity_id: activityId });
    assert.equal(res.status, 200);
    
    // Verify Registration in DB
    const dbReg = db.prepare("SELECT * FROM registrations WHERE user_id = ? AND activity_id = ?").get(user1.id, activityId);
    assert.ok(dbReg, "Registration should exist in DB");
    assert.equal(dbReg.attendance_status, "pending");

    // Edge Case: Duplicate Registration
    res = await apiCall("/registrations", "POST", { user_id: user1.id, activity_id: activityId });
    assert.equal(res.status, 400, "Duplicate registration should fail");
    success("Registration tests passed.");

    // ============================================
    // 4. ATTENDANCE & ADMIN MANAGEMENT
    // ============================================
    log("Testing Attendance Updates...");
    
    // Update Attendance
    res = await apiCall("/registrations/attendance", "PATCH", {
      user_id: user1.id,
      activity_id: activityId,
      attendance_status: "present",
      note: "Arrived on time"
    });
    assert.equal(res.status, 200);

    // Verify in DB
    const dbRegUpdated = db.prepare("SELECT * FROM registrations WHERE user_id = ? AND activity_id = ?").get(user1.id, activityId);
    assert.equal(dbRegUpdated.attendance_status, "present");
    assert.equal(dbRegUpdated.note, "Arrived on time");
    success("Attendance validation passed.");

    // ============================================
    // 5. USER MANAGEMENT
    // ============================================
    log("Testing User Management...");
    
    // Create new member
    res = await apiCall("/users", "POST", {
      full_name: "QA Member",
      email: "qa_member@example.com",
      academic_year: "2025-2026",
      role: "member"
    });
    assert.equal(res.status, 200);
    const newUserId = res.data.id;

    // Delete Member
    res = await apiCall(`/users/${newUserId}`, "DELETE");
    assert.equal(res.status, 200);
    
    // Verify Deletion
    const deletedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(newUserId);
    assert.ok(!deletedUser, "User should be removed from database");
    success("User Management tests passed.");

    // ============================================
    // 6. TEARDOWN
    // ============================================
    // Delete the test activity
    res = await apiCall(`/activities/${activityId}`, "DELETE");
    assert.equal(res.status, 200);

    log("🎉 All automated E2E tests passed successfully!");

  } catch (err) {
    error("Test failed: " + err.message);
    console.error(err);
    process.exit(1);
  }
}

runTests();
