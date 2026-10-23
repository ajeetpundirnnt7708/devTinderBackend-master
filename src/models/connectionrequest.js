const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ignore", "interested", "accepted", "rejected"],
      required: true,
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ fromUserid: 1, toUserid: 1 });

connectionRequestSchema.pre("save", function () {
  if (this.fromUserid.equals(this.toUserid)) {
    throw new Error("You cannot send a connection request to yourself");
  }
});

const connectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = { connectionRequestModel };
