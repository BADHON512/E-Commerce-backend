
const express=require("express")
const {isSeller}=require("../middleware/auth")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ErrorHandler = require("../utils/ErrorHandle")
const Coupon=require("../model/coupon")

const router=express.Router()

router.post("/create-coupon",isSeller,catchAsyncErrors(async(req,res,next)=>{
    try {
         const existCoupon= await Coupon.find({
            name:req.body.name
         })

         if(existCoupon.length !==0){
            return next(new ErrorHandler("Coupon code is exist",400))
         }

         const coupon=await Coupon.create(req.body)
         res.status(201).json({
            success:true,
            coupon
         })
    } catch (error) {
        return next(new ErrorHandler(error,400))
    }
}))

router.get("/get-all-coupon/:id",isSeller,catchAsyncErrors(async(req,res,next)=>{
   try {
      
      const coupon=await Coupon.find({shopId:req.params.id})
      res.status(201).json({
         success:true,
         coupon
      })

   } catch (error) {
      return next(new ErrorHandler(error,400))
   }
}))

router.delete("/delete-coupon/:id",isSeller,catchAsyncErrors(async(req,res,next)=>{
   try {
      const coupon=await Coupon.findByIdAndDelete(req.params.id)
      if(!coupon){
         return next(new ErrorHandler("Id not found"))
      }
      res.status(201).json({
         success:true,
         message:"Coupon deleted successfully"
      })
   } catch (error) {
      return next(new ErrorHandler(error,400))
   }
}))

module.exports= router