var bodyParser = require('body-parser')
const express=require("express")
const app=express();
//const cors=require("cors");
const dotenv= require("dotenv").config()
const port=process.env.PORT || 8080;
const db=require("./db_Connection")
const upload=require('./middleware/multerMiddleware');
const {errorHandler} = require('./middleware/errorHandler');

//app.use(cors());

app.use("/",express.static('uploads'));
app.use('/upload',upload)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(errorHandler)
app.use("/api/todos",require('./routes/todoRoutes'),require('./routes/userRoutes'));
//app.use("/api/user",require('./routes/userRoutes'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const server=app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});
//cors
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Perform any necessary cleanup or logging here

  // Close the server gracefully
  // server.close(() => {
  //   console.log('Server closed due to uncaught exception.');
  //   process.exit(1); // Exit the process with a non-zero exit code
  // });
});






