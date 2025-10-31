import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Find professor by username or email
    const professor = await prisma.professor.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    // For security, always return success even if user not found
    if (!professor) {
      return NextResponse.json(
        { message: "If a user with that username exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.professor.update({
      where: { id: professor.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send email with reset link
    const websiteUrl = `${request.headers.get('origin') || 'http://localhost:9900'}`;
    const resetUrl = `${websiteUrl}/reset-password/${resetToken}`;
    
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="sq">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rivendosja e Fjalëkalimit</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: black; margin: 0; font-size: 28px;">🔐 Rivendosja e Fjalëkalimit</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px; margin-bottom: 20px;">Përshëndetje <strong>${professor.firstName} ${professor.lastName}</strong>,</p>

            <p style="margin-bottom: 20px;">Kemi marrë një kërkesë për të rivendosur fjalëkalimin e llogarisë suaj në sistemin e menaxhimit të frekuentimit.</p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>⏰ Shënim:</strong> Kjo lidhje do të skadojë në <strong>1 orë</strong>.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3); transition: background-color 0.3s ease;">
                🔑 Rivendos Fjalëkalimin
              </a>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Ose kopjoni dhe ngjitni këtë URL në shfletuesin tuaj:</p>
              <p style="word-break: break-all; color: #667eea; font-family: monospace; font-size: 13px; background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0;">${resetUrl}</p>
            </div>

            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;"><strong>🛡️ Sigurie:</strong> Nëse nuk keni kërkuar ju këtë ndryshim, ju lutemi injoroni këtë email. Fjalëkalimi juaj do të mbetet i njëjtë.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
              Nëse keni pyetje ose keni nevojë për ndihmë, mos ngurroni të na kontaktoni.<br>
              <strong>Email:</strong> ${process.env.EMAIL_USER}<br><br>
              <em>Ky është një email automatik. Ju lutemi mos u përgjigjni. 🙏</em>
            </p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Rivendosja e Fjalëkalimit

Përshëndetje ${professor.firstName} ${professor.lastName},

Kemi marrë një kërkesë për të rivendosur fjalëkalimin e llogarisë suaj në sistemin e menaxhimit të frekuentimit.

Për të rivendosur fjalëkalimin tuaj, kopjoni dhe ngjitni këtë URL në shfletuesin tuaj:
${resetUrl}

Shënim: Kjo lidhje do të skadojë në 1 orë.

Sigurie: Nëse nuk keni kërkuar ju këtë ndryshim, ju lutemi injoroni këtë email. Fjalëkalimi juaj do të mbetet i njëjtë.

Nëse keni pyetje ose keni nevojë për ndihmë, mos ngurroni të na kontaktoni.
Email: ${process.env.EMAIL_USER}

Ky është një email automatik. Ju lutemi mos u përgjigjni.
      `;

      await sendEmail({
        to: professor.email,
        subject: "🔐 Rivendosja e Fjalëkalimit - Sistemi i Frekuentimit",
        html: htmlContent,
        text: textContent,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Continue anyway - don't reveal whether email was sent or not
    }

    return NextResponse.json(
      { message: "If a user with that username exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
