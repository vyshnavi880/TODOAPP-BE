const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator');
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const transporter = require("../middleware/email");
const cron = require("node-cron");
const moment = require('moment');

// Admin login
const login = async (req, res) => {
    const adminData = await userModel.findOne({ email: req.body.email, role: 'admin' });
    if (!adminData) {
        return res.status(404).json({ status: 404, message: "Admin not found, Please check credentials and try again!" });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, adminData.password);
    if (!isPasswordValid) {
        return res.status(404).json({ message: "Password does not match" });
    }

    const accessToken = jwt.sign({
        admin: {
            admin_id: adminData._id,
            email: req.body.email,
            first_name: adminData.first_name
        }
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });

    res.status(200).json({ status: 200, message: "Login successfully", accessToken });
};

// Admin logout (placeholder)
const logout = async (req, res) => {
    // Implement logout functionality if needed
};

// Get admin details
const getAdmin = async (req, res) => {
    const adminData = req.admin;
    const data = await userModel.findById(adminData.admin_id);
    if (!data) {
        return res.status(404).json({ status: 404, message: 'Not Found' });
    }
    res.json({ status: 200, message: 'Success', data });
};

// Create user
const createUser  = async (req, res) => {
    try {
        const { first_name, last_name, email, phone_Number, password } = req.body;
        const existingUser  = await userModel.findOne({ email });
        if (existingUser ) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (!first_name || !last_name || !email || !phone_Number || !password) {
            return res.status(400).json({ message: "Enter valid data" });
        }

        req.body.image = req.file.filename;
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);

        const newUser  = await userModel.create(req.body);
        const accessToken = jwt.sign({
            user: {
                user_id: newUser ._id,
                email: newUser .email,
                first_name: newUser .first_name
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });

        res.status(201).json({ status: 201, message: "User  created", accessToken, data: newUser  });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 500, message: "Something went wrong" });
    }
};

// Edit user
const editUser  = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming user ID is passed in the URL
        req.body.image = req.file.filename;
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

        const updatedUser  = await userModel.findByIdAndUpdate(userId, req.body, { new: true });
        if (!updatedUser ) {
            return res.status(404).json({ message: "User  not found" });
        }
        res.status(200).json({ status: 200, message: "User  updated", data: updatedUser  });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 500, message: "Something went wrong", error });
    }
};

// Delete user
const deleteUser  = async (req, res) => {
    const userId = req.params.id; // Assuming user ID is passed in the URL
    try {
        const deletedUser  = await userModel.findByIdAndDelete(userId);
        if (!deletedUser ) {
            return res.status(404).json({ error: 'User  not found' });
        }
        res.status(200).json({ message: "Successfully deleted", data: deletedUser  });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        const otpData = await otpModel.findOneAndUpdate({ email }, { otp }, { new: true }) || await otpModel.create({ email, otp });

        schedule.scheduleJob('*/3 * * * *', async () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            await otpModel.deleteMany({ createdAt: { $lt: fiveMinutesAgo } });
        });

        const mailDetails = {
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: user.email,
            subject: 'One Time Password to Reset Password',
            html: `<div style="text-align: center;">
                      <h2>Hello, ${user.first_name}!</h2>
                      <p>Your one-time password to reset your password is:</p>
                      <h2>${otp}</h2>
                      <p>Please copy this OTP and use it to reset your password.</p>
                   </div>`
        };

        transporter.sendMail(mailDetails, (err) => {
            if (err) {
                return res.status(400).json({ message: "Error occurred while sending email" });
            }
            res.status(200).json({ message: "OTP sent successfully, valid for only 3 minutes. Please check your email." });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { password, otp } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otpData = await otpModel.findOne({ otp });
        if (!otpData) {
            return res.status(404).json({ message: "Invalid OTP!" });
        }

        const user = await userModel.findOneAndUpdate({ email: otpData.email }, { password: hashedPassword }, { new: true });
        if (!user) {
            return res.status(400).json({ message: "Something went wrong" });
        }

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Send reminder email
const sendReminderEmail = async (todo) => {
    const mailOptions = {
        from: process.env.SENDER_EMAIL_ADDRESS,
        to: todo.user.email,
        subject: 'Task Reminder',
        html: `<div>
                  <h2>Hello ${todo.user.first_name},</h2>
                  <h3>Task Reminder:</h3>
                  <p>"${todo.title}"</p>
                  <p>Description: ${todo.description}</p>
                  <p>This is a friendly reminder for your task. Keep up the good work!</p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully.');
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
};

// Check due dates and send emails
const checkDueDatesAndSendEmails = async () => {
    try {
        const currentDate = moment().startOf('day');
        const todos = await todoModel.aggregate([
            {
                $match: {
                    dueDate: {
                        $gte: currentDate.toDate(),
                        $lt: currentDate.add(1, 'day').toDate()
                    },
                    status: false,
                }
            },
            {
                $lookup: {
                    from: 'tb_users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' }
        ]);

        for (const todo of todos) {
            await sendReminderEmail(todo);
        }
    } catch (error) {
        console.error('Error checking due dates and sending emails:', error);
    }
};

// Schedule cron job
cron.schedule(`${process.env.cronBalanceTimings}`, () => {
    console.log('Cron job scheduled');
    checkDueDatesAndSendEmails();
}, { timezone: 'Asia/Calcutta' });

module.exports = {
    login,
    logout,
    getAdmin,
    createUser ,
    editUser ,
    deleteUser ,
    resetPassword,
    forgotPassword,
};