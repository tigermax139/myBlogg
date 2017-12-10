nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'k2kkrtzkjsbo4n2e@ethereal.email', // generated ethereal user
            pass: 'Y9JCGMYmM5PkcMuaBM'  // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'Nodemailer TEST', // sender address
        to: 'yurchuck.dev@gmail.com', // list of receivers
        subject: 'Hire in you', // Subject line
        text: 'You have new message', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

       
    });
});
});