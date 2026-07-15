import { useParams } from 'react-router-dom';
import { useSubjectDetail } from '@/hooks/useSis';
import SubjectDetail from './SubjectDetail';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useSubjectDetail(id);
  return <SubjectDetail id={id} data={data} isLoading={isLoading} isError={isError} />;
}
