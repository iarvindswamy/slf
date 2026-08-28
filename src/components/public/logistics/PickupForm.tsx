"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
} from "lucide-react";

type PickupFormData = {
  name: string;
  phone: string;
  email: string;
  pickupAddress: string;
  city: string;
  pincode: string;
  packageType: string;
  preferredDate: string;
  message: string;
};

const initialData: PickupFormData = {
  name: "",
  phone: "",
  email: "",
  pickupAddress: "",
  city: "",
  pincode: "",
  packageType: "",
  preferredDate: "",
  message: "",
};

type PickupFormProps = {
  onSubmit?: (
    data: PickupFormData,
  ) => Promise<void> | void;
};

export default function PickupForm({
  onSubmit,
}: PickupFormProps) {
  const [form, setForm] =
    useState<PickupFormData>(
      initialData,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const updateField = (
    field: keyof PickupFormData,
    value: string,
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (
      !form.name ||
      !form.phone ||
      !form.pickupAddress ||
      !form.city ||
      !form.pincode
    ) {
      setError(
        "Please fill in all required fields.",
      );

      return;
    }

    try {
      setLoading(true);

      await onSubmit?.(
        form,
      );

      setSubmitted(true);
    } catch {
      setError(
        "Unable to submit the pickup request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-slate-900">
          Pickup request submitted
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          Your pickup request has been received. Our team
          will contact you with the next steps.
        </p>

        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setForm(initialData);
          }}
          className="mt-6 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputClass =
    "h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Request a Pickup
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter the pickup details and our team will
          coordinate the request.
        </p>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Name *
          </label>

          <input
            value={form.name}
            onChange={(e) =>
              updateField(
                "name",
                e.target.value,
              )
            }
            className={inputClass}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Phone *
          </label>

          <input
            value={form.phone}
            onChange={(e) =>
              updateField(
                "phone",
                e.target.value,
              )
            }
            className={inputClass}
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              updateField(
                "email",
                e.target.value,
              )
            }
            className={inputClass}
            placeholder="Email address"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Package Type
          </label>

          <select
            value={form.packageType}
            onChange={(e) =>
              updateField(
                "packageType",
                e.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              Select package type
            </option>
            <option value="DOCUMENT">
              Document
            </option>
            <option value="PARCEL">
              Parcel
            </option>
            <option value="CARGO">
              Cargo
            </option>
            <option value="OTHER">
              Other
            </option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Pickup Address *
          </label>

          <textarea
            value={form.pickupAddress}
            onChange={(e) =>
              updateField(
                "pickupAddress",
                e.target.value,
              )
            }
            rows={3}
            className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            placeholder="Complete pickup address"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            City *
          </label>

          <input
            value={form.city}
            onChange={(e) =>
              updateField(
                "city",
                e.target.value,
              )
            }
            className={inputClass}
            placeholder="City"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Pincode *
          </label>

          <input
            value={form.pincode}
            onChange={(e) =>
              updateField(
                "pincode",
                e.target.value,
              )
            }
            className={inputClass}
            placeholder="Pincode"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Preferred Pickup Date
          </label>

          <input
            type="date"
            value={form.preferredDate}
            onChange={(e) =>
              updateField(
                "preferredDate",
                e.target.value,
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Additional Message
          </label>

          <input
            value={form.message}
            onChange={(e) =>
              updateField(
                "message",
                e.target.value,
              )
            }
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}

        {loading
          ? "Submitting..."
          : "Request Pickup"}
      </button>
    </form>
  );
}