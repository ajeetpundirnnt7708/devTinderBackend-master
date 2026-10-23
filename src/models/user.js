const mongoose = require("mongoose");
require("dotenv").config();
const validator = require("validator")
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        index:true,
        maxlength: 20

    },
    lastName: {
        type: String,
        maxlength: 20
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email address")
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) throw new Error("Enter a Strong Password")
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender Is Not Valid");
            }

        }
    },
    photoUrl: {
        type: String,
        default: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        validate(value) {
            if (!validator.isURL(value)) throw new Error("Invalid Photo Url" + value);
        }
    },
    about: {
        type: String
    },
    skills: {
        type: [String],
    }


}, { timestams: true })

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, process.env.SECREAT_KEY, { expiresIn: "7d", });
    return token;

}
userSchema.methods.getValidatePassword = async function (inputpassword) {//input password by user
     const user=this;//pointed to current user
    const isPasswordValid=await bcrypt.compare(inputpassword, user.password);
    return isPasswordValid;
}

const User = mongoose.model("User", userSchema);
module.exports = { User };