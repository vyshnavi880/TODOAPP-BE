const mongoose=require("mongoose")
const validator=require("validator")

//var schema=mongoose.schema;
const userschemas= mongoose.Schema({
    first_name:
   {
       type: String,
       required:true
   },
   last_name:
   {
       type: String,
       required:true
     
   },
   
   email: {
    type: String,
    required: true,
    unique: [true,'email already taken'],
    trim: true,
    lowercase: true,
    // validate(value) {
    //   if (!validator.isEmail(value)) {
    //     res.status(400)
    //     throw new Error('Invalid email');
    //   }
    // },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    // validate(value) {
    //   if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    //     res.status(400)
    //     throw new Error('Password must contain at least one letter and one number');
    //   }
    // },
    private: true, // used by the toJSON plugin
  },
   phone_Number:
   {
    type:Number,
    required:true,
    minlength:10
   },
   image:
   {
    type:String,
    required:true
   }
},
{
    timestamps: true,
  },
)
const UserModel=mongoose.model('tb_user', userschemas)
module.exports=UserModel;