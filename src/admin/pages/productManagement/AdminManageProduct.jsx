import ProductCategory from '../../components/partials/dashboard/productsManagement/ProductCategoryTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageProduct = () => {

  return (
    <PermissionWrapper requiredPermissions={[
      UserPermissions.products_view,
      UserPermissions.products_categories_view
    ]}>
      <ProductCategory />
    </PermissionWrapper>
  );
}
export default PageLayoutHOC(AdminManageProduct);