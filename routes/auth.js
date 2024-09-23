const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await pool.query("SELECT id FROM public.users WHERE email = $1", [email]);
        if (result.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await argon2.hash(password);

        await pool.query("INSERT INTO public.users (name, email, password, status) VALUES ($1, $2, $3, $4)", [name, email, hashedPassword, "active"]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];

        if (user.status === "blocked") {
            return res.status(403).json({ message: "User is blocked" });
        }

        const match = await argon2.verify(user.password, password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        await pool.query("UPDATE public.users SET last_login_time = NOW() WHERE id = $1", [user.id]);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
