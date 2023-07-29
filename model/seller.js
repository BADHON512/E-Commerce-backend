const { default: mongoose } = require("mongoose");
const jwt=require("jsonwebtoken")

const bcrypt =require("bcryptjs")

const SellerSchema=mongoose.Schema({
    shopName:{
        type:String,
        required:[ true, "Please enter your shop name"]
    },
    address:{
        type:String,
        required:[true,"Please enter your address"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"]
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[6,"Password should be greater than 6 characters"],
        select:false
    },
    phoneNumber:{
        type:String,
        required:[true,"Please enter your PhoneNumber"],
      
    },
    description:{
        type:String
    },
    role:{
        type:String,
        default:"seller"
    },
    avatar:{
        type:String,
        required:true
    },
    zipCode:{
        type:Number,
        required:true
    },   createdAt:{
        type:Date,
        default:Date.now()
    },
    resetPasswordToken:String,
    resetPasswordTime:Date
    
})

SellerSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password= await bcrypt.hash(this.password,10)
})



SellerSchema.methods.getJwtToken=  function(){
   return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES
    })
}

SellerSchema.methods.comparePassword= async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password)
}

const Seller=mongoose.model("seller",SellerSchema)

module.exports= Seller