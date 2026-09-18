const express = require('express');
const corsMiddleware = require('./middlewares/cors.middleware');
const path = require('path');
const dotEnv = require('dotenv');
dotEnv.config();


const connectDB = require('./config/db.config');
connectDB();
const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use('/api/files', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/v1/product',require('./routes/product.route'));
app.use('/api/v1/category',require('./routes/category.route'));
app.use('/api/v1/subcategory',require('./routes/subcategory.route'));
app.use('/api/v1/user',require('./routes/user.route'));
app.use('/api/v1/address',require('./routes/address.route'));
app.use('/api/v1/cart',require('./routes/cart.route'));
app.use('/api/v1/testimonial',require('./routes/testimonial.route'));
app.use('/api/v1/order',require('./routes/order.route'));
app.use('/api/v1/auth',require('./routes/auth.route'));
app.use('/api/v1/refund',require('./routes/refund.route'));
app.use('/api/v1/report',require('./routes/report.route'));
app.use('/api/v1/admin',require('./routes/admin.route'));
app.use('/api/v1/hero',require('./routes/heroSlide.route'));
app.use('/api/v1/settings',require('./routes/settings.route'));
app.use('/api/v1/message',require('./routes/message.route'));

const AppError = require('./utilites/appError.uti');
app.use((req,res,next)=>{
next (new AppError(`can't find ${req.originalUrl}`,404))
})

const errorHandlar = require('./middlewares/errorHandlar.middleware');
app.use(errorHandlar);

app.listen(port,_=> console.log(`Server started at port ${port}`));





