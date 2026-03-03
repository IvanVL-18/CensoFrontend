export type ProfileData = {
  name: string;
  lastname: string;
  phone: string;
  mobile: string;
  address: string;
};

export type AuthUser = {
  email: string;
  profile: ProfileData;
};

export type Props = {
  // Inputs
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;

  // Modales
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  onGoToComplete: () => void;
};

export type CompleteProfilePromptModalProps = Pick<
  Props,
  "open" | "onClose" | "onGoToComplete"
>;

export type CompleteProfileModalProps = Pick<Props, "open" | "onClose" | "user">;

export type EditProfileModalProps = Pick<Props, "open" | "onClose" | "user">;

export type ProfileFieldProps = Pick<
  Props,
  "label" | "value" | "onChange" | "placeholder" | "maxLength" | "className"
>;

export type ProfileFormProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  className?: string;
};