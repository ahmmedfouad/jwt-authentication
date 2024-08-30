// models/counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Identifier for different counters
    sequence_value: { type: Number, default: 0 } // The current value of the counter
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
