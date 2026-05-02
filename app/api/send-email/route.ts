import { NextResponse } from "next/server";
import { Resend } from "resend";
import { RESEND_FROM, RESEND_REPLY_TO } from "@/lib/resend-from";
import { buildPropertyInvestmentPlanHtml, type EmailProperty } from "@/lib/report-email-html";

export const runtime = "nodejs";

const INTERNAL_INBOX = "info@depropertypro.com";

type CompareEmailBody = {
  type: "compare-report";
  age: number;
  income: number;
  savings: number;
  hasProperty: "Yes" | "No";
  email: string;
  report: string;
  readinessScore: number;
  dealScore?: number;
  leadScore?: number;
  leadLevel?: string;
  salesAdvice?: string;
  summary: string;
  propertyInsight: string;
  risks?: string;
  strategy?: string;
  timingLabel?: string;
  recommendedProperties?: Array<{
    id: string;
    name: string;
    priceLabel: string;
    location: string;
    image: string;
    description?: string;
  }>;
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
      console.error("[send-email] Missing RESEND_API_KEY");
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

      const score = body.leadScore ?? body.dealScore ?? body.readinessScore;
      const leadLevel = body.leadLevel ?? "Warm";
      const props: EmailProperty[] = (body.recommendedProperties ?? []).slice(0, 3).map((p) => ({
        name: p.name,
        priceLabel: p.priceLabel,
        location: p.location,
        image: p.image
      }));

      const html = buildPropertyInvestmentPlanHtml({
        leadScore: score,
        leadLevel,
        summary: body.summary,
        salesAdvice: body.salesAdvice ?? body.propertyInsight ?? "",
        properties: props
      });

      const userResult = await resend.emails.send({
        from: RESEND_FROM,
        to: body.email.trim(),
        replyTo: RESEND_REPLY_TO,
        subject: "Your Property Investment Plan",
        html,
        text: `Your Property Investment Plan\n\nScore: ${score}/100 (${leadLevel})\n\n${body.summary}\n\n${body.salesAdvice ?? ""}\n\nProperties: https://depropertypro.com/properties`
      });

      if (userResult.error || !userResult.data?.id) {
        console.error("[send-email] Customer report failed:", userResult.error);
        return NextResponse.json(
          { success: false, message: userResult.error?.message ?? "Failed to send report email." },
          { status: 502 }
        );
      }

      const leadText = `New Compare AI lead
Email: ${body.email}
LeadScore: ${score} | LeadLevel: ${leadLevel}
Age: ${body.age} | Income: ${body.income} | Savings: ${body.savings} | Ownership: ${body.hasProperty}
Summary: ${body.summary}
Time: ${new Date().toISOString()}`;

      const leadResult = await resend.emails.send({
        from: RESEND_FROM,
        to: INTERNAL_INBOX,
        replyTo: body.email.trim(),
        subject: "New Lead - Property Inquiry",
        text: leadText
      });

      if (leadResult.error || !leadResult.data?.id) {
        console.error("[send-email] Internal notify failed:", leadResult.error);
        return NextResponse.json(
          { success: false, message: leadResult.error?.message ?? "Failed to send lead email." },
          { status: 502 }
        );
      }

      console.log("[send-email] Investment plan sent to customer and internal notify OK.");
      return NextResponse.json({ success: true });
    }

    if (!body.name?.trim() || !isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: "Name and valid email are required." },
        { status: 400 }
      );
    }

    const houseLeadResult = await resend.emails.send({
      from: RESEND_FROM,
      to: INTERNAL_INBOX,
      replyTo: body.email.trim(),
      subject: "New Lead - Property Inquiry",
      text: `House Package inquiry
Name: ${body.name.trim()}
Email: ${body.email.trim()}
Message: ${body.message?.trim() || "-"}
Source: House Package
Time: ${new Date().toISOString()}`
    });

    if (houseLeadResult.error || !houseLeadResult.data?.id) {
      console.error("[send-email] House lead failed:", houseLeadResult.error);
      return NextResponse.json(
        { success: false, message: houseLeadResult.error?.message ?? "Failed to send lead email." },
        { status: 502 }
      );
    }

    console.log("[send-email] House package lead email OK.");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[send-email]", e);
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
