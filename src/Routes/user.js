const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/authmiddlewares")
const { User } = require("../models/user");
const { connectionRequestModel } = require("../models/connectionrequest")

userRouter.get("/user/request", userAuth, async (req, res) => {
    try {
        const userid = req.user._id;//looged in user id
        //we have to get all pending connection request for the loggedin user

        const getallConnectionRequest = await connectionRequestModel.find({
            toUserid: userid, status: "interested",}).populate("fromUserid", ["firstName", "lastName", "photoUrl", "age","about"]);

        if (getallConnectionRequest.length == 0) return res.status(400).send({ message: "NO connection Request Found" });

        res.status(200).send({ message: getallConnectionRequest });

    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
})

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const userid = req.user._id;
        const getallConnection = await connectionRequestModel.find({
            $or: [
                { toUserid: userid, status: "accepted" },
                { fromUserid: userid, status: "accepted" }
            ]


        }).populate("fromUserid", ["firstName", "lastName", "age", "photoUrl","about"]).populate("toUserid", ["firstName", "lastName", "age", "photoUrl","about"])

        if (getallConnection.length === 0) return res.status(400).send({ message: "NO coonection Request Found" });

        const data = getallConnection.map((items) => {
            if (items.fromUserid._id.toString() === userid.toString()) {
                return items.toUserid
            }
            return items.fromUserid
        })

        res.status(200).send({ data: data });



    } catch (error) {
        res.status(400).send({ message: error.message });
    }


})

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {
        const loggeduserid = req.user._id;


        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const skip = (page - 1) * limit;



        // Get all users connected or requested by logged-in user
        const allConnections = await connectionRequestModel.find({
            $or: [
                { fromUserid: loggeduserid },
                { toUserid: loggeduserid }
            ]
        })
            .select("fromUserid toUserid")
            .populate("fromUserid", "_id")
            .populate("toUserid", "_id");

        const hideUsersfromFeed = new Set();

        allConnections.forEach(connection => {
            hideUsersfromFeed.add(connection.fromUserid._id.toString());
            hideUsersfromFeed.add(connection.toUserid._id.toString());
        });

        // Exclude connected users and self
        const excludeIds = [...hideUsersfromFeed, loggeduserid];

        const users = await User.find({
            _id: { $nin: excludeIds }
        })
            .select(["firstName", "lastName", "photoUrl", "about", "skills","age"]).skip(skip).limit(limit)

        if (users.length === 0)
            return res.status(400).send({ message: "No Users Found" });

        res.status(200).send({ users });

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


module.exports = { userRouter };