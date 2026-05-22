export type TokenStatus = "validating" | "valid" | "invalid";

export type ResetPasswordCardProps = {
  title?: string;
  subtitle?: string;
  email?: string;
  onSubmit: (data: { password: string }) => Promise<void>;
};
