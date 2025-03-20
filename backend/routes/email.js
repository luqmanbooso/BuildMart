const express = require('express');
const router = express.Router();

// Replace the entire email sending route with this simpler version
router.post('/send-agreement', async (req, res) => {
  try {
    // Just validate the data and return the content for mailto
    const {
      recipientEmail,
      subject,
      projectTitle,
      clientName,
      contractorName,
      agreementId,
      bidAmount,
      timeline
    } = req.body;
    
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }
    
    // Format the bid amount
    const formattedAmount = typeof bidAmount === 'number' && bidAmount > 0
      ? bidAmount.toLocaleString()
      : (parseFloat(bidAmount || 0) > 0 ? parseFloat(bidAmount).toLocaleString() : "TBD");
    
    // Create email body content
    const emailBody = `
Dear ${contractorName || 'Contractor'},

The project agreement for "${projectTitle || 'Project'}" has been confirmed.

AGREEMENT DETAILS:
* Project ID: ${agreementId || 'N/A'}
* Bid Amount: LKR ${formattedAmount}
* Timeline: ${timeline || 0} days
* Client: ${clientName || 'Client'}

Please log in to your BuildMart account to view the complete agreement.

Thank you for using BuildMart!
    `;
    
    // Return success with content for mailto
    res.status(200).json({ 
      message: 'Email content prepared',
      useMailto: true,
      mailtoSubject: subject || `Project Agreement: ${projectTitle || 'Project'}`,
      mailtoBody: emailBody,
      recipientEmail: recipientEmail
    });
  } catch (error) {
    console.error('Error preparing email content:', error);
    res.status(500).json({ 
      message: 'Error preparing email content', 
      error: error.message
    });
  }
});

module.exports = router;