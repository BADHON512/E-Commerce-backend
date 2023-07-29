const express=require("express")

const router=express.Router()
const { upload } = require("../multer")
const ErrorHandle=require("../utils/ErrorHandle")
const catchAsyncErrors  =require("../middleware/catchAsyncErrors")
const Seller = require("../model/seller")
const Event = require("../model/event")
const { isSeller } = require("../middleware/auth")
const fs =require("fs")
const path=require("path")





// create Event
router.post("/create-event",upload.array("images"),catchAsyncErrors(async(req,res,next)=>{
try {
    const shopId=req.body.shopId
    const shop= await Seller.findById(shopId)
    if(!shop){
        return next(new ErrorHandle("this id not exist",400))
    }else{
        const files=req.files
        const imagesURl=files.map((file)=>`${file.filename}`)
        const  eventData=req.body
        eventData.images=imagesURl
        eventData.shop=shop

        const event=Event.create(eventData)
        res.status(201).json({
            success:true,
            event
        })
    }
} catch (error) {
    return next(new ErrorHandle(error,400))
}
}))

router.get("/get-all-event/:id",catchAsyncErrors(async(req,res,next)=>{
    try {
        const event=await Event.find({shopId:req.params.id})

        res.status(201).json({
            success:true,
            event
        })
    } catch (error) {
       return next(new ErrorHandle(error,400)) 
    }
}))

router.delete("/event-delete/:id",isSeller,catchAsyncErrors(async(req,res,next)=>{
    try {
        const eventPIC=await Event.findById(req.params.id)
        eventPIC.images.forEach((file)=>{
            const filename=file
            const filepath=path.join(__dirname, '../uploads', filename)
            fs.unlink(filepath,(err)=>{
                if(err){
                    console.log(err)
                }
            })
        })

        const event= await Event.findByIdAndDelete(req.params.id)
        if(!event){
            return next(new ErrorHandle("Product not found with this id",400))
          }
        res.status(201).json({
            success:true,
            message:"Event Deleted successfully"
        })
    } catch (error) {
       return next(new ErrorHandle(error,400)) 
    }
}))

module.exports=router