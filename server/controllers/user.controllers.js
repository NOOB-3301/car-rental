import { User } from "../models/user.model.js";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"


dotenv.config({ path: './.env' });
const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    console.error("Error: SECRET_KEY is not defined in the environment variables.");
    process.exit(1);
}

const registerUser = async (req, res) => {
    console.log("Register endpoint hit");
    try {
        const { username, email, password, name, location, picture, dob } = req.body;
        console.log(req.body);

        // Input validation
        if (!username || !email || !password) {
            console.error("Missing required fields: username, email, password.");
            return res.status(400).json({ error: "All fields (username, email, password) are required." });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error(`User with email ${email} already exists.`);
            return res.status(409).json({ error: "Email already in use." });
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            username,
            email,
            password: password,
            name: name || "",
            location: location || "",
            picture: picture || "",
            dob: dob || null,
            isAdmin: false, // Set default admin status to false
            isEmailVerified: true // Update this based on your email verification logic
        });

        await user.save();

        // Generate a token
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: "1h" });

        res.status(201).json({
            message: `User ${username} registered successfully.`,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                location: user.location,
                picture: user.picture || "",
                dob: user.dob,
                accountCreated: user.accountCreated
            }
        });

        console.log(`User ${username} registered successfully.`);
    } catch (error) {
        console.error("Error during user registration:", error.message);
        res.status(500).json({ error: "An error occurred while registering the user." });
    }
};

const loginUser = async (req, res) => {
    console.log("login hit")
    try {
        const { credential, password } = req.body;

        // Input validation
        if (!credential || !password) {
            console.error("Missing required fields: credential or password");
            return res.status(400).json({ error: "Both credential (email/username) and password are required" });
        }

        // Determine if credential is email or username
        const isEmail = credential.includes('@');

        // Fetch user from database based on either email or username
        const user = await User.findOne(
            isEmail ? { email: credential } : { username: credential }
        );

        if (!user) {
            console.error(`Login failed for credential: ${credential}. User not found.`);
            return res.status(404).json({
                error: `No user found with this ${isEmail ? 'email' : 'username'}`
            });
        }

        // Password validation
        // const isValidPassword = await bcrypt.compare(password, user.password);
        const isValidPassword = await user.comparePassword(password)
        if (!isValidPassword) {
            console.error(`Login failed for user: ${user.username}. Invalid password.`);
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        // Send successful response with token and user data
        res.json({
            message: `User ${user.username} logged in successfully.`,
            token,
            user:{
                userId: user._id,
                username: user.username,
                email: user.email,
                name: user.name || '',
                picture: user.picture || '',
                location: user.location || '',
                dob: user.dob || '',
                accountCreated: user.accountCreated
            }
        });

        console.log(`User ${user.username} logged in successfully`);

    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({
            error: "An error occurred during login. Please try again later."
        });
    }
};


export {registerUser,loginUser}