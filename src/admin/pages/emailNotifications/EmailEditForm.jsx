import { useLocation, useNavigate } from 'react-router-dom';
import { AdminApis, ApiCalls, HttpStatus, UserPermissions } from '../../utils';
import { showToast } from '../../components/generic/Alerts';
import PageLayoutHOC from '../PageLayoutHOC';
import Form from '../../components/generic/Forms';
import { FormStyle } from '../../styles/FormStyles';
import useAuth from '../../hooks/UseAuth';
import { PermissionWrapper } from '../../components';

const EmailEditForm = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const state = location.state;
  const auth = useAuth();

  const formFields = [
    {
      name: "template_name",
      type: "text",
      label: "Template Name",
      defaultValue: state?.template_name,
      disabled: '{true}',
    },
    {
      name: "title",
      type: "text",
      label: "Title",
      defaultValue: state?.title,
    },
    {
      name: "description",
      type: "richText",
      label: "Description",
      defaultValue: state?.description,
    },
    {
      name: "variables",
      type: "textarea",
      row: 5,
      disabled: true,
      label: "Variables",
      defaultValue: state?.variable,

    }
  ];

  const onClose = () => {
    navigate(-1)
  }

  const handleConfirmation = async (formData, editorData) => {
    formData.append("email_id", state.id_email);
    formData.append("description", editorData);
    await ApiCalls(AdminApis.emailUpdate, "POST", formData, false, auth.token.access)
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
      <PermissionWrapper requiredPermissions={[UserPermissions.email_notifications_edit, UserPermissions.email_templates_edit]}>
        <div className="min-h-screen bg-white text-gray-900">
          <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
            <Form form={formFields} styles={FormStyle} onCancel={() => onClose()} onSubmit={handleConfirmation} />
          </main>
        </div>
      </PermissionWrapper >
    </>
  )


}
export default PageLayoutHOC(EmailEditForm);