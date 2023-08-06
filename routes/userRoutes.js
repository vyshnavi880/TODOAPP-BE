const express= require("express")
const router= express.Router()
const userController=require("../controllers/user.controller")
const multerMiddleware=require('../middleware/multerMiddleware')
const multer=require('multer')
const upload = require('../middleware/multerMiddleware');
const varify  = require("../middleware/auth")


router.route('/login').post(userController.login);
router.route('/logout').post(userController.logout);
router.route('/getuser').get(varify,userController.getuser);
router.route('/createuser').post(upload,userController.createuser);
router.route('/edituser/:id').patch(upload,varify,userController.edituser);
router.route('/deleteuser/:id').delete(varify,userController.deleteuser);

module.exports =router