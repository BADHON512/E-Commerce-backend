const express = require("express")
const path = require("path")
const User = require("../model/user")
const fs = require("fs")
const router = express.Router()
const jwt = require("jsonwebtoken");

const { upload } = require("../multer")

const ErrorHandler = require("../utils/ErrorHandle")
const sendMail = require("../utils/sendMail")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const sendToken = require("../utils/jwtToken")
const {isAuthenticated} = require("../middleware/auth")

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
     // exist multer picture delete 
    const { name, email, password } = req.body
    const userEmail = await User.findOne({ email })
    if (userEmail) {
      const filename = req.file.filename;
      const filepath = path.join(__dirname, '../uploads', filename);
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });

    }//

    
    const filename = req.file.filename;
    const fileUrl = path.join(filename);
    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl

    }
    const activationToken = createActivationToken(user)
    const activationUrl = `http://localhost:3000/activation/${activationToken}`
      try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${user.email} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }


  } catch (error) {

    return next(new ErrorHandler(error.message, 500))
  }
})

//create activation token

const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};
//activate user

router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
       
      if (!newUser) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });

      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }
      user = await User.create({
        name,
        email,
        avatar,
        password,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
//login-user
router.post("/user-login",catchAsyncErrors(async(req,res,next)=>{
try {
  const {email,password}=req.body;
  if(!email||!password){
    return next(new ErrorHandler("fields with correct information",400))
  }
  const user= await User.findOne({email}).select("+password")
  if(!user){
    return next(new ErrorHandler("User doesn't not exist",400))
  }
  const isPasswordValid=await user.comparePassword(password)
   console.log(user)
  if(!isPasswordValid){
    return next(new ErrorHandler("Please provide the correct information",400))
  }
  sendToken(user,201,res)
} catch (error) {
  return next(new ErrorHandler(error.message,400))
}
}))

router.get("/get-all-user",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
     const users=await User.find()
     if(!users){
      return next(new ErrorHandler("users not found",404))
    }
    res.status(201).json({
      success:true,
      users
    })
  } catch (error) {
    return next(new ErrorHandler(error,400))
  }
}))

//load user
router.get("/get-user",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
     const user =await User.findById(req.user._id)
 
    
     if(!user){
      return next(new ErrorHandler("User doesn't exists",400))
     }
     res.status(200).json({
      success:true,
      user
     })
  } catch (error) {
    return next(new ErrorHandler(error.message,400))
  }
}))

// user update
router.put("/user-update",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
     const{phoneNumber, email,name,password}=req.body
     const user =await User.findOne({email}).select("+password")
     if(!user){
      return next(new ErrorHandler("User not found",400))
     }
     const isPasswordValid=await user.comparePassword(password)
     if(!isPasswordValid){
      return next(new ErrorHandler("Password is incorrect",400))
     }
     user.name=name
     user.email=email
     user.phoneNumber=phoneNumber
     
     await user.save()
 
     res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))

// user update profile picture

router.put("/update-avatar",upload.single("image"),isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
    const  existUser=await User.findById(req.user.id)
 
    const  existPath= path.join(__dirname,"../uploads",existUser.avatar)
    fs.unlinkSync(existPath)
    const filePath= path.join(req.file.filename)
    const user= await User.findByIdAndUpdate(req.user.id,{
      avatar:filePath
    })
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))

// update address
router.put("/update-addresses",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
    const user=await User.findById(req.user.id)
    if(!user){
      return next(new ErrorHandler("User could not found",400))

    }
    const sameTypeAddress=user.addresses.find((address)=>address.addressType===req.body.addressType)
    if(sameTypeAddress){
      return next(new ErrorHandler(`${req.body.addressType} already exists`,400))
    }
    const existsAddress=user.addresses.find((i)=>i._id===req.body._id)

    if(existsAddress){
      Object.assign(existsAddress,req.body)
    }else{
      user.addresses.push(req.body)
    }
    await user.save()
    res.status(201).json({
      success:false,
      user
    })
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))

router.delete("/delete-address/:id",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{

  try {
     const userId=req.user._id
     const addressId=req.params.id

     await User.updateOne({
      _id:userId
     },{
      $pull:{addresses:{_id:addressId}}
     })

    
     res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))

//user password update
router.put("/update-password",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
     const  user= await User.findById(req.user.id).select("+password")
     if(!user){
      return next(new ErrorHandler("something went wrong",400))
    }
      const passwordIsMatch= await user.comparePassword(req.body.old)
      if(!passwordIsMatch){
        return next(new ErrorHandler("old Password is incorrect",400))
      }
      if(req.body.Newn !== req.body.confirm){
        return next(new ErrorHandler("New password & confirm password mismatch",400))
      }
      user.password=req.body.confirm
      await user.save()
      res.status(201).json({
        success:false,
        message:"Password update successful"
      })
  } catch (error) {
    return next(new ErrorHandler(error,400))
  }
}))


router.get("/user-log-out",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
  try {
    res.cookie("token",null,{
      expires:new Date(Date.now()),
      httpOnly:true
    })

    res.status(201).json({
      success:true,
      message:"User Log Out Successfully"
    })

  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
}))

module.exports = router