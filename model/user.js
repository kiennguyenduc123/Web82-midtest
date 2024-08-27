import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userName:String,
    email: {
        type:String,
        unique:true,
        required:true
    },
    password: {
        type:String,
        required:true
    }
})

const UserModel = mongoose.model('users', userSchema);

export default UserModel;