import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const FROM_ADDRESS = "info@mail.depropertypro.com";
const PACKAGE_URL = "https://depropertypro.com/house-package";

type CompareEmailBody = {
  type: "compare-report";
  age: number;
  income: number;
  savings: number;
  hasProperty: "Yes" | "No";
  email: string;
  report: string;
  readinessScore: number;
  summary: string;
  propertyInsight: string;
};

type HouseEmailBody = {
  type: "house-package";
  name: string;
  email: string;
  message?: string;
};

type EmailBody = CompareEmailBody | HouseEmailBody;

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EmailBody;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Server configuration missing RESEND_API_KEY." },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);

    if (body.type === "compare-report") {
      if (!isValidEmail(body.email)) {
        return NextResponse.json({ success: false, message: "Invalid email." }, { status: 400 });
      }

      const userText = `Your Personal Property Report

Property Readiness Score: ${body.readinessScore}/100
Summary: ${body.summary}

Financial Snapshot
- Age: ${body.age}
- Income: ${body.income}
- Savings: ${body.savings}
- Property Ownership: ${body.hasProperty}

Property Insight
${body.propertyInsight}

AI Report
${body.report}

Recommended Property:
Premium House & Land Package
From $620,000
${PACKAGE_URL}

Book a consultation or view property`;

      const userResult = await resend.emails.send({
        from: FROM_ADDRESS,
        to: body.email.trim(),
        subject: "Your Property Readiness Report",
        text: userText
      });
      if (userResult.error || !userResult.data?.id) {
        return NextResponse.json(
          { success: false, message: userResult.error?.message ?? "Failed to send report email." },
          { status: 502 }
        );
      }

      const leadResult = await resend.emails.send({
        from: FROM_ADDRESS,
        to: "info@depropertypro.com",
        subject: "New Compare AI Lead",
        text: `Age: ${body.age}
Income: ${body.income}
Savings: ${body.savings}
Property: ${body.hasProperty}
Email: ${body.email}`
      });
      if (leadResult.error || !leadResult.data?.id) {
        return NextResponse.json(
          { success: false, message: leadResult.error?.message ?? "Failed to send lead email." },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (!body.name?.trim() || !isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: "Name and valid email are required." },
        { status: 400 }
      );
    }

    const houseLeadResult = await resend.emails.send({
      from: FROM_ADDRESS,
      to: "info@depropertypro.com",
      subject: "New House Package Lead",
      text: `Name: ${body.name.trim()}
Email: ${body.email.trim()}
Message: ${body.message?.trim() || "-"}
Interest Property: Premium House & Land Package
Source: House Package`
    });

    if (houseLeadResult.error || !houseLeadResult.data?.id) {
      return NextResponse.json(
        { success: false, message: houseLeadResult.error?.message ?? "Failed to send lead email." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
