const express= require("express")

const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
 const sellerController=require("./controller/sellerCrontroller")
const cors=require("cors")
const path =require("path")
const error = require("./middleware/error")



const app=express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))
app.use("/", express.static(path.join(__dirname,"./uploads")));
app.use(bodyParser.urlencoded({extended:true}))
app.get("/",(req,res)=>{
    res.send("<h1 >Server is running now</h1>")
})
// config
if(process.env.NODE_ENV !=="PRODUCTION"){
    require("dotenv").config({path:"config/.env"})
}

//import route
const user = require("./controller/user")
const productController = require("./controller/productController")
const event = require("./controller/eventController")
const couponController=require("./controller/couponController")

app.use("/api/v2/user",user)
app.use("/api/v2",sellerController)
app.use("/api/v2",productController)
app.use("/api/v2",event)
app.use("/api/v2",couponController)


//it's fof ErrorHandling
app.use(error)
module.exports=app
