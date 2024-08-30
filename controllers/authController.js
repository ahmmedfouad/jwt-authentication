const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getNextSequenceValue } = require('../services/counterService'); // Ensure you have this service set up

const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Please provide all fields" });
    }

    // Check if user already exists
    const foundUser = await User.findOne({ $or: [{ username }, { email }] }).exec();
    if (foundUser) {
        return res.status(400).json({ error: "User already exists" });
    }

    // Validate role if provided
    const validRoles = ['admin', 'instructor', 'student', 'manager'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    // Generate the next custom ID
    const nextId = await getNextSequenceValue('user_id');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
        id: nextId,
        username,
        email,
        password: hashedPassword,
        role: role || 'student'
    });
    await newUser.save();

    // Create an access token
    const accessToken = jwt.sign({
        UserInfo: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    // Create a refresh token
    const refreshToken = jwt.sign({
        UserInfo: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    res.cookie("jwt", refreshToken, {
        httpOnly: true, // Prevents client-side JS from reading the cookie
        secure: true, // Ensures the browser only sends the cookie over HTTPS
        sameSite: "none", // Cross-Origin Requests will be allowed
        maxAge: 604800000 // Sets the cookie to expire in 7 days
    });

    res.status(201).json({
        id: newUser.id,
        _id: newUser._id,
        accessToken,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Please provide all fields" });
    }

    // Check if user exists
    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) {
        return res.status(401).json({ error: "Incorrect email or password" });
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
        return res.status(401).json({ error: "Incorrect email or password" });
    }

    // Create an access token
    const accessToken = jwt.sign({
        UserInfo: {
            id: foundUser._id,
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.role
        }
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    // Create a refresh token
    const refreshToken = jwt.sign({
        UserInfo: {
            id: foundUser._id,
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.role
        }
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    res.cookie("jwt", refreshToken, {
        httpOnly: true, // Prevents client-side JS from reading the cookie
        secure: true, // Ensures the browser only sends the cookie over HTTPS
        sameSite: "none", // Cross-Origin Requests will be allowed
        maxAge: 604800000 // Sets the cookie to expire in 7 days
    });

    res.status(200).json({
        accessToken,
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role
    });
};

const refresh = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ error: "No refresh token found" });
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        const foundUser = await User.findById(user.UserInfo.id).exec();
        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate a new access token
        const accessToken = jwt.sign({
            UserInfo: {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                role: foundUser.role
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        res.status(200).json({ accessToken });
    });
};
const logout = async (req, res) => {
    if (!req.cookies.jwt) {
        return res.status(401).json({ error: "No refresh token found" });
    }
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out" });
}
module.exports = {
    register,
    login,
    refresh,
    logout,
};
