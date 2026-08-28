import {
  Quote,
  Star,
} from "lucide-react";

type Testimonial = {
  name: string;
  company?: string;
  message: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Business Customer",
    company: "Regular Logistics Customer",
    message:
      "The shipment process is simple and the tracking information makes it easy to follow every stage.",
  },
  {
    name: "Enterprise Customer",
    company: "Business Partner",
    message:
      "A dependable logistics solution for handling our regular shipment requirements.",
  },
  {
    name: "Individual Customer",
    company: "Customer",
    message:
      "Booking a shipment was straightforward and the overall process was convenient.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Customer Experiences
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What our customers say
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border bg-white p-6"
            >
              <Quote className="h-8 w-8 text-slate-200" />

              <div className="mt-5 flex gap-1">
                {Array.from({ length: 5 }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-current text-slate-800"
                    />
                  ),
                )}
              </div>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                “{testimonial.message}”
              </p>

              <div className="mt-6 border-t pt-5">
                <p className="font-semibold text-slate-900">
                  {testimonial.name}
                </p>

                {testimonial.company && (
                  <p className="mt-1 text-xs text-gray-500">
                    {testimonial.company}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}