const express=require("express");
const profileRouter=express.Router();
require("dotenv").config();
const { User } = require("../models/user")
const { userAuth } = require("../middlewares/authmiddlewares")
const app = express();
const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");




profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const { user } = req;

       
        res.status(200).send({ message: user });
        

    } catch (error) {
        res.status(400).send({ message: `Someething went wrong : ${error.message}` });


    }

})


profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const data = req.body;

    if (data?.skills?.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    const ALLOWED_UPDATE = [
      "firstName",
      "lastName",
      "photoUrl",
      "about",
      "gender",
      "age",
      "skills"
    ];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATE.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    const user = await User.findOneAndUpdate(
      { _id },
      data,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({
      message: `${user.firstName}, your profile updated successfully`,
      user
    });

  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
//     try {
//         const { id } = req.user;
//         const data = req.body;
//         //console.log(data);

//         if (data?.skills?.length > 10) throw new Error("skills Cannot be More Than 10")

//         const ALLOWED_UPDATE = ["photoUrl", "about", "gender", "age","skills"];

//         const isUpdateAllowed = Object.keys(data).every((k) => ALLOWED_UPDATE.includes(k));

//         if (!isUpdateAllowed) {
//             throw new Error("Update Not allowed");
//         }


//         const user = await User.findOneAndUpdate({ _id: id }, data, {
//             new:true,//return new data
//             runvalidator: true
//         });



//         if (!user) {
//             return res.status(404).send({ message: "User not found" });
//         }

//         res.status(200).send({ message: ` ${user.firstName } your Profile Updated Successfully` , user: user })

//     }
//     catch (error) {
//         res.status(404).send({ message: `Someething went wrong ${error.message}` })
//     }


// })


profileRouter.patch("/profile/updatePassword",userAuth,async(req,res)=>{
    try{
        const {password}=req.body;
        if(!password)throw new Eroor("Password Fieds Are Required");

        const {_id}=req.user;
        
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

         const user = await User.findOneAndUpdate({ _id: _id }, {password:hashPassword}, {
            runvalidator: true
        });

         res.status(200).send({ message: "Password updated successfully" });

    }catch(error){
         res.status(404).send({ message: `Someething went wrong ${error.message}` })
        

    }
})



// profileRouter.get("/user", userAuth, async (req, res) => {
//     try {
//         const { emailId } = req.body;

//         if (!emailId) return res.status(500).send({ message: "Email id Is Required" });

//         const user = await User.findOne({ emailId: emailId });

//         if (!user) res.status(404).send({ message: "User Not Found" })

//         res.status(200).send({ message: user });
//     }
//     catch (error) {
//         res.status(400).send({ message: `Someething went wrong ${error.message}` })
//     }
// })

// profileRouter.get("/feed", userAuth, async (req, res) => {
//     try {
//         const users = await User.find({});

//         if (!users) return res.status(404).send({ message: "User Not Found" })

//         res.status(200).send({ message: users });


//     } catch (error) {
//         res.status(400).send({ message: `Someething went wrong ${error.message}` });

//     }
// })

module.exports={profileRouter};