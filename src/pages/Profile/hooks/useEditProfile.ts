import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import {
  getProfile,
  updateProfile,
  getCatalogList,
  type FullProfile,
  type UpdateProfileData,
} from "../Profile.service";
import { profileSchema, passwordChangeSchema } from "../schemas/Profile.schema";

export type CatalogItem = { id: string | number; name: string };

type PersonalDraft = {
  name: string;
  lastname: string;
  phone: string;
  mobile: string;
  address: string;
};
type AccountDraft = {
  occupation_id: string;
  dependency_id: string;
  census_id: string;
};
type PasswordDraft = { password: string; password_confirmation: string };
type ToastState = {
  message: string;
  type: "success" | "danger" | "warning";
} | null;

export function useEditProfile(open: boolean) {
  const { user: authUser } = useAuthContext();
  const canAlwaysEdit =
    authUser?.role === "Admin" || authUser?.role === "Super Admin";
  const isSurveyor = authUser?.role === "Surveyed";

  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [draft, setDraft] = useState<PersonalDraft>({
    name: "",
    lastname: "",
    phone: "",
    mobile: "",
    address: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof PersonalDraft, boolean>>
  >({});
  const [allDraftErrors, setAllDraftErrors] = useState<
    Partial<Record<keyof PersonalDraft, string>>
  >({});
  const [accountDraft, setAccountDraft] = useState<AccountDraft>({
    occupation_id: "",
    dependency_id: "",
    census_id: "",
  });
  const [originalAccountDraft, setOriginalAccountDraft] =
    useState<AccountDraft>({
      occupation_id: "",
      dependency_id: "",
      census_id: "",
    });
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>({
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [catalogs, setCatalogs] = useState<{
    occupations: CatalogItem[];
    dependencies: CatalogItem[];
    censuses: CatalogItem[];
  }>({ occupations: [], dependencies: [], censuses: [] });
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const isIncomplete =
    !profile?.name?.trim() ||
    !profile?.lastname?.trim() ||
    !profile?.address?.trim();
  const isEditable = isIncomplete || canAlwaysEdit;

  // Validación completa en background (siempre corre, para saber si el draft es válido)
  useEffect(() => {
    if (!isEditable) return;
    const result = profileSchema.safeParse(draft);
    if (result.success) {
      setAllDraftErrors({});
    } else {
      const errors: Partial<Record<keyof PersonalDraft, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PersonalDraft;
        if (!errors[field]) errors[field] = issue.message;
      }
      setAllDraftErrors(errors);
    }
  }, [draft, isEditable]);

  // Solo se muestran errores de campos que el usuario ya tocó (no al abrir la ventana)
  const draftErrors = useMemo(() => {
    const visible: Partial<Record<keyof PersonalDraft, string>> = {};
    for (const key of Object.keys(allDraftErrors) as (keyof PersonalDraft)[]) {
      if (touched[key]) visible[key] = allDraftErrors[key];
    }
    return visible;
  }, [allDraftErrors, touched]);

  useEffect(() => {
    if (!open) return;
    setLoadError(null);
    setToast(null);
    setTouched({});
    setAllDraftErrors({});
    setLoading(true);

    getProfile()
      .then((p) => {
        setProfile(p);
        setDraft({
          name: p.name ?? "",
          lastname: p.lastname ?? "",
          phone: p.phone ?? "",
          mobile: p.mobile ?? "",
          address: p.address ?? "",
        });
      })
      .catch((err) => {
        setLoadError(err?.message ?? "Error al cargar el perfil.");
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !canAlwaysEdit) return;
    const controller = new AbortController();
    setLoadingCatalogs(true);
    Promise.all([
      getCatalogList("occupations/data/list", controller.signal),
      getCatalogList("dependency/data/list", controller.signal),
      getCatalogList("censuses/active/content", controller.signal),
    ])
      .then(
        ([occsData, depsData, censusesData]: [
          CatalogItem[],
          CatalogItem[],
          CatalogItem[] | { censuses?: CatalogItem[] },
        ]) => {
          const censusItems = Array.isArray(censusesData)
            ? censusesData
            : (censusesData?.censuses ?? []);
          setCatalogs({
            occupations: occsData,
            dependencies: depsData,
            censuses: censusItems,
          });
        },
      )
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCatalogs(false);
      });
    return () => controller.abort();
  }, [open, canAlwaysEdit]);

  useEffect(() => {
    if (!open || !isSurveyor) return;
    const controller = new AbortController();
    getCatalogList("answers/my-censuses", controller.signal)
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : ((data as any)?.censuses ?? []);
        setCatalogs((prev) => ({ ...prev, censuses: items }));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open, isSurveyor]);

  useEffect(() => {
    if (!profile || !canAlwaysEdit) return;

    const findId = (
      catalog: CatalogItem[],
      relation: { id: string | number; name: string } | null | undefined,
    ): string => {
      if (!relation) return "";
      const byId = catalog.find(
        (item) => String(item.id) === String(relation.id),
      );
      if (byId) return String(byId.id);
      const byName = catalog.find(
        (item) =>
          item.name.trim().toLowerCase() === relation.name.trim().toLowerCase(),
      );
      return byName ? String(byName.id) : "";
    };

    const initial = {
      occupation_id: findId(catalogs.occupations, profile.occupation),
      dependency_id: findId(catalogs.dependencies, profile.dependency),
      census_id: findId(catalogs.censuses, profile.census),
    };
    setAccountDraft(initial);
    setOriginalAccountDraft(initial);
  }, [profile, catalogs]);

  const passwordValidation = useMemo(() => {
    const { password, password_confirmation } = passwordDraft;
    if (!password) return null;
    const result = passwordChangeSchema.safeParse({
      password,
      password_confirmation,
    });
    if (result.success) return [];
    return result.error.issues
      .filter(
        (e) =>
          !(e.path[0] === "password_confirmation" && !password_confirmation),
      )
      .map((e) => e.message);
  }, [passwordDraft]);

  const hasDraftErrors = Object.keys(draftErrors).length > 0;

  const hasChanges = useMemo(() => {
    const personalChanged =
      draft.name !== (profile?.name ?? "") ||
      draft.lastname !== (profile?.lastname ?? "") ||
      draft.phone !== (profile?.phone ?? "") ||
      draft.mobile !== (profile?.mobile ?? "") ||
      draft.address !== (profile?.address ?? "");
    const passwordChanged = !!passwordDraft.password;
    if (!canAlwaysEdit) return personalChanged || passwordChanged;
    const accountChanged =
      accountDraft.occupation_id !== originalAccountDraft.occupation_id ||
      accountDraft.dependency_id !== originalAccountDraft.dependency_id ||
      accountDraft.census_id !== originalAccountDraft.census_id;
    return personalChanged || accountChanged || passwordChanged;
  }, [
    draft,
    profile,
    accountDraft,
    originalAccountDraft,
    canAlwaysEdit,
    passwordDraft,
  ]);

  const handleSave = async () => {
    if (hasDraftErrors) {
      setToast({
        message:
          "Corrige los errores en los datos personales antes de guardar.",
        type: "warning",
      });
      return;
    }
    if (
      passwordDraft.password &&
      passwordValidation &&
      passwordValidation.length > 0
    ) {
      setToast({
        message: "Corrige los errores en la contraseña antes de guardar.",
        type: "warning",
      });
      return;
    }

    // Payload como diff real: solo se incluyen los campos que cambiaron
    const payload: UpdateProfileData = {};

    if (draft.name !== (profile?.name ?? "")) {
      payload.name = draft.name || null;
    }
    if (draft.lastname !== (profile?.lastname ?? "")) {
      payload.lastname = draft.lastname || null;
    }
    if (draft.address !== (profile?.address ?? "")) {
      payload.address = draft.address || null;
    }
    if (draft.phone !== (profile?.phone ?? "")) {
      payload.phone = draft.phone || null;
    }
    if (draft.mobile !== (profile?.mobile ?? "")) {
      payload.mobile = draft.mobile || null;
    }

    if (canAlwaysEdit) {
      if (accountDraft.occupation_id !== originalAccountDraft.occupation_id) {
        payload.occupation_id = accountDraft.occupation_id || null;
      }
      if (accountDraft.dependency_id !== originalAccountDraft.dependency_id) {
        payload.dependency_id = accountDraft.dependency_id || null;
      }
      if (accountDraft.census_id !== originalAccountDraft.census_id) {
        payload.census_id = accountDraft.census_id || null;
      }
    }

    if (passwordDraft.password) {
      payload.password = passwordDraft.password;
      payload.password_confirmation = passwordDraft.password_confirmation;
    }

    // Nada que enviar: no dispares el PATCH
    if (Object.keys(payload).length === 0) return;

    setSubmitting(true);
    try {
      const res = await updateProfile(payload);
      setPasswordDraft({ password: "", password_confirmation: "" });
      setShowPassword(false);
      setShowConfirm(false);
      setToast({
        message: res.message ?? "Perfil actualizado correctamente.",
        type: "success",
      });
      if (canAlwaysEdit) {
        setOriginalAccountDraft(accountDraft);
      }
    } catch (err: any) {
      setToast({
        message: err?.message ?? "Error al guardar los cambios.",
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    canAlwaysEdit,
    isSurveyor,
    isIncomplete,
    isEditable,

    profile,
    loading,
    loadError,
    submitting,
    toast,
    dismissToast: () => setToast(null),

    draft,
    setDraftField: <K extends keyof PersonalDraft>(
      field: K,
      value: PersonalDraft[K],
    ) => {
      setDraft((s) => ({ ...s, [field]: value }));
      setTouched((s) => ({ ...s, [field]: true }));
    },
    draftErrors,

    accountDraft,
    setAccountDraftField: <K extends keyof AccountDraft>(
      field: K,
      value: AccountDraft[K],
    ) => setAccountDraft((s) => ({ ...s, [field]: value })),

    catalogs,
    loadingCatalogs,

    passwordDraft,
    setPasswordField: <K extends keyof PasswordDraft>(
      field: K,
      value: PasswordDraft[K],
    ) => setPasswordDraft((s) => ({ ...s, [field]: value })),
    passwordValidation,
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
    showConfirm,
    toggleShowConfirm: () => setShowConfirm((s) => !s),

    hasChanges,
    hasDraftErrors,
    handleSave,
  };
}
