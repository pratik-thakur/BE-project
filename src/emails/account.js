const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

const sendverifyEmail = (email,name,host,id)=>{
    
    // Send email (use credintials of SendGrid)
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
        }
    });
    //console.log("h1")
    const token = jwt.sign({_id : id.toString()},process.env.JWT_SECRET)
    var mailOptions = {
        from: 'beprojectvps@gmail.com',
        to: email,
        subject: 'Account Verification Link',
        text: 'Hello ' + name + ',\n\n' +
            'Please verify your account by clicking the link: \nhttps:\/\/' +
            host + '\/confirmation\/' +
            token + '\n\nThank You!\n'
    };
    //console.log("h2")
    transporter.sendMail(mailOptions, function(err) {
        if (err) {
            return ({err, msg: 'Technical Issue!, Please click on resend for verify your Email.' });
        }
        else
        {
            const msg =({msg:'A verification email has been sent to ' + email + '. It will expire after one day. If you have not got verification Email click on resend token.'});
            //console.log(msg)
            return msg;
        }
        
    });
}

module.exports={
    sendverifyEmail
}
