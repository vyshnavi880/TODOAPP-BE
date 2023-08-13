const nodemailer=require("nodemailer")
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
  auth: {
    type:'OAuth2 ',
    user: process.env.SENDER_EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
    // serviceClient:process.env.EMAIL_CLIENT_ID,
    // privateKey:process.env.EMAIL_PRIVATE_KEY
  },
  });

module.exports=transporter