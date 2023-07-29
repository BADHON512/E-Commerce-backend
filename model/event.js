const { default: mongoose } = require("mongoose");


const eventSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your Event name"]
    },
    description:{
        type:String,
        required:[true,"Please write your Event description"]
    },
    category:{
        type:String,
        required:[true,"Please select your event category"]
    },
    start_Date:{
        type:Date,
        required:true
    },
    finish_Date:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        default:"Running"
    },

    tags:{
        type:String,
       
    },
    originalPrice:{
        type:Number,
        required:[true,"Please enter your first Price"]

    },
    discountPrice:{
        type:Number,
        required:[true,"Please enter your discountPrice Price"]

    },
    stock:{
        type:String,
        required:[true,"Please enter your stock"]
    },
    images:[{
        type:String
    }],
    shopId:{
        type:String,
        required:true
    },
    shop:{
        type:Object,
        required:true
    },
    sold_out:{
        type:Number,
        default:0
    },

    createdAt:{
        type:Date,
        default:Date.now()
    }

})


const Event= mongoose.model("Event",eventSchema)

module.exports= Event;