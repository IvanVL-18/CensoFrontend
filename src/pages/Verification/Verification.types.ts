export type VerificationCardProps = {
  title?: string;
  subtitle?: string;
  destination?: string;
  onVerified?: (code: string) => void;
};

export type ResendTimerProps = {
  seconds?: number;
  onResend: () => void;
};

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
};