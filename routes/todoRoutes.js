const express= require("express")
const router= express.Router()
const todoController=require("../controllers/todo.controller")
const varify=require("../middleware/auth")

router.route('/gettask').get(varify, todoController.gettodo);
router.route('/createtask').post(varify,todoController.createtodo);
router.route('/edittask/:id').patch(varify,todoController.edittodo);
router.route('/deletetask/:id').delete(varify,todoController.deletetodo);

module.exports =router