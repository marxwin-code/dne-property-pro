import { NextResponse } from "next/server";
import { Resend } from "resend";

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
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body: LeadBody = await req.json();
    if (!body.name || !body.email || !body.phone || !body.propertyType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const content = `New AI Interactive 360° Shop Lead

Request Type: ${body.requestType ?? "Not specified"}
Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone}
Property Type: ${body.propertyType}
Message: ${body.message ?? "-"}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "marxwin@gmail.com",
      subject: "New 360° Shop Lead",
      text: content
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send lead.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
