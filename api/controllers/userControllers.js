const ErrorHandler = require("../utils/errorhandler")
const catchAsyncErrors = require("../middleware/catchAsyncError")
const User = require("../models/userModel")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")


//Register a user

exports.registerUser = catchAsyncErrors(async (req, res, next) =>{
    const {name, email, password} = req.body

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: "this is a sample id",
            url: "Profile epic url"
        }
    })

    sendToken(user, 201, res)
})

//Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) =>{

    const {email, password} = req.body

    //cheking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("Please enter email & password", 400))
    }

    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    sendToken(user, 200, res)

})

//Logout

exports.logout = catchAsyncErrors(async (req, res, next) =>{
    
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

// Forgot Password

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found", 404))
    }

    //get reset password
    const resetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave: false})

    const reserPasswordUrl = `${req.protocol}://${req.get(
        "host"
        )}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${reserPasswordUrl} \n\n
    If you have not requested this email then, please ignore it.`

    try {

        await sendEmail({
            email:user.email,
            subject: "Ecommerce Password Recovery",
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully!`
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})

        return next(new ErrorHandler(error.message, 500))
    }
})


//Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    //creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not password", 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    sendToken(user, 200, res)
})