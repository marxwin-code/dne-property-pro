import { NextResponse } from "next/server";
import { Resend } from "resend";
import { RESEND_FROM } from "@/lib/resend-from";

export const runtime = "nodejs";

type Body = {
  fullName?: string;
  email?: string;
  phone?: string;
  propertyType?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    if (!body.fullName || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const text = `New lead from website contact form

Full Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone}
Property Type: ${body.propertyType ?? "—"}
Message: ${body.message ?? "—"}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "Email is not configured (missing RESEND_API_KEY)."
      });
    }

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: RESEND_FROM,
        to: "info@depropertypro.com",
        replyTo: body.email,
        subject: "New Lead from Website",
        text
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email.",
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
}
