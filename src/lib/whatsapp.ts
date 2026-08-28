import "server-only";

const GRAPH_API_VERSION = "v23.0";

type WhatsAppParameter =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "currency";
      currency: {
        fallback_value: string;
        code: string;
        amount_1000: number;
      };
    }
  | {
      type: "date_time";
      date_time: {
        fallback_value: string;
      };
    };

export type WhatsAppTemplateComponent =
  | {
      type: "body";
      parameters: WhatsAppParameter[];
    }
  | {
      type: "header";
      parameters: WhatsAppParameter[];
    }
  | {
      type: "button";
      sub_type: string;
      index: string;
      parameters: WhatsAppParameter[];
    };

export type SendWhatsAppTemplateInput = {
  phone: string;
  templateName: string;
  languageCode: string;
  components?: WhatsAppTemplateComponent[];
  /** @deprecated use phone */
  to?: string;
  parameters?: string[];
};

export type SendWhatsAppTextInput = {
  phone: string;
  message: string;
};

export type SendWhatsAppDocumentInput = {
  phone: string;
  documentUrl: string;
  filename?: string;
  caption?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

async function graphRequest(body: Record<string, unknown>) {
  const accessToken = requiredEnv("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = requiredEnv("WHATSAPP_PHONE_NUMBER_ID");

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      ...body,
    }),
  });

  const raw = await response.json();

  if (!response.ok) {
    throw new Error(
      `WhatsApp API failed (${response.status}): ${JSON.stringify(raw)}`,
    );
  }

  return raw;
}

export async function sendWhatsAppText(input: SendWhatsAppTextInput) {
  const to = normalizePhone(input.phone);

  if (!to || to.length < 12) {
    throw new Error("A valid WhatsApp recipient number is required.");
  }

  const message = input.message?.trim();
  if (!message) {
    throw new Error("Message is required.");
  }

  return graphRequest({
    to,
    type: "text",
    text: {
      preview_url: true,
      body: message,
    },
  });
}

export async function sendWhatsAppDocument(
  input: SendWhatsAppDocumentInput,
) {
  const to = normalizePhone(input.phone);

  if (!to || to.length < 12) {
    throw new Error("A valid WhatsApp recipient number is required.");
  }

  const documentUrl = input.documentUrl?.trim();
  if (!documentUrl) {
    throw new Error("documentUrl is required.");
  }

  return graphRequest({
    to,
    type: "document",
    document: {
      link: documentUrl,
      filename: input.filename || "document.pdf",
      ...(input.caption
        ? { caption: String(input.caption) }
        : {}),
    },
  });
}

export async function sendWhatsAppTemplate(
  input: SendWhatsAppTemplateInput,
) {
  const to = normalizePhone(input.phone || input.to || "");

  if (!to || to.length < 12) {
    throw new Error("A valid WhatsApp recipient number is required.");
  }

  if (!input.templateName?.trim()) {
    throw new Error("WhatsApp template name is required.");
  }

  // Support simple string parameters → body components
  let components = input.components;

  if (
    !components &&
    Array.isArray(input.parameters) &&
    input.parameters.length > 0
  ) {
    components = [
      {
        type: "body",
        parameters: input.parameters.map((text) => ({
          type: "text" as const,
          text: String(text),
        })),
      },
    ];
  }

  return graphRequest({
    to,
    type: "template",
    template: {
      name: input.templateName,
      language: {
        code: input.languageCode || "en_US",
      },
      ...(components ? { components } : {}),
    },
  });
}

export function textParameter(text: string): WhatsAppParameter {
  return {
    type: "text",
    text,
  };
}

export function currencyParameter(
  amount: number,
  currencyCode = "INR",
): WhatsAppParameter {
  return {
    type: "currency",
    currency: {
      fallback_value: `${currencyCode} ${amount.toFixed(2)}`,
      code: currencyCode,
      amount_1000: Math.round(amount * 1000),
    },
  };
}