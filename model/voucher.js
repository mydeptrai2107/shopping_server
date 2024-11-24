const mongoose = require("mongoose");

const voucherSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    minPurchase: {
        type: Number,
        default: 0,
    },
    applicableCategories: {
        type: [String],
        default: [],
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
});

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
