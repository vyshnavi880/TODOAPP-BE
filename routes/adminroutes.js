const express= require("express")
const router= express.Router()
const userController=require("../controllers/user.controller")
const multerMiddleware=require('../middleware/multerMiddleware')
const multer=require('multer')
const upload = require('../middleware/multerMiddleware');
const varify  = require("../middleware/auth")


router.route('/loginadmin').post(userController.login);
router.route('/logoutadmin').post(userController.logout);
router.route('/getadmin').get(varify,userController.getuser);
router.route('/createadmin').post(upload,userController.createuser);
router.route('/editadmin').patch(upload,varify,userController.edituser);
router.route('/deleteadmin').delete(varify,userController.deleteuser);
router.route('/forgotPassword').post(userController.forgotPassword);
router.route('/resetpassword').patch(userController.resetPassword);

module.exports =router