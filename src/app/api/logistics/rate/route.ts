import { NextRequest } from "next/server";

import {
  getCurrentUser,
} from "@/lib/auth";

import {
  can,
} from "@/lib/permissions";

import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

import {
  calculateFreightRate,
} from "@/lib/pricing";

import {
  positiveNumber,
} from "@/utils/validators";

type RateOption = {
  serviceId: string;
  serviceName: string;

  baseRatePerKg: number;

  minimumCharge?: number;

  fuelSurchargePercent?: number;

  handlingCharges?: number;
  pickupCharges?: number;
  deliveryCharges?: number;
  otherCharges?: number;

  discount?: number;

  gstRate?: number;
};

type RateBody = {
  chargeableWeightKg?: number;

  rates?: RateOption[];
};

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (
      !can(
        user,
        "LOGISTICS_RATE_VIEW",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view rates.",
        403,
      );
    }

    let body: RateBody;

    try {
      body =
        await request.json();
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const chargeableWeightKg =
      positiveNumber(
        body.chargeableWeightKg ??
          0,
        "chargeableWeightKg",
      );

    if (
      chargeableWeightKg <= 0
    ) {
      return errorResponse(
        "INVALID_WEIGHT",
        "Chargeable weight must be greater than zero.",
        400,
      );
    }

    const rates =
      body.rates ?? [];

    if (
      rates.length === 0
    ) {
      return errorResponse(
        "RATES_REQUIRED",
        "At least one rate option is required.",
        400,
      );
    }

    const calculated =
      rates.map(
        (rate) => {
          const result =
            calculateFreightRate({
              chargeableWeightKg,

              baseRatePerKg:
                positiveNumber(
                  rate.baseRatePerKg,
                  "baseRatePerKg",
                ),

              minimumCharge:
                rate.minimumCharge,

              fuelSurchargePercent:
                rate.fuelSurchargePercent,

              handlingCharges:
                rate.handlingCharges,

              pickupCharges:
                rate.pickupCharges,

              deliveryCharges:
                rate.deliveryCharges,

              otherCharges:
                rate.otherCharges,

              discount:
                rate.discount,

              gstRate:
                rate.gstRate,
            });

          return {
            serviceId:
              rate.serviceId,

            serviceName:
              rate.serviceName,

            ...result,
          };
        },
      );

    calculated.sort(
      (a, b) =>
        a.total -
        b.total,
    );

    return successResponse({
      chargeableWeightKg,
      rates:
        calculated,
      recommended:
        calculated[0],
    });
  } catch (error) {
    console.error(
      "POST /api/logistics/rate:",
      error,
    );

    return errorResponse(
      "RATE_CALCULATION_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to calculate rates.",
      500,
    );
  }
}