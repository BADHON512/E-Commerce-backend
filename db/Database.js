const mongoose  = require("mongoose");

const connectDatabase=async()=>{
  await  mongoose.connect(process.env.MONGODB_URL).then((data)=>{
        console.log(`mongodb connected with server ${data.connection.host}`)
    })
}


module.exports=connectDatabase;
