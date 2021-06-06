const mongoose=require('mongoose')
const validator = require('validator')

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    body:{
        type:String,
        required:true,
        trim:true
    },
    tags:[String],
    like:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    dislike:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    support:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    comments:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        comment:String
    }],
    numShare:{
        type:Number,
        default:0
    },
    numSave:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0,
        validate(value){
            if(value<0||value>5)
            {
                throw new Error('Rating cannot be Less than 0 and greater Than 5')
            }
        }
    }
},{
    timestamps:true
})

const Posts = mongoose.model('Posts',postSchema)

module.exports = Posts