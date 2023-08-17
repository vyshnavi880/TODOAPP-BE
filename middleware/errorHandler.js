
const errorHandler=(err,req,res,nest)=>{
    // console.log("calling")
    const statusCode=res.statusCode?res.statusCode:500;
    if (err instanceof mongoose.Error.ValidationError) {
        res.send(err.errors);
      }
    switch (statusCode) {
        case 400:
            res.json({title:"validation error",
            message:err.message,
            stackTrace:err.stack})
            break;
        
        case 404:
            res.json({title:"Not found",
            message:err.message,
            stackTrace:err.stack})
            break;
        case 500:
            res.json({title:"Server error",
            message:err.message,
            stackTrace:err.stack})
            break;
          case 401:
            res.json({title:"unauthorized",
            message:err.message,
            stackTrace:err.stack})
            break;
          case 400:
            res.json({title:"forbidden",
            message:err.message,
            stackTrace:err.stack})
            break;
        default:
            console.log("NO error, All good!!")
            break;
    }
}

module.exports={errorHandler}


