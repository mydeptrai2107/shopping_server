const express = require('express');
const voucherRouter = express.Router();
const Voucher = require('../model/voucher');
const auth = require('../middlewares/auth');

// CREATE: Create a new voucher
voucherRouter.post('/api/vouchers', auth, async (req, res) => {
    try {
        const { code, discountType, discountValue, minPurchase, applicableCategories, expirationDate, usageLimit } = req.body;

        // Validate required fields
        if (!code , !discountType , !discountValue , !expirationDate) {
            return res.status(400).json({ error: 'Code, discountType, discountValue, và expirationDate là bắt buộc!' });
        }

        // Check if voucher code already exists
        const existingVoucher = await Voucher.findOne({ code });
        if (existingVoucher) {
            return res.status(400).json({ error: 'Voucher code already exists!' });
        }

        const newVoucher = new Voucher({
            code,
            discountType,
            discountValue,
            minPurchase: minPurchase ?? 0,
            applicableCategories: applicableCategories ??  [],
            expirationDate,
            usageLimit: usageLimit ?? 1,
        });

        await newVoucher.save();
        res.status(201).json(newVoucher);
    } catch (e) {
        res.status(500).json({ error:' ${e.message} from server' });
    }
});

// READ: Get all vouchers
voucherRouter.get('/api/vouchers', auth, async (req, res) => {
    try {
        const vouchers = await Voucher.find({});
        res.json(vouchers);
    } catch (e) {
        res.status(500).json({ error:' ${e.message} from server '});
    }
});

// READ: Get a single voucher by code
voucherRouter.get('/api/vouchers/:code', auth, async (req, res) => {
    try {
        const voucher = await Voucher.findOne({ code: req.params.code });

        if (!voucher) {
            return res.status(404).json({ error: 'Voucher không tồn tại!' });
        }

        res.json(voucher);
    } catch (e) {
        res.status(500).json({ error: '${e.message} from server '});
    }
});

// UPDATE: Update a voucher by code
voucherRouter.put('/api/vouchers/:code', auth, async (req, res) => {
    try {
        const { discountType, discountValue, minPurchase, applicableCategories, expirationDate, usageLimit } = req.body;

        const updatedVoucher = await Voucher.findOneAndUpdate(
            { code: req.params.code },
            {
                discountType,
                discountValue,
                minPurchase,
                applicableCategories,
                expirationDate,
                usageLimit,
            },
            { new: true } // Return the updated document
        );

        if (!updatedVoucher) {
            return res.status(404).json({ error: 'Voucher không tồn tại!' });
        }

        res.json(updatedVoucher);
    } catch (e) {
        res.status(500).json({ error:' ${e.message} from server' });
    }
});

// DELETE: Delete a voucher by code
voucherRouter.delete('/api/vouchers/:code', auth, async (req, res) => {
    try {
        const deletedVoucher = await Voucher.findOneAndDelete({ code: req.params.code });

        if (!deletedVoucher) {
            return res.status(404).json({ error: 'Voucher không tồn tại!' });
        }

        res.json({ message: 'Voucher đã bị xóa!' });
    } catch (e) {
        res.status(500).json({ error: '${e.message} from server'});
    }
});

// VALIDATE: Check if a voucher is valid
voucherRouter.get('/api/vouchers/validate/:code', auth, async (req, res) => {
    try {
        const voucher = await Voucher.findOne({ code: req.params.code });

        if (!voucher) {
            return res.status(404).json({ error: 'Voucher không tồn tại!' });
        }

        const currentDate = new Date();
        if (voucher.expirationDate < currentDate) {
            return res.status(400).json({ error: 'Voucher đã hết hạn!' });
        }

        res.json({ valid: true, voucher });
    } catch (e) {
        res.status(500).json({ error: '${e.message} from server'});
    }
});

module.exports = voucherRouter;