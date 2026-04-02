const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const db = () => {
  try {
    const mongodb = mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("mongoDb DataBase is Connected ❤️");
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = db;
