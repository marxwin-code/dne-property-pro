import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Resend } from "resend";

export const runtime = "nodejs";

type CompareBody = {
  age?: number;
  income?: number;
  savings?: number;
  hasProperty?: "Yes" | "No";
  email?: string;
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function POST(req: Request) {
  try {
    const body: CompareBody = await req.json();

    if (
      !isPositiveNumber(body.age) ||
      !isPositiveNumber(body.income) ||
      !isPositiveNumber(body.savings) ||
      (body.hasProperty !== "Yes" && body.hasProperty !== "No") ||
      !body.email?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid input. Please complete all fields." },
        { status: 400 }
      );
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!openAiKey || !resendKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration missing OPENAI_API_KEY or RESEND_API_KEY."
        },
        { status: 503 }
      );
    }

    const prompt = `You are a professional Australian property investment advisor.
Client Profile:
* Age: ${body.age}
* Income: ${body.income}
* Savings: ${body.savings}
* Owns Property: ${body.hasProperty}
Generate a structured report including:
1. Financial Position Summary
2. Property Readiness Score (0-100)
3. Recommended Property Budget Range
4. Suggested Strategy (buy now / wait / invest)
5. Key Risks
6. Next Action Plan
Make it professional, clear, and persuasive.`;

    const openai = new OpenAI({ apiKey: openAiKey });
    const aiResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const report = aiResponse.output_text?.trim();
    if (!report) {
      return NextResponse.json(
        { success: false, message: "AI report generation failed. Please try again." },
        { status: 502 }
      );
    }

    const resend = new Resend(resendKey);
    const fromAddress = "info@mail.depropertypro.com";

    const userEmailResult = await resend.emails.send({
      from: fromAddress,
      to: body.email.trim(),
      subject: "Your Property Readiness Report",
      text: `Your Personal Property Report\n\n${report}`
    });

    if (userEmailResult.error || !userEmailResult.data?.id) {
      return NextResponse.json(
        {
          success: false,
          message: userEmailResult.error?.message ?? "Failed to send report email."
        },
        { status: 502 }
      );
    }

    const leadEmailResult = await resend.emails.send({
      from: fromAddress,
      to: "info@depropertypro.com",
      subject: "New Compare AI Lead",
      text: `Age: ${body.age}\nIncome: ${body.income}\nSavings: ${body.savings}\nProperty: ${body.hasProperty}\nEmail: ${body.email.trim()}`
    });

    if (leadEmailResult.error || !leadEmailResult.data?.id) {
      return NextResponse.json(
        {
          success: false,
          message: leadEmailResult.error?.message ?? "Lead capture email failed."
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Report sent to your email" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
