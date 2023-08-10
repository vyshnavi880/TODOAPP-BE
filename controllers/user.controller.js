const asyncHandler= require("express-async-handler")
const userModel=require("../models/user.model")
const bcrypt=require("bcrypt")
const {verify_Token}=require("../middleware/auth")
const jwt=require("jsonwebtoken")
//to reduce the code of try catch in async funcion it automatically call error handler.


const login=async(req,res)=>{
      const data=await userModel.findOne({email:req.body.email})
      if(!data){
        res.status(404)
        res.json({status:404,message:"User not found, Please check credentials and try again!"})
      }
      else{
        bcrypt.compare(req.body.password,data.password,function(err, result) {
           if(!result){
            res.status(404).json({message:"Password does not match"})
           }
           else{
            const accessToken=jwt.sign({
                user:{
                    user_id:data._id,
                    email:req.body.email,
                    first_name:data.first_name
                }
            },process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"24h"}
            )
            res.status(200).json({status:200,message:"Login sucessfully",accessToken:accessToken})
           }
        })
      }
}
const logout=async(req,res)=>{

}
const getuser = async (req, res) => {
    const userData = req.user
    const user_id=userData.user.user_id
    const data = await userModel.findById(user_id)
    if(!data){
        res.status(404);
        throw new Error('Not Found')
    }else{res.json({status:200,message:'sucess',data:data})}
}

const createuser =async (req, res) => {
    try{
        console.log(req.body)
        const {first_name,last_name,email,phone_Number,password}=req.body
        const uniquedata = await userModel.findOne({email})
        if(uniquedata){
            res.status(400).json({message:"email already exist"})
        }
        if(!first_name||!last_name||!email||!phone_Number||!password){
            res.status(400).json({message:"enter valid data"})
        }
    req.body.image=req.file.filename
    const salt = await bcrypt.genSalt(10)
    bcrypt.hash(req.body.password,salt, async function(err,hashedPass){
        if (err) {
            res.json({
              error: err,
            });
          } 
    req.body.password=hashedPass;
    const data = await userModel.create(req.body)
    if(data){
        console.log(data._id.valueOf())
        const accessToken=await jwt.sign({
            user:{
                user_id:data._id,
                email:req.body.email,
                first_name:req.body.first_name
            }
        }, process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"24h" }
        );
    res.status(200)
    res.json({status:200, message:"created",accessToken:accessToken,data:data})
    }
    else{
        res.json({status:404,message:"something went wrong"})
    }
     })
    }
    catch(error){
        console.log("error",error)
        res.status(500)
        res.send({status: 500, message: "something went wrong"})
    }
}

const edituser =async (req, res) => {
    try{
        const userData = req.user
        const user_id=userData.user.user_id
        req.body.image=req.file.filename
    const salt = await bcrypt.genSalt(10)
    bcrypt.hash(req.body.password,salt, async function(err,hashedPass){
        if (err) {
            res.json({
              error: err,
            });
          } 
    req.body.password=hashedPass;
        const data = await userModel.findByIdAndUpdate(user_id,req.body,{
            new: true, // Return the updated document after the update
          })
        res.status(200)
        res.json({status:200, message:"Updated",data:data})
    })
    }
    catch(error){
        console.log("error",error)
        res.status(500)
        res.send({status: 500, message: "something went wrong",error:error})
    }
}

const deleteuser =async (req, res) => {
    const userData = req.user
    const id=userData.user.user_id
    try {
        // Find the document by ID and update it (Replace 'YourModel' with your actual model name)
        const deletedData = await userModel.findByIdAndDelete(id);
        if (!deletedData) {
            res.status(404).json({ error: 'user not found' });
          }
          res.status(200).json({message:"sucessfully deleted",data:deletedData});
        } catch (error) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
}

module.exports = { login,logout,getuser,createuser,edituser,deleteuser }