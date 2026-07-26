import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'luckyvirani555@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'jbdj zeic oytj mqaq',
  },
});

// Frontend URL — set FRONTEND_URL in .env for production (e.g. https://mykeys-property.vercel.app)

export const emailService = {
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: email,
        cc: 'luckyvirani555@gmail.com',
        subject: 'Welcome to MyKeys! 🎉',
        html: `
          <h2>Welcome to MyKeys, ${firstName}!</h2>
          <p>We're excited to have you on board. Start exploring properties and connecting with owners today.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/user/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to Dashboard
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
    }
  },

  /**
   * Send inquiry confirmation email to guest
   */
  async sendInquiryConfirmationEmail(email: string, name: string, propertyTitle: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: email,
        cc: 'luckyvirani555@gmail.com',
        subject: 'Thank You for Your Inquiry! 📝',
        html: `
          <h2>Thank You, ${name}!</h2>
          <p>We've received your inquiry about <strong>${propertyTitle}</strong>.</p>
          <p>The property owner will review your message and get back to you soon. In the meantime, you can:</p>
          <ul>
            <li>Explore more properties on MyKeys</li>
            <li>Check your notification dashboard for updates</li>
            <li>Contact us if you have any questions</li>
          </ul>
          <p>
            <a href="${process.env.FRONTEND_URL}/user/dashboard/inquiries" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Inquiries
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Inquiry confirmation email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send inquiry confirmation email to ${email}:`, error);
    }
  },

  /**
   * Send new inquiry notification email to property owner
   */
  async sendNewInquiryNotificationEmail(
    ownerEmail: string,
    ownerName: string,
    inquirerName: string,
    propertyTitle: string,
    inquiryId: string
  ) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: ownerEmail,
        cc: 'luckyvirani555@gmail.com',
        subject: `New Inquiry for ${propertyTitle} 🔔`,
        html: `
          <h2>New Inquiry Received!</h2>
          <p>Hi ${ownerName},</p>
          <p><strong>${inquirerName}</strong> sent an inquiry about your property <strong>${propertyTitle}</strong>.</p>
          <p>Please review and respond to their inquiry as soon as possible to increase booking chances.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/owner/dashboard/inquiries/${inquiryId}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Inquiry
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`New inquiry notification sent to ${ownerEmail}`);
    } catch (error) {
      console.error(`Failed to send new inquiry notification to ${ownerEmail}:`, error);
    }
  },

  /**
   * Send inquiry response email to guest
   */
  async sendInquiryResponseEmail(
    guestEmail: string,
    guestName: string,
    ownerName: string,
    propertyTitle: string,
    ownerResponse: string,
    inquiryId: string
  ) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: guestEmail,
        cc: 'luckyvirani555@gmail.com',
        subject: `Response to Your Inquiry about ${propertyTitle} 📮`,
        html: `
          <h2>Response from ${ownerName}!</h2>
          <p>Hi ${guestName},</p>
          <p>Good news! <strong>${ownerName}</strong> has responded to your inquiry about <strong>${propertyTitle}</strong>.</p>
          <p><strong>Message:</strong></p>
          <p>${ownerResponse.replace(/\n/g, '<br>')}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/user/dashboard/inquiries" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View in Dashboard
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Inquiry response email sent to ${guestEmail}`);
    } catch (error) {
      console.error(`Failed to send inquiry response email to ${guestEmail}:`, error);
    }
  },

  /**
   * Send new review notification email to property owner
   */
  async sendNewReviewNotificationEmail(
    ownerEmail: string,
    ownerName: string,
    reviewerName: string,
    propertyTitle: string,
    rating: number,
    reviewText: string,
    propertyId: string
  ) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: ownerEmail,
        cc: 'luckyvirani555@gmail.com',
        subject: `New ${rating}-Star Review for ${propertyTitle} ⭐`,
        html: `
          <h2>You Received a New Review!</h2>
          <p>Hi ${ownerName},</p>
          <p><strong>${reviewerName}</strong> left a <strong>${rating}-star review</strong> for <strong>${propertyTitle}</strong>.</p>
          <p><strong>Review:</strong></p>
          <p>${reviewText.replace(/\n/g, '<br>')}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/properties/${propertyId}#reviews" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Review
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`New review notification sent to ${ownerEmail}`);
    } catch (error) {
      console.error(`Failed to send new review notification to ${ownerEmail}:`, error);
    }
  },

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(
    guestEmail: string,
    guestName: string,
    propertyTitle: string,
    checkInDate: string,
    checkOutDate: string,
    totalAmount: number,
    bookingId: string
  ) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: guestEmail,
        cc: 'luckyvirani555@gmail.com',
        subject: `Booking Request Received for ${propertyTitle}`,
        html: `
          <h2>Booking Request Received</h2>
          <p>Hi ${guestName},</p>
          <p>Your booking for <strong>${propertyTitle}</strong> has been received and is awaiting owner confirmation.</p>
          <table style="width: 100%; max-width: 400px; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-In:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${checkInDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-Out:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${checkOutDate}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">£${totalAmount.toFixed(2)}</td>
            </tr>
          </table>
          <p>We will notify you as soon as the owner confirms your booking.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/user/dashboard/bookings/${bookingId}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Booking Request
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Booking confirmation email sent to ${guestEmail}`);
    } catch (error) {
      console.error(`Failed to send booking confirmation email to ${guestEmail}:`, error);
    }
  },

  /**
   * Send booking notification email to property owner
   */
  async sendBookingNotificationEmailToOwner(
    ownerEmail: string,
    ownerName: string,
    guestName: string,
    propertyTitle: string,
    checkInDate: string,
    checkOutDate: string,
    bookingId: string
  ) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mykeys.com',
        to: ownerEmail,
        cc: 'luckyvirani555@gmail.com',
        subject: `New Booking for ${propertyTitle} 📅`,
        html: `
          <h2>You Have a New Booking!</h2>
          <p>Hi ${ownerName},</p>
          <p><strong>${guestName}</strong> has booked your property <strong>${propertyTitle}</strong>.</p>
          <table style="width: 100%; max-width: 400px; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Guest:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${guestName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-In:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${checkInDate}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-Out:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${checkOutDate}</td>
            </tr>
          </table>
          <p>
            <a href="${process.env.FRONTEND_URL}/owner/dashboard/bookings/${bookingId}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Booking
            </a>
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Booking notification email sent to ${ownerEmail}`);
    } catch (error) {
      console.error(`Failed to send booking notification email to ${ownerEmail}:`, error);
    }
  },

  /**
   * Alert a user about new properties matching a saved search
   */
  async sendSavedSearchAlertEmail(
    email: string,
    firstName: string,
    searchName: string,
    matches: { id: string; title: string; location: string; priceLabel: string }[],
    resultsUrl: string
  ) {
    try {
      const listHtml = matches
        .map(
          (m) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <strong>${m.title}</strong><br/>
                <span style="color:#555;">${m.location || ""}</span>
                ${m.priceLabel ? `<br/><span style="color:#0f766e;font-weight:600;">${m.priceLabel}</span>` : ""}
              </td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">
                <a href="${process.env.FRONTEND_URL || ""}/property/${m.id}" style="color:#2196F3;text-decoration:none;">View</a>
              </td>
            </tr>`
        )
        .join("");

      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@mykeys.com",
        to: email,
        cc: "luckyvirani555@gmail.com",
        subject: `New listings for "${searchName}"`,
        html: `
          <h2>New matching properties</h2>
          <p>Hi ${firstName},</p>
          <p>We found <strong>${matches.length}</strong> new listing${
            matches.length === 1 ? "" : "s"
          } matching your saved search <strong>${searchName}</strong>.</p>
          <table style="width:100%; max-width:560px; margin:20px 0; border-collapse:collapse;">
            ${listHtml}
          </table>
          <p>
            <a href="${resultsUrl}" style="background-color:#339390;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
              View all results
            </a>
          </p>
          <p style="color:#666;font-size:13px;">
            Manage alerts in your
            <a href="${process.env.FRONTEND_URL || ""}/user/dashboard/saved-searches">dashboard</a>.
          </p>
          <p>Best regards,<br/>The MyKeys Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Saved search alert email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send saved search alert email to ${email}:`, error);
    }
  },
};

