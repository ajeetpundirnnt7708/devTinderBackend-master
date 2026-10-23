require("dotenv").config();
const db="mongodb+srv://ajeetpundirnnt_db_user:@Rana7708@cluster0.eqtbck9.mongodb.net/?appName=Cluster0"
const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(db);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {connectDb}

