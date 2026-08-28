type LoadingProps = {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
};

export default function Loading({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  className = "",
}: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          "animate-spin rounded-full border-gray-200 border-t-slate-900",
          sizes[size],
        ].join(" ")}
      />

      {text && (
        <p className="text-sm text-gray-500">
          {text}
        </p>
      )}

      <span className="sr-only">
        {text}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}