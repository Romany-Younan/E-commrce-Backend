const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utilites/appError.uti');

module.exports = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith('Bearer ')) {
        return next(new AppError('unauthorized , no token provided',401))
    }
    const token = authHeader.split(' ')[1];

    try{
const decode = jwt.verify(token,process.env.SECRET_KEY);
const myUser = await User.findById(decode.id).select('-password');
if(!myUser){
     return  res.status(401).json({message:'error',err:'unauthorized'})
}
req.user = myUser;

next();
    }
    catch(err){
res.status(403).json({message:'error',err:'invalid user'})
    }
}