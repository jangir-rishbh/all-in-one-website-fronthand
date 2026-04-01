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

    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Your App';
    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `${appName} — Your Verification Code`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your OTP Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your verification code is ${otp}. It expires in 15 minutes.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0f2f5;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;background-color:#ffffff;border-radius:12px;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

          <tr>
            <td align="center"
                style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
                       padding:32px 40px 28px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:2px;
                        text-transform:uppercase;color:#c7d2fe;">
                ${appName}
              </p>
              <h1 style="margin:10px 0 0;font-size:24px;font-weight:700;color:#ffffff;
                         line-height:1.3;">
                Password Reset Request
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 24px;">

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
                You have requested to reset the password for your
                <strong>${appName}</strong> account. Use the code below to proceed.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin-bottom:24px;">
                <tr>
                  <td align="center"
                      style="background-color:#eef2ff;border:2px dashed #6366f1;
                             border-radius:10px;padding:20px 16px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;
                               letter-spacing:1.5px;text-transform:uppercase;color:#6366f1;">
                      Your verification code
                    </p>
                    <p style="margin:0;font-size:40px;font-weight:800;
                               letter-spacing:10px;color:#3730a3;
                               font-family:'Courier New',Courier,monospace;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fff7ed;border-left:4px solid #f97316;
                             border-radius:0 8px 8px 0;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.5;">
                      <strong>&#9200; Expires in 15 minutes.</strong>
                      Do not share this code with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f8fafc;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                      &#128274; <strong>Security notice:</strong> ${appName} will
                      never ask for your OTP via phone or chat. If you did not
                      request this code, please ignore this email — your account
                      remains secure.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td align="center"
                style="padding:20px 40px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                This is an automated message — please do not reply.
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`,
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
