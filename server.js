//var bodyParser = require('body-parser')
const express=require("express")
const app=express();
const cors=require("cors");
const errorHandler = require("./middleware/errorHandler");
const dotenv= require("dotenv").config()
const port=process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api/todos",require('./routes/todoRoutes'));
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
app.use(errorHandler);


app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})