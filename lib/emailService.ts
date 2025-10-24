import nodemailer from 'nodemailer';

/**
 * Email Service for Attendance Management System
 * 
 * This service handles email functionality using nodemailer.
 * It sends welcome emails to newly registered professors with their login credentials.
 * 
 * Environment variables required in .env:
 * - EMAIL_HOST: SMTP server host
 * - EMAIL_PORT: SMTP server port
 * - EMAIL_USER: SMTP username
 * - EMAIL_PASS: SMTP password
 */

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: parseInt(process.env.EMAIL_PORT!),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

interface SendWelcomeEmailParams {
  to: string;
  professorName: string;
  username: string;
  password: string;
  websiteUrl: string;
}

export async function sendWelcomeEmail({
  to,
  professorName,
  username,
  password,
  websiteUrl,
}: SendWelcomeEmailParams) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="sq">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mirësevini në Sistemin e Pranimeve</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: black; margin: 0; font-size: 28px;">🎓 Mirësevini!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; margin-bottom: 20px;">Përshëndetje <strong>${professorName}</strong>,</p>

        <p style="margin-bottom: 20px;">Jemi të gëzuar t'ju njoftojmë se llogaria juaj si profesor në sistemin tonë të menaxhimit të frekuentimit është krijuar me sukses!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin-top: 0;">📝 Të dhënat e hyrjes:</h3>
          <p style="margin: 10px 0;"><strong>🌐 URL e faqes:</strong> <a href="${websiteUrl}" style="color: #667eea; text-decoration: none;">${websiteUrl}</a></p>
          <p style="margin: 10px 0;"><strong>👤 Përdoruesi:</strong> <span style="background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${username}</span></p>
          <p style="margin: 10px 0;"><strong>🔐 Fjalëkalimi:</strong> <span style="background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${password}</span></p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>ℹ️ Shënim:</strong> Ju mund të përdorni si emrin e përdoruesit ashtu edhe email-in tuaj për t'u kyçur në sistem.</p>
        </div>
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0c5460;"><strong>🔒 Për sigurinë tuaj:</strong> Rekomandojmë që të ndryshoni fjalëkalimin tuaj pas hyrjes së parë në sistem.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${websiteUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3); transition: background-color 0.3s ease;">
            🚀 Hyni në Sistem
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
          Nëse keni pyetje ose keni nevojë për ndihmë, mos ngurroni të na kontaktoni.<br>
          <strong>Email:</strong> ${process.env.EMAIL_USER}<br><br>
          <em>Faleminderit që jeni pjesë e ekipit tonë! 🙏</em>
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Mirësevini në Sistemin e Menaxhimit të Pranimeve!

Përshëndetje ${professorName},

Jemi të gëzuar t'ju njoftojmë se llogaria juaj si profesor në sistemin tonë të menaxhimit të pranimeve është krijuar me sukses!

Të dhënat e hyrjes:
- URL e faqes: ${websiteUrl}
- Përdoruesi: ${username}
- Fjalëkalimi: ${password}

Shënim: Ju mund të përdorni si emrin e përdoruesit ashtu edhe email-in tuaj për t'u kyçur në sistem.

Për sigurinë tuaj: Rekomandojmë që të ndryshoni fjalëkalimin tuaj pas hyrjes së parë në sistem.

Nëse keni pyetje ose keni nevojë për ndihmë, mos ngurroni të na kontaktoni.
Email: ${process.env.EMAIL_USER}

Faleminderit që jeni pjesë e ekipit tonë!
  `;

  const mailOptions = {
    from: `"Sistemi i Frekuentimit" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🎓 Mirësevini në Sistemin e Frekuentimit - Të dhënat e hyrjes',
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error };
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return { success: true };
  } catch (error) {
    console.error('Email server connection failed:', error);
    return { success: false, error: error };
  }
}