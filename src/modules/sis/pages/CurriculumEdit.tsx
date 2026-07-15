import { Navigate } from 'react-router-dom';
import { useCurriculumDetail } from '@/hooks/useSis';
import { LoadingState } from '@/components/data-display/LoadingState';
import CurriculumForm from './CurriculumForm';

interface CurriculumEditProps {
  id: string;
}

export default function CurriculumEdit({ id }: CurriculumEditProps) {
  const { data, isLoading, isError } = useCurriculumDetail(id);

  if (isLoading) {
    return <LoadingState message="Đang tải chương trình đào tạo..." />;
  }

  if (isError || !data) {
    return <Navigate to="/sis/chuong-trinh-dao-tao" replace />;
  }

  return <CurriculumForm mode="edit" initial={data} />;
}
