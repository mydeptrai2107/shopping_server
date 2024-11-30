const express = require("express");
const admin = require("../middlewares/admin");
const {Product} = require("../model/product");
const Order  = require("../model/order");

const adminRouter = express.Router();

adminRouter.post("/admin/add-product", admin, async (req, res) => {
    try {
        const { name, description, images, quantity, price, category } = req.body;
        const shopId = req.shopId || req.body.shopId; // Lấy shopId từ middleware hoặc request body

        if (!shopId) {
            return res.status(400).json({ error: "Shop ID is required" });
        }

        let product = new Product({ name, description, images, quantity, price, category, shopId });

        product = await product.save();

        res.json(product);


    } catch (err) {
        res.status(500).json({error: err.message});
        
    }
});

adminRouter.put("/admin/update-product", admin, async (req, res) => {
    try {
        const { id, name, description, images, quantity, price, category } = req.body;
        const shopId = req.shopId;

        // Tìm sản phẩm theo ID và shopId
        let product = await Product.findOne({ _id: id, shopId });

        if (!product) {
            return res.status(404).json({ error: "Product not found or not authorized" });
        }

        // Cập nhật thông tin
        product.name = name || product.name;
        product.description = description || product.description;
        product.images = images || product.images;
        product.quantity = quantity || product.quantity;
        product.price = price || product.price;
        product.category = category || product.category;

        product = await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

adminRouter.get("/admin/get-products", admin, async (req, res) => {
    try {
        const id = req.shopId; // Lấy shopId từ middleware
        console.log(id)

        const products = await Product.find({ shopId: id });
        res.json(products);
    } catch (err) {
        res.status(500).json({error : err.message});       
    }
});


adminRouter.get("/admin/get-category-product/:category", admin, async (req, res) => {

    try {
        
        const { category } = req.params;
        let products = await Product.find({
            'category' : category,
        });


        res.json(products);


    } catch (e) {
        res.status(500).json({error : e.message});
    }

});



adminRouter.post("/admin/delete-product", admin, async (req, res) => {
    try {
        const { id } = req.body;
        const shopId = req.shopId;

        // Tìm và xóa sản phẩm
        const product = await Product.findOneAndDelete({ _id: id, shopId });

        if (!product) {
            return res.status(404).json({ error: "Product not found or not authorized" });
        }

        res.json(product);

    } catch (err) {
        res.status(500).json({error : err.message});
    }
});



adminRouter.get("/admin/get-orders", admin, async (req, res) => {
    try {
        const shopId = req.shopId;

        // Lọc đơn hàng chứa sản phẩm thuộc shop hiện tại
        const orders = await Order.find({ "products.product.shopId": shopId });

        res.json(orders);
    } catch (e) {
        res.status(500).json({error : e.message});
    }
});


adminRouter.post("/admin/change-order-status", admin, async (req, res) => {
    try {
        const { status, id } = req.body;
        const shopId = req.shopId;

        // Tìm đơn hàng chứa sản phẩm của shop
        let order = await Order.findOne({ _id: id, "products.product.shopId": shopId });

        if (!order) {
            return res.status(404).json({ error: "Order not found or not authorized" });
        }

        order.status = status;

        order = await order.save();

        res.json(order.status);

    } catch (e) {
        res.status(500).json({error : e.message});

    }
});


adminRouter.get("/admin/analytics", admin, async (req, res) => {
    try {
        const shopId = req.shopId;

        // Lấy danh sách đơn hàng chứa sản phẩm của shop
        const orders = await Order.find({ "products.product.shopId": shopId });
        let totalEarnings = 0;

        for (let i = 0; i < orders.length; i++) {
            for (let j = 0; j < orders[i].products.length; j++) {
                if (orders[i].products[j].product.shopId.toString() === shopId.toString()) {
                    totalEarnings += orders[i].products[j].quantity * orders[i].products[j].product.price;
                }
            }
        }

        // Phân tích doanh thu theo danh mục
        let earnings = {
            totalEarnings,
            mobileEarnings: await fetchCategoryWiseProductEarning("Mobiles", shopId),
            fashionEarnings: await fetchCategoryWiseProductEarning("Fashion", shopId),
            electronicsEarnings: await fetchCategoryWiseProductEarning("Electronics", shopId),
            homeEarnings: await fetchCategoryWiseProductEarning("Home", shopId),
            beautyEarnings: await fetchCategoryWiseProductEarning("Beauty", shopId),
            appliancesEarnings: await fetchCategoryWiseProductEarning("Appliances", shopId),
            groceryEarnings: await fetchCategoryWiseProductEarning("Grocery", shopId),
            booksEarnings: await fetchCategoryWiseProductEarning("Books", shopId),
            essentialsEarnings: await fetchCategoryWiseProductEarning("Essentials", shopId),
        };

        res.json(earnings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



async function fetchCategoryWiseProductEarning(category, shopId) {
    let earnings = 0;

    // Lọc đơn hàng theo danh mục và shop
    let categoryOrders = await Order.find({
        "products.product.category": category,
        "products.product.shopId": shopId,
    });

    for (let i = 0; i < categoryOrders.length; i++) {
        for (let j = 0; j < categoryOrders[i].products.length; j++) {
            if (categoryOrders[i].products[j].product.shopId.toString() === shopId.toString()) {
                earnings +=
                    categoryOrders[i].products[j].quantity * categoryOrders[i].products[j].product.price;
            }
        }
    }

    return earnings;
}




module.exports = adminRouter;

