const Purchase = require('../models/purchase.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');


exports.addPurchase= async(req,res)=>{
const {productId, quantity,purchasedAt}= req.body;
const userId = req.user._id;

const session = await mongoose.startSession();
session.startTransaction();
try{
const myProduct = await Product.findOneAndUpdate({_id:productId,stock:{$gte:quantity}},{$inc: {stock:-quantity}}, {new:true,session})
if(!myProduct){
    throw new Error("Product not found or out of stock");
    
}
const myPurchase = await Purchase.create([{user:userId,product:productId,quantity,price:myProduct.price,purchasedAt}],{session});

await session.commitTransaction();
session.endSession();
res.status(201).json({message:'purchase added',data:myPurchase});
}
catch(err){
await session.abortTransaction();
session.endSession();

return res.status(500).json({message:'error',error:err.message});
}





}



exports.getUserPurchases= async (req,res) => {
    const userId = req.user._id;
    const myPurchases = await Purchase.find({user:userId}).populate('product user','name imgURL');
    
    res.status(200).json({message:'user purchases',data:myPurchases});
}

exports.getAllPurchases = async (req,res) => {
    const purchases = await Purchase.find().populate('product user','name imgURL');
    res.status(200).json({message:'purchases list',data:purchases});
}