import "server-only";

const CASHFREE_API_VERSION =
  "2025-01-01";

export type CashfreeEnvironment =
  | "sandbox"
  | "production";

export type CreateCashfreeOrderInput = {
  orderId: string;
  orderAmount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl?: string;
};

export type CashfreeOrderResponse = {
  cfOrderId?: string;
  orderId: string;
  paymentSessionId?: string;
  orderStatus?: string;
  raw: unknown;
};

function getEnvironment(): CashfreeEnvironment {
  const environment =
    process.env
      .CASHFREE_ENVIRONMENT;

  if (
    environment ===
      "production" ||
    environment ===
      "sandbox"
  ) {
    return environment;
  }

  throw new Error(
    "CASHFREE_ENVIRONMENT must be 'sandbox' or 'production'.",
  );
}

function getBaseUrl(): string {
  return getEnvironment() ===
    "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function requiredEnv(
  name: string,
): string {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`,
    );
  }

  return value;
}

function headers(): HeadersInit {
  return {
    "Content-Type":
      "application/json",
    "x-client-id":
      requiredEnv(
        "CASHFREE_APP_ID",
      ),
    "x-client-secret":
      requiredEnv(
        "CASHFREE_SECRET_KEY",
      ),
    "x-api-version":
      CASHFREE_API_VERSION,
  };
}

export async function createCashfreeOrder(
  input: CreateCashfreeOrderInput,
): Promise<CashfreeOrderResponse> {
  if (
    input.orderAmount <= 0
  ) {
    throw new Error(
      "Cashfree order amount must be greater than zero.",
    );
  }

  const response =
    await fetch(
      `${getBaseUrl()}/orders`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          order_id:
            input.orderId,

          order_amount:
            Number(
              input.orderAmount.toFixed(
                2,
              ),
            ),

          order_currency:
            "INR",

          customer_details: {
            customer_id:
              input.customerId,

            customer_name:
              input.customerName,

            customer_email:
              input.customerEmail,

            customer_phone:
              input.customerPhone,
          },

          order_meta: {
            return_url:
              input.returnUrl,

            ...(input.notifyUrl
              ? {
                  notify_url:
                    input.notifyUrl,
                }
              : {}),
          },
        }),
      },
    );

  const raw =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `Cashfree create order failed (${response.status}): ${JSON.stringify(
        raw,
      )}`,
    );
  }

  return {
    cfOrderId:
      typeof raw?.cf_order_id ===
      "string"
        ? raw.cf_order_id
        : undefined,

    orderId:
      typeof raw?.order_id ===
      "string"
        ? raw.order_id
        : input.orderId,

    paymentSessionId:
      typeof raw?.payment_session_id ===
      "string"
        ? raw.payment_session_id
        : undefined,

    orderStatus:
      typeof raw?.order_status ===
      "string"
        ? raw.order_status
        : undefined,

    raw,
  };
}

export async function getCashfreeOrder(
  orderId: string,
): Promise<unknown> {
  const response =
    await fetch(
      `${getBaseUrl()}/orders/${encodeURIComponent(
        orderId,
      )}`,
      {
        method: "GET",
        headers: headers(),
        cache: "no-store",
      },
    );

  const raw =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `Cashfree order lookup failed (${response.status}): ${JSON.stringify(
        raw,
      )}`,
    );
  }

  return raw;
}

export async function getCashfreePayments(
  orderId: string,
): Promise<unknown> {
  const response =
    await fetch(
      `${getBaseUrl()}/orders/${encodeURIComponent(
        orderId,
      )}/payments`,
      {
        method: "GET",
        headers: headers(),
        cache: "no-store",
      },
    );

  const raw =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `Cashfree payment lookup failed (${response.status}): ${JSON.stringify(
        raw,
      )}`,
    );
  }

  return raw;
}