export interface Censo {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  year?: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  status?: string;
  percentage?: number;
  total_expected?: number;
  total_completed?: number;
}

export interface CreateCensoDTO {
  name: string;
  description?: string;
  init_date?: string;
  deadline?: string;
}

export type UpdateCensoDTO = Partial<CreateCensoDTO>;

export interface MetaLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface Meta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  links: MetaLink[];
  path: string;
  to: number;
}

export interface PaginatedCensosResponse {
  data: Censo[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface ExcelFailure {
  row: number;
  field: string;
  errors: string[];
  invalid_value: any;
}

export interface BulkErrorModalProps {
  isOpen: boolean;
  errors: ExcelFailure[];
  onClose: () => void;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonColor?: "danger" | "primary";
  onClose: () => void;
  onConfirm: () => void;
}

export interface FormErrorsProps {
  errors: string[];
}

export interface CensoModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export interface CensosTableProps {
  Censos: Censo[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Censo) => void;
  onView: (Censo: Censo) => void;
  onEdit: (Censo: Censo) => void;
  onBan: (Censo: Censo) => void;
  onRestore: (Censo: Censo) => void;
  onDelete: (Censo: Censo) => void;
}

export interface ViewCensoModalProps {
  isOpen: boolean;
  onClose: () => void;
  Censo: Censo | null;
}

/* =========================
   MODULES + INDEXES
========================= */

export interface Index {
  original_id: string;
  id: string | number;
  name: string;
}

export interface Module {
  id: string | number;
  name: string;
}

export interface IndexForCenso {
  id: number;
  index_id: number;
  reference_id: number;
  reference_type: string;

  index?: Index;
  reference?: Module;
}

export interface ModuleForCensoShowResponse {
  censo: { id: string; name: string };
  indexes: Index[];
  modules: Module[];
  indexForCensos?: IndexForCenso[];
}

export interface ModuleForCensoRequest {
  items: Array<{
    module_id: string;
    index_id: string;
  }>;
}

/* =========================
   CENSUS VIEW (getCensus endpoint)
========================= */

export interface CensusViewModuleRef {
  id: string;
  index: string;
  name: string;
}

export interface CensusViewSectionRef {
  id: string;
  index: string;
  name: string;
}

export interface CensusViewQuestionRef {
  id: string;
  index: string;
  name: string;
}

export interface CensusViewQuestionItem {
  question: CensusViewQuestionRef;
}

export interface CensusViewSectionItem {
  section: CensusViewSectionRef;
  census_questions: CensusViewQuestionItem[];
}

/** Sección con sus subsecciones anidadas, derivadas de la profundidad del índice. */
export interface CensusSectionNode extends CensusViewSectionItem {
  depth: number;
  children: CensusSectionNode[];
}

export interface CensusViewModuleItem {
  module: CensusViewModuleRef;
  census_sections: CensusViewSectionItem[];
}

export interface GetCensusResponse {
  census_modules: CensusViewModuleItem[];
}

/* =========================
   CENSUS QUERY (filter rubric)
========================= */

export interface FilterSelectorItem {
  id: string;
  name: string;
}

export interface FilterIndicator {
  id: string;
  name: string;
}

export interface GetCensusFiltersResponse {
  modules: FilterSelectorItem[];
  indicators: FilterIndicator[];
}

export interface CensusQuerySection {
  id: string;
  name: string;
  index: string;
}

export interface CensusQueryFilters {
  census_id: string;
  module_id: string;
  indicator_id?: string;
  required_attention?: boolean;
  search?: string;
}

export interface CensusQueryResponse {
  sections: CensusQuerySection[];
}
