const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    tagline:{
        type: String,
        required: true,
    },
    highlights:{
        type: [String],
        required: true,
    },
    images: {
        type:[String],
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    displayDate: {
        type: String,
    },
    date:{
        type:String,
        required: true,
    },
    // featured: {
    //     type: String,
    //     required: true,
    // },
}, {timestamps: true});


module.exports = mongoose.model("Events", eventSchema)

