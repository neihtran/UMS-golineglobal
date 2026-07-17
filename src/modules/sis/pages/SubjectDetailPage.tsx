import { useParams } from 'react-router-dom';
import SubjectDetail from './SubjectDetail';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <SubjectDetail id={id} />;
}
