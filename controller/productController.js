const express=require("express")


const catchAsyncErrors  =require("../middleware/catchAsyncErrors")
const ErrorHandle=require("../utils/ErrorHandle")
const Seller=require("../model/seller")
const Product=require("../model/productModel")
const { upload } = require("../multer")
const { isSeller}=require("../middleware/auth.js")
const fs =require("fs")
const path= require("path")



const router=express.Router()




 router.post("/create-product",upload.array("images"),catchAsyncErrors(async(req,res,next)=>{
    try {
        const shopId=req.body.shopId
    
        const shop= await Seller.findById(shopId)
        if(!shop){
          return next(new ErrorHandle("Shop id Not Exist"))
        }else{
           const files= req.files
           const imagesURL=files.map((file)=>`${file.filename}`)
           const productData=req.body;
           productData.images=imagesURL
           productData.shop=shop
           
           const product= await Product.create(productData)
           res.status(201).json({
            success:true,
            product
           })
        }
    } catch (error) {
      return next(new ErrorHandle(error,400))
    }
 }))

 router.get("/get-all-products/:id",catchAsyncErrors(async(req,res,next)=>{
   try {
    const product= await Product.find({shopId:req.params.id})
    res.status(201).json({
        success:true,
        product
    })
   } catch (error) {
    return next(new ErrorHandle(error,400))
   }

 }))


 // delete Product of a shop

 router.delete("/delete-shop-product/:id",isSeller,catchAsyncErrors(async(req,res,next)=>{
  try {
    const productId=req.params.id
    
    const productPIC=await Product.findById(productId)
    productPIC.images.forEach((file)=>{
      const filename=file
      const pathname= path.join(__dirname,"../uploads",filename)
      fs.unlink(pathname,(err)=>{
        console.log(err)
      })
    })


    const product=await Product.findByIdAndDelete(productId)
    if(!product){
      return next(new ErrorHandle("Product not found with this id",400))
    }
    res.status(201).json({
      success:true,
       message:"Product deleted Successfully"
    })
  } catch (error) {
    return next(new ErrorHandle(error,400))
  }
 }))


 router.get("/get-all-product",catchAsyncErrors(async(req,res,next)=>{
  try {
    const product=await Product.find()
    if(!product){
      return next(new ErrorHandle("NO product found",400))
    }
    res.status(201).json({
      success:true,
      product
    })
  } catch (error) {
    return next(new ErrorHandle(error,400))
  }
 }))

module.exports = router