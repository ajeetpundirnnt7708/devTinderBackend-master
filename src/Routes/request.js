const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const express = require("express");
const mongoose = require("mongoose");

const requestRouter = express.Router();
const { User } = require("../models/user");
const { userAuth } = require("../middlewares/authmiddlewares");
const { connectionRequestModel } = require("../models/connectionrequest");

const SEND_ALLOWED_STATUS = ["interested", "ignore"];
const REVIEW_ALLOWED_STATUS = ["accepted", "rejected"];

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    if (!SEND_ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: `Invalid connection request status: ${status}` });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (fromUserId.equals(toUserId)) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const toUser = await User.findById(toUserId).select("firstName");
    if (!toUser) {
      return res.status(404).json({ message: "The user you are trying to connect with does not exist" });
    }

    const existingConnection = await connectionRequestModel.findOne({
      $or: [
        { fromUserid: fromUserId, toUserid: toUserId },
        { fromUserid: toUserId, toUserid: fromUserId },
      ],
    });

    if (existingConnection) {
      return res.status(409).json({ message: "A connection request already exists with this user" });
    }

    const connectionRequest = await connectionRequestModel.create({
      fromUserid: fromUserId,
      toUserid: toUserId,
      status,
    });

    const message =
      status === "interested"
        ? `You sent a connection request to ${toUser.firstName}`
        : `You ignored ${toUser.firstName}`;

    return res.status(200).json({ message, data: connectionRequest });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const { requestId, status } = req.params;

    if (!REVIEW_ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: `Invalid review status: ${status}` });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const connectionRequest = await connectionRequestModel
      .findOne({
        _id: requestId,
        toUserid: req.user._id,
        status: "interested",
      })
      .populate("fromUserid", "firstName");

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = status;
    await connectionRequest.save();

    return res.status(200).json({
      message: `You ${status} the connection request from ${connectionRequest.fromUserid?.firstName || "the developer"}`,
      data: connectionRequest,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = { requestRouter };
