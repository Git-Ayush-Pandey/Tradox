const {model} = require("mongoose")
const {Schema} = require("mongoose")

const HoldingsSchema = new Schema({
    name: String,
    qty: Number,
    avg: Number,
    price: Number,
    net: String,
    day: String,
})
const Holding = new model("Holding", HoldingsSchema)

module.exports = {Holding};
