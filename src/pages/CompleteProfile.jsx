// pages/CompleteProfile.jsx (or wherever you want)
import UserFormScreen from '../components/UserFormScreen';
import { useRouter } from 'next/router'; // or your routing library

export default function CompleteProfile() {
  const router = useRouter();
  const { phone, countryCode } = router.query; // Get from URL params

  const handleFormComplete = (data) => {
    console.log('Form completed:', data);
    // Navigate to dashboard or home
    router.push('/dashboard');
  };

  return (
    <UserFormScreen
      phone={phone || ''}
      countryCode={countryCode || '+971'}
      onComplete={handleFormComplete}
    />
  );
}