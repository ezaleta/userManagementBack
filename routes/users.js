const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
    try {
        const [userRows] = await pool.query("SELECT status FROM users WHERE id = ?", [req.userId]);
        if (userRows[0].status === "blocked") {
            return res.sendStatus(403);
        }

        const [rows] = await pool.query("SELECT id, name, email, last_login_time, registration_time, status FROM users");
        res.json({ users: rows });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/action", authenticateToken, async (req, res) => {
    const { action, userIds } = req.body;

    try {
        const [userRows] = await pool.query("SELECT status FROM users WHERE id = ?", [req.userId]);
        if (userRows[0].status === "blocked") {
            return res.sendStatus(403);
        }

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "No user IDs provided" });
        }

        if (action === "block") {
            await pool.query("UPDATE users SET status = ? WHERE id IN (?)", ["blocked", userIds]);
        } else if (action === "unblock") {
            await pool.query("UPDATE users SET status = ? WHERE id IN (?)", ["active", userIds]);
        } else if (action === "delete") {
            await pool.query("DELETE FROM users WHERE id IN (?)", [userIds]);
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        res.json({ message: "Action performed successfully" });
    } catch (error) {
        console.error("Action Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
