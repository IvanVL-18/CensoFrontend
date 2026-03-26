import type { AuthProfile, AuthUser } from "../../context/AuthContext";

export type ProfileData = AuthProfile;
export type { AuthUser };

export type CompleteProfilePromptModalProps = {
  open: boolean;
  onClose: () => void;
  onGoToComplete: () => void;
};

export type CompleteProfileModalProps = {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  onCompleted: (user: AuthUser) => void;
};

export type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
};

export type ProfileFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
};

export type ProfileFormProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  className?: string;
};
