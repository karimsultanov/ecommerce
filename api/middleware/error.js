const ErrorHander = require("../utils/errorhander")

module.exports = (err, req, res, next) =>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    //Wrong MongoDB Id error

    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHander(message, 400)
    }

    //Mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered!`
        err = new ErrorHander(message, 400)
    }

    //Wrong JWT error
    if(err.name === "JsonWebTokenError"){
        const message = "Json web token is invalid, try again!"
        err = new ErrorHander(message, 400)
    }

    //Wrong expire error
    if(err.name === "TokenExpiredError"){
        const message = "Json web token is Expired, try again!"
        err = new ErrorHander(message, 400)
    }

    res.status(err.statusCode).json({success: false, message : err.message})
}