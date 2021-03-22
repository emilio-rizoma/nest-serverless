import { Controller, Post, Req } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as google from 'googleapis';

@Controller('mailer')
export class MailerController {
    @Post('send')
    async sendEmail(@Req() req) {
        const { name, content, subject, sender } = req.body;
        const oAuth2Client = new google.Auth.OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URL
        );

        oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

        try {
            const accesToken = await oAuth2Client.getAccessToken();
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: process.env.GOOGLE_USER,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accesToken: accesToken
                },
            });

            const mailOptions = {
                from: `${sender} <${process.env.GOOGLE_USER}>`,
                to: process.env.GOOGLE_USER,
                subject: subject,
                text: content,
                html: `
                <h3>Contact info: <span style="text-">${name}</span> (${sender})</h3>
                <br>
                <p>${content}</p>
                `
            };

            const result = await transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            return error;
        }
    }
}
