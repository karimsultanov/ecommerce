const express = require("express")
const app = express()
const errorMiddleware = require("./middleware/error")
const cookie = require("cookie-parser")

app.use(express.json())
app.use(cookie())

//Route Import
const product = require("./routes/productRoute")
const user = require("./routes/userRoute")

app.use("/api/v1", product)
app.use("/api/v1", user)

//Middleware for Errors

app.use(errorMiddleware)

module.exports = app