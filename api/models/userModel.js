const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please enter your name"],
        maxlength: [30, "Name cannot exceed 30 characters"],
        minlength: [4, "Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.email, "Please enter a valid email"]
    },
    password:{
        type:String,
        required: [true, "Please enter your password"],
        minlength:[8, "Password should be greater than 8 characters"],
        select: false
    },
    avatar:{
        public_id: {
            type:String, 
            required: true
                   }, 
        url:{
            type:String, 
            required: true
            }
    },
    role:{
        type:String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: String
})
module.exports = mongoose.model("User", userSchema)