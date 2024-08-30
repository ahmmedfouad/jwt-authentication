require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const corsOptions = require('./config/corsOptions');

// Import routes
const userRoutes = require('./routes/userRoutes'); // Ensure this path is correct
const authRoutes = require('./routes/authRoutes'); // Ensure this path is correct
const rootRoutes = require('./routes/root'); // Ensure this path is correct

const port = process.env.PORT || 5000;

// Connect to database
connectDB()
    .then(() => {
        console.log('MongoDB connected');
        
        // Middleware
        app.use(cors(corsOptions)); // Configure CORS
        app.use(cookieParser()); // Parse cookies
        app.use(express.json()); // Parse JSON bodies

        app.use("/", express.static(path.join(__dirname, "public"))); // Serve static files from the public directory

        // Use routers
        app.use("/", rootRoutes); // Root router
        app.use("/auth", authRoutes); // Authentication-related routes
        app.use("/user", userRoutes); // User-related routes

        // Handle 404 errors
        app.all("*", (req, res) => {
            if (req.accepts("html")) {
                res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
            } else if (req.accepts("json")) {
                res.status(404).json({ error: "Not Found" });
            } else {
                res.status(404).type("txt").send("Not Found");
            }
        });

        // Start server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process with failure code
    });

// Handle database connection errors
mongoose.connection.on("error", (err) => {
    console.error('Database connection error:', err);
});
