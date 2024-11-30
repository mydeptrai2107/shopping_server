const mongoose = require("mongoose");

const shopSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            default: "admin",
        },
        address: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        logo: {
            type: String,
            default: "",
        },
    },
    { timestamps: true } // Tự động thêm createdAt và updatedAt
);

const Shop = mongoose.model("Shop", shopSchema);

module.exports = Shop;
