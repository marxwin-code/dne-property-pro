import { NextResponse } from "next/server";
import { Resend } from "resend";
import { RESEND_FROM } from "@/lib/resend-from";

export const runtime = "nodejs";

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  propertyType?: string;
  message?: string;
  requestType?: string;
};

export async function POST(req: Request) {
  try {
    const body: LeadBody = await req.json();
    if (!body.name || !body.email || !body.phone || !body.propertyType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const content = `New AI Interactive 360° Shop Lead

Request Type: ${body.requestType ?? "Not specified"}
Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone}
Property Type: ${body.propertyType}
Message: ${body.message ?? "-"}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        queued: false,
        fallback: true,
        message: "Lead captured without email send (missing RESEND_API_KEY)."
      });
    }

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: RESEND_FROM,
        to: "marxwin@gmail.com",
        subject: "New 360° Shop Lead",
        text: content
      });
      return NextResponse.json({ success: true, queued: true, fallback: false });
    } catch (error) {
      return NextResponse.json({
        success: true,
        queued: false,
        fallback: true,
        message: "Lead captured but email send failed.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        fallback: true,
        queued: false,
        message: "Lead accepted with fallback response.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 }
    );
  }
}
