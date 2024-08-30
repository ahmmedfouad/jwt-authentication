
const mongoose = require('mongoose');



// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
  } catch (error) {
   console.log(error);
  }
};
module.exports = connectDB;