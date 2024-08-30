const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    id: {
        type: Number,
        required: true,
        unique: true,

    },

    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 50
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        trim: true,
        minlength: 8,
        maxlength: 100
    },
    role: {
        type: String,
        default: 'student',
        enum: ['student', 'instructor', 'admin', 'manager']
    },


}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
