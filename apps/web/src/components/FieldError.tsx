export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;

  return (
    <p className="field-error" role="alert" id={id}>
      <svg className="field-error-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 4.75v4.1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.15" r="0.85" fill="currentColor" />
      </svg>
      <span>{message}</span>
    </p>
  );
}
