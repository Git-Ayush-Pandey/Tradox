const { model } = require("mongoose");
const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Your email address is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Your name is required"],
    },
    // FIX: phone changed from Number to String to preserve leading zeros, country codes,
    // and avoid exceeding safe integer range
    phone: {
      type: String,
      required: [true, "Your mobile no. is required"],
      unique: true,
    },
    // FIX: default changed from new Date() (evaluated once at module load) to Date.now
    // (function reference, evaluated per document)
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    realizedPL: { type: Number, default: 0 },
    unrealizedPL: { type: Number, default: 0 },
  },
  { timestamps: true } // FIX: adds createdAt + updatedAt managed by Mongoose
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameUnique: false,
});
const User = new model("User", userSchema);
module.exports = User;
