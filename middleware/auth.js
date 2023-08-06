const jwt = require("jsonwebtoken")

const verify_Token=async(req,res,next)=>{
    let token;
    const header = req.headers.authorization;
    if(header&&header.startsWith('Bearer')){
        token= header.split(" ")[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
            if(err){
                res.status(401).json({message:"invalid Token"})
            }
          
           req.user=decoded
        })
    }
    next();
}
module.exports=(verify_Token)