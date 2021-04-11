const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'pratikthakur421@gmail.com',
        subject:'Thanks for joining in Pratik Games-App!',
        text:`Welcome to the app, ${name} . Let me know how you get along with the app.I am eagerly waiting and excited for working with you all.`
    }).then()
    .catch(e=>console.log(e))
}

const sendCancelationEmail =(email,name)=>{
    sgMail.send({
        to:email,
        from:'pratikthakur421@gmail.com',
        subject:'Sorry to see you go! Pratik Games-App',
        text:`Goodbye, ${name} . I hope to see you back Sometime soon.I am eagerly waiting and excited for working with you all.`
    }).then()
    .catch(e=>console.log(e))

}

module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}
