import { NextResponse } from "next/server";
import OpenAI from "openai";

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

function getAffordability(income: number): "Low" | "Medium" | "High" {
  if (income < 60000) return "Low";
  if (income <= 120000) return "Medium";
  return "High";
}

function getReadinessScore({
  income,
  savings,
  hasProperty,
  age
}: {
  income: number;
  savings: number;
  hasProperty: "Yes" | "No";
  age: number;
}) {
  let score = 25;
  score += Math.min(35, Math.round(income / 5000));
  score += Math.min(25, Math.round(savings / 4000));
  if (hasProperty === "Yes") score += 8;
  if (age >= 28 && age <= 50) score += 7;
  return Math.max(1, Math.min(100, score));
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

    if (!openAiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration missing OPENAI_API_KEY."
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

    const affordability = getAffordability(body.income);
    const readinessScore = getReadinessScore({
      income: body.income,
      savings: body.savings,
      hasProperty: body.hasProperty,
      age: body.age
    });

    const summary = `Based on your profile, your affordability level is ${affordability} with a property readiness score of ${readinessScore}/100.`;
    const propertyInsight =
      affordability === "Low"
        ? "Focus on deposit growth and serviceability improvements before targeting larger packages."
        : affordability === "Medium"
          ? "You are positioned to evaluate quality house and land stock with careful borrowing structure."
          : "You have strong capacity to pursue premium stock and optimize for long-term capital growth.";

    return NextResponse.json({
      success: true,
      message: "Report generated",
      report,
      readinessScore,
      affordability,
      summary,
      propertyInsight
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
