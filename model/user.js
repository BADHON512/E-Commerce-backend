
const mongoose  = require("mongoose");
const jwt =require("jsonwebtoken")

const bcrypt=require("bcryptjs")


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your name!"]
    },
    email:{
        type:String,
        required:[true, "Please enter your email!"]
    },
    password:{
        type:String,
        required:[true, "Please enter your password!"],
        minLength:[4,"Password should greater that 4 characters"],
        select:false
    },
    phoneNumber:{
        type:Number
       
    },
    addresses:[
        {
           country:{
            type:String
           },
           city:{
            type:String
           },
           address1:{
            type:String
           },
           address2:{
            type:String
           },
           zipCode:{
            type:Number 
           },
           addressType:{
            type: String,
          },

        }
    ],
    role:{
        type:String,
        default:"user"
    },
    avatar:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    resetPasswordToken:String,
    resetPasswordTime:Date
})

//password hash
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }

    this.password= await bcrypt.hash(this.password,10)
})

//jwt token
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id},process.env.jwt_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES
    })
}

//comparePassword

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
const User=mongoose.model("User",userSchema);
module.exports=User