const { default: mongoose } = require("mongoose")


const couponsSchema=mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    value:{
        type:String,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    maxAmount:{
        type:Number,
        required:true
    },
    shopId:{
        type:String,
        required:true
    },
    shop:{
        type:Object,
        required:true
    },
    selectedProduct:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const Coupon=mongoose.model("coupon",couponsSchema)
module.exports= Coupon