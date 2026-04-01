import nodemailer from 'nodemailer';

// Check configuration on startup
console.log('Email Configuration Status:', {
  service: 'gmail',
  emailConfigured: !!process.env.NEXT_PUBLIC_GMAIL_EMAIL,
  authConfigured: !!process.env.GMAIL_APP_PASSWORD
});

interface SendEmailResponse {
  success: boolean;
  messageId: string;
  previewUrl?: string;
}

export const sendOtpEmail = async (to: string, otp: string): Promise<SendEmailResponse> => {
  console.log('Email Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    hasPass: !!process.env.SMTP_PASS
  });
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error('Email configuration is incomplete. Please check your environment variables.');
    console.error('Missing email configuration:', {
      SMTP_HOST: process.env.SMTP_HOST ? 'Configured' : 'Missing',
      SMTP_PORT: process.env.SMTP_PORT ? 'Configured' : 'Missing',
      SMTP_USER: process.env.SMTP_USER ? 'Configured' : 'Missing',
      SMTP_PASS: process.env.SMTP_PASS ? 'Configured' : 'Missing'
    });
    throw error;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      debug: true
    });

    // Verify connection
    await new Promise<void>((resolve, reject) => {
      transporter.verify((error) => {
        if (error) {
          console.error('SMTP Connection Error:', error);
          reject(error);
        } else {
          console.log('SMTP Server is ready to send messages');
          resolve();
        }
      });
    });

    const mailOptions = {
      from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Clothing Shop'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Your Password Reset OTP',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; color: #333;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e8ed;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px 40px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1f36; letter-spacing: -0.5px;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 20px 40px; text-align: center;">
                      <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4f566b;">Use the verification code below to securely reset your password. For your protection, never share this code with anyone.</p>
                    </td>
                  </tr>
                  <!-- OTP Box -->
                  <tr>
                    <td align="center" style="padding: 20px 40px 30px 40px;">
                      <div style="background-color: #eef2ff; border-radius: 8px; padding: 24px; display: inline-block; border: 1px solid #e0e7ff;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 6px; margin-left: 6px;">${otp}</span>
                      </div>
                    </td>
                  </tr>
                  <!-- Expiry -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #697386;">This code will expire in <span style="color: #1a1f36; font-weight: 700;">15 minutes</span>.</p>
                    </td>
                  </tr>
                  <!-- Security Note -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e1e8ed; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #697386; text-transform: uppercase; letter-spacing: 1px;">Security Note</p>
                      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #697386;">If you did not request this code, someone may be trying to access your account. Please ignore this email or contact support if you have concerns.</p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #a3acb9;">&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME || 'Clothing Shop'}. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } else {
          console.log('Email sent successfully:', info.messageId);
          resolve(info);
        }
      });
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl
    };
  } catch (error) {
    console.error('Error in sendOtpEmail:', error);
    throw new Error('Failed to send OTP email');
  }
};
