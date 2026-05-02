import { NextResponse } from "next/server";
import { Resend } from "resend";
import { RESEND_FROM, RESEND_REPLY_TO } from "@/lib/resend-from";

export const runtime = "nodejs";

type Body = {
  fullName?: string;
  email?: string;
  propertyType?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    if (!body.fullName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name and email are required." },
        { status: 400 }
      );
    }

    const name = body.fullName.trim();
    const email = body.email.trim();
    const propertyType = (body.propertyType ?? "").trim() || "—";
    const message = (body.message ?? "").trim() || "—";

    const text = `New lead from website contact form

name: ${name}
email: ${email}
property type: ${propertyType}
message: ${message}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server misconfiguration: RESEND_API_KEY is not set."
        },
        { status: 503 }
      );
    }

    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to: RESEND_REPLY_TO,
        replyTo: email,
        subject: "New Lead - Property Inquiry",
        text
      });

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message ?? "Resend rejected the send request."
          },
          { status: 502 }
        );
      }

      if (!data?.id) {
        return NextResponse.json(
          { success: false, message: "Email send did not return a message id." },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Failed to send email."
        },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
}
