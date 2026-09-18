const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    desc: String,
    price: { type: Number, required: true },
    image: String,
    stock: { type: Number, default: 0 },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    soldCount: {
        type: Number,
        default: 0
    },
    season: {
        type: String,
        enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'All Year'],
        default: 'All Year'
    }
}, { timestamps: true });



module.exports = mongoose.model('product', productSchema);