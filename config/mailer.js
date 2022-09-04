const {google} = require('googleapis');
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const { readHTMLFile } = require("../utils/files");

async function sendGmail(mailOptions) {
    const oAuth2Client = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URI)
    oAuth2Client.setCredentials({refresh_token: process.env.GMAIL_REFRESH_TOKEN})
    try {
        const accessToken = await oAuth2Client.getAccessToken()
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: 'oAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        let result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error
    }
}

const sendMailConfirmation = (token, email, callback) => {
    readHTMLFile(
        __dirname + "/../emails/confirmEmail.html",
        async function (error, html) {
            if (error) throw error;
            var template = handlebars.compile(html);
            var replacements = {
                url: process.env.URL_UI + "/verify/" + token,
            };
            var htmlToSend = template(replacements);
            try {                
                const mailOptions = {
                    from: `${process.env.GMAIL_FROM} <${process.env.GMAIL_USER}>`,
                    to: email,
                    subject: "Confirm mail adresse",
                    text: "Hi, Click to confirm mail adresse " + replacements.url,
                    html: htmlToSend
                };
                sendGmail(mailOptions)
                    .then(result => callback())
                    .catch (error => console.log(error))
            } catch (error) {
                console.log(error);
            }
        }
    );
};

module.exports = { sendMailConfirmation }