const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create a test account or use your own SMTP credentials
// For development, you can use ethereal.email for testing
let transporter;

async function createTransporter() {
  // Real email configuration (Gmail example)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'buildmart94@gmail.com',     // Replace with your email
      pass: 'msah gpyb pxdy jaog'         // Use app password for Gmail
    }
  });
  
  console.log('Email transport configured with Gmail');
  return true;
}

createTransporter();

router.post('/send-agreement', async (req, res) => {
  try {
    const {
      recipientEmail,
      subject,
      projectTitle,
      clientName,
      contractorName,
      agreementId,
      bidAmount
    } = req.body;
    
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }
    
    // Send email
    const mailOptions = {
      from: '"BuildMart" <noreply@buildmart.com>',
      to: recipientEmail,
      subject: subject || `Project Agreement: ${projectTitle || 'Project'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Project Agreement</h2>
          <p>Dear ${contractorName || 'Contractor'},</p>
          <p>The project agreement for <strong>${projectTitle || 'Project'}</strong> has been confirmed.</p>
          <p><strong>Agreement Details:</strong></p>
          <ul>
            <li>Project ID: ${agreementId || 'N/A'}</li>
            <li>Bid Amount: LKR ${bidAmount || 'N/A'}</li>
            <li>Client: ${clientName || 'Client'}</li>
          </ul>
          <p>Please log in to your BuildMart account to view the complete agreement.</p>
          <p>Thank you for using BuildMart!</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For ethereal email testing, provide preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Email sent: %s', info.messageId);
    console.log('Preview URL: %s', previewUrl);
    
    res.status(200).json({ 
      message: 'Email sent successfully', 
      previewUrl: previewUrl // Only for testing with Ethereal
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;