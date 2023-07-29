const express = require("express")
const path = require("path")

const fs =require("fs")
const router = express.Router()
const jwt = require('jsonwebtoken');
const {isAdmin, isAuthenticated}=require("../middleware/auth")


const { upload } = require("../multer")

const ErrorHandler = require("../utils/ErrorHandle")
const sendMail = require("../utils/sendMail")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const sendToken = require("../utils/jwtToken")
const Seller = require("../model/seller")
const sellerToken = require("../utils/sellerToken");
const { isSeller } = require("../middleware/auth");


router.post("/seller-create", upload.single("file"), async (req, res, next) => {
 try {
    
   const { email,shopName,address,password,zipCode ,phoneNumber } = req.body

   const sellerEmail=await Seller.findOne({email})
   if(sellerEmail){
    const filename=req.file.filename
    const filePath= path.join(__dirname, "../uploads",filename)
    fs.unlink(filePath,(err)=>{
      if(err){
        res.status(500).json({message:"Error deleting file"})
      }
    })

    
   }
    const filename=req.file.filename
    const fileUrl=path.join(filename)
    
    const seller={
      shopName:shopName,
      email:email,
      address:address,
      zipCode:zipCode,
      password:password,
      phoneNumber:phoneNumber,
      avatar:fileUrl
      

    }
    const activationToken=createActivationToken(seller)
    const activationURL=`http://localhost:3000/seller-activation/${activationToken}`

    try {
      await sendMail({
        email:seller.email,
        subject:"Activate your seller account",
        message:`hello ${seller.email} Please click your active your seller account ${activationURL}`
       })
       res.status(201).json({
        success:true,
        message:` Please check your email ${seller.email} activate your seller account`
       })
    } catch (error) {
      return next(new ErrorHandler(error.message,500))
    }
   


   }

 catch (error) {
   
   return next(new ErrorHandler(error.message,500))
 }
})

//create a token
const createActivationToken=(seller)=>{
  return jwt.sign(seller,process.env.ACTIVATION_SECRET,{
    expiresIn:"5m"
  })
}

//active seller
router.post("/seller-activation",catchAsyncErrors(async(req,res,next)=>{
  try {
    const {seller_activation_token}=req.body
    const newSeller=jwt.verify(
      seller_activation_token,
      process.env.ACTIVATION_SECRET
    )
    if(!newSeller){
      return next(new ErrorHandler("Invalid Token",400))

    }
    const { email,shopName,address,password,zipCode ,phoneNumber,avatar } = newSeller

    let seller= await Seller.findOne({email})
    if(seller){
      return next(new ErrorHandler("Seller already exist",400))
    }
    seller= await Seller.create({
      email,shopName,address,password,zipCode ,phoneNumber ,avatar
    })
    sellerToken(seller,201,res)

  } catch (error) {
    return next(new ErrorHandler(error,500))
  
  }
}))

//seller-login
router.post("/seller-login",catchAsyncErrors(async(req,res,next)=>{
  try {
    const {email,password} =req.body
    if(!email||!password){
      return next(new ErrorHandler("Please complete all fields",400))
    }
    const seller= await Seller.findOne({email}).select("+password")
    if(!seller){
      return next(new ErrorHandler("User doesn't exist",400))
    }

    const isPasswordValid= await seller.comparePassword(password)
    if(!isPasswordValid){
      return next(new ErrorHandler("Please provide the correct information",400))
    }
    sellerToken(seller,200,res)
  } catch (error) {
    return next(new ErrorHandler(error,400))
  }
}))

// get all seller
router.get("/get-all-seller",isAuthenticated,isAdmin("Admin"),catchAsyncErrors(async(req,res,next)=>{
  try {
    const sellers =await Seller.find()
    if(!sellers){
      return next(new ErrorHandler("seller not found",404))
    }
    res.status(201).json({
      success:true,
      sellers
    })
  } catch (error) {
    return next(new ErrorHandler(error,400))
  }
}))

//load seller
router.get("/get-seller",isSeller,catchAsyncErrors(async(req,res,next)=>{
  try {
      const seller= await Seller.findById(req.seller._id)
     
    
      if(!seller){
        return next(new ErrorHandler("User doesn't exist",400))
      }

      res.status(200).json({
        success:true,
        seller
      })
  } catch (error) {
    return next(new ErrorHandler(error,400))
  }
}))

//log out seller

router.get("/seller-log-out",catchAsyncErrors(async(req,res,next)=>{
  try {
    res.cookie("seller_token",null,{
      expires:new Date(Date.now()),
      httpOnly:true
    })

    res.status(201).json({
      success:true,
      message:"Log out successfully"
    })
  } catch (error) {
    return next(new ErrorHandler(error,400))
  }
}))

module.exports= router