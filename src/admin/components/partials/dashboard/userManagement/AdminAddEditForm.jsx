import { PageTitles, ApiCalls, AdminApis, UserPermissions } from '../../../../utils';
import { toast } from 'react-toastify';
import { GridStyle, InputBoxStyle } from '../../../../styles/FormStyles';
import { Button } from '../../../generic';
import React, { useState } from 'react';
import useAuth from '../../../../hooks/UseAuth';

const permissionMapping = [
  {
    name: PageTitles.DASHBOARD,
    permissions: { view: true },
    view_value: UserPermissions.dashboard_view,
  },
  {
    name: PageTitles.WEB_CONTENTS,
    permissions: { view: true, edit: true, add: true, delete: true },
    view_value: UserPermissions.web_contents_view,
    add_value: UserPermissions.web_contents_add,
    edit_value: UserPermissions.web_contents_edit,
    delete_value: UserPermissions.web_contents_delete,
    subsections: [
      {
        name: PageTitles.STATIC_CONTENTS,
        permissions: {
          view: true,
          edit: true,
        },
        view_value: UserPermissions.static_contents_view,
        edit_value: UserPermissions.static_contents_edit,
      },
      {
        name: PageTitles.FAQ,
        permissions: {
          view: true,
          add: true,
          edit: true,
          delete: true
        },
        view_value: UserPermissions.faq_view,
        edit_value: UserPermissions.faq_edit,
        add_value: UserPermissions.faq_add,
        delete_value: UserPermissions.faq_delete,
      },
      {
        name: PageTitles.BLOGS,
        permissions: {
          view: true,
          add: true,
          edit: true,
        },
        view_value: UserPermissions.blogs_view,
        edit_value: UserPermissions.blogs_edit,
        add_value: UserPermissions.blogs_add,
      },
      {
        name: PageTitles.BLOG_CATEGORY,
        permissions: {
          view: true,
          add: true,
          edit: true,
        },
        view_value: UserPermissions.blog_categories_view,
        edit_value: UserPermissions.blog_categories_edit,
        add_value: UserPermissions.blog_categories_add,
      },
    ],
  },
  {
    name: PageTitles.PRODUCTS,
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: true,
    },
    view_value: UserPermissions.products_view,
    edit_value: UserPermissions.products_edit,
    delete_value: UserPermissions.products_delete,
    add_value: UserPermissions.products_add,
    subsections: [
      {
        name: PageTitles.PRODUCTS_CATEGORIES,
        permissions: {
          view: true,
          add: true,
          edit: true,
          delete: true,
        },
        view_value: UserPermissions.products_categories_view,
        edit_value: UserPermissions.products_categories_edit,
        delete_value: UserPermissions.products_categories_delete,
        add_value: UserPermissions.products_categories_add,
      },
      {
        name: PageTitles.PRODUCTS_REVIEWS,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.products_reviews_view,
      }
    ],
  },
  {
    name: PageTitles.ORDERS,
    permissions: {
      view: true,
    },
    view_value: UserPermissions.orders_view,
    subsections: [
      {
        name: PageTitles.ORDER_LIST,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.order_list_view,
      },
    ],
  },
  {
    name: PageTitles.CAMPAIGNS,
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: true,
    },
    view_value: UserPermissions.campaigns_view,
    edit_value: UserPermissions.campaigns_edit,
    delete_value: UserPermissions.campaigns_delete,
    add_value: UserPermissions.campaigns_add,
    subsections: [
      {
        name: PageTitles.PLATFORM_VOUCHERS,
        permissions: {
          view: true,
          add: true,
          edit: true,
          delete: true,
        },
        view_value: UserPermissions.platform_vouchers_view,
        edit_value: UserPermissions.platform_vouchers_edit,
        delete_value: UserPermissions.platform_vouchers_delete,
        add_value: UserPermissions.platform_vouchers_add,
      },
      {
        name: PageTitles.CAMPAIGNS_REQUEST,
        permissions: {
          view: true,
          delete: true,
          edit: true,
        },
        view_value: UserPermissions.campaigns_request_view,
        edit_value: UserPermissions.campaigns_request_edit,
        delete_value: UserPermissions.campaigns_request_delete,
      },
      {
        name: PageTitles.BANNERS,
        permissions: {
          view: true,
          add: true,
          edit: true,
          delete: true,
        },
        view_value: UserPermissions.banner_view,
        add_value: UserPermissions.banner_add,
        edit_value: UserPermissions.banner_edit,
        delete_value: UserPermissions.banner_delete,
      },
      {
        name: PageTitles.PROMOTIONS,
        permissions: {
          view: true,
          edit: true,
        },
        view_value: UserPermissions.web_promotion_view,
        edit_value: UserPermissions?.web_promotion_edit,
      }
    ],
  },
  {
    name: PageTitles.FINANCE,
    permissions: { view: true, edit: true, download: true },
    view_value: UserPermissions.finance_view,
    edit_value: UserPermissions.finance_edit,
    download_value: UserPermissions.finance_download,
    subsections: [
      {
        name: PageTitles.SELLER_WALLET,
        permissions: {
          view: true,
          edit: true,
          download: true,
        },
        view_value: UserPermissions.seller_wallet,
        edit_value: UserPermissions.seller_wallet_edit,
        download_value: UserPermissions.seller_wallet_download,
      },
      {
        name: PageTitles.TAX_INVOICE_DN,
        permissions: {
          view: true,
          delete: true,
        },
        view_value: UserPermissions.seller_invoice_view,
        delete_value: UserPermissions.seller_invoice_delete,
      },
      {
        name: PageTitles.MERCHANT_WALLET_REPORT,
        permissions: {
          view: true,
          delete: true,
        },
        view_value: UserPermissions.seller_invoice_view,
        delete_value: UserPermissions.seller_invoice_delete,
      },
    ],
  },
  {
    name: PageTitles.USER_MANAGEMENT,
    permissions: {
      view: true,
      edit: true,
      delete: true,
      download: true,
    },
    view_value: UserPermissions.user_management_view,
    edit_value: UserPermissions.user_management_edit,
    delete_value: UserPermissions.user_management_delete,
    download_value: UserPermissions.user_management_download,
    subsections: [
      {
        name: PageTitles.CUSTOMERS,
        permissions: {
          view: true,
          edit: true,
          delete: true,
          download: true,
        },
        view_value: UserPermissions.customers_view,
        edit_value: UserPermissions.customers_edit,
        delete_value: UserPermissions.customers_delete,
        download_value: UserPermissions.customers_download,
      },
      {
        name: PageTitles.SELLERS,
        permissions: {
          view: true,
          edit: true,
          delete: true,
        },
        view_value: UserPermissions.sellers_view,
        edit_value: UserPermissions.sellers_edit,
        delete_value: UserPermissions.sellers_delete,
      },
      {
        name: PageTitles.USER_DELETE_REQUEST,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.delete_requests_view,
      },
      {
        name: PageTitles.AFFILIATE_USERS,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.affiliate_users_view,
      },
      {
        name: PageTitles.AFFILIATE_WALLET,
        permissions: {
          view: true,
          edit: true,
        },
        view_value: UserPermissions.affiliate_wallet_view,
        edit_value: UserPermissions.affiliate_wallet_withdraw,
      }
    ],
  },
  {
    name: PageTitles.EMAIL_NOTIFICATIONS,
    permissions: {
      view: true,
      edit: true,
    },
    view_value: UserPermissions.email_notifications_view,
    edit_value: UserPermissions.email_notifications_edit,
    subsections: [
      {
        name: PageTitles.EMAIL_TEMPLATES,
        permissions: {
          view: true,
          edit: true,
        },
        view_value: UserPermissions.email_templates_view,
        edit_value: UserPermissions.email_templates_edit,
      },
      {
        name: PageTitles.USER_NEWSLETTER,
        permissions: {
          view: true,
          add: true,
        },
        view_value: UserPermissions.newsletter_view,
        add_value: UserPermissions.newsletter_add,
      },
    ],
  },
  {
    name: PageTitles.SETTINGS,
    permissions: {
      view: true,
    },
    view_value: "settings.view",
    subsections: [
      {
        name: PageTitles.SHIPPING_OPTIONS,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.shipping_options_view,
      },
      {
        name: PageTitles.WEB_ANNOUNCEMENT,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.web_announcement_view,
      },
      {
        name: PageTitles.CANCEL_REASON,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.cancel_reasons_view,
      },
      {
        name: PageTitles.SELLER_NOTICE,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.web_notification_view,
      },
      {
        name: PageTitles.PROHIBITED_KEYWORDS,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.prohibited_keywords_view,
      },
      {
        name: PageTitles.PUBLIC_HOLIDAYS,
        permissions: {
          view: true,
        },
        view_value: UserPermissions.ph_holidays_view,
      },
    ],
  }
];

