const express = require("express");
const Shop = require("../model/shop");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/admin");

const shopRouter = express.Router();

// Đăng ký shop (chỉ tên, email, password)
shopRouter.post("/shop/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra xem email đã được sử dụng chưa
        const existingShop = await Shop.findOne({ email });
        if (existingShop) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo shop mới
        const shop = new Shop({
            name,
            email,
            password: hashedPassword,
        });

        await shop.save();

        res.status(201).json({
            message: "Đăng ký shop thành công!",
            shop: {
                id: shop._id,
                name: shop.name,
                email: shop.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi!", error: error.message });
    }
});

shopRouter.patch("/shop/update", auth, async (req, res) => {
    try {
        const { description, address, phone, logo } = req.body;
        const shopId = req.shopId; // Lấy shopId từ middleware auth
        console.log(shopId)
        // Kiểm tra nếu shop tồn tại
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: "Shop không tồn tại!" });
        }

        // Cập nhật thông tin
        if (description) shop.description = description;
        if (address) shop.address = address;
        if (phone) shop.phone = phone;
        if (logo) shop.logo = logo;

        await shop.save();

        res.status(200).json({
            message: "Cập nhật thông tin shop thành công!",
            shop,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi!", error: error.message });
    }
});

shopRouter.get("/api/shop/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm shop theo ID
        const shop = await Shop.findById(id);

        if (!shop) {
            return res.status(404).json({ error: "Shop not found!" });
        }

        // Trả về thông tin shop
        res.json(shop);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

shopRouter.get("/api/shop", auth, async (req, res) => {
    try {
        // Lấy shopId từ middleware auth
        const shopId = req.shopId;
        console.log(shopId)

        if (!shopId) {
            return res.status(400).json({ error: "Shop ID not found in token" });
        }

        // Tìm shop theo shopId
        const shop = await Shop.findById(shopId).select("-password"); // Loại bỏ trường password khi trả về

        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        // Trả về thông tin shop
        res.json(shop);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = shopRouter;
