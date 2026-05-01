import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type RequestBody = {
  email?: string;
  type?: string;
};

export async function POST(req: Request) {
  try {
    const { email, type }: RequestBody = await req.json();

    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: "Missing email or type." },
        { status: 400 }
      );
    }

    const report = `Your Financial Personality Report
Type: ${type}
----------------------------------
You are ahead of most people.
But you are not in the top 10%.
Without a clear strategy, you are likely to stay in this position for years.
----------------------------------
What this means:
You currently have the potential to grow, but your financial behavior is not optimised.
Most people at your level stay stuck because they don't change their strategy.
----------------------------------
Next Step:
Start building a structured financial plan focused on growth, not just stability.
----------------------------------
Property Insight:
Based on your profile, your current approach may limit your ability to benefit from property opportunities.
----------------------------------
This is only your basic report.
More detailed strategy is coming.`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        queued: false,
        fallback: true,
        message: "Report generated without email send (missing RESEND_API_KEY)."
      });
    }

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your Financial Report",
        text: report
      });
      return NextResponse.json({ success: true, queued: true, fallback: false });
    } catch (error) {
      return NextResponse.json({
        success: true,
        queued: false,
        fallback: true,
        message: "Report generated but email send failed.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        queued: false,
        fallback: true,
        message: "Report request accepted with fallback response.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 }
    );
  }
}
