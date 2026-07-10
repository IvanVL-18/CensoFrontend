interface ValidationErrorProps {
  message: string | null;
}

export function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      <span>{message}</span>
    </div>
  );
}
