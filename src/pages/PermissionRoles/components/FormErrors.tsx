import React from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  errors: string[];
};

const FormErrors: React.FC<Props> = ({ errors }) => {
  if (!errors.length) return null;

  return (
    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-red-700" />
        <div>
          <p className="text-sm font-semibold text-red-800">Revisa lo siguiente:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-800">
            {errors.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormErrors;