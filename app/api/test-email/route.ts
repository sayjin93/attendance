import { NextResponse } from "next/server";
import { testEmailConnection, sendWelcomeEmail } from "@/lib/emailService";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

// POST: Test email functionality (Admin only)
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të testojnë email-in!" },
        { status: 403 }
      );
    }

    const { testType, email } = await req.json();

    if (testType === "connection") {
      // Test email server connection
      const connectionResult = await testEmailConnection();
      return NextResponse.json(connectionResult, { 
        status: connectionResult.success ? 200 : 500 
      });
    } else if (testType === "send" && email) {
      // Send a test welcome email
      const websiteUrl = `${req.headers.get('origin') || 'http://localhost:9900'}`;
      
      const emailResult = await sendWelcomeEmail({
        to: email,
        professorName: "Test Professor",
        username: "testuser",
        password: "testpassword123",
        websiteUrl: websiteUrl,
      });

      return NextResponse.json(emailResult, { 
        status: emailResult.success ? 200 : 500 
      });
    } else {
      return NextResponse.json(
        { error: "Invalid test type or missing email!" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing email:", error);
    return NextResponse.json(
      { error: "Dështoi testimi i email-it!" },
      { status: 500 }
    );
  }
}