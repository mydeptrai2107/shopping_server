const mongoose = require("mongoose");
const { productSchema } = require("./product");

const orderSchema = mongoose.Schema({
  products: [
    {
      product: productSchema,
      quantity: {
        type: Number,
        required: true,
      },
      shopId: {
        type: mongoose.Schema.Types.ObjectId,  // Mỗi sản phẩm sẽ có một shopId riêng
        required: true,
        ref: "Shop",   // Liên kết với model Shop để biết sản phẩm thuộc cửa hàng nào
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  userId: {
    required: true,
    type: String,
  },
  orderedAt: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  payMethod : {
    type: String,
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;