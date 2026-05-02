import { NextResponse } from "next/server";
import {
  computeRiskScore,
  type BuildingCondition,
  type PropertyType,
  type RiskScoreInput
} from "@/lib/risk-scoring";

export const runtime = "nodejs";

function isFinitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

function parseBody(raw: unknown): RiskScoreInput | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;

  const price = b.price;
  const income = b.income;
  const savings = b.savings;
  const suburbMedianPrice = b.suburbMedianPrice;
  const rentalYield = b.rentalYield;
  const OC_fee = b.OC_fee;

  if (!isFinitePositive(price) || !isFinitePositive(income) || !isFiniteNonNegative(savings)) {
    return null;
  }
  if (!isFiniteNonNegative(suburbMedianPrice) || !isFiniteNonNegative(rentalYield)) {
    return null;
  }
  if (!isFiniteNonNegative(OC_fee)) return null;

  const propertyType = b.propertyType;
  if (propertyType !== "house" && propertyType !== "apartment") return null;

  const buildingCondition = b.buildingCondition;
  if (buildingCondition !== "good" && buildingCondition !== "average" && buildingCondition !== "bad") {
    return null;
  }

  const location = typeof b.location === "string" ? b.location.trim() : "";
  if (!location) return null;

  const hasOC = Boolean(b.hasOC);
  const specialLevy = Boolean(b.specialLevy);

  const input: RiskScoreInput = {
    price,
    income,
    savings,
    propertyType: propertyType as PropertyType,
    hasOC,
    OC_fee,
    specialLevy,
    buildingCondition: buildingCondition as BuildingCondition,
    location,
    suburbMedianPrice,
    rentalYield,
    hasEasement: typeof b.hasEasement === "boolean" ? b.hasEasement : undefined,
    hasCovenant: typeof b.hasCovenant === "boolean" ? b.hasCovenant : undefined,
    zoningRisk: typeof b.zoningRisk === "boolean" ? b.zoningRisk : undefined,
    OC_reserve_low: typeof b.OC_reserve_low === "boolean" ? b.OC_reserve_low : undefined
  };

  return input;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = parseBody(json);

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid input. Required: price, income, savings, propertyType (house|apartment), hasOC, OC_fee, specialLevy, buildingCondition (good|average|bad), location, suburbMedianPrice, rentalYield. Optional booleans: hasEasement, hasCovenant, zoningRisk, OC_reserve_low."
        },
        { status: 400 }
      );
    }

    const result = computeRiskScore(input);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[risk-score]", e);
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
