const asyncHandler = require("express-async-handler")
const userModel = require("../models/user.model")
const todoModel = require("../models/todos.model")
const otpModel = require("../models/otp.model")
const bcrypt = require("bcrypt")
const { verify_Token } = require("../middleware/auth")
const jwt = require("jsonwebtoken")
const otpGenerator = require('otp-generator');
const schedule = require('node-schedule');
const { json } = require("body-parser")
const nodemailer = require("nodemailer")
const transporter = require("../middleware/email")
const cron = require("node-cron")
const moment = require('moment');
//to reduce the code of try catch in async funcion it automatically call error handler.


const login = async (req, res) => {
    const data = await userModel.findOne({ email: req.body.email })
    if (!data) {
        res.status(404)
        res.json({ status: 404, message: "User not found, Please check credentials and try again!" })
    }
    else {
        bcrypt.compare(req.body.password, data.password, function (err, result) {
            if (!result) {
                res.status(404).json({ message: "Password does not match" })
            }
            else {
                const accessToken = jwt.sign({
                    user: {
                        user_id: data._id,
                        email: req.body.email,
                        first_name: data.first_name
                    }
                }, process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "24h" }
                )
                res.status(200).json({ status: 200, message: "Login sucessfully", accessToken: accessToken })
            }
        })
    }
}
const logout = async (req, res) => {

}
const getuser = async (req, res) => {
    const userData = req.user
    const user_id = userData.user.user_id
    const data = await userModel.findById(user_id)
    if (!data) {
        res.status(404);
        throw new Error('Not Found')
    } else { res.json({ status: 200, message: 'sucess', data: data }) }
}

const createuser = async (req, res) => {
    try {
        // console.log(req.body)
        const { first_name, last_name, email, phone_Number, password } = req.body
        const uniquedata = await userModel.findOne({ email })
        if (uniquedata) {
            res.status(400).json({ message: "email already exist" })
        }
        if (!first_name || !last_name || !email || !phone_Number || !password) {
            res.status(400).json({ message: "enter valid data" })
        }
        req.body.image = req.file.filename
        //const salt = await bcrypt.genSalt(10)
        const salt=10
        bcrypt.hash(req.body.password, salt, async function (err, hashedPass) {
            if (err) {
                res.json({
                    error: err,
                });
            }
            req.body.password = hashedPass;
            const data = await userModel.create(req.body)
            if (data) {
                //console.log(data._id.valueOf())
                const accessToken = await jwt.sign({
                    user: {
                        user_id: data._id,
                        email: req.body.email,
                        first_name: req.body.first_name
                    }
                }, process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "24h" }
                );
                res.status(200)
                res.json({ status: 200, message: "created", accessToken: accessToken, data: data })
            }
            else {
                res.json({ status: 404, message: "something went wrong" })
            }
        })
    }
    catch (error) {
        console.log("error", error)
        res.status(500)
        res.send({ status: 500, message: "something went wrong" })
    }
}

const edituser = async (req, res) => {
    try {
        const userData = req.user
        const user_id = userData.user.user_id
        req.body.image = req.file.filename
        //const salt = await bcrypt.genSalt(10)
        const salt =10
        bcrypt.hash(req.body.password, salt, async function (err, hashedPass) {
            if (err) {
                res.json({
                    error: err,
                });
            }
            req.body.password = hashedPass;
            const data = await userModel.findByIdAndUpdate(user_id, req.body, {
                new: true, // Return the updated document after the update
            })
            res.status(200)
            res.json({ status: 200, message: "Updated", data: data })
        })
    }
    catch (error) {
        console.log("error", error)
        res.status(500)
        res.send({ status: 500, message: "something went wrong", error: error })
    }
}

