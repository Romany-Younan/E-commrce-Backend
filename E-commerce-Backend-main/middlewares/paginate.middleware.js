module.exports = (Model)=>async(req,res,next)=>{
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
const sortBy = req.query.sort || 'createdAt';
const order = req.query.order === 'desc' ? -1 : 1;

const [results,total] = await Promise.all([
    Model.find().sort({[sortBy]:order}).skip(skip).limit(limit),
    Model.countDocuments()
])

res.paginatedResult ={
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults:total,
    data:results
}
next()
}