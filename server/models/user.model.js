import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true // Ensures usernames are unique
        },
        email: {
            type: String,
            required: true,
            unique: true // Ensures emails are unique
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: false
        },
        location: {
            type: String,
            required: false
        },
        picture: {
            type: String,
            required: false,
            default: ""
        },
        dob: {
            type: Date,
            required: false
        },
        accountCreated: {
            type: Date,
            required: true,
            default: Date.now
        },
        isAdmin:{
            type:Boolean,
            default:false,
            required: true
        }
    },
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
    }
);

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export { User };
