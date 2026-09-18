const cors = require('cors');
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'];

const corsOptions = {
    origin : function(origin, callback){
        if(!origin) {
            return callback(null,true);
        }
        else
        {
            if(allowedOrigins.includes(origin)){
                return callback(null,true)
            }
            else{
                return callback(new Error('Cors policy: origin not allowed'))
            }
        }
    },
    credentials: true,
    methods: ['GET','POST','PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization']
}

module.exports = cors(corsOptions);