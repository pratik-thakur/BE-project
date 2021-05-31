const mongoose=require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    
    username: {
        type: String,
        unique: true,
        required: "username is required!"
        
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    contact:{
        type:Number,
        trime:true,
        minlength:10,
        maxlength:10
    },
    password:{
        type:String,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password'))
            {
            throw new Error('Password cannot conatin "password"')
            }
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    identifiedAs:{
        type:String,
        lowercase:true,
        trim:true,
        default:null
    },
    interest:[{
        type:String,
        lowercase:true,
        trim:true
    }],
    domain:[{
        type:String,
        lowercase:true,
        trim:true
    }],
    social:[{
        _id:false,
        site:String,
        link:String
    }],
    description:{
        type:String,
        trime:true
    },
    profilePic:{
        type:String,
        trime:true
    },
    points:{
        type:Number,
        default:0,
        trime:true
    },
    rank:{
        type:Number,
        default:0,
        trime:true
    },
    saved:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts'
    }],
    repoCreated:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Repos'
    }],
    groupJoined:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Groups'
    }],
    pending:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
    completed:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
    contribution:[{
        _id:false,
        date:{
            type:Date
        },
        numContribution:{
            type:Number,
            Default:0
        }
    }],
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],

},{
    timestamps:true
})

userSchema.plugin(uniqueValidator);
//instance methods

userSchema.methods.toJSON = function(){
    const user =this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function (){
    const user = this 
    const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//model methods
userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('User not found')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

//hash the plain text password before saving
userSchema.pre('save',async function(next){
    const user = this

    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8)
    }
    //console.log('just before saving')
    next()
})



const User = mongoose.model('User',userSchema)

module.exports = User
