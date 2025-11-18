interface InstitutionData {
  name: string;
  municipality: string;
  geocode: string;
  typeinst: string;
}

export const validateInstitution = (data: InstitutionData): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("El nombre de la institución es obligatorio.");
  }

  if (!data.municipality.trim()) {
    errors.push("La municipalidad es obligatoria.");
  }

  if (!data.geocode.trim()) {
    errors.push("El código postal / geocódigo es obligatorio.");
  } else if (!/^\d+$/.test(data.geocode)) {
    errors.push("El geocódigo solo debe contener números.");
  }

  if (!data.typeinst.trim()) {
    errors.push("El tipo de institución es obligatorio.");
  }

  return errors;
};