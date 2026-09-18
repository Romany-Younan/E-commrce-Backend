const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    productNameSnapshot: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceSnapshot: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'Cash On Delivery'
    },
    addressSnapshot: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    backupPhone: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'shipped', 'received', 'refused', 'cancelledByUser', 'cancelledByAdmin', 'refunded'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
