import AiBadge from "./AiBadge";

export default function AiFieldHint({ children, showBadge = true }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-xs text-violet-700/90 flex flex-wrap items-center gap-1.5">
      {showBadge && <AiBadge title={typeof children === "string" ? children : undefined} />}
      <span>{children}</span>
    </p>
  );
}
