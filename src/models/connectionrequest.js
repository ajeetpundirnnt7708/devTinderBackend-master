const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUserid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",//reference to the user
        required: true
    },
    toUserid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["ignore", "interested", "accepted", "rejected"],
        required: true
    }
});
//index like query 
connectionRequestSchema.index({fromUserid:1,toUserid:1});

connectionRequestSchema.pre("save",function(next){
    const connectionRequest=this;
    ///check if the from useridto is same as userid;
    if(connectionRequest.fromUserid.equals(connectionRequest.toUserid)) return next(new Error("You cannot send request to yourself"));
})
const connectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = { connectionRequestModel }; 
