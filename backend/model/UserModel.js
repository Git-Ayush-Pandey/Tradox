const { model } = require("mongoose");
const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Your name is required"],
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
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameUnique: false,
});
const User = new model("User", userSchema);
module.exports = User;
