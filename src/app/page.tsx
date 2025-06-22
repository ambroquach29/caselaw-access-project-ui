import CaseList from '@/components/CaseList';
import LoginForm from '@/components/LoginForm';
import AuthStatus from '@/components/AuthStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Section for Testing */}
      {/* <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LoginForm />
            </div>
            <div>
              <AuthStatus />
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Case List */}
      <CaseList />
    </div>
  );
}
