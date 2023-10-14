const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    mb_nick: {
        type: String,
        required: true,
        index: { unique: true, sparse: true },
    },
    mb_phone: {
        type: String,
        required: true,
    },
    mb_password: {
        type: String,
        required: true,
        select: false,
    },
    mb_type: {
        type: String,
        required: false,
        default: "USER",
        enum: {
            values: member_type_enums,
            message: "{VALUES} is not among permitted values",
        },
    },
    mb_status: {
        type: String,
        required: false,
        default: "ACTIVE",
        enum: {
            values: member_status_enums,
            message: "{VALUES} is not among permitted values",
        },
    },
    mb_full_name: {
        type: String,
        required: false,
    },
    mb_address: {
        type: String,
        required: false,
    },
    mb_image: {
        type: String,
        required: false,
    },
    mb_point: {
        type: String,
        required: false,
        default: 0,
    },
});
