export type ProfileData = {
  name: string | null;
  lastname: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  profile_completed_at: string | null;
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

// Estos dos modales son obligatorios: no se pueden cerrar hasta completar el perfil.
// La única salida es cerrar sesión.
export type CompleteProfilePromptModalProps = Pick<
  Props,
  "open" | "onGoToComplete"
> & {
  onLogout: () => void;
};

export type CompleteProfileModalProps = Pick<Props, "open" | "user"> & {
  onCompleted: (user: AuthUser) => void;
  onLogout: () => void;
};

export type EditProfileModalProps = Pick<Props, "open" | "onClose"> & { user?: AuthUser };

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
