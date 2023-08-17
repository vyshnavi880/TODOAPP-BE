const mongoose=require('mongoose')
const otpSchema=mongoose.Schema({
    email: {
        type: String,
        required: true,
        // unique: [true,'email already taken'],
        trim: true,
        lowercase: true,
    },
    otp:{
        type:String,
        required:true,
    }
},
{
    timestamps: true,
  })
  const otpModel=mongoose.model('tb_otp',otpSchema)
  module.exports=otpModel;
