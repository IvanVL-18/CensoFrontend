export type ResetPasswordCardProps = {
  title?: string;
  subtitle?: string;
  email?: string;
  onSubmit?: (data: { password: string }) => void;
};
