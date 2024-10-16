import PageLayoutHOC from './PageLayoutHOC'
import { UserPermissions } from '../utils';
import { PermissionWrapper } from '../components';


function AdminDashboard() {
  return (
    <PermissionWrapper requiredPermissions={[UserPermissions.dashboard_view]}>
      <div className="min-h-screen bg-white text-gray-900">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        </main>
      </div>
    </PermissionWrapper>
  )
}

export default PageLayoutHOC(AdminDashboard);