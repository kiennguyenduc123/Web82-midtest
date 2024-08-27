import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config();
import UserModel from './model/user.js';
import PostModel from './model/post.js';
await mongoose.connect(process.env.MongDb_URL);

const app = express();
app.use(express.json());
const listApikey = [];
const saltsRound = 10;

// bài 1
app.post('/users/register', (req,res,next) => {
   try {
     const {userName, email, password} = req.body;
     if(!userName) throw new Error('userName chưa được cung cấp');
     if(!email || !password) throw new Error('email,password chưa đc tạo');
     return next();
   } catch (error) {
        res.status(400).send({
            message:error.message,
            data:null
        })
   }
    
}, async (req, res) => {
    try {
        const {email, password} = req.body;
        const salt = bcrypt.genSaltSync(saltsRound);
        const hash = bcrypt.hashSync(password, salt)
        const createUser = await UserModel.create({
            email:email,
            password: hash
        })
        res.status(201).send({
            message:"Thành Công! ",
            data:createUser
        })
    } catch (error) {
        res.status(500).send({
            message:error.message,
            data:null
        })
    }
})

//bài2

app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new Error('Email or password is missing!');
        const crrUser = await UserModel.findOne({
            email: email
        });
        if (!crrUser) throw new Error('Email is invalid!');
        const comparedPassword = bcrypt.compareSync(password,crrUser.password)
        if(!comparedPassword) throw new Error("Password is invalid!")
        const findExistKey = listApikey.findIndex((item) => (String(item).includes(email) && String(item).includes(crrUser._id) ))
            if(findExistKey >= 0) {
                listApikey.splice(findExistKey,1);
            }
            const randomString = crypto.randomUUID();
            const crrString = `mern-$${crrUser._id}$-$${crrUser.email}$-$${randomString}$`;
            listApikey.push(crrString)
    
        res.status(201).send({
            message: "thành công",
            data:crrUser,listApikey
        })
    } catch (error) {
        res.status(500).send({
            message:error.message
        })
    }
})

// bài3
app.post('/posts', async (req, res) => {
    try {
        const { apiKey } = req.query;
        if (!apiKey) throw new Error('apiKey không được cung cấp');

        const user = await authenticateUserFromApiKey(apiKey);
        if (!user) throw new Error('Xác thực người dùng thất bại');

        
        const { userId, content } = req.body;
        if (!userId) throw new Error('userId là bắt buộc');
        if (!content) throw new Error('Nội dung bài viết là bắt buộc');

       
        const crrUser = await UserModel.findById(userId)
        if (!crrUser) throw new Error('Người dùng không tồn tại');

        
        const createdPost = await PostModel.create({ userId, content });
        res.status(201).send({ 
            message: "Tạo bài viết thành công", data: createdPost
        });
    } catch (error) {
        res.status(500).send({
             message: 'Lỗi hệ thống',
             error: error.message
             });
    }
});


async function authenticateUserFromApiKey(apiKey) {
    try {
        const [prefix, userId, email] = apiKey.split('$');
        if (prefix !== 'mern') return null;
        return await UserModel.findOne({ _id: userId, email });
    } catch (error) {
        throw new Error('Lỗi xác thực người dùng: ' + error.message);
    }   
}   

// bài 4
app.put('/posts/:id', async (req,res,next) => {
   try {
     const { apiKey } = req.query;
     const { content } = req.body;
     // Kiểm tra apiKey
     if (!apiKey) throw new Error('apiKey không được cung cấp');
     const user = await authenticateUser(apiKey);
     if (!user) throw new Error('Xác thực người dùng thất bại');
 
     // Kiểm tra nội dung bài post
     if (!content) throw new Error('Nội dung bài viết là bắt buộc');
     return next();
   } catch (error) {
        res.status(400).send({
            message:error.message,
            data:null
        })
   }
} , async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    try {
        const post = await PostModel.findById(postId);
        if (!post) throw new Error('Bài viết không tồn tại')

        // Cập nhật bài post
        post.content = content;
        post.updatedAt = Date.now();
        const updatedPost = await post.save();
        
        res.status(200).send({
            message: 'Cập nhật bài viết thành công',
            data: updatedPost
        });
    } catch (error) {
        res.status(500).send({ 
            message: 'Lỗi khi cập nhật bài viết', 
            error: error.message 
        });
    }
});

async function authenticateUser(apiKey) {
    try {
        const [prefix, userId, email] = apiKey.split('$');
        if (prefix !== 'mern') return null;
        return await UserModel.findOne({ _id: userId, email });
    } catch (error) {
        throw new Error('Lỗi xác thực người dùng: ' + error.message);
    }
}

app.listen(8080, () => {
    console.log('server is running')
})