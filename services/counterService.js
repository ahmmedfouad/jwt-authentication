// services/counterService.js
const Counter = require('../models/counter'); // Adjust path if necessary

async function getNextSequenceValue(sequenceName) {
    try {
        const sequenceDocument = await Counter.findByIdAndUpdate(
            { _id: sequenceName },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true } // Create if not exists
        );
        return sequenceDocument.sequence_value;
    } catch (err) {
        console.error('Error fetching next sequence value:', err);
        throw new Error('Error fetching next sequence value');
    }
}

module.exports = { getNextSequenceValue };
