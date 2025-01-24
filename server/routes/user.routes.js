import express from 'express'
import { loginUser, registerUser } from '../controllers/user.controllers.js'


const userRouter = express.Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)

export {userRouter}