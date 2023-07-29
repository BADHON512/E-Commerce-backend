const express=require("express")
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const ErrorHandler=require("../utils/ErrorHandle")
const router=express.Router()

router.post("/create-order",catchAsyncErrors(async(req,res,next)=>{
   
    try {
       const {cart,shippingAddress,user,totalPrice,paymentInfo}=req.body;
       // group cart items by shopId
       const shopItemsMap=new Map()
        
    } catch (error) {
        return next(new ErrorHandler(error,400))
    }
}))