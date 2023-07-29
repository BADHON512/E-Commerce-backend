const { default: mongoose } = require("mongoose");


const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your Product name"]
    },
    description:{
        type:String,
        required:[true,"Please write your product description"]
    },
    category:{
        type:String,
        required:[true,"Please select your category"]
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


const Product= mongoose.model("Product",productSchema)

module.exports= Product;