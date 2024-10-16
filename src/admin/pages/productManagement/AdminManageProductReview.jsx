import ProductReviewsTable from '../../components/partials/dashboard/productsManagement/ProductReviewsTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';


const AdminManageProductReview = () => {
  return (
    <PermissionWrapper requiredPermissions={[
      UserPermissions.products_view,
      UserPermissions.products_reviews_view
    ]}>
      <ProductReviewsTable />
    </PermissionWrapper>
  )
}
export default PageLayoutHOC(AdminManageProductReview);