export default function AdminAddEditForm({ onClose, props }) {
  const auth = useAuth();
  const hasPermissions = props?.permissions;

  const [expandedSections, setExpandedSections] = useState(() => {
    return permissionMapping.map((section, index) => index); // Set all sections as expanded by default
  });

  const [checkboxValues, setCheckboxValues] = useState(() => {
    // Set initial values for checkboxes to true if not specified
    const initialValues = permissionMapping.reduce((acc, section, index) => {

      const defaultPermissions = {
        view: true,
        add: true,
        edit: true,
        delete: true,
        download: true
      };

      const permissions = {
        view: hasPermissions && props.permissions.includes(section.view_value),
        add: hasPermissions && props.permissions.includes(section.add_value),
        edit: hasPermissions && props.permissions.includes(section.edit_value),
        delete: hasPermissions && props.permissions.includes(section.delete_value),
        download: hasPermissions && props.permissions.includes(section.download_value)
      };

      Object.entries(defaultPermissions).forEach(([permission, value]) => {
        acc[`${index}-${permission}`] = hasPermissions ? permissions[permission] : value;
      });

      if (section.subsections) {
        section.subsections.forEach((subSection, subIndex) => {
          const subPermissions = {
            view: hasPermissions && props.permissions.includes(subSection.view_value),
            add: hasPermissions && props.permissions.includes(subSection.add_value),
            edit: hasPermissions && props.permissions.includes(subSection.edit_value),
            delete: hasPermissions && props.permissions.includes(subSection.delete_value),
            download: hasPermissions && props.permissions.includes(subSection.download_value)
          };
          Object.entries(defaultPermissions).forEach(([permission, value]) => {
            acc[`${index}-${subIndex}-${permission}`] = hasPermissions ? subPermissions[permission] : value;
          });
        });
      }

      return acc;
    }, {});
    return initialValues;
  });

  const toggleSection = (index) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter((item) => item !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  const isSectionExpanded = (index) => {
    return expandedSections.includes(index);
  };

  const handleCheckboxChange = (sectionIndex, subsectionIndex, permission, value) => {
    const updatedValues = {};

    if (subsectionIndex === null) {
      const sectionKey = `${sectionIndex}-${permission}`;

      if (permission === 'view' && permissionMapping[sectionIndex].subsections) {
        const permissionsToUpdate = ['view', 'add', 'edit', 'delete', 'download'];

        for (const [subIndex, subsection] of permissionMapping[sectionIndex].subsections.entries()) {
          for (const perm of permissionsToUpdate) {
            if (subsection) {
              updatedValues[`${sectionIndex}-${perm}`] = value;
              updatedValues[`${sectionIndex}-${subIndex}-${perm}`] = value;
              updatedValues[`${sectionIndex}-${perm}-disabled`] = !value;
              updatedValues[`${sectionIndex}-${subIndex}-${perm}-disabled`] = !value;
            }
          }
        }
      } else if (['add', 'edit', 'delete', 'download'].includes(permission)) {
        for (const [subIndex, subsection] of permissionMapping[sectionIndex].subsections.entries()) {
          if (subsection) {
            updatedValues[`${sectionIndex}-${subIndex}-${permission}`] = value;
            updatedValues[`${sectionIndex}-${subIndex}-${permission}-disabled`] = !value;
          }
        }
      }

      updatedValues[sectionKey] = value;
    } else {
      updatedValues[`${sectionIndex}-${subsectionIndex}-${permission}`] = value;
    }

    setCheckboxValues((prevValues) => ({
      ...prevValues,
      ...updatedValues,
    }));
  };


  const handleConfirmation = async (e) => {
    e.preventDefault();
    let url = AdminApis.addAdmin
    const excludedFields = ["name", "surname", "email"];
    const permissionList = [];

    const formData = new FormData(e.target);
    for (let [name, value] of formData) {
      //Exclude fields to be added to permissions list
      if (!excludedFields.includes(name)) {
        permissionList.push(value);
      }
    }

    formData.append("permissions", JSON.stringify(permissionList));
    if (props?.id_user) {
      url = `${AdminApis.editAdmin}${props.id_user}/` //Append id if editing mode
    }

    await toast.promise(
      ApiCalls(url, "POST", formData, false, auth.token.access),
      {
        pending: {
          render() {
            return "Loading..."
          },
        },
        success: {
          render({ data }) {
            return data.data.message
          },
        },
        error: {
          render({ data }) {
            return data.data.message
          },
        },
      },
    )
  }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-start">
          <span className="pr-3 bg-white text-lg font-medium text-gray-900">Admin Details</span>
        </div>
      </div>

      <form className={GridStyle.overall} onSubmit={handleConfirmation}>
        <div className={GridStyle.layout}>
          <div>
            <label htmlFor="name" className="my-2 block text-base font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" defaultValue={props?.name} className={InputBoxStyle} />
          </div>
          <div>
            <label htmlFor="surname" className="my-2 block text-base font-medium text-gray-700">Surname</label>
            <input type="text" name="surname" id="surname" defaultValue={props?.surname} className={InputBoxStyle} />
          </div>
          <div>
            <label htmlFor="email" className="my-2 block text-base font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" defaultValue={props?.email} className={InputBoxStyle} />
          </div>
          {props?.id_user && 
            <div>
              <label htmlFor="qrcode" className="mt-2 block text-base font-medium text-gray-700">2FA Login QR Code</label>
              <img src={props?.qrcode} alt="2FA Login QR Code" height="130px" width="130px" name="qrcode" id="qrcode" />
            </div>
          }
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-start">
            <span className="pr-3 bg-white text-lg font-medium text-gray-900">Configure Permissions</span>
          </div>
        </div>

        {/* Start -- Checkbox Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full my-2 text-left text-sm font-light">
            <thead className="border-b font-medium dark:border-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-2">Pages</th>
                <th scope="col" className="px-4 py-2">View</th>
                <th scope="col" className="px-4 py-2">Add</th>
                <th scope="col" className="px-4 py-2">Edit</th>
                <th scope="col" className="px-4 py-2">Delete</th>
                <th scope="col" className="px-4 py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {permissionMapping.map((section, index) => (
                <React.Fragment key={index}>
                  <tr className="border-b dark:border-neutral-500 bg-gray-100">
                    <td className="px-4 py-2 font-medium">
                      {section.subsections ? (
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSection(index)}
                        >
                          {section.name}
                          {isSectionExpanded(index) ? (
                            <span className="ml-1">&#9660;</span>
                          ) : (
                            <span className="ml-1">&#9654;</span>
                          )}
                        </span>
                      ) : (<span>{section.name}</span>)}
                    </td>
                    <td className="px-6 py-2">
                      {section.permissions.view && (
                        <input
                          type="checkbox"
                          name={`${index}-view`}
                          value={section.view_value}
                          checked={checkboxValues[`${index}-view`] || false}
                          onChange={(e) => handleCheckboxChange(index, null, 'view', e.target.checked)}
                          className="h-4 w-4"
                        />
                      )}
                    </td>
                    <td className="px-6 py-2">
                      {section.permissions.add && (
                        <input
                          type="checkbox"
                          name={`${index}-add`}
                          value={section.add_value}
                          checked={checkboxValues[`${index}-add`] || false}
                          onChange={(e) => handleCheckboxChange(index, null, 'add', e.target.checked)}
                          className="h-4 w-4"
                          disabled={checkboxValues[`${index}-add-disabled`]}
                        />
                      )}
                    </td>
                    <td className="px-6 py-2">
                      {section.permissions.edit && (
                        <input
                          type="checkbox"
                          name={`${index}-edit`}
                          value={section.edit_value}
                          checked={checkboxValues[`${index}-edit`] || false}
                          onChange={(e) => handleCheckboxChange(index, null, 'edit', e.target.checked)}
                          className="h-4 w-4"
                          disabled={checkboxValues[`${index}-edit-disabled`]}
                        />
                      )}
                    </td>
                    <td className="px-6 py-2">
                      {section.permissions.delete && (
                        <input
                          type="checkbox"
                          name={`${index}-delete`}
                          value={section.delete_value}
                          checked={checkboxValues[`${index}-delete`] || false}
                          onChange={(e) => handleCheckboxChange(index, null, 'delete', e.target.checked)}
                          className="h-4 w-4"
                          disabled={checkboxValues[`${index}-delete-disabled`]}
                        />
                      )}
                    </td>
                    <td className="px-6 py-2">
                      {section.permissions.download && (
                        <input
                          type="checkbox"
                          name={`${index}-download`}
                          value={section.download_value}
                          checked={checkboxValues[`${index}-download`] || false}
                          onChange={(e) => handleCheckboxChange(index, null, 'download', e.target.checked)}
                          className="h-4 w-4"
                          disabled={checkboxValues[`${index}-download-disabled`]}
                        />
                      )}
                    </td>
                  </tr>
                  {isSectionExpanded(index) && section.subsections && (
                    <>
                      {section.subsections.map((subsection, subIndex) => (
                        <tr key={subIndex}>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {subsection.name}
                          </td>
                          <td className="px-6 py-4">
                            {subsection.permissions.view && (
                              <input
                                type="checkbox"
                                name={`${index}-${subIndex}-view`}
                                value={subsection.view_value}
                                checked={checkboxValues[`${index}-${subIndex}-view`] || false}
                                onChange={(e) => handleCheckboxChange(index, subIndex, 'view', e.target.checked)}
                                className="h-4 w-4"
                                disabled={checkboxValues[`${index}-${subIndex}-view-disabled`]}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {subsection.permissions.add && (
                              <input
                                type="checkbox"
                                name={`${index}-${subIndex}-add`}
                                value={subsection.add_value}
                                checked={checkboxValues[`${index}-${subIndex}-add`] || false}
                                onChange={(e) => handleCheckboxChange(index, subIndex, 'add', e.target.checked)}
                                className="h-4 w-4"
                                disabled={checkboxValues[`${index}-${subIndex}-add-disabled`]}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {subsection.permissions.edit && (
                              <input
                                type="checkbox"
                                name={`${index}-${subIndex}-edit`}
                                value={subsection.edit_value}
                                checked={checkboxValues[`${index}-${subIndex}-edit`] || false}
                                onChange={(e) => handleCheckboxChange(index, subIndex, 'edit', e.target.checked)}
                                className="h-4 w-4"
                                disabled={checkboxValues[`${index}-${subIndex}-edit-disabled`]}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {subsection.permissions.delete && (
                              <input
                                type="checkbox"
                                name={`${index}-${subIndex}-delete`}
                                value={subsection.delete_value}
                                checked={checkboxValues[`${index}-${subIndex}-delete`] || false}
                                onChange={(e) => handleCheckboxChange(index, subIndex, 'delete', e.target.checked)}
                                className="h-4 w-4"
                                disabled={checkboxValues[`${index}-${subIndex}-delete-disabled`]}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {subsection.permissions.download && (
                              <input
                                type="checkbox"
                                name={`${index}-${subIndex}-download`}
                                value={subsection.download_value}
                                checked={checkboxValues[`${index}-${subIndex}-download`] || false}
                                onChange={(e) => handleCheckboxChange(index, subIndex, 'download', e.target.checked)}
                                className="h-4 w-4"
                                disabled={checkboxValues[`${index}-${subIndex}-download-disabled`]}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {/* End -- Checkbox Table */}

        <div className="flex justify-end gap-4 py-2">
          <Button
            onClick={() => onClose({ add: "false" })}
            text="Back"
            type="cancel"
            py="2"
            px="3"
          />
          <Button
            text="Submit"
            type="submit"
            py="2"
            px="3"
          />
        </div>
      </form>
    </>
  )

}