const deleteuser = async (req, res) => {
    const userData = req.user
    const id = userData.user.user_id
    try {
        // Find the document by ID and update it (Replace 'YourModel' with your actual model name)
        const deletedData = await userModel.findByIdAndDelete(id);
        if (!deletedData) {
            res.status(404).json({ error: 'user not found' });
        }
        res.status(200).json({ message: "sucessfully deleted", data: deletedData });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const data = await userModel.findOne({ email: email })
        if (!data || data.length === 0) {
            res.status(404).json({ message: "user not found" })
        } else {
            const otp = await otpGenerator.generate(6, {
                digits: true,
                alphabets: false,
                upperCase: false,
                specialChars: false
            });
            req.body.otp = otp
            let dataotp;
            dataotp = await otpModel.findOneAndUpdate({ email: email }, req.body, {
                new: true,
            })
            if (!dataotp) {
                dataotp = await otpModel.create(req.body)
            }
            schedule.scheduleJob('*/3 * * * *', async () => {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
                try {
                    const deletedOTPCount = await otpModel.deleteMany({ createdAt: { $lt: fiveMinutesAgo } });
                    console.log(`Deleted ${deletedOTPCount.deletedCount} OTPs`);
                } catch (error) {
                    console.error('Error deleting OTPs:', error);
                }
            });
            if (dataotp) {
                let mailDetails = {
                    from: process.env.SENDER_EMAIL_ADDRESS,
                    to: data.email,
                    subject: 'One Time passwod to reset password',
                    html: `
    <div style="text-align: center; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 24px; margin-bottom: 10px;">Hello, ${data.first_name}!</h2>
      <p style="font-size: 18px;">Your one-time password to reset your password is:</p>
      <div style="background-color: #ffffff; border: 1px solid #ccc; padding: 10px; display: inline-block;">
        <h2 style="font-size: 28px; margin: 0;">${otp}</h2>
      </div>
      <p style="font-size: 18px; margin-top: 10px;">
        Please copy this OTP and use it to reset your password.
      </p>
    </div>
  `
                };
                transporter.sendMail(mailDetails, function (err, data) {
                    if (err) {
                        res.status(400).json({ message: "Error Occurs in email" })
                        console.log('Error Occurs in mail', err);
                    } else {
                        console.log({ data: data, message: 'Email sent successfully' });
                        res.status(200).json({ message: "OTP sent successfully, valid for only 3 minutes. Please check your email" })
                    }
                });
                
            }
            else {
                res.status(400), json({ message: "something went wrong" })
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
}
const resetPassword = async (req, res) => {
    //const salt = await bcrypt.genSalt(10)
    const salt=10
    bcrypt.hash(req.body.password, salt, async function (err, hashedPass) {
        if (err) {
            res.json({
                error: err,
            });
        }
        req.body.password = hashedPass;

        const updateData = req.body;
        const otp = req.body.otp;
        const data = await otpModel.find({ otp })
        if (!data || data.length === 0) {
            res.status(404).json({ message: "invalid OTP!"})
        }
        else {
            const userdata = await userModel.findOneAndUpdate({ email: data[0].email },
                { $set: updateData },
                { new: true, useFindAndModify: false },)
            if (!userdata) {
                res.status(400).json({ messsage: "something went wrong" })
            }
            else {
                res.status(200).json({ message: "Password updated sucessfully!" })
            }
        }
    })
}
const sendReminderEmail = async (todo) => {
    
    const mailOptions = {
        from: process.env.SENDER_EMAIL_ADDRESS,
        to: todo.user.email, 
        subject: 'Task Reminder',
        html: `
        <div style="background-color: #f5f5f5; padding: 20px;">
          <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">Hello ${todo.user.first_name},</h2>
          <div style="background-color: #ffffff; border: 1px solid #ccc; padding: 20px;">
            <h3 style="color: #333; font-size: 20px; margin-bottom: 10px;">Task Reminder:</h3>
            <p style="color: #666; font-size: 18px; margin-bottom: 20px;">"${todo.title}"</p>
            <p style="color: #666; font-size: 18px;">Description: ${todo.description}</p>
          </div>
          <p style="color: #555; font-size: 16px; margin-top: 20px;">
            This is a friendly reminder for your task. Keep up the good work!
          </p>
        </div>
      `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully.');
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
}
const checkDueDatesAndSendEmails = async () => {
    try {
        const currentDate = moment().startOf('day');
        //   const todos = await todoModel.find({ dueDate: { 
        //this is a method to fetch data from both table using .populate() 
        //     $gte: currentDate.toDate(),   
        //     $lt: currentDate.add(1, 'day').toDate()
        //   } }).populate('user_id');;


        //Another way is using aggregation pipeline
        const todos = await todoModel.aggregate([
            {
                $match: {
                    dueDate: {
                        $gte: currentDate.toDate(),
                        $lt: currentDate.add(1, 'day').toDate()
                    },
                    status: false,
                }
            }, {
                $lookup: {
                    from: 'tb_users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            }
        ])
        if (todos) {
            for (const todo of todos) {
                await sendReminderEmail(todo);
            }
        }
    } catch (error) {
        console.error('Error checking due dates and sending emails:', error);
    }
};

  cron.schedule(`${process.env.cronBalanceTimings}`,()=>{
    console.log('Cron job scheduled'); // Log to check if the cron job is scheduled
    checkDueDatesAndSendEmails();
  },{timezone:'Asia/Calcutta'})
// Schedule the task to run daily at 04:30 AM
//cron.schedule('30 04 * * *', checkDueDatesAndSendEmails);
//above remaining * * * are date month and week

module.exports = { login, logout, getuser, createuser, edituser, deleteuser, resetPassword, forgotPassword, }