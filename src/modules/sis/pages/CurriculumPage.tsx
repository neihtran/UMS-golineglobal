import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Users, Calendar, Briefcase, GraduationCap, BookMarked, Library, GitBranch, RotateCcw } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  ConfirmModal,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import {
  useHqnhatCurriculums,
  useCreateHqnhatCurriculum,
  useUpdateHqnhatCurriculum,
  useDeleteHqnhatCurriculum,
  useHqnhatMajors,
  useHqnhatMajor,
  useCreateHqnhatMajor,
  useUpdateHqnhatMajor,
  useDeleteHqnhatMajor,
  useHqnhatTrainingSystems,
  useHqnhatTrainingSystem,
  useCreateHqnhatTrainingSystem,
  useUpdateHqnhatTrainingSystem,
  useDeleteHqnhatTrainingSystem,
  useHqnhatSpecializations,
  useHqnhatSpecialization,
  useCreateHqnhatSpecialization,
  useUpdateHqnhatSpecialization,
  useDeleteHqnhatSpecialization,
  useHqnhatAcademicTerms,
  useHqnhatAcademicTerm,
  useCreateHqnhatAcademicTerm,
  useUpdateHqnhatAcademicTerm,
  useDeleteHqnhatAcademicTerm,
  useHqnhatCurriculum,
  useHqnhatCourses,
  useHqnhatCourse,
  useCreateHqnhatCourse,
  useUpdateHqnhatCourse,
  useDeleteHqnhatCourse,
  useHqnhatSubjectTypes,
  useCreateHqnhatSubjectType,
  useUpdateHqnhatSubjectType,
  useDeleteHqnhatSubjectType,
  useHqnhatSubjects,
  useHqnhatSubject,
  useCreateHqnhatSubject,
  useUpdateHqnhatSubject,
  useDeleteHqnhatSubject,
  useHqnhatCurriculumSubjects,
  useCreateHqnhatCurriculumSubject,
  useUpdateHqnhatCurriculumSubject,
  useDeleteHqnhatCurriculumSubject,
  useHqnhatSubjectPrerequisites,
  useCreateHqnhatSubjectPrerequisite,
  useUpdateHqnhatSubjectPrerequisite,
  useDeleteHqnhatSubjectPrerequisite,
} from '@/hooks/useHqnhat';
import type {
  HqnhatCurriculum, HqnhatCurriculumCreatePayload,
  HqnhatMajor, HqnhatMajorCreatePayload,
  HqnhatTrainingSystem, HqnhatTrainingSystemCreatePayload,
  HqnhatSpecialization, HqnhatSpecializationCreatePayload,
  HqnhatAcademicTerm, HqnhatAcademicTermCreatePayload,
  HqnhatCourse, HqnhatCourseCreatePayload,
  HqnhatSubjectType, HqnhatSubjectTypeCreatePayload,
  HqnhatSubject, HqnhatSubjectCreatePayload,
  HqnhatCurriculumSubject, HqnhatCurriculumSubjectCreatePayload, HqnhatCurriculumSubjectUpdatePayload,
  HqnhatSubjectPrerequisite, HqnhatSubjectPrerequisiteCreatePayload,
} from '@/types/hqnhat.types';

type TabType = 'ctdt' | 'nganh' | 'he' | 'chuyen-nganh' | 'hoc-ky' | 'khoa-hoc' | 'mon-hoc' | 'mon-trong-ctdt' | 'tien-quyet';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'ctdt', label: 'CTĐT', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'nganh', label: 'Ngành học', icon: <Users className="h-4 w-4" /> },
  { id: 'he', label: 'Hệ đào tạo', icon: <Calendar className="h-4 w-4" /> },
  { id: 'chuyen-nganh', label: 'Chuyên ngành', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'hoc-ky', label: 'Học kỳ', icon: <Calendar className="h-4 w-4" /> },
  { id: 'khoa-hoc', label: 'Khóa học', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'mon-hoc', label: 'Môn học', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'mon-trong-ctdt', label: 'Môn trong CTĐT', icon: <Library className="h-4 w-4" /> },
  { id: 'tien-quyet', label: 'Tiên quyết', icon: <GitBranch className="h-4 w-4" /> },
];

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'error' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

const AT_STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  0: { label: 'Lập kế hoạch', variant: 'neutral' },
  1: { label: 'Mở đăng ký', variant: 'info' },
  2: { label: 'Đang học', variant: 'success' },
  3: { label: 'Đã kết thúc', variant: 'warning' },
};

const SEMESTER_LABELS: Record<number, string> = { 1: 'HK1', 2: 'HK2', 3: 'HK Hè' };

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const emptyCTDT = (): HqnhatCurriculumCreatePayload => ({
  code: '', name: '', major_id: 0, training_system_id: 0, course_id: 0,
  total_credit: 0, elective_credit: 0, description: '', status: 1,
});

const emptyMajor = (): HqnhatMajorCreatePayload => ({
  code: '', name: '', department_id: 1, degree_level: 1, description: '', status: 1,
});

const emptyTS = (): HqnhatTrainingSystemCreatePayload => ({
  code: '', name: '', description: '', status: 1,
});

const emptySpec = (): HqnhatSpecializationCreatePayload => ({
  code: '', name: '', major_id: 0, description: '', status: 1,
});

const emptyAT = (): HqnhatAcademicTermCreatePayload => ({
  code: '', academic_year: '', semester: 1, start_date: '', end_date: '',
  registration_start: '', registration_end: '', status: 0,
});

const emptyCourse = (): HqnhatCourseCreatePayload => ({
  code: '', name: '', start_year: new Date().getFullYear(), end_year: new Date().getFullYear() + 4,
  description: '', status: 1,
});

const emptyST = (): HqnhatSubjectTypeCreatePayload => ({
  code: '', name: '', description: '', status: 1,
});

const emptySubject = (): HqnhatSubjectCreatePayload => ({
  code: '', name: '', subject_type_id: 0, credit: 3,
  theory_hours: 30, practice_hours: 15, lab_hours: 0,
  description: '', status: 1,
});

const emptyCS = (): HqnhatCurriculumSubjectCreatePayload => ({
  curriculum_id: 0, subject_id: 0,
  semester: null, year_no: null, display_order: null,
  is_capstone: false, is_internship: false, is_required: true,
  elective_group: null,
});

const emptySP = (): HqnhatSubjectPrerequisiteCreatePayload => ({
  subject_id: 0, prerequisite_subject_id: 0, type: 1,
});

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ctdt');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  // CTDT State
  const [ctdtSearch, setCtdtSearch] = useState('');
  const [ctdtStatus, setCtdtStatus] = useState('');
  const [ctdtModalOpen, setCtdtModalOpen] = useState(false);
  const [ctdtEditing, setCtdtEditing] = useState<HqnhatCurriculum | null>(null);
  const [ctdtDeleteOpen, setCtdtDeleteOpen] = useState(false);
  const [ctdtDeleting, setCtdtDeleting] = useState<HqnhatCurriculum | null>(null);
  const [ctdtDetailOpen, setCtdtDetailOpen] = useState(false);
  const [ctdtDetailId, setCtdtDetailId] = useState<number | null>(null);
  const [ctdtForm, setCtdtForm] = useState<HqnhatCurriculumCreatePayload>(emptyCTDT());
  const [ctdtErrors, setCtdtErrors] = useState<Record<string, string>>({});
  const [ctdtSubmitError, setCtdtSubmitError] = useState<string | null>(null);

  // Major State
  const [majorSearch, setMajorSearch] = useState('');
  const [majorStatus, setMajorStatus] = useState('');
  const [majorDegree, setMajorDegree] = useState('');
  const [majorModalOpen, setMajorModalOpen] = useState(false);
  const [majorEditing, setMajorEditing] = useState<HqnhatMajor | null>(null);
  const [majorDeleteOpen, setMajorDeleteOpen] = useState(false);
  const [majorDeleting, setMajorDeleting] = useState<HqnhatMajor | null>(null);
  const [majorDetailOpen, setMajorDetailOpen] = useState(false);
  const [majorDetailId, setMajorDetailId] = useState<number | null>(null);
  const [majorForm, setMajorForm] = useState<HqnhatMajorCreatePayload>(emptyMajor());
  const [majorErrors, setMajorErrors] = useState<Record<string, string>>({});
  const [majorSubmitError, setMajorSubmitError] = useState<string | null>(null);

  // Training System State
  const [tsSearch, setTsSearch] = useState('');
  const [tsStatus, setTsStatus] = useState('');
  const [tsModalOpen, setTsModalOpen] = useState(false);
  const [tsEditing, setTsEditing] = useState<HqnhatTrainingSystem | null>(null);
  const [tsDeleteOpen, setTsDeleteOpen] = useState(false);
  const [tsDeleting, setTsDeleting] = useState<HqnhatTrainingSystem | null>(null);
  const [tsDetailOpen, setTsDetailOpen] = useState(false);
  const [tsDetailId, setTsDetailId] = useState<number | null>(null);
  const [tsForm, setTsForm] = useState<HqnhatTrainingSystemCreatePayload>(emptyTS());
  const [tsErrors, setTsErrors] = useState<Record<string, string>>({});
  const [tsSubmitError, setTsSubmitError] = useState<string | null>(null);

  // Specialization State
  const [specSearch, setSpecSearch] = useState('');
  const [specStatus, setSpecStatus] = useState('');
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specEditing, setSpecEditing] = useState<HqnhatSpecialization | null>(null);
  const [specDeleteOpen, setSpecDeleteOpen] = useState(false);
  const [specDeleting, setSpecDeleting] = useState<HqnhatSpecialization | null>(null);
  const [specDetailOpen, setSpecDetailOpen] = useState(false);
  const [specDetailId, setSpecDetailId] = useState<number | null>(null);
  const [specForm, setSpecForm] = useState<HqnhatSpecializationCreatePayload>(emptySpec());
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});
  const [specSubmitError, setSpecSubmitError] = useState<string | null>(null);

  // Academic Term State
  const [atSearch, setAtSearch] = useState('');
  const [atStatus, setAtStatus] = useState('');
  const [atSemester, setAtSemester] = useState('');
  const [atModalOpen, setAtModalOpen] = useState(false);
  const [atEditing, setAtEditing] = useState<HqnhatAcademicTerm | null>(null);
  const [atDeleteOpen, setAtDeleteOpen] = useState(false);
  const [atDeleting, setAtDeleting] = useState<HqnhatAcademicTerm | null>(null);
  const [atDetailOpen, setAtDetailOpen] = useState(false);
  const [atDetailId, setAtDetailId] = useState<number | null>(null);
  const [atForm, setAtForm] = useState<HqnhatAcademicTermCreatePayload>(emptyAT());
  const [atErrors, setAtErrors] = useState<Record<string, string>>({});
  const [atSubmitError, setAtSubmitError] = useState<string | null>(null);

  // Course State
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatus, setCourseStatus] = useState('');
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseEditing, setCourseEditing] = useState<HqnhatCourse | null>(null);
  const [courseDeleteOpen, setCourseDeleteOpen] = useState(false);
  const [courseDeleting, setCourseDeleting] = useState<HqnhatCourse | null>(null);
  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [courseDetailId, setCourseDetailId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<HqnhatCourseCreatePayload>(emptyCourse());
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});
  const [courseSubmitError, setCourseSubmitError] = useState<string | null>(null);

  // Subject Type State
  const [stSearch, setStSearch] = useState('');
  const [stStatus, setStStatus] = useState('');
  const [stModalOpen, setStModalOpen] = useState(false);
  const [stEditing, setStEditing] = useState<HqnhatSubjectType | null>(null);
  const [stDeleteOpen, setStDeleteOpen] = useState(false);
  const [stDeleting, setStDeleting] = useState<HqnhatSubjectType | null>(null);
  const [stForm, setStForm] = useState<HqnhatSubjectTypeCreatePayload>(emptyST());
  const [stErrors, setStErrors] = useState<Record<string, string>>({});
  const [stSubmitError, setStSubmitError] = useState<string | null>(null);

  // Subject State
  const [subjSearch, setSubjSearch] = useState('');
  const [subjStatus, setSubjStatus] = useState('');
  const [subjModalOpen, setSubjModalOpen] = useState(false);
  const [subjEditing, setSubjEditing] = useState<HqnhatSubject | null>(null);
  const [subjDeleteOpen, setSubjDeleteOpen] = useState(false);
  const [subjDeleting, setSubjDeleting] = useState<HqnhatSubject | null>(null);
  const [subjDetailOpen, setSubjDetailOpen] = useState(false);
  const [subjDetailId, setSubjDetailId] = useState<number | null>(null);
  const [subjForm, setSubjForm] = useState<HqnhatSubjectCreatePayload>(emptySubject());
  const [subjErrors, setSubjErrors] = useState<Record<string, string>>({});
  const [subjSubmitError, setSubjSubmitError] = useState<string | null>(null);

  // Curriculum Subject State
  const [csSearch, setCsSearch] = useState('');
  const [csCurriculumFilter, setCsCurriculumFilter] = useState('');
  const [csSubjectFilter, setCsSubjectFilter] = useState('');
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [csEditing, setCsEditing] = useState<HqnhatCurriculumSubject | null>(null);
  const [csDeleteOpen, setCsDeleteOpen] = useState(false);
  const [csDeleting, setCsDeleting] = useState<HqnhatCurriculumSubject | null>(null);
  const [csDetailOpen, setCsDetailOpen] = useState(false);
  const [csDetailItem, setCsDetailItem] = useState<HqnhatCurriculumSubject | null>(null);
  const [csForm, setCsForm] = useState<HqnhatCurriculumSubjectCreatePayload>(emptyCS());
  const [csErrors, setCsErrors] = useState<Record<string, string>>({});
  const [csSubmitError, setCsSubmitError] = useState<string | null>(null);

  // Subject Prerequisite State
  const [spSearch, setSpSearch] = useState('');
  const [spSubjectFilter, setSpSubjectFilter] = useState('');
  const [spTypeFilter, setSpTypeFilter] = useState('');
  const [spModalOpen, setSpModalOpen] = useState(false);
  const [spDeleteOpen, setSpDeleteOpen] = useState(false);
  const [spDeleting, setSpDeleting] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [spForm, setSpForm] = useState<HqnhatSubjectPrerequisiteCreatePayload>(emptySP());
  const [spErrors, setSpErrors] = useState<Record<string, string>>({});
  const [spSubmitError, setSpSubmitError] = useState<string | null>(null);
  const [spDetailItem, setSpDetailItem] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [spDetailOpen, setSpDetailOpen] = useState(false);
  const [spEditing, setSpEditing] = useState<HqnhatSubjectPrerequisite | null>(null);

  // CTDT Hooks
  const ctdtParams = { page, per_page: pageSize, code: ctdtSearch || undefined, name: ctdtSearch || undefined, status: ctdtStatus ? Number(ctdtStatus) as 0 | 1 : undefined };
  const { data: ctdtData, isLoading: ctdtLoading, isFetching: ctdtFetching } = useHqnhatCurriculums(ctdtParams);
  const { data: ctdtDetailData, isLoading: ctdtDetailLoading } = useHqnhatCurriculum(ctdtDetailId ?? undefined);
  const { data: majorsData } = useHqnhatMajors(
    { page: 1, per_page: 100 },
    { staleTime: 0, gcTime: 5 * 60 * 1000 }
  );
  const { data: trainingSystemsData } = useHqnhatTrainingSystems(
    { page: 1, per_page: 100 },
    { staleTime: 0, gcTime: 5 * 60 * 1000 }
  );
  const ctdtCreateMut = useCreateHqnhatCurriculum();
  const ctdtUpdateMut = useUpdateHqnhatCurriculum();
  const ctdtDeleteMut = useDeleteHqnhatCurriculum();

  // Major Hooks
  const majorParams = { page, per_page: pageSize, code: majorSearch || undefined, name: majorSearch || undefined, status: majorStatus ? Number(majorStatus) as 1 | 2 | 3 | 4 : undefined, degree_level: majorDegree ? Number(majorDegree) as 1 | 2 | 3 : undefined };
  const { data: majorData, isLoading: majorLoading, isFetching: majorFetching } = useHqnhatMajors(majorParams);
  const { data: majorDetailData, isLoading: majorDetailLoading } = useHqnhatMajor(majorDetailId ?? undefined);
  const majorCreateMut = useCreateHqnhatMajor();
  const majorUpdateMut = useUpdateHqnhatMajor();
  const majorDeleteMut = useDeleteHqnhatMajor();

  // Training System Hooks
  const tsParams = { page, per_page: pageSize, code: tsSearch || undefined, name: tsSearch || undefined, status: tsStatus ? Number(tsStatus) as 0 | 1 : undefined };
  const { data: tsData, isLoading: tsLoading, isFetching: tsFetching } = useHqnhatTrainingSystems(tsParams);
  const { data: tsDetailData, isLoading: tsDetailLoading } = useHqnhatTrainingSystem(tsDetailId ?? undefined);
  const tsCreateMut = useCreateHqnhatTrainingSystem();
  const tsUpdateMut = useUpdateHqnhatTrainingSystem();
  const tsDeleteMut = useDeleteHqnhatTrainingSystem();

  // Specialization Hooks
  const specParams = { page, per_page: pageSize, code: specSearch || undefined, name: specSearch || undefined, status: specStatus ? Number(specStatus) as 0 | 1 : undefined };
  const { data: specData, isLoading: specLoading, isFetching: specFetching } = useHqnhatSpecializations(specParams);
  const { data: specDetailData, isLoading: specDetailLoading } = useHqnhatSpecialization(specDetailId ?? undefined);
  const specCreateMut = useCreateHqnhatSpecialization();
  const specUpdateMut = useUpdateHqnhatSpecialization();
  const specDeleteMut = useDeleteHqnhatSpecialization();

  // Academic Term Hooks
  const atParams = { page, per_page: pageSize, code: atSearch || undefined, status: atStatus ? Number(atStatus) as 0 | 1 | 2 | 3 : undefined, semester: atSemester ? Number(atSemester) : undefined };
  const { data: atData, isLoading: atLoading, isFetching: atFetching } = useHqnhatAcademicTerms(atParams);
  const { data: atDetailData, isLoading: atDetailLoading } = useHqnhatAcademicTerm(atDetailId ?? undefined);
  const atCreateMut = useCreateHqnhatAcademicTerm();
  const atUpdateMut = useUpdateHqnhatAcademicTerm();
  const atDeleteMut = useDeleteHqnhatAcademicTerm();

  // Course Hooks
  const courseParams = { page, per_page: pageSize, code: courseSearch || undefined, name: courseSearch || undefined, status: courseStatus ? Number(courseStatus) as 0 | 1 : undefined };
  const { data: courseData, isLoading: courseLoading, isFetching: courseFetching } = useHqnhatCourses(courseParams, { staleTime: 0, gcTime: 5 * 60 * 1000 });
  const { data: courseDetailData, isLoading: courseDetailLoading } = useHqnhatCourse(courseDetailId ?? undefined);
  const courseCreateMut = useCreateHqnhatCourse();
  const courseUpdateMut = useUpdateHqnhatCourse();
  const courseDeleteMut = useDeleteHqnhatCourse();

  // Subject Type Hooks
  const stParams = { page, per_page: pageSize, code: stSearch || undefined, name: stSearch || undefined, status: stStatus ? Number(stStatus) as 0 | 1 : undefined };
  const { data: stData, isLoading: stLoading, isFetching: stFetching } = useHqnhatSubjectTypes(stParams, { staleTime: 0, gcTime: 5 * 60 * 1000 });
  const stCreateMut = useCreateHqnhatSubjectType();
  const stUpdateMut = useUpdateHqnhatSubjectType();
  const stDeleteMut = useDeleteHqnhatSubjectType();

  // Subject Hooks
  const subjParams = { page, per_page: pageSize, code: subjSearch || undefined, name: subjSearch || undefined, status: subjStatus ? Number(subjStatus) as 0 | 1 : undefined };
  const { data: subjData, isLoading: subjLoading, isFetching: subjFetching } = useHqnhatSubjects(subjParams, { staleTime: 0, gcTime: 5 * 60 * 1000 });
  const { data: subjDetailData, isLoading: subjDetailLoading } = useHqnhatSubject(subjDetailId ?? undefined);
  const subjCreateMut = useCreateHqnhatSubject();
  const subjUpdateMut = useUpdateHqnhatSubject();
  const subjDeleteMut = useDeleteHqnhatSubject();

  // Curriculum Subject Hooks
  const csParams = { page, per_page: pageSize, curriculum_id: csCurriculumFilter ? Number(csCurriculumFilter) : undefined, subject_id: csSubjectFilter ? Number(csSubjectFilter) : undefined };
  const { data: csData, isLoading: csLoading, isFetching: csFetching } = useHqnhatCurriculumSubjects(csParams);
  const csCreateMut = useCreateHqnhatCurriculumSubject();
  const csUpdateMut = useUpdateHqnhatCurriculumSubject();
  const csDeleteMut = useDeleteHqnhatCurriculumSubject();

  // Subject Prerequisite Hooks
  const spParams = { page, per_page: pageSize, subject_id: spSubjectFilter ? Number(spSubjectFilter) : undefined, type: spTypeFilter ? Number(spTypeFilter) as 1 | 2 : undefined };
  const { data: spData, isLoading: spLoading, isFetching: spFetching } = useHqnhatSubjectPrerequisites(spParams);
  const spCreateMut = useCreateHqnhatSubjectPrerequisite();
  const spUpdateMut = useUpdateHqnhatSubjectPrerequisite();
  const spDeleteMut = useDeleteHqnhatSubjectPrerequisite();

  // Data
  const ctdtItems = ctdtData?.data ?? [];
  const ctdtMeta = ctdtData?.meta;
  const ctdtTotal = ctdtMeta?.total ?? 0;
  const majors = majorsData?.data ?? [];
  const trainingSystems = trainingSystemsData?.data ?? [];

  const majorItems = majorData?.data ?? [];
  const majorMeta = majorData?.meta ?? { total: 0 };
  const majorTotal = majorMeta?.total ?? 0;

  const tsItems = tsData?.data ?? [];
  const tsMeta = tsData?.meta ?? { total: 0 };
  const tsTotal = tsMeta?.total ?? 0;

  const specItems = specData?.data ?? [];
  const specMeta = specData?.meta ?? { total: 0 };
  const specTotal = specMeta?.total ?? 0;

  const atItems = atData?.data ?? [];
  const atMeta = atData?.meta ?? { total: 0 };
  const atTotal = atMeta?.total ?? 0;

  const courseItems = courseData?.data ?? [];
  const courseMeta = courseData?.meta ?? { total: 0 };
  const courseTotal = courseMeta?.total ?? 0;

  const stItems = stData?.data ?? [];
  const stMeta = stData?.meta ?? { total: 0 };
  const stTotal = stMeta?.total ?? 0;

  const subjItems = subjData?.data ?? [];
  const subjMeta = subjData?.meta ?? { total: 0 };
  const subjTotal = subjMeta?.total ?? 0;

  const csItems = csData?.data ?? [];
  const csMeta = csData?.meta ?? { total: 0 };
  const csTotal = csMeta?.total ?? 0;

  const spItems = spData?.data ?? [];
  const spMeta = spData?.meta ?? { total: 0 };
  const spTotal = spMeta?.total ?? 0;

  // Lookup helpers cho các entity mới
  const getCourseName = (id: number | string) => {
    if (!id) return '—';
    const found = courseItems.find(c => String(c.id) === String(id));
    return found?.name ?? `ID: ${id}`;
  };
  const getSubjectTypeName = (id: number | string) => {
    if (!id) return '—';
    const found = stItems.find(t => String(t.id) === String(id));
    return found?.name ?? `ID: ${id}`;
  };
  const getSubjectName = (id: number | string) => {
    if (!id) return '—';
    const found = subjItems.find(s => String(s.id) === String(id));
    return found?.name ?? `ID: ${id}`;
  };
  const getSubjectCode = (id: number | string) => {
    if (!id) return '—';
    const found = subjItems.find(s => String(s.id) === String(id));
    return found?.code ?? '';
  };
  const getCurriculumName = (id: number | string) => {
    if (!id) return '—';
    const found = ctdtItems.find(c => String(c.id) === String(id));
    return found?.name ?? `ID: ${id}`;
  };

  // CTDT Handlers
  const openCtdtCreate = () => { setCtdtEditing(null); setCtdtForm(emptyCTDT()); setCtdtErrors({}); setCtdtSubmitError(null); setCtdtModalOpen(true); };
  const openCtdtEdit = (item: HqnhatCurriculum) => {
    setCtdtEditing(item); setCtdtForm({ code: item.code, name: item.name, major_id: item.major_id, specialization_id: item.specialization_id, training_system_id: item.training_system_id, course_id: item.course_id, total_credit: item.total_credit, elective_credit: item.elective_credit, description: item.description ?? '', status: item.status as 0 | 1 }); setCtdtErrors({}); setCtdtSubmitError(null); setCtdtModalOpen(true);
  };
  const openCtdtDetail = (item: HqnhatCurriculum) => { setCtdtDetailId(item.id); setCtdtDetailOpen(true); };
  const openCtdtDelete = (item: HqnhatCurriculum) => { setCtdtDeleting(item); setCtdtDeleteOpen(true); };
  const validateCtdt = (): boolean => {
    const e: Record<string, string> = {};
    if (!ctdtForm.code.trim()) e.code = 'Mã CTĐT không được để trống';
    if (!ctdtForm.name.trim()) e.name = 'Tên không được để trống';
    if (!ctdtForm.major_id || ctdtForm.major_id === 0) e.major_id = 'Chọn ngành';
    if (!ctdtForm.training_system_id || ctdtForm.training_system_id === 0) e.training_system_id = 'Chọn hệ đào tạo';
    if (!ctdtForm.course_id) e.course_id = 'Chọn khóa sinh viên';
    if (!ctdtForm.total_credit || ctdtForm.total_credit <= 0) e.total_credit = 'Tổng tín chỉ phải > 0';
    setCtdtErrors(e); return Object.keys(e).length === 0;
  };
  const handleCtdtSubmit = async () => {
    if (!validateCtdt()) return; setCtdtSubmitError(null);
    try { ctdtEditing ? await ctdtUpdateMut.mutateAsync({ id: ctdtEditing.id, payload: ctdtForm }) : await ctdtCreateMut.mutateAsync(ctdtForm); setCtdtModalOpen(false); } catch (err: any) { setCtdtSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleCtdtDelete = async () => { if (!ctdtDeleting) return; try { await ctdtDeleteMut.mutateAsync(ctdtDeleting.id); setCtdtDeleteOpen(false); setCtdtDeleting(null); } catch (e) { void e; } };
  const getMajorName = (id: number | string) => {
    if (id === 0 || id == null || id === '') return '—';
    const found = majors.find(m => String(m.id) === String(id));
    return found?.name ?? `ID: ${id}`;
  };
  const getTrainingSystemName = (id: number | string) => {
    if (id === 0 || id == null || id === '') return '—';
    const found = trainingSystems.find(t => String(t.id) === String(id));
    return found?.name ?? `ID: ${id}`;
  };

  // Major Handlers
  const openMajorCreate = () => { setMajorEditing(null); setMajorForm(emptyMajor()); setMajorErrors({}); setMajorSubmitError(null); setMajorModalOpen(true); };
  const openMajorEdit = (item: HqnhatMajor) => { setMajorEditing(item); setMajorForm({ code: item.code, name: item.name, department_id: item.department_id ?? 1, degree_level: item.degree_level ?? 1, description: item.description ?? '', status: item.status as 0 | 1 }); setMajorErrors({}); setMajorSubmitError(null); setMajorModalOpen(true); };
  const openMajorDetail = (item: HqnhatMajor) => { setMajorDetailId(item.id); setMajorDetailOpen(true); };
  const openMajorDelete = (item: HqnhatMajor) => { setMajorDeleting(item); setMajorDeleteOpen(true); };
  const validateMajor = (): boolean => {
    const e: Record<string, string> = {};
    if (!majorForm.code.trim()) e.code = 'Mã ngành không được để trống';
    if (!majorForm.name.trim()) e.name = 'Tên ngành không được để trống';
    if (!majorForm.degree_level) e.degree_level = 'Chọn bậc đào tạo';
    if (!majorForm.department_id || majorForm.department_id === 0) e.department_id = 'Chọn khoa/phòng';
    if (!majorForm.description.trim()) e.description = 'Mô tả không được để trống';
    setMajorErrors(e); return Object.keys(e).length === 0;
  };
  const handleMajorSubmit = async () => {
    if (!validateMajor()) return; setMajorSubmitError(null);
    try { majorEditing ? await majorUpdateMut.mutateAsync({ id: majorEditing.id, payload: majorForm }) : await majorCreateMut.mutateAsync(majorForm); setMajorModalOpen(false); } catch (err: any) { setMajorSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleMajorDelete = async () => { if (!majorDeleting) return; try { await majorDeleteMut.mutateAsync(majorDeleting.id); setMajorDeleteOpen(false); setMajorDeleting(null); } catch (e) { void e; } };

  // Training System Handlers
  const openTsCreate = () => { setTsEditing(null); setTsForm(emptyTS()); setTsErrors({}); setTsSubmitError(null); setTsModalOpen(true); };
  const openTsEdit = (item: HqnhatTrainingSystem) => { setTsEditing(item); setTsForm({ code: item.code, name: item.name, description: item.description ?? '', status: item.status as 0 | 1 }); setTsErrors({}); setTsSubmitError(null); setTsModalOpen(true); };
  const openTsDetail = (item: HqnhatTrainingSystem) => { setTsDetailId(item.id); setTsDetailOpen(true); };
  const openTsDelete = (item: HqnhatTrainingSystem) => { setTsDeleting(item); setTsDeleteOpen(true); };
  const validateTs = (): boolean => {
    const e: Record<string, string> = {};
    if (!tsForm.code.trim()) e.code = 'Mã hệ không được để trống';
    if (!tsForm.name.trim()) e.name = 'Tên không được để trống';
    setTsErrors(e); return Object.keys(e).length === 0;
  };
  const handleTsSubmit = async () => {
    if (!validateTs()) return; setTsSubmitError(null);
    try { tsEditing ? await tsUpdateMut.mutateAsync({ id: tsEditing.id, payload: tsForm }) : await tsCreateMut.mutateAsync(tsForm); setTsModalOpen(false); } catch (err: any) { setTsSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleTsDelete = async () => { if (!tsDeleting) return; try { await tsDeleteMut.mutateAsync(tsDeleting.id); setTsDeleteOpen(false); setTsDeleting(null); } catch (e) { void e; } };

  // Specialization Handlers
  const openSpecCreate = () => { setSpecEditing(null); setSpecForm(emptySpec()); setSpecErrors({}); setSpecSubmitError(null); setSpecModalOpen(true); };
  const openSpecEdit = (item: HqnhatSpecialization) => { setSpecEditing(item); setSpecForm({ code: item.code, name: item.name, major_id: item.major_id, description: item.description ?? '', status: item.status as 0 | 1 }); setSpecErrors({}); setSpecSubmitError(null); setSpecModalOpen(true); };
  const openSpecDetail = (item: HqnhatSpecialization) => { setSpecDetailId(item.id); setSpecDetailOpen(true); };
  const openSpecDelete = (item: HqnhatSpecialization) => { setSpecDeleting(item); setSpecDeleteOpen(true); };
  const validateSpec = (): boolean => {
    const e: Record<string, string> = {};
    if (!specForm.code.trim()) e.code = 'Mã chuyên ngành không được để trống';
    if (!specForm.name.trim()) e.name = 'Tên không được để trống';
    if (!specForm.major_id || specForm.major_id === 0) e.major_id = 'Chọn ngành';
    if (!specForm.description.trim()) e.description = 'Mô tả không được để trống';
    setSpecErrors(e); return Object.keys(e).length === 0;
  };
  const handleSpecSubmit = async () => {
    if (!validateSpec()) return; setSpecSubmitError(null);
    try { specEditing ? await specUpdateMut.mutateAsync({ id: specEditing.id, payload: specForm }) : await specCreateMut.mutateAsync(specForm); setSpecModalOpen(false); } catch (err: any) { setSpecSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleSpecDelete = async () => { if (!specDeleting) return; try { await specDeleteMut.mutateAsync(specDeleting.id); setSpecDeleteOpen(false); setSpecDeleting(null); } catch (e) { void e; } };

  // Academic Term Handlers
  const openAtCreate = () => { setAtEditing(null); setAtForm(emptyAT()); setAtErrors({}); setAtSubmitError(null); setAtModalOpen(true); };
  const openAtEdit = (item: HqnhatAcademicTerm) => { setAtEditing(item); setAtForm({ code: item.code, academic_year: item.academic_year, semester: item.semester, start_date: item.start_date ?? '', end_date: item.end_date ?? '', registration_start: item.registration_start ?? '', registration_end: item.registration_end ?? '', status: item.status as 0 | 1 | 2 | 3 }); setAtErrors({}); setAtSubmitError(null); setAtModalOpen(true); };
  const openAtDetail = (item: HqnhatAcademicTerm) => { setAtDetailId(item.id); setAtDetailOpen(true); };
  const openAtDelete = (item: HqnhatAcademicTerm) => { setAtDeleting(item); setAtDeleteOpen(true); };
  const validateAt = (): boolean => {
    const e: Record<string, string> = {};
    if (!atForm.code.trim()) e.code = 'Mã học kỳ không được để trống';
    if (!atForm.academic_year.trim()) e.academic_year = 'Năm học không được để trống';
    if (!atForm.semester) e.semester = 'Chọn học kỳ';
    if (!atForm.start_date) e.start_date = 'Chọn ngày bắt đầu';
    if (!atForm.end_date) e.end_date = 'Chọn ngày kết thúc';
    if (!atForm.registration_start) e.registration_start = 'Chọn ngày bắt đầu đăng ký';
    if (!atForm.registration_end) e.registration_end = 'Chọn ngày kết thúc đăng ký';
    setAtErrors(e); return Object.keys(e).length === 0;
  };
  const handleAtSubmit = async () => {
    if (!validateAt()) return; setAtSubmitError(null);
    try { atEditing ? await atUpdateMut.mutateAsync({ id: atEditing.id, payload: atForm }) : await atCreateMut.mutateAsync(atForm); setAtModalOpen(false); } catch (err: any) { setAtSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleAtDelete = async () => { if (!atDeleting) return; try { await atDeleteMut.mutateAsync(atDeleting.id); setAtDeleteOpen(false); setAtDeleting(null); } catch (e) { void e; } };

  // Course Handlers
  const openCourseCreate = () => { setCourseEditing(null); setCourseForm(emptyCourse()); setCourseErrors({}); setCourseSubmitError(null); setCourseModalOpen(true); };
  const openCourseEdit = (item: HqnhatCourse) => { setCourseEditing(item); setCourseForm({ code: item.code, name: item.name, start_year: item.start_year, end_year: item.end_year, description: item.description ?? '', status: item.status as 0 | 1 }); setCourseErrors({}); setCourseSubmitError(null); setCourseModalOpen(true); };
  const openCourseDetail = (item: HqnhatCourse) => { setCourseDetailId(item.id); setCourseDetailOpen(true); };
  const openCourseDelete = (item: HqnhatCourse) => { setCourseDeleting(item); setCourseDeleteOpen(true); };
  const validateCourse = (): boolean => {
    const e: Record<string, string> = {};
    if (!courseForm.code.trim()) e.code = 'Mã khóa không được để trống';
    if (!courseForm.name.trim()) e.name = 'Tên khóa không được để trống';
    if (!courseForm.start_year) e.start_year = 'Năm bắt đầu không được để trống';
    if (!courseForm.end_year) e.end_year = 'Năm kết thúc không được để trống';
    if (courseForm.end_year < courseForm.start_year) e.end_year = 'Năm kết thúc phải ≥ năm bắt đầu';
    setCourseErrors(e); return Object.keys(e).length === 0;
  };
  const handleCourseSubmit = async () => {
    if (!validateCourse()) return; setCourseSubmitError(null);
    try { courseEditing ? await courseUpdateMut.mutateAsync({ id: courseEditing.id, payload: courseForm }) : await courseCreateMut.mutateAsync(courseForm); setCourseModalOpen(false); } catch (err: any) { setCourseSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleCourseDelete = async () => { if (!courseDeleting) return; try { await courseDeleteMut.mutateAsync(courseDeleting.id); setCourseDeleteOpen(false); setCourseDeleting(null); } catch (e) { void e; } };

  // Subject Type Handlers
  const openStCreate = () => { setStEditing(null); setStForm(emptyST()); setStErrors({}); setStSubmitError(null); setStModalOpen(true); };
  const openStEdit = (item: HqnhatSubjectType) => { setStEditing(item); setStForm({ code: item.code, name: item.name, description: item.description ?? '', status: item.status as 0 | 1 }); setStErrors({}); setStSubmitError(null); setStModalOpen(true); };
  const openStDelete = (item: HqnhatSubjectType) => { setStDeleting(item); setStDeleteOpen(true); };
  const validateSt = (): boolean => {
    const e: Record<string, string> = {};
    if (!stForm.code.trim()) e.code = 'Mã nhóm không được để trống';
    if (!stForm.name.trim()) e.name = 'Tên nhóm không được để trống';
    setStErrors(e); return Object.keys(e).length === 0;
  };
  const handleStSubmit = async () => {
    if (!validateSt()) return; setStSubmitError(null);
    try { stEditing ? await stUpdateMut.mutateAsync({ id: stEditing.id, payload: stForm }) : await stCreateMut.mutateAsync(stForm); setStModalOpen(false); } catch (err: any) { setStSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleStDelete = async () => { if (!stDeleting) return; try { await stDeleteMut.mutateAsync(stDeleting.id); setStDeleteOpen(false); setStDeleting(null); } catch (e) { void e; } };

  // Subject Handlers
  const openSubjCreate = () => { setSubjEditing(null); setSubjForm(emptySubject()); setSubjErrors({}); setSubjSubmitError(null); setSubjModalOpen(true); };
  const openSubjEdit = (item: HqnhatSubject) => { setSubjEditing(item); setSubjForm({ code: item.code, name: item.name, subject_type_id: item.subject_type_id, credit: item.credit, theory_hours: item.theory_hours, practice_hours: item.practice_hours, lab_hours: item.lab_hours, description: item.description ?? '', status: item.status as 0 | 1 }); setSubjErrors({}); setSubjSubmitError(null); setSubjModalOpen(true); };
  const openSubjDetail = (item: HqnhatSubject) => { setSubjDetailId(item.id); setSubjDetailOpen(true); };
  const openSubjDelete = (item: HqnhatSubject) => { setSubjDeleting(item); setSubjDeleteOpen(true); };
  const validateSubject = (): boolean => {
    const e: Record<string, string> = {};
    if (!subjForm.code.trim()) e.code = 'Mã môn không được để trống';
    if (!subjForm.name.trim()) e.name = 'Tên môn không được để trống';
    if (!subjForm.subject_type_id || subjForm.subject_type_id === 0) e.subject_type_id = 'Chọn nhóm môn';
    if (!subjForm.credit || subjForm.credit <= 0) e.credit = 'Tín chỉ phải > 0';
    if (subjForm.theory_hours === undefined || subjForm.theory_hours === null || subjForm.theory_hours < 0) e.theory_hours = 'Nhập số giờ lý thuyết';
    if (subjForm.practice_hours === undefined || subjForm.practice_hours === null || subjForm.practice_hours < 0) e.practice_hours = 'Nhập số giờ thực hành';
    if (subjForm.lab_hours === undefined || subjForm.lab_hours === null || subjForm.lab_hours < 0) e.lab_hours = 'Nhập số giờ thí nghiệm';
    setSubjErrors(e); return Object.keys(e).length === 0;
  };
  const handleSubjSubmit = async () => {
    if (!validateSubject()) return; setSubjSubmitError(null);
    try { subjEditing ? await subjUpdateMut.mutateAsync({ id: subjEditing.id, payload: subjForm }) : await subjCreateMut.mutateAsync(subjForm); setSubjModalOpen(false); } catch (err: any) { setSubjSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleSubjDelete = async () => { if (!subjDeleting) return; try { await subjDeleteMut.mutateAsync(subjDeleting.id); setSubjDeleteOpen(false); setSubjDeleting(null); } catch (e) { void e; } };

  // Curriculum Subject Handlers
  const openCsCreate = () => { setCsEditing(null); setCsForm(emptyCS()); setCsErrors({}); setCsSubmitError(null); setCsModalOpen(true); };
  const openCsEdit = (item: HqnhatCurriculumSubject) => { setCsEditing(item); setCsForm({ curriculum_id: item.curriculum_id, subject_id: item.subject_id, semester: item.semester, year_no: item.year_no, display_order: item.display_order, is_capstone: item.is_capstone, is_internship: item.is_internship, is_required: item.is_required, elective_group: item.elective_group }); setCsErrors({}); setCsSubmitError(null); setCsModalOpen(true); };
  const openCsDetail = (item: HqnhatCurriculumSubject) => { setCsDetailItem(item); setCsDetailOpen(true); };
  const openCsDelete = (item: HqnhatCurriculumSubject) => { setCsDeleting(item); setCsDeleteOpen(true); };
  const validateCs = (): boolean => {
    const e: Record<string, string> = {};
    if (!csForm.curriculum_id || csForm.curriculum_id === 0) e.curriculum_id = 'Chọn CTĐT';
    if (!csForm.subject_id || csForm.subject_id === 0) e.subject_id = 'Chọn môn học';
    setCsErrors(e); return Object.keys(e).length === 0;
  };
  const handleCsSubmit = async () => {
    if (!validateCs()) return; setCsSubmitError(null);
    try {
      if (csEditing) {
        await csUpdateMut.mutateAsync({ id: csEditing.id, payload: csForm as HqnhatCurriculumSubjectUpdatePayload });
      } else {
        await csCreateMut.mutateAsync(csForm);
      }
      setCsModalOpen(false);
    } catch (err: any) { setCsSubmitError(err.message || 'Có lỗi xảy ra'); }
  };
  const handleCsDelete = async () => { if (!csDeleting) return; try { await csDeleteMut.mutateAsync(csDeleting.id); setCsDeleteOpen(false); setCsDeleting(null); } catch (e) { void e; } };  // Subject Prerequisite Handlers
  const openSpCreate = () => { setSpEditing(null); setSpForm(emptySP()); setSpErrors({}); setSpSubmitError(null); setSpModalOpen(true); };
  const openSpEdit = (item: HqnhatSubjectPrerequisite) => { setSpEditing(item); setSpForm({ subject_id: item.subject_id, prerequisite_subject_id: item.prerequisite_subject_id, type: item.type as 1 | 2 }); setSpErrors({}); setSpSubmitError(null); setSpModalOpen(true); };
  const openSpDetail = (item: HqnhatSubjectPrerequisite) => { setSpDetailItem(item); setSpDetailOpen(true); };
  const openSpDelete = (item: HqnhatSubjectPrerequisite) => { setSpDeleting(item); setSpDeleteOpen(true); };
  const validateSp = (): boolean => {
    const e: Record<string, string> = {};
    if (!spForm.subject_id) e.subject_id = 'Chọn môn học';
    if (!spForm.prerequisite_subject_id) e.prerequisite_subject_id = 'Chọn môn tiên quyết';
    if (spForm.subject_id === spForm.prerequisite_subject_id) e.prerequisite_subject_id = 'Không thể chọn chính nó';
    setSpErrors(e); return Object.keys(e).length === 0;
  };
  const handleSpSubmit = async () => {
    if (!validateSp()) return; setSpSubmitError(null);
    try {
      if (spEditing) {
        await spUpdateMut.mutateAsync({ id: spEditing.id, payload: spForm });
      } else {
        await spCreateMut.mutateAsync(spForm);
      }
      setSpModalOpen(false);
    } catch (err: any) { setSpSubmitError(err?.response?.data?.message || err.message || 'Có lỗi xảy ra'); }
  };
  const handleSpDelete = async () => { if (!spDeleting) return; try { await spDeleteMut.mutateAsync(spDeleting.id); setSpDeleteOpen(false); setSpDeleting(null); } catch (e) { void e; } };

  const ctdtIsSubmitting = ctdtCreateMut.isPending || ctdtUpdateMut.isPending;
  const majorIsSubmitting = majorCreateMut.isPending || majorUpdateMut.isPending;
  const tsIsSubmitting = tsCreateMut.isPending || tsUpdateMut.isPending;
  const specIsSubmitting = specCreateMut.isPending || specUpdateMut.isPending;
  const atIsSubmitting = atCreateMut.isPending || atUpdateMut.isPending;
  const spIsSubmitting = spCreateMut.isPending || spUpdateMut.isPending;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Đào tạo"
        description="Quản lý chương trình đào tạo và các danh mục liên quan"
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Quản lý Đào tạo' }]}
      />

      {/* Tabs */}
      <div className="border-b border-[rgb(var(--border))]">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                  : 'border-transparent text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:border-[rgb(var(--border))]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── CTDT TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'ctdt' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã, tên..." value={ctdtSearch} onChange={e => { setCtdtSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={ctdtStatus} onChange={e => { setCtdtStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Ngừng hoạt động</option>
            </select>
            <div className="flex-1" />
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCtdtCreate}>Thêm CTĐT</Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã CTĐT</TableHeadCell>
                <TableHeadCell>Tên chương trình</TableHeadCell>
                <TableHeadCell>Ngành</TableHeadCell>
                <TableHeadCell>Hệ đào tạo</TableHeadCell>
                <TableHeadCell>Tổng TC</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ctdtLoading ? <TableSkeleton colSpan={8} rows={5} /> :
               ctdtItems.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy CTĐT nào</TableCell></TableRow> :
               ctdtItems.map((item, i) => {
                 const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={ctdtFetching && !ctdtLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell><button onClick={() => openCtdtDetail(item)} className="font-medium hover:text-[rgb(var(--primary))] text-left">{item.name}</button></TableCell>
                     <TableCell className="text-sm">{getMajorName(item.major_id)}</TableCell>
                     <TableCell className="text-sm">{getTrainingSystemName(item.training_system_id)}</TableCell>
                     <TableCell className="text-center">{item.total_credit}</TableCell>
                     <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openCtdtDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openCtdtEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openCtdtDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={ctdtTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── NGÀNH HỌC TAB ───────────────────────────────────────────────── */}
      {activeTab === 'nganh' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã, tên..." value={majorSearch} onChange={e => { setMajorSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={majorStatus} onChange={e => { setMajorStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="1">Bản nháp</option>
              <option value="2">Chờ phê duyệt</option>
              <option value="3">Đã công bố</option>
              <option value="4">Lưu trữ</option>
            </select>
            <select value={majorDegree} onChange={e => { setMajorDegree(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả bậc</option>
              <option value="1">Đại học</option>
              <option value="2">Thạc sĩ</option>
              <option value="3">Tiến sĩ</option>
            </select>
            {(majorSearch || majorStatus || majorDegree) && (
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setMajorSearch(''); setMajorStatus(''); setMajorDegree(''); setPage(1); }}>Đặt lại</Button>
            )}
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openMajorCreate}>Thêm ngành</Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã ngành</TableHeadCell>
                <TableHeadCell>Tên ngành</TableHeadCell>
                <TableHeadCell>Mô tả</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {majorLoading ? <TableSkeleton colSpan={6} rows={5} /> :
               majorItems.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy ngành nào</TableCell></TableRow> :
               majorItems.map((item, i) => {
                 const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={majorFetching && !majorLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell><button onClick={() => openMajorDetail(item)} className="font-medium hover:text-[rgb(var(--primary))] text-left">{item.name}</button></TableCell>
                     <TableCell className="text-sm text-[rgb(var(--text-muted))] truncate max-w-xs">{item.description || '—'}</TableCell>
                     <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openMajorDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openMajorEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openMajorDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={majorTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── HỆ ĐÀO TẠO TAB ─────────────────────────────────────────────── */}
      {activeTab === 'he' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã, tên..." value={tsSearch} onChange={e => { setTsSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={tsStatus} onChange={e => { setTsStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Ngừng hoạt động</option>
            </select>
            {(tsSearch || tsStatus) && (
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setTsSearch(''); setTsStatus(''); setPage(1); }}>Đặt lại</Button>
            )}
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openTsCreate}>Thêm hệ</Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã hệ</TableHeadCell>
                <TableHeadCell>Tên hệ đào tạo</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tsLoading ? <TableSkeleton colSpan={6} rows={5} /> :
               tsItems.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy hệ đào tạo nào</TableCell></TableRow> :
               tsItems.map((item, i) => {
                 const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={tsFetching && !tsLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell><button onClick={() => openTsDetail(item)} className="font-medium hover:text-[rgb(var(--primary))] text-left">{item.name}</button></TableCell>
                     <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openTsDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openTsEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openTsDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={tsTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── CHUYÊN NGÀNH TAB ────────────────────────────────────────────── */}
      {activeTab === 'chuyen-nganh' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã, tên..." value={specSearch} onChange={e => { setSpecSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={specStatus} onChange={e => { setSpecStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Ngừng hoạt động</option>
            </select>
            {(specSearch || specStatus) && (
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSpecSearch(''); setSpecStatus(''); setPage(1); }}>Đặt lại</Button>
            )}
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openSpecCreate}>Thêm chuyên ngành</Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã</TableHeadCell>
                <TableHeadCell>Tên chuyên ngành</TableHeadCell>
                <TableHeadCell>Ngành</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specLoading ? <TableSkeleton colSpan={6} rows={5} /> :
               specItems.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy chuyên ngành nào</TableCell></TableRow> :
               specItems.map((item, i) => {
                 const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={specFetching && !specLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell><button onClick={() => openSpecDetail(item)} className="font-medium hover:text-[rgb(var(--primary))] text-left">{item.name}</button></TableCell>
                     <TableCell className="text-sm">{getMajorName(item.major_id)}</TableCell>
                     <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openSpecDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openSpecEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openSpecDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={specTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── HỌC KỲ TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'hoc-ky' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã..." value={atSearch} onChange={e => { setAtSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={atStatus} onChange={e => { setAtStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="0">Lập kế hoạch</option>
              <option value="1">Mở đăng ký</option>
              <option value="2">Đang học</option>
              <option value="3">Đã kết thúc</option>
            </select>
            <select value={atSemester} onChange={e => { setAtSemester(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả học kỳ</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ hè</option>
            </select>
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openAtCreate}>Thêm học kỳ</Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã HK</TableHeadCell>
                <TableHeadCell>Năm học</TableHeadCell>
                <TableHeadCell>Học kỳ</TableHeadCell>
                <TableHeadCell>Ngày bắt đầu</TableHeadCell>
                <TableHeadCell>Ngày kết thúc</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atLoading ? <TableSkeleton colSpan={8} rows={5} /> :
               atItems.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy học kỳ nào</TableCell></TableRow> :
               atItems.map((item, i) => {
                 const sc = AT_STATUS_CONFIG[item.status] ?? AT_STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={atFetching && !atLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell>{item.academic_year}</TableCell>
                     <TableCell><Badge variant="neutral">{SEMESTER_LABELS[item.semester] || `HK${item.semester}`}</Badge></TableCell>
                     <TableCell className="text-sm text-[rgb(var(--text-muted))]">{formatDate(item.start_date)}</TableCell>
                     <TableCell className="text-sm text-[rgb(var(--text-muted))]">{formatDate(item.end_date)}</TableCell>
                     <TableCell><Badge variant={sc.variant}>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openAtDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openAtEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openAtDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={atTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── KHÓA HỌC TAB ────────────────────────────────────────────────── */}
      {activeTab === 'khoa-hoc' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã, tên khóa..." value={courseSearch} onChange={e => { setCourseSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={courseStatus} onChange={e => { setCourseStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option><option value="1">Đang hoạt động</option><option value="0">Ngừng hoạt động</option>
            </select>
            {(courseSearch || courseStatus) && (
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setCourseSearch(''); setCourseStatus(''); setPage(1); }}>Đặt lại</Button>
            )}
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCourseCreate}>Thêm khóa</Button>
          </div>
          <Table>
            <TableHead><TableRow>
              <TableHeadCell>STT</TableHeadCell><TableHeadCell>Mã khóa</TableHeadCell><TableHeadCell>Tên khóa</TableHeadCell>
              <TableHeadCell>Năm bắt đầu</TableHeadCell><TableHeadCell>Năm kết thúc</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
            </TableRow></TableHead>
            <TableBody>
              {courseLoading ? <TableSkeleton colSpan={7} rows={5} /> :
               courseItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy khóa học nào</TableCell></TableRow> :
               courseItems.map((item, i) => {
                 const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={courseFetching && !courseLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell className="font-medium">{item.name}</TableCell>
                     <TableCell>{item.start_year}</TableCell>
                     <TableCell>{item.end_year}</TableCell>
                     <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openCourseDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openCourseEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openCourseDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={courseTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── MÔN HỌC TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'mon-hoc' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input placeholder="Tìm theo mã, tên môn..." value={subjSearch} onChange={e => { setSubjSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
            <select value={subjStatus} onChange={e => { setSubjStatus(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả trạng thái</option><option value="1">Đang hoạt động</option><option value="0">Ngừng hoạt động</option>
            </select>
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openSubjCreate}>Thêm môn học</Button>
          </div>
          <Table>
            <TableHead><TableRow>
              <TableHeadCell>STT</TableHeadCell><TableHeadCell>Mã môn</TableHeadCell><TableHeadCell>Tên môn</TableHeadCell>
              <TableHeadCell>Nhóm môn</TableHeadCell><TableHeadCell>Tín chỉ</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
            </TableRow></TableHead>
            <TableBody>
              {subjLoading ? <TableSkeleton colSpan={7} rows={5} /> :
               subjItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy môn học nào</TableCell></TableRow> :
               subjItems.map((item, i) => {
                 const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
                 return (
                   <TableRow key={item.id} className={subjFetching && !subjLoading ? 'opacity-50' : ''}>
                     <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                     <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                     <TableCell className="font-medium">{item.name}</TableCell>
                     <TableCell className="text-sm">{getSubjectTypeName(item.subject_type_id)}</TableCell>
                     <TableCell className="text-center">{item.credit}</TableCell>
                     <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="sm" onClick={() => openSubjDetail(item)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openSubjEdit(item)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => openSubjDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
               })}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={subjTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── MÔN TRONG CTĐT TAB ──────────────────────────────────────────── */}
      {activeTab === 'mon-trong-ctdt' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <select value={csCurriculumFilter} onChange={e => { setCsCurriculumFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả CTĐT</option>
              {ctdtItems.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
            <select value={csSubjectFilter} onChange={e => { setCsSubjectFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả môn</option>
              {subjItems.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCsCreate}>Thêm môn vào CTĐT</Button>
          </div>
          <Table>
            <TableHead><TableRow>
              <TableHeadCell>STT</TableHeadCell><TableHeadCell>CTĐT</TableHeadCell><TableHeadCell>Môn học</TableHeadCell>
              <TableHeadCell>Học kỳ</TableHeadCell><TableHeadCell>Năm</TableHeadCell><TableHeadCell>Bắt buộc</TableHeadCell>
              <TableHeadCell className="text-right">Thao tác</TableHeadCell>
            </TableRow></TableHead>
            <TableBody>
              {csLoading ? <TableSkeleton colSpan={7} rows={5} /> :
               csItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có môn học nào trong CTĐT</TableCell></TableRow> :
               csItems.map((item, i) => (
                 <TableRow key={item.id} className={csFetching && !csLoading ? 'opacity-50' : ''}>
                   <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                   <TableCell className="text-sm">{getCurriculumName(item.curriculum_id)}</TableCell>
                   <TableCell className="font-medium">{getSubjectName(item.subject_id)}</TableCell>
                   <TableCell className="text-center">{item.semester ?? '—'}</TableCell>
                   <TableCell className="text-center">{item.year_no ?? '—'}</TableCell>
                   <TableCell className="text-center">{item.is_required ? <Badge variant="success">Bắt buộc</Badge> : <Badge variant="neutral">Tự chọn</Badge>}</TableCell>
                   <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-1">
                       <Button variant="ghost" size="sm" onClick={() => openCsDetail(item)}><Eye className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => openCsEdit(item)}><Edit className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => openCsDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={csTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── TIÊN QUYẾT HỌC PHẦN TAB ────────────────────────────────────── */}
      {activeTab === 'tien-quyet' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <select value={spSubjectFilter} onChange={e => { setSpSubjectFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả môn học</option>
              {subjItems.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
            <select value={spTypeFilter} onChange={e => { setSpTypeFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">Tất cả loại</option><option value="1">Tiên quyết</option><option value="2">Học trước</option>
            </select>
            <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openSpCreate}>Thêm tiên quyết</Button>
          </div>
          <Table>
            <TableHead><TableRow>
              <TableHeadCell>STT</TableHeadCell><TableHeadCell>Môn học</TableHeadCell><TableHeadCell>Môn tiên quyết</TableHeadCell>
              <TableHeadCell>Loại</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
            </TableRow></TableHead>
            <TableBody>
              {spLoading ? <TableSkeleton colSpan={5} rows={5} /> :
               spItems.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có tiên quyết nào</TableCell></TableRow> :
               spItems.map((item, i) => (
                 <TableRow key={item.id} className={spFetching && !spLoading ? 'opacity-50' : ''}>
                   <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                   <TableCell className="font-medium">{getSubjectName(item.subject_id)}</TableCell>
                   <TableCell className="text-sm">{getSubjectName(item.prerequisite_subject_id)}</TableCell>
                   <TableCell>{item.type === 1 ? <Badge variant="warning">Tiên quyết</Badge> : <Badge variant="info">Học trước</Badge>}</TableCell>
                   <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-1">
                       <Button variant="ghost" size="sm" onClick={() => openSpDetail(item)}><Eye className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => openSpEdit(item)}><Edit className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => openSpDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
            </TableBody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={spTotal} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </div>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}

      {/* CTDT Modal */}
      <Modal open={ctdtModalOpen} onClose={() => setCtdtModalOpen(false)} title={ctdtEditing ? 'Sửa CTĐT' : 'Thêm CTĐT'} size="lg" footer={<><Button variant="outline" onClick={() => setCtdtModalOpen(false)}>Hủy</Button><Button onClick={handleCtdtSubmit} loading={ctdtIsSubmitting}>{ctdtEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {ctdtSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{ctdtSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã CTĐT" error={ctdtErrors.code} required><Input value={ctdtForm.code} onChange={e => setCtdtForm({ ...ctdtForm, code: e.target.value.toUpperCase() })} placeholder="VD: SE2026" /></FormField>
            <FormField label="Tổng tín chỉ" error={ctdtErrors.total_credit} required><Input type="number" value={ctdtForm.total_credit} onChange={e => setCtdtForm({ ...ctdtForm, total_credit: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Tên chương trình" error={ctdtErrors.name} required><Input value={ctdtForm.name} onChange={e => setCtdtForm({ ...ctdtForm, name: e.target.value })} placeholder="VD: Chương trình đào tạo Kỹ thuật phần mềm 2026" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngành" error={ctdtErrors.major_id} required>
              <select value={ctdtForm.major_id} onChange={e => setCtdtForm({ ...ctdtForm, major_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn ngành --</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
              </select>
            </FormField>
            <FormField label="Hệ đào tạo" error={ctdtErrors.training_system_id} required>
              <select value={ctdtForm.training_system_id} onChange={e => setCtdtForm({ ...ctdtForm, training_system_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn hệ --</option>
                {trainingSystems.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Khóa sinh viên" error={ctdtErrors.course_id} required><Input type="number" value={ctdtForm.course_id} onChange={e => setCtdtForm({ ...ctdtForm, course_id: Number(e.target.value) })} /></FormField>
            <FormField label="Tín chỉ tự chọn"><Input type="number" value={ctdtForm.elective_credit} onChange={e => setCtdtForm({ ...ctdtForm, elective_credit: Number(e.target.value) })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Chuyên ngành"><Input type="number" value={ctdtForm.specialization_id ?? ''} onChange={e => setCtdtForm({ ...ctdtForm, specialization_id: e.target.value ? Number(e.target.value) : null })} /></FormField>
            <FormField label="Trạng thái">
              <select value={ctdtForm.status} onChange={e => setCtdtForm({ ...ctdtForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả"><textarea value={ctdtForm.description ?? ''} onChange={e => setCtdtForm({ ...ctdtForm, description: e.target.value })} rows={3} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      {/* CTDT Detail Modal */}
      <Modal open={ctdtDetailOpen} onClose={() => setCtdtDetailOpen(false)} title="Chi tiết CTĐT" size="lg">
        {ctdtDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         ctdtDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{ctdtDetailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {ctdtDetailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[ctdtDetailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>{STATUS_CONFIG[ctdtDetailData.data.status]?.label}</Badge>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngành</p><p className="font-medium">{getMajorName(ctdtDetailData.data.major_id)}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Hệ đào tạo</p><p className="font-medium">{getTrainingSystemName(ctdtDetailData.data.training_system_id)}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổng tín chỉ</p><p className="text-2xl font-bold">{ctdtDetailData.data.total_credit}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tín chỉ tự chọn</p><p className="text-2xl font-bold">{ctdtDetailData.data.elective_credit}</p></div>
             </div>
             {ctdtDetailData.data.description && <div><p className="text-sm font-medium mb-2">Mô tả</p><p className="text-sm text-[rgb(var(--text-secondary))]">{ctdtDetailData.data.description}</p></div>}
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setCtdtDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setCtdtDetailOpen(false); openCtdtEdit(ctdtDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* CTDT Delete Modal */}
      <ConfirmModal open={ctdtDeleteOpen} onClose={() => setCtdtDeleteOpen(false)} onConfirm={handleCtdtDelete} title="Xác nhận xóa CTĐT" description={`Bạn có chắc muốn xóa CTĐT "${ctdtDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={ctdtDeleteMut.isPending} />

      {/* Major Modal */}
      <Modal open={majorModalOpen} onClose={() => setMajorModalOpen(false)} title={majorEditing ? 'Sửa ngành' : 'Thêm ngành'} size="md" footer={<><Button variant="outline" onClick={() => setMajorModalOpen(false)}>Hủy</Button><Button onClick={handleMajorSubmit} loading={majorIsSubmitting}>{majorEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {majorSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{majorSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã ngành" error={majorErrors.code} required><Input value={majorForm.code} onChange={e => setMajorForm({ ...majorForm, code: e.target.value.toUpperCase() })} /></FormField>
            <FormField label="Bậc đào tạo" error={majorErrors.degree_level} required>
              <select value={majorForm.degree_level} onChange={e => setMajorForm({ ...majorForm, degree_level: Number(e.target.value) as 1 | 2 | 3 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đại học</option>
                <option value={2}>Thạc sĩ</option>
                <option value={3}>Tiến sĩ</option>
              </select>
            </FormField>
          </div>
          <FormField label="Tên ngành" error={majorErrors.name} required><Input value={majorForm.name} onChange={e => setMajorForm({ ...majorForm, name: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Khoa/Phòng" error={majorErrors.department_id} required>
              <select value={majorForm.department_id} onChange={e => setMajorForm({ ...majorForm, department_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn khoa --</option>
                <option value={1}>Khoa Công nghệ thông tin</option>
                <option value={2}>Khoa Kinh tế</option>
                <option value={3}>Khoa Ngoại ngữ</option>
                <option value={4}>Khoa Kỹ thuật</option>
                <option value={5}>Khoa Sư phạm</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select value={majorForm.status} onChange={e => setMajorForm({ ...majorForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả" error={majorErrors.description} required><textarea value={majorForm.description} onChange={e => setMajorForm({ ...majorForm, description: e.target.value })} rows={3} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      {/* Major Delete Modal */}
      <ConfirmModal open={majorDeleteOpen} onClose={() => setMajorDeleteOpen(false)} onConfirm={handleMajorDelete} title="Xác nhận xóa ngành" description={`Bạn có chắc muốn xóa ngành "${majorDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={majorDeleteMut.isPending} />

      {/* Major Detail Modal */}
      <Modal open={majorDetailOpen} onClose={() => setMajorDetailOpen(false)} title="Chi tiết ngành" size="md">
        {majorDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         majorDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{majorDetailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {majorDetailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[majorDetailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>{STATUS_CONFIG[majorDetailData.data.status]?.label}</Badge>
             </div>
             <div className="space-y-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã ngành</p>
                 <p className="font-mono font-medium">{majorDetailData.data.code}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tên ngành</p>
                 <p className="font-medium">{majorDetailData.data.name}</p>
               </div>
               {majorDetailData.data.description && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
                 <p className="text-sm">{majorDetailData.data.description}</p>
               </div>}
             </div>
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setMajorDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setMajorDetailOpen(false); openMajorEdit(majorDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Training System Modal */}
      <Modal open={tsModalOpen} onClose={() => setTsModalOpen(false)} title={tsEditing ? 'Sửa hệ đào tạo' : 'Thêm hệ đào tạo'} size="md" footer={<><Button variant="outline" onClick={() => setTsModalOpen(false)}>Hủy</Button><Button onClick={handleTsSubmit} loading={tsIsSubmitting}>{tsEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {tsSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{tsSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã hệ" error={tsErrors.code} required><Input value={tsForm.code} onChange={e => setTsForm({ ...tsForm, code: e.target.value.toUpperCase() })} /></FormField>
            <FormField label="Mô tả"><textarea value={tsForm.description ?? ''} onChange={e => setTsForm({ ...tsForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
          </div>
          <FormField label="Tên hệ đào tạo" error={tsErrors.name} required><Input value={tsForm.name} onChange={e => setTsForm({ ...tsForm, name: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mô tả"><textarea value={tsForm.description ?? ''} onChange={e => setTsForm({ ...tsForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
            <FormField label="Trạng thái">
              <select value={tsForm.status} onChange={e => setTsForm({ ...tsForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Training System Delete Modal */}
      <ConfirmModal open={tsDeleteOpen} onClose={() => setTsDeleteOpen(false)} onConfirm={handleTsDelete} title="Xác nhận xóa hệ" description={`Bạn có chắc muốn xóa hệ "${tsDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={tsDeleteMut.isPending} />

      {/* Training System Detail Modal */}
      <Modal open={tsDetailOpen} onClose={() => setTsDetailOpen(false)} title="Chi tiết hệ đào tạo" size="md">
        {tsDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         tsDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{tsDetailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {tsDetailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[tsDetailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>{STATUS_CONFIG[tsDetailData.data.status]?.label}</Badge>
             </div>
             <div className="space-y-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã hệ</p>
                 <p className="font-mono font-medium">{tsDetailData.data.code}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tên hệ đào tạo</p>
                 <p className="font-medium">{tsDetailData.data.name}</p>
               </div>
               {tsDetailData.data.description && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
                 <p className="text-sm">{tsDetailData.data.description}</p>
               </div>}
             </div>
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setTsDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setTsDetailOpen(false); openTsEdit(tsDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Specialization Modal */}
      <Modal open={specModalOpen} onClose={() => setSpecModalOpen(false)} title={specEditing ? 'Sửa chuyên ngành' : 'Thêm chuyên ngành'} size="md" footer={<><Button variant="outline" onClick={() => setSpecModalOpen(false)}>Hủy</Button><Button onClick={handleSpecSubmit} loading={specIsSubmitting}>{specEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {specSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{specSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã chuyên ngành" error={specErrors.code} required><Input value={specForm.code} onChange={e => setSpecForm({ ...specForm, code: e.target.value.toUpperCase() })} /></FormField>
            <FormField label="Ngành" error={specErrors.major_id} required>
              <select value={specForm.major_id} onChange={e => setSpecForm({ ...specForm, major_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn ngành --</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Tên chuyên ngành" error={specErrors.name} required><Input value={specForm.name} onChange={e => setSpecForm({ ...specForm, name: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mô tả" error={specErrors.description} required><textarea value={specForm.description} onChange={e => setSpecForm({ ...specForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
            <FormField label="Trạng thái">
              <select value={specForm.status} onChange={e => setSpecForm({ ...specForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Specialization Delete Modal */}
      <ConfirmModal open={specDeleteOpen} onClose={() => setSpecDeleteOpen(false)} onConfirm={handleSpecDelete} title="Xác nhận xóa chuyên ngành" description={`Bạn có chắc muốn xóa chuyên ngành "${specDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={specDeleteMut.isPending} />

      {/* Specialization Detail Modal */}
      <Modal open={specDetailOpen} onClose={() => setSpecDetailOpen(false)} title="Chi tiết chuyên ngành" size="md">
        {specDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         specDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{specDetailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {specDetailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[specDetailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>{STATUS_CONFIG[specDetailData.data.status]?.label}</Badge>
             </div>
             <div className="space-y-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã chuyên ngành</p>
                 <p className="font-mono font-medium">{specDetailData.data.code}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tên chuyên ngành</p>
                 <p className="font-medium">{specDetailData.data.name}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngành</p>
                 <p className="font-medium">{getMajorName(specDetailData.data.major_id)}</p>
               </div>
               {specDetailData.data.description && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
                 <p className="text-sm">{specDetailData.data.description}</p>
               </div>}
             </div>
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setSpecDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setSpecDetailOpen(false); openSpecEdit(specDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Academic Term Modal */}
      <Modal open={atModalOpen} onClose={() => setAtModalOpen(false)} title={atEditing ? 'Sửa học kỳ' : 'Thêm học kỳ'} size="lg" footer={<><Button variant="outline" onClick={() => setAtModalOpen(false)}>Hủy</Button><Button onClick={handleAtSubmit} loading={atIsSubmitting}>{atEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {atSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{atSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã học kỳ" error={atErrors.code} required><Input value={atForm.code} onChange={e => setAtForm({ ...atForm, code: e.target.value.toUpperCase() })} placeholder="VD: HK1_2024_2025" /></FormField>
            <FormField label="Năm học" error={atErrors.academic_year} required><Input value={atForm.academic_year} onChange={e => setAtForm({ ...atForm, academic_year: e.target.value })} placeholder="VD: 2024-2025" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Học kỳ" error={atErrors.semester} required>
              <select value={atForm.semester} onChange={e => setAtForm({ ...atForm, semester: Number(e.target.value) as 1 | 2 | 3 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Học kỳ 1</option>
                <option value={2}>Học kỳ 2</option>
                <option value={3}>Học kỳ hè</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select value={atForm.status} onChange={e => setAtForm({ ...atForm, status: Number(e.target.value) as 0 | 1 | 2 | 3 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>Lập kế hoạch</option>
                <option value={1}>Mở đăng ký</option>
                <option value={2}>Đang học</option>
                <option value={3}>Đã kết thúc</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngày bắt đầu HK" error={atErrors.start_date} required><Input type="date" value={atForm.start_date} onChange={e => setAtForm({ ...atForm, start_date: e.target.value })} /></FormField>
            <FormField label="Ngày kết thúc HK" error={atErrors.end_date} required><Input type="date" value={atForm.end_date} onChange={e => setAtForm({ ...atForm, end_date: e.target.value })} /></FormField>
            <FormField label="Ngày bắt đầu đăng ký" error={atErrors.registration_start} required><Input type="date" value={atForm.registration_start} onChange={e => setAtForm({ ...atForm, registration_start: e.target.value })} /></FormField>
            <FormField label="Ngày kết thúc đăng ký" error={atErrors.registration_end} required><Input type="date" value={atForm.registration_end} onChange={e => setAtForm({ ...atForm, registration_end: e.target.value })} /></FormField>
          </div>
        </div>
      </Modal>

      {/* Academic Term Delete Modal */}
      <ConfirmModal open={atDeleteOpen} onClose={() => setAtDeleteOpen(false)} onConfirm={handleAtDelete} title="Xác nhận xóa học kỳ" description={`Bạn có chắc muốn xóa học kỳ "${atDeleting?.code}" không?`} confirmText="Xóa" variant="danger" loading={atDeleteMut.isPending} />

      {/* Academic Term Detail Modal */}
      <Modal open={atDetailOpen} onClose={() => setAtDetailOpen(false)} title="Chi tiết học kỳ" size="lg">
        {atDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         atDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{atDetailData.data.code}</h3><p className="text-sm text-[rgb(var(--text-muted))]">{atDetailData.data.academic_year}</p></div>
               <Badge variant={AT_STATUS_CONFIG[atDetailData.data.status]?.variant}>{AT_STATUS_CONFIG[atDetailData.data.status]?.label}</Badge>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã học kỳ</p>
                 <p className="font-mono font-medium">{atDetailData.data.code}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm học</p>
                 <p className="font-medium">{atDetailData.data.academic_year}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p>
                 <p className="font-medium">{SEMESTER_LABELS[atDetailData.data.semester] || `HK${atDetailData.data.semester}`}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày bắt đầu</p>
                 <p className="font-medium">{formatDate(atDetailData.data.start_date)}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày kết thúc</p>
                 <p className="font-medium">{formatDate(atDetailData.data.end_date)}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Bắt đầu đăng ký</p>
                 <p className="font-medium">{formatDate(atDetailData.data.registration_start)}</p>
               </div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Kết thúc đăng ký</p>
                 <p className="font-medium">{formatDate(atDetailData.data.registration_end)}</p>
               </div>
             </div>
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setAtDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setAtDetailOpen(false); openAtEdit(atDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Course Modal */}
      <Modal open={courseModalOpen} onClose={() => setCourseModalOpen(false)} title={courseEditing ? 'Sửa khóa học' : 'Thêm khóa học'} size="md" footer={<><Button variant="outline" onClick={() => setCourseModalOpen(false)}>Hủy</Button><Button onClick={handleCourseSubmit} loading={courseCreateMut.isPending || courseUpdateMut.isPending}>{courseEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {courseSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{courseSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã khóa" error={courseErrors.code} required><Input value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })} placeholder="VD: K67" /></FormField>
            <FormField label="Năm bắt đầu" error={courseErrors.start_year} required><Input type="number" value={courseForm.start_year} onChange={e => setCourseForm({ ...courseForm, start_year: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Tên khóa" error={courseErrors.name} required><Input value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="VD: Khóa 67" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Năm kết thúc" error={courseErrors.end_year} required><Input type="number" value={courseForm.end_year} onChange={e => setCourseForm({ ...courseForm, end_year: Number(e.target.value) })} /></FormField>
            <FormField label="Trạng thái">
              <select value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option><option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả"><textarea value={courseForm.description ?? ''} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      {/* Course Delete Modal */}
      <ConfirmModal open={courseDeleteOpen} onClose={() => setCourseDeleteOpen(false)} onConfirm={handleCourseDelete} title="Xác nhận xóa khóa học" description={`Bạn có chắc muốn xóa khóa "${courseDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={courseDeleteMut.isPending} />

      {/* Course Detail Modal */}
      <Modal open={courseDetailOpen} onClose={() => setCourseDetailOpen(false)} title="Chi tiết khóa học" size="md">
        {courseDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         courseDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{courseDetailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {courseDetailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[courseDetailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>{STATUS_CONFIG[courseDetailData.data.status]?.label}</Badge>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã khóa</p><p className="font-mono font-medium">{courseDetailData.data.code}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tên khóa</p><p className="font-medium">{courseDetailData.data.name}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm bắt đầu</p><p className="font-medium">{courseDetailData.data.start_year}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm kết thúc</p><p className="font-medium">{courseDetailData.data.end_year}</p></div>
             </div>
             {courseDetailData.data.description && <div><p className="text-sm font-medium mb-2">Mô tả</p><p className="text-sm text-[rgb(var(--text-secondary))]">{courseDetailData.data.description}</p></div>}
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setCourseDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setCourseDetailOpen(false); openCourseEdit(courseDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Subject Type Modal */}
      <Modal open={stModalOpen} onClose={() => setStModalOpen(false)} title={stEditing ? 'Sửa nhóm môn' : 'Thêm nhóm môn'} size="md" footer={<><Button variant="outline" onClick={() => setStModalOpen(false)}>Hủy</Button><Button onClick={handleStSubmit} loading={stCreateMut.isPending || stUpdateMut.isPending}>{stEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {stSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{stSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã nhóm" error={stErrors.code} required><Input value={stForm.code} onChange={e => setStForm({ ...stForm, code: e.target.value.toUpperCase() })} /></FormField>
            <FormField label="Trạng thái">
              <select value={stForm.status} onChange={e => setStForm({ ...stForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option><option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Tên nhóm" error={stErrors.name} required><Input value={stForm.name} onChange={e => setStForm({ ...stForm, name: e.target.value })} placeholder="VD: Nhóm môn đại cương" /></FormField>
          <FormField label="Mô tả"><textarea value={stForm.description ?? ''} onChange={e => setStForm({ ...stForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      {/* Subject Type Delete Modal */}
      <ConfirmModal open={stDeleteOpen} onClose={() => setStDeleteOpen(false)} onConfirm={handleStDelete} title="Xác nhận xóa nhóm môn" description={`Bạn có chắc muốn xóa nhóm "${stDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={stDeleteMut.isPending} />

      {/* Subject Modal */}
      <Modal open={subjModalOpen} onClose={() => setSubjModalOpen(false)} title={subjEditing ? 'Sửa môn học' : 'Thêm môn học'} size="lg" footer={<><Button variant="outline" onClick={() => setSubjModalOpen(false)}>Hủy</Button><Button onClick={handleSubjSubmit} loading={subjCreateMut.isPending || subjUpdateMut.isPending}>{subjEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {subjSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{subjSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã môn" error={subjErrors.code} required><Input value={subjForm.code} onChange={e => setSubjForm({ ...subjForm, code: e.target.value.toUpperCase() })} placeholder="VD: IT101" /></FormField>
            <FormField label="Nhóm môn" error={subjErrors.subject_type_id} required>
              <select value={subjForm.subject_type_id} onChange={e => setSubjForm({ ...subjForm, subject_type_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn nhóm --</option>
                {stItems.map(t => <option key={t.id} value={t.id}>{t.code} - {t.name}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Tên môn" error={subjErrors.name} required><Input value={subjForm.name} onChange={e => setSubjForm({ ...subjForm, name: e.target.value })} /></FormField>
          <div className="grid grid-cols-4 gap-3">
            <FormField label="Tín chỉ" error={subjErrors.credit} required><Input type="number" value={subjForm.credit} onChange={e => setSubjForm({ ...subjForm, credit: Number(e.target.value) })} /></FormField>
            <FormField label="LT (h)" error={subjErrors.theory_hours} required><Input type="number" value={subjForm.theory_hours} onChange={e => setSubjForm({ ...subjForm, theory_hours: Number(e.target.value) })} /></FormField>
            <FormField label="TH (h)" error={subjErrors.practice_hours} required><Input type="number" value={subjForm.practice_hours} onChange={e => setSubjForm({ ...subjForm, practice_hours: Number(e.target.value) })} /></FormField>
            <FormField label="TN (h)" error={subjErrors.lab_hours} required><Input type="number" value={subjForm.lab_hours} onChange={e => setSubjForm({ ...subjForm, lab_hours: Number(e.target.value) })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Trạng thái">
              <select value={subjForm.status} onChange={e => setSubjForm({ ...subjForm, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option><option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả"><textarea value={subjForm.description ?? ''} onChange={e => setSubjForm({ ...subjForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      {/* Subject Delete Modal */}
      <ConfirmModal open={subjDeleteOpen} onClose={() => setSubjDeleteOpen(false)} onConfirm={handleSubjDelete} title="Xác nhận xóa môn học" description={`Bạn có chắc muốn xóa môn "${subjDeleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={subjDeleteMut.isPending} />

      {/* Subject Detail Modal */}
      <Modal open={subjDetailOpen} onClose={() => setSubjDetailOpen(false)} title="Chi tiết môn học" size="lg">
        {subjDetailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         subjDetailData?.data ?
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{subjDetailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {subjDetailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[subjDetailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>{STATUS_CONFIG[subjDetailData.data.status]?.label}</Badge>
             </div>
             <div className="grid grid-cols-3 gap-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tín chỉ</p><p className="text-2xl font-bold">{subjDetailData.data.credit}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ LT</p><p className="text-2xl font-bold">{subjDetailData.data.theory_hours}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ TH</p><p className="text-2xl font-bold">{subjDetailData.data.practice_hours}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ Lab</p><p className="text-2xl font-bold">{subjDetailData.data.lab_hours}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                 <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhóm môn</p>
                 <p className="font-medium">{getSubjectTypeName(subjDetailData.data.subject_type_id)}</p>
               </div>
             </div>
             {subjDetailData.data.description && <div><p className="text-sm font-medium mb-2">Mô tả</p><p className="text-sm text-[rgb(var(--text-secondary))]">{subjDetailData.data.description}</p></div>}
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setSubjDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setSubjDetailOpen(false); openSubjEdit(subjDetailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Curriculum Subject Modal */}
      <Modal open={csModalOpen} onClose={() => setCsModalOpen(false)} title={csEditing ? 'Sửa môn trong CTĐT' : 'Thêm môn vào CTĐT'} size="lg" footer={<><Button variant="outline" onClick={() => setCsModalOpen(false)}>Hủy</Button><Button onClick={handleCsSubmit} loading={csCreateMut.isPending || csUpdateMut.isPending}>{csEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {csSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{csSubmitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="CTĐT" error={csErrors.curriculum_id} required>
              <select value={csForm.curriculum_id} onChange={e => setCsForm({ ...csForm, curriculum_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn CTĐT --</option>
                {ctdtItems.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Môn học" error={csErrors.subject_id} required>
              <select value={csForm.subject_id} onChange={e => setCsForm({ ...csForm, subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn môn --</option>
                {subjItems.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Học kỳ"><Input type="number" value={csForm.semester ?? ''} onChange={e => setCsForm({ ...csForm, semester: e.target.value ? Number(e.target.value) : null })} /></FormField>
            <FormField label="Năm học"><Input type="number" value={csForm.year_no ?? ''} onChange={e => setCsForm({ ...csForm, year_no: e.target.value ? Number(e.target.value) : null })} /></FormField>
            <FormField label="Thứ tự"><Input type="number" value={csForm.display_order ?? ''} onChange={e => setCsForm({ ...csForm, display_order: e.target.value ? Number(e.target.value) : null })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bắt buộc">
              <select value={csForm.is_required ? '1' : '0'} onChange={e => setCsForm({ ...csForm, is_required: e.target.value === '1' })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="1">Bắt buộc</option><option value="0">Tự chọn</option>
              </select>
            </FormField>
            <FormField label="Nhóm tự chọn"><Input value={csForm.elective_group ?? ''} onChange={e => setCsForm({ ...csForm, elective_group: e.target.value || null })} placeholder="VD: Group A" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Đồ án tốt nghiệp">
              <select value={csForm.is_capstone ? '1' : '0'} onChange={e => setCsForm({ ...csForm, is_capstone: e.target.value === '1' })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">Không</option><option value="1">Có</option>
              </select>
            </FormField>
            <FormField label="Thực tập">
              <select value={csForm.is_internship ? '1' : '0'} onChange={e => setCsForm({ ...csForm, is_internship: e.target.value === '1' })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">Không</option><option value="1">Có</option>
              </select>
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Curriculum Subject Delete Modal */}
      <ConfirmModal open={csDeleteOpen} onClose={() => setCsDeleteOpen(false)} onConfirm={handleCsDelete} title="Xác nhận xóa môn khỏi CTĐT" description={`Bạn có chắc muốn xóa môn "${csDeleting ? getSubjectName(csDeleting.subject_id) : ''}" khỏi CTĐT không?`} confirmText="Xóa" variant="danger" loading={csDeleteMut.isPending} />

      {/* CurriculumSubject Detail Modal */}
      <Modal open={csDetailOpen} onClose={() => setCsDetailOpen(false)} title="Chi tiết môn trong CTĐT" size="lg">
        {csDetailItem ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h3 className="text-lg font-bold">{getSubjectName(csDetailItem.subject_id)}</h3><p className="text-sm text-[rgb(var(--text-muted))]">CTĐT: {getCurriculumName(csDetailItem.curriculum_id)}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">CTĐT</p><p className="font-medium">{getCurriculumName(csDetailItem.curriculum_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Môn học</p><p className="font-medium">{getSubjectName(csDetailItem.subject_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p><p className="font-medium">{csDetailItem.semester ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm học</p><p className="font-medium">{csDetailItem.year_no ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự hiển thị</p><p className="font-medium">{csDetailItem.display_order ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại</p><p className="font-medium">{csDetailItem.is_required ? 'Bắt buộc' : 'Tự chọn'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đồ án tốt nghiệp</p><p className="font-medium">{csDetailItem.is_capstone ? 'Có' : 'Không'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thực tập</p><p className="font-medium">{csDetailItem.is_internship ? 'Có' : 'Không'}</p></div>
              {csDetailItem.elective_group && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhóm tự chọn</p><p className="font-medium">{csDetailItem.elective_group}</p></div>}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setCsDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setCsDetailOpen(false); openCsEdit(csDetailItem); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không có dữ liệu</p>}
      </Modal>

      {/* Subject Prerequisite Detail Modal */}
      <Modal open={spDetailOpen} onClose={() => setSpDetailOpen(false)} title="Chi tiết tiên quyết" size="md">
        {spDetailItem ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {spDetailItem.type === 1 ? <Badge variant="warning" dot>Tiên quyết</Badge> : <Badge variant="info" dot>Học trước</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 space-y-1">
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Môn học</p>
                <p className="font-mono font-medium">{getSubjectCode(spDetailItem.subject_id)}</p>
                <p className="font-medium">{getSubjectName(spDetailItem.subject_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 space-y-1">
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{spDetailItem.type === 1 ? 'Môn tiên quyết' : 'Môn học trước'}</p>
                <p className="font-mono font-medium">{getSubjectCode(spDetailItem.prerequisite_subject_id)}</p>
                <p className="font-medium">{getSubjectName(spDetailItem.prerequisite_subject_id)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
              <Button variant="outline" onClick={() => setSpDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setSpDetailOpen(false); openSpEdit(spDetailItem); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button>
            </div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không có dữ liệu</p>}
      </Modal>

      {/* Subject Prerequisite Modal */}
      <Modal open={spModalOpen} onClose={() => setSpModalOpen(false)} title={spEditing ? 'Sửa tiên quyết' : 'Thêm tiên quyết'} size="md" footer={<><Button variant="outline" onClick={() => setSpModalOpen(false)}>Hủy</Button><Button onClick={handleSpSubmit} loading={spIsSubmitting}>{spEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {spSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{spSubmitError}</div>}
          <FormField label="Môn học" error={spErrors.subject_id} required>
            <select value={spForm.subject_id} onChange={e => setSpForm({ ...spForm, subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn môn --</option>
              {subjItems.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Môn tiên quyết" error={spErrors.prerequisite_subject_id} required>
            <select value={spForm.prerequisite_subject_id} onChange={e => setSpForm({ ...spForm, prerequisite_subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn môn --</option>
              {subjItems.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Loại" required>
            <select value={spForm.type} onChange={e => setSpForm({ ...spForm, type: Number(e.target.value) as 1 | 2 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={1}>Tiên quyết (prerequisite)</option>
              <option value={2}>Học trước (corequisite)</option>
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Subject Prerequisite Delete Modal */}
      <ConfirmModal open={spDeleteOpen} onClose={() => setSpDeleteOpen(false)} onConfirm={handleSpDelete} title="Xác nhận xóa tiên quyết" description={`Bạn có chắc muốn xóa liên kết tiên quyết này không?`} confirmText="Xóa" variant="danger" loading={spDeleteMut.isPending} />
    </div>
  );
}
