const express = require("express");
const mongoose=require("mongoose");
const requestRouter = express.Router();
require("dotenv").config();
const { User } = require("../models/user")
const { userAuth } = require("../middlewares/authmiddlewares")
const app = express();
const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { connectionRequestModel } = require("../models/connectionrequest")
app.use(express.json());
app.use(cookieParser());

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserid = req.user._id;
    const toUserid = req.params.toUserId
    const status = req.params.status;

   


    if (!fromUserid || !toUserid || !status) throw new Error("Something Went wrong on sending Connection Request")

    //check is the toUserId is present or not;
    const isToUserPresent = await User.findById(toUserid);


    if (!isToUserPresent) throw new Error("Something Went Wrong During sending Request");

   

    const ALLOWEDSTATUS = ['interested', 'ignore'];

    if (!ALLOWEDSTATUS.includes(status)) throw new Error({
      message: `Bad Connection Request ${status}`
    })



    //check is user is already Present 
    const existingConnection = await connectionRequestModel.findOne({
      $or: [
        { fromUserid: fromUserid, toUserid: toUserid },
        { fromUserid: toUserid, toUserid: fromUserid }
      ]
    });




    if (existingConnection) throw new Error("connectionm Request Already Present");

    const connectionRequest = new connectionRequestModel({
      fromUserid: fromUserid,
      toUserid: toUserid,
      status: status
    })

    const data = await connectionRequest.save()

    res.status(200).send({ message: `${req.user.firstName} is ` + " " + status === "intrested" ? "Intrested in You " : "Ignored You", data: data })

  }
  catch (error) {
    res.status(400).send({ message: error.message })
  }
})
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = req.params.requestId;
      const toUserId = user._id;
      const status = req.params.status;

      const ALLOWEDSTATUS = ["accepted", "rejected"];
      if (!ALLOWEDSTATUS.includes(status)) {
        throw new Error("Status not allowed");
      }



      const connectionRequest = await connectionRequestModel.findOne({
        fromUserid: new mongoose.Types.ObjectId(fromUserId),
        toUserid: new mongoose.Types.ObjectId(toUserId),
        status: "interested",
      });

      if (!connectionRequest) {
        throw new Error("Connection request not found");
      }

      connectionRequest.status = status;
      await connectionRequest.save();

      res.status(200).send({
        message: `${user.firstName} ${status} your request`,
      });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
);

module.exports = { requestRouter }