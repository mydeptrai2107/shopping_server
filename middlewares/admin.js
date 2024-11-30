
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

const admin = async (req, res, next) => {
    try {
        // Lấy token từ header "x-auth-token"
        const token = req.header("x-auth-token");
        if (!token)
            return res.status(401).json({ msg: 'No auth token, access denied!' });

        // Kiểm tra và giải mã token
        const isVerified = jwt.verify(token, "passwordKey");

        if (!isVerified)
            return res.status(401).json({ msg: "Token verification failed, access denied!" });

        // Kiểm tra xem token có đúng là của admin không
        if (isVerified.type !== 'admin') {
            return res.status(403).json({ msg: "Access denied, admin privileges required!" });
        }

        // Tìm thông tin shop từ ID trong token
        const shop = await Shop.findById(isVerified.id);
        if (!shop) {
            return res.status(404).json({ msg: "Shop not found!" });
        }

        // Gán thông tin user vào request object để dùng ở các phần tiếp theo
        req.shop = shop;
        req.shopId = isVerified.id;
        req.token = token;
        
        // Tiếp tục xử lý
        next();
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = admin;

