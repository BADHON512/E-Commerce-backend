const sellerToken=(seller, statusCode,res)=>{

    const sellerToken =seller.getJwtToken()

    const cookieOption={
        expires:new Date(Date.now()+90*24*60*60*1000),
        httpOnly:true,
        sameSite:"none",
        secure:true
    }

    res.status(statusCode).cookie("seller_token",sellerToken,cookieOption).json({
        success:true,
        seller,
        sellerToken,
        
    })

}



module.exports= sellerToken