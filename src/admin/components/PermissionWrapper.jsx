import { NoAccess } from '../components/generic';
import useAuth from '../hooks/UseAuth';

const PermissionWrapper = ({ requiredPermissions, children }) => {
  const auth = useAuth();
  const hasPermission = auth.checkPermission(requiredPermissions);

  return hasPermission ? children : <NoAccess />;
};

export default PermissionWrapper;