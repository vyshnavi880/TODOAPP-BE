const mongoose=require("mongoose")

//var schema=mongoose.schema;
const todoschemas= mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,ref:"tb_user",
        required:true
    },
    title:
   {
       type: String,
       required:true
   },
   description:
   {
       type: String,
       required:true     
   },
   status:
   {
    type:Boolean,
    default:false
   },
   important:
   {
    type:Boolean,
    default:false
   },
},
{
    timestamps: true,
  },
)
const TodoModel=mongoose.model('tb_todoschemas', todoschemas)
module.exports=TodoModel;