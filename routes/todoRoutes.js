const express= require("express")
const router= express.Router()
const todoController=require("../controllers/todo.controller")

router.route('/gettask').get(todoController.gettodo);
router.route('/createtask').post(todoController.createtodo);
router.route('/edittask/:id').patch(todoController.edittodo);
router.route('/deletetask/:id').delete(todoController.deletetodo);

module.exports =router