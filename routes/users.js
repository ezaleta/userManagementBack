const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query("SELECT status FROM public.users WHERE id = $1", [req.userId]);
        if (userResult.rows[0].status === "blocked") {
            return res.sendStatus(403);
        }

        const result = await pool.query("SELECT id, name, email, last_login_time, registration_time, status FROM public.users");
        res.json({ users: result.rows });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/action", authenticateToken, async (req, res) => {
    const { action, userIds } = req.body;

    try {
        const result = await pool.query("SELECT status FROM public.users WHERE id = $1", [req.userId]);
        if (result.rows[0].status === "blocked") {
            return res.sendStatus(403);
        }

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "No user IDs provided" });
        }

        if (action === "block") {
            await pool.query("UPDATE public.users SET status = $1 WHERE id IN ($2)", ["blocked", userIds]);
        } else if (action === "unblock") {
            await pool.query("UPDATE public.users SET status = $1 WHERE id IN ($2)", ["active", userIds]);
        } else if (action === "delete") {
            await pool.query("DELETE public.users users WHERE id IN ($1)", [userIds]);
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
