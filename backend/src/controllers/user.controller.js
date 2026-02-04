import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    res.status(201).json({
        success: true,
        message: "User registered",
    });
};



export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    // 🔐 SET COOKIE
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,        // true in production (https)
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({
        success: true,
        message: "Login successful",
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
        },
    });
};


export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out" });
};

export const getMe = (req, res) => {
    res.json({
        id: req.user.id,
        role: req.user.role,
    });
};


