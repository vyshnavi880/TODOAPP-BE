const asyncHandler= require("express-async-handler")
const TodoModel=require("../models/todos.model")
const mongoose=require("mongoose")
//to reduce the code of try catch in async funcion it automatically call error handler.

const gettodo = async (req, res) => {
  const userData = req.user
  const user_id=userData.user.user_id
    const data = await TodoModel.find({user_id})
    if(!data||data.length==0){
      const data1=[{title:"No Task To Display",createdAt:null,description:"please Add Task"}]
        res.status(404).json({message:"Not found",data:data1})
    }
    else{
        res.status(200).json({message:"sucess",data:data})
    }
   
}

const createtodo =async (req, res) => {
  const userData = req.user;
  const userid=userData.user.user_id;
  req.body.user_id=userid;
  const {title,description}=req.body
    if(!title||!description){
        res.status(400).json({message:'All fields are mendatory'});
    }
    else{
        const data=await TodoModel.create(req.body)
        res.status(200).json({message:"sucess",data:data})
    }
}

const edittodo =async (req, res) => {
    const id=req.params.id;
    try {
        // Find the document by ID and update it (Replace 'YourModel' with your actual model name)
        const updatedData = await TodoModel.findByIdAndUpdate(id, req.body, {
          new: true, // Return the updated document after the update
        });
        if (!updatedData) {
            res.status(404).json({ error: 'Document not found' });
          }
      
          res.json({message:"sucess",data:updatedData});
        } catch (error) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
    
}

const deletetodo =async (req, res) => {
    const id=req.params.id;
    try {
        // Find the document by ID and update it (Replace 'YourModel' with your actual model name)
        const deletedData = await TodoModel.findByIdAndDelete(id);
        if (!deletedData) {
            res.status(404).json({ error: 'Document not found' });
          }
          res.status(200).json({message:"sucessfully deleted",data:deletedData});
        } catch (error) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
}

module.exports = { gettodo,createtodo,edittodo,deletetodo }