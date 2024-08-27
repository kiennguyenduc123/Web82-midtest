import mongoose, { Types } from 'mongoose'

const postSchema = new mongoose.Schema({
    userId:String,
    content:String,
    createdAt: {
        type:Date,
        default:Date.now
    },
    updatedAt: {
        type:Date,
        default:Date.now
    }
})

const PostModel = mongoose.model('posts', postSchema);

export default PostModel;