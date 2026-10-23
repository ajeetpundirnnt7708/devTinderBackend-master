const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const express = require("express");

const userRouter = express.Router();
const { userAuth } = require("../middlewares/authmiddlewares");
const { User } = require("../models/user");
const { connectionRequestModel } = require("../models/connectionrequest");

const PUBLIC_FIELDS = ["firstName", "lastName", "photoUrl", "age", "about", "skills", "gender"];

// Pending requests received by the logged-in user.
userRouter.get("/user/request", userAuth, async (req, res) => {
  try {
    const requests = await connectionRequestModel
      .find({ toUserid: req.user._id, status: "interested" })
      .populate("fromUserid", PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: requests });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Users the logged-in user is connected with (accepted requests).
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const connections = await connectionRequestModel
      .find({
        status: "accepted",
        $or: [{ toUserid: userId }, { fromUserid: userId }],
      })
      .populate("fromUserid", PUBLIC_FIELDS)
      .populate("toUserid", PUBLIC_FIELDS)
      .sort({ updatedAt: -1 });

    const data = connections.map((connection) => {
      const from = connection.fromUserid;
      const to = connection.toUserid;
      return from && from._id.toString() === userId.toString() ? to : from;
    });

    return res.status(200).json({ data: data.filter(Boolean) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// People you have not interacted with yet.
userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const interactions = await connectionRequestModel
      .find({ $or: [{ fromUserid: loggedUserId }, { toUserid: loggedUserId }] })
      .select("fromUserid toUserid")
      .lean();

    const excludeIds = new Set([loggedUserId.toString()]);
    interactions.forEach(({ fromUserid, toUserid }) => {
      excludeIds.add(fromUserid.toString());
      excludeIds.add(toUserid.toString());
    });

    const users = await User.find({ _id: { $nin: [...excludeIds] } })
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = { userRouter };
