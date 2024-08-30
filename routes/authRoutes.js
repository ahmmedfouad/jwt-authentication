
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route("/Register").post(authController.register);// Register a new user
router.route("/Login").post(authController.login);// Login a user
router.route("/refresh").get(authController.refresh);// Refresh the JWT token
router.route("/logout").post(authController.logout);// Logout a user
router.post('/test', (req, res) => {
    res.send('POST request to /test was successful');
});
module.exports = router;

