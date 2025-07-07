const { model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  phone: {
    type: Number,
    required: [true, "Your mobile no.  is required"],
    unique: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});
const User = new model("User", userSchema);

module.exports = User;
