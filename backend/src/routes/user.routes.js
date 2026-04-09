import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Helper function to create token and set cookie
const createTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true, // true in prod
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// REGISTER
router.post("/register", async (req, res) => {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        email = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Automatically log in after successful registration
        createTokenAndSetCookie(res, user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully and logged in"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        createTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: { _id: user._id, username: user.username, email: user.email }  

        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// DASHBOARD – get logged-in user + all other users
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId)
            .select("_id username email");

        const users = await User.find({
            _id: { $ne: req.userId }
        }).select("_id username email");

        res.status(200).json({
            success: true,
            currentUser,
            users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});



export default router;
