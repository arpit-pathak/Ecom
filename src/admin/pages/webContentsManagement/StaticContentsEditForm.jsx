import { useLocation, useNavigate } from 'react-router-dom';
import { AdminApis, ApiCalls, HttpStatus, ReverseStatusMapping, UserPermissions } from '../../utils';
import { showToast } from '../../components/generic/Alerts';
import PageLayoutHOC from '../PageLayoutHOC';
import Form from '../../components/generic/Forms';
import { FormStyle } from '../../styles/FormStyles';
import useAuth from '../../hooks/UseAuth';
import { PermissionWrapper } from '../../components';

const StaticContentsEditForm = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const state = location.state;
  const auth = useAuth();

  const formFields = [
    {
      name: "title",
      type: "text",
      label: "Title",
      defaultValue: state?.title,
    },
    {
      name: "meta_title",
      type: "text",
      label: "Meta Title",
      defaultValue: state?.meta_title ,
    },
    {
      name: "meta_description",
      type: "text",
      label: "Meta Description",
      defaultValue: state?.meta_description,
    },
    {
      name: "short-description",
      type: "text",
      label: "Short Description",
      defaultValue: state?.short_description,
    },
    {
      name: "description",
      type: "richText",
      label: "Description",
      defaultValue: state?.description,
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "1", label: "Active" },
        { value: "2", label: "Inactive" },
      ],
      defaultValue: ReverseStatusMapping(state?.status_name),
    },
  ];

  const handleConfirmation = async (formData, editorData) => {
    formData.append("description", editorData);
    formData.append("static_id", state.id_staticcontents);
    await ApiCalls(AdminApis.editStaticContents, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success")
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")
      });
  }

  return (
    <>
      <PermissionWrapper requiredPermissions={[UserPermissions.web_contents_edit, UserPermissions.static_contents_edit]}>
        <div className="min-h-screen bg-white text-gray-900">
          <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
            <Form form={formFields}
              styles={FormStyle}
              onSubmit={handleConfirmation}
              onCancel={() => navigate(-1)}
            />
          </main>
        </div>
      </PermissionWrapper>
    </>
  )
}
export default PageLayoutHOC(StaticContentsEditForm);