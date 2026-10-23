const express = require("express");
const authRouter = express.Router();
require("dotenv").config();
const { User } = require("../models/user")
const { userAuth } = require("../middlewares/authmiddlewares")
const app = express();
const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cookieParser());


authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        console.log(`${emailId}  ${password} `);

        if (!emailId || !password) throw new Error("Fields Are Required");

        const user = await User.findOne({ emailId: emailId });

        if (!user) throw new Error("Invalid Emailid or Password");

        //mongodbmethods
        const isPasswordValid = await user.getValidatePassword(password);


        if (!isPasswordValid) throw new Error("Invalid Email or Password");

        if (isPasswordValid) {
            //crete jwt token from schema methods

            const token = await user.getJWT();


            //send back token to the user
            // 
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
            });


            res.status(200).send({ message: "User Login Successfully", user: user })
        }


    } catch (error) {
        res.status(400).send({ message: error.message });

    }



})

authRouter.post("/signup", async (req, res) => {
    try {

        const { firstName, lastName, emailId, password, age } = req.body;
        validateSignup(req);
        //hashPassword



        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = new User({
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            password: hashPassword,
            age: age
        });
        const SavedUser = await user.save();
        const token = await SavedUser.getJWT();

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,          // HTTP (change to true when HTTPS)
            sameSite: "lax",
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
        });


        res.status(200).send({
            message: "User added Successfully",
            user: SavedUser
        });

    }
    catch (error) {
        res.status(400).send({ message: error.message });

    }

})

authRouter.delete("/deleteuser", userAuth, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).send({ message: "Invalid emailId" })
        }
        const { deleteCount } = await User.findOneAndDelete({ _id: id });

        if (deleteCount === 0) return res.status(404).send({ message: "User not found" });

        res.status(200).send({ message: "User deleted Successfully" })

    }
    catch (error) {
        res.status(404).send({ message: `Someething went wrong ${error.message}` })
    }

})

authRouter.post("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,        // must match login
        sameSite: "none",    // must match login
        path: "/",           // must match login
        expires: new Date(0) // force expire
    });

    res.status(200).json({
        message: "You Are Logged Out Successfully"
    });
});



module.exports = { authRouter }