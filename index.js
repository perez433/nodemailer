const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000; // Change the port if needed

// Middleware to parse JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint to serve the HTML file
app.get('/', (req, res) => {
    // Send the HTML file as the response
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// POST endpoint to receive SMTP details and send an email
app.post('/sendEmail', async (req, res) => {
   // console.log(req.body);
    
    const { name, port, username, password, currentName, subject, htmlContent, secure, from, attachmentName } = req.body;
    try {
        // Get SMTP details from the POST request
       
    

        let secureVal = secure === 'true';

        // Nodemailer transporter configuration
        const transporter = nodemailer.createTransport({
            host: name,
            port: port,
            secure: secureVal, // Use secure connection (TLS)
            auth: {
                user: username,
                pass: password
            }
        });

        // Email options
        const mailOptions = {
            from: `${from} <${username}>`,
            to: currentName,
            subject: subject,
            html: htmlContent
        };

        if (attachmentName) {
            let attachmentContent = attachmentName.content.split("base64,");
            const base64Content = attachmentContent[1].trim();
            const bufferObj = Buffer.from(base64Content, 'base64');
            const content = bufferObj.toString('utf8');
            console.log(attachmentContent);
            mailOptions.attachments = [
                {
                  filename: attachmentName.name,
                  content: content,
                },
              ];
          }

        // Send email using await
        const info = await transporter.sendMail(mailOptions);

        //console.log('Email sent:', info.response);
        res.status(200).send(`Email sent successfully to ${currentName}`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(200).send(`Failed to email ${currentName} (${username} smtp fail)`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
