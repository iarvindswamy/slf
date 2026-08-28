"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HomeTrackForm() {
  const router = useRouter();

  function handleTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const awb = String(form.get("awb") || "").trim();

    if (!awb) return;

    router.push(`/logistics/track/${encodeURIComponent(awb)}`);
  }

  return (
    <form className="tracking-form" onSubmit={handleTracking}>
      <input
        name="awb"
        className="input"
        placeholder="Enter AWB / Tracking Number"
        aria-label="AWB tracking number"
        required
      />
      <button className="btn-primary" type="submit">
        Track Now
      </button>
    </form>
  );
}