export function roundCurrency(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) *
      100,
  ) / 100;
}

export function calculatePercentage(
  amount: number,
  percentage: number,
): number {
  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(
      percentage,
    )
  ) {
    return 0;
  }

  return roundCurrency(
    amount *
      (percentage / 100),
  );
}

export function calculateTax(
  taxableAmount: number,
  taxRate: number,
): number {
  return calculatePercentage(
    taxableAmount,
    taxRate,
  );
}

export function calculateDiscount(
  amount: number,
  discountPercentage: number,
  maximumDiscount?: number,
): number {
  const calculated =
    calculatePercentage(
      amount,
      discountPercentage,
    );

  if (
    maximumDiscount ===
    undefined
  ) {
    return calculated;
  }

  return roundCurrency(
    Math.min(
      calculated,
      Math.max(
        0,
        maximumDiscount,
      ),
    ),
  );
}

export function calculateSubtotal(
  items: Array<{
    price: number;
    quantity: number;
  }>,
): number {
  return roundCurrency(
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.price *
          item.quantity,
      0,
    ),
  );
}

export function calculateCartTotal(
  subtotal: number,
  discount: number,
  deliveryFee: number,
): number {
  return roundCurrency(
    Math.max(
      0,
      subtotal -
        discount +
        deliveryFee,
    ),
  );
}

export function calculateVolumetricWeight(
  length: number,
  width: number,
  height: number,
  divisor: number,
): number {
  if (
    length <= 0 ||
    width <= 0 ||
    height <= 0 ||
    divisor <= 0
  ) {
    return 0;
  }

  return roundCurrency(
    (length *
      width *
      height) /
      divisor,
  );
}

export function calculateChargeableWeight(
  actualWeight: number,
  volumetricWeight: number,
): number {
  return roundCurrency(
    Math.max(
      actualWeight,
      volumetricWeight,
    ),
  );
}

export function calculatePieceTotalWeight(
  pieces: Array<{
    quantity: number;
    actualWeight: number;
  }>,
): number {
  return roundCurrency(
    pieces.reduce(
      (
        total,
        piece,
      ) =>
        total +
        piece.quantity *
          piece.actualWeight,
      0,
    ),
  );
}

export function calculateTaxSplit(
  taxableAmount: number,
  taxRate: number,
  sameState: boolean,
) {
  const totalTax =
    calculateTax(
      taxableAmount,
      taxRate,
    );

  if (sameState) {
    const half =
      roundCurrency(
        totalTax / 2,
      );

    return {
      cgst: half,
      sgst: roundCurrency(
        totalTax - half,
      ),
      igst: 0,
      total: totalTax,
    };
  }

  return {
    cgst: 0,
    sgst: 0,
    igst: totalTax,
    total: totalTax,
  };
}

export function calculateFuelSurcharge(
  freight: number,
  percentage: number,
): number {
  return calculatePercentage(
    freight,
    percentage,
  );
}

export function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

export function calculateAverage(
  values: number[],
): number {
  if (!values.length) {
    return 0;
  }

  const validValues =
    values.filter(
      Number.isFinite,
    );

  if (!validValues.length) {
    return 0;
  }

  return roundCurrency(
    validValues.reduce(
      (
        sum,
        value,
      ) => sum + value,
      0,
    ) /
      validValues.length,
  );
}