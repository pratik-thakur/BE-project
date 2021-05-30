const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// These id's and secrets should come from .env file.
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendverifyEmail(email,name,host,id) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'beprojectvps@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const token = jwt.sign({_id : id.toString()},process.env.JWT_SECRET)
    const mailOptions = {
      from: 'BE Project <beprojectvps@gmail.com>',
        to: email,
        subject: 'Account Verification Link',
        text: 'Hello ' + name + ',\n\n' +
            'Please verify your account by clicking the link: \nhttp:\/\/' +
            host + '\/confirmation\/' +
            token + '\n\nThank You!\n'
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

module.exports={
    sendverifyEmail
}
