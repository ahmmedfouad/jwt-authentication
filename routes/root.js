const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html")); // Send the index.html file
});


module.exports = router;