const { mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
  try {
    const x = await mongoose.connect(process.env.DB_STRING);
    console.log("Connected to db");
    mongoose.connection.db.dropDatabase();
    console.log("Dropped db");
    // get the data from Github
  } catch (error) {
    console.log("db error");
  }
};

module.exports = { connectDB };
