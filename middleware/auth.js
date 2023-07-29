const Seller =require("../model/seller")

const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandle");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../model/user");

exports.isAuthenticated= catchAsyncErrors(async(req,res,next)=>{

    const {token}=req.cookies;
   
    if(!token){
        return next(new ErrorHandler("please login to continue",401))
    } 
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
   
    
    req.user=await User.findById(decoded.id)
  
    next()
})

exports.isSeller= catchAsyncErrors(async(req,res,next)=>{

    const {seller_token}=req.cookies
   
    if(!seller_token){
        return next(new ErrorHandler("please login to continue",401))
    } 
    const decoded=jwt.verify(seller_token,process.env.JWT_SECRET_KEY)
   
    
    req.seller=await Seller.findById(decoded.id)
    
    next()
})

exports.isAdmin=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} can not access this resource`))
        }
        next()
    }
}


