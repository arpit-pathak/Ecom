import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from "../../../assets/logo-white.svg";
import SidebarLinkGroup from './SidebarLinkGroup';
import { AdminRoutes } from '../../../Routes';
import SideBarIcons from '../generic/Icons';
import { PageTitles, PathNames, UserPermissions, UserType } from '../../utils';
import useAuth from '../../hooks/UseAuth';

const sidebarGroupItems = [
  {
    title: PageTitles.DASHBOARD,
    path: AdminRoutes.Landing,
    pathName: PathNames.DASHBOARD,
    requiredPermission: [UserPermissions.dashboard_view],
    icon: (props) => <SideBarIcons.DashboardIcon {...props} />,
    children: []
  },
  {
    title: PageTitles.WEB_CONTENTS,
    pathName: PathNames.WEB_CONTENTS,
    requiredPermission: [UserPermissions.web_contents_view],
    icon: (props) => <SideBarIcons.WebContentIcon {...props} />,
    children: [
      {
        title: PageTitles.STATIC_CONTENTS,
        path: AdminRoutes.ManageStaticContents,
        requiredPermission: [
          UserPermissions.web_contents_view,
          UserPermissions.static_contents_view,
        ],
      },
      {
        title: PageTitles.FAQ,
        path: AdminRoutes.ManageFAQ,
        requiredPermission: [
          UserPermissions.web_contents_view,
          UserPermissions.faq_view,
        ],
      },
      {
        title: PageTitles.FAQ_CATEGORY,
        path: AdminRoutes.ManageFAQCategories,
        requiredPermission: [
          UserPermissions.web_contents_view,
          UserPermissions.faq_view,
        ],
      },
      {
        title: PageTitles.BLOGS,
        path: AdminRoutes.ManageBlogs,
        requiredPermission: [
          UserPermissions.web_contents_view,
          UserPermissions.blogs_view,
        ],
      },
      {
        title: PageTitles.BLOG_CATEGORY,
        path: AdminRoutes.ManageBlogCategories,
        requiredPermission: [
          UserPermissions.web_contents_view,
          UserPermissions.blog_categories_view,
        ],
      }
    ]
  },
  {
    title: PageTitles.PRODUCTS,
    pathName: PathNames.PRODUCTS,
    requiredPermission: [UserPermissions.products_view],
    icon: (props) => <SideBarIcons.ProductIcon {...props} />,
    children: [
      {
        title: PageTitles.PRODUCTS_CATEGORIES,
        path: AdminRoutes.ManageProductCategories,
        requiredPermission: [
          UserPermissions.products_view,
          UserPermissions.products_categories_view
        ],
      },
      {
        title: PageTitles.PRODUCTS_REVIEWS,
        path: AdminRoutes.ManageProductReviews,
        requiredPermission: [
          UserPermissions.products_view,
          UserPermissions.products_reviews_view
        ],
      },
      {
        title: PageTitles.PRODUCTS_LIST,
        path: AdminRoutes.ManageProductList,
        requiredPermission: [
          UserPermissions.products_view,
        ],
      }
    ]
  },
  {
    title: PageTitles.ORDERS,
    pathName: PathNames.ORDERS,
    requiredPermission: [UserPermissions.orders_view],
    icon: (props) => <SideBarIcons.OrderIcon {...props} />,
    children: [
      {
        title: PageTitles.ORDER_LIST,
        path: AdminRoutes.ManageOrders,
        requiredPermission: [
          UserPermissions.orders_view,
          UserPermissions.order_list_view
        ]
      },
      {
        title: PageTitles.ORDER_REPORT,
        path: AdminRoutes.ManageLateOrders,
        requiredPermission: [
          UserPermissions.orders_view,
          UserPermissions.order_list_view
        ]
      }
    ]
  },
  {
    title: PageTitles.CAMPAIGNS,
    pathName: PathNames.CAMPAIGNS,
    requiredPermission: [UserPermissions.campaigns_view],
    icon: (props) => <SideBarIcons.CampaignIcon {...props} />,
    children: [
      {
        title: PageTitles.PLATFORM_VOUCHERS,
        path: AdminRoutes.ManagePlatformVouchers,
        requiredPermission: [
          UserPermissions.campaigns_view,
          UserPermissions.platform_vouchers_view
        ],
      },
      {
        title: PageTitles.CAMPAIGNS_REQUEST,
        path: AdminRoutes.ManageCampaigns,
        requiredPermission: [
          UserPermissions.campaigns_view,
          UserPermissions.campaigns_request_view
        ],
      },
      {
        title: PageTitles.BANNERS,
        path: AdminRoutes.ManageBanners,
        requiredPermission: [
          UserPermissions.campaigns_view,
          UserPermissions.banner_view
        ],
      },
      {
        title: PageTitles.PROMOTIONS,
        path: AdminRoutes.ManagePromotions,
        requiredPermission: [
          UserPermissions.campaigns_view,
          UserPermissions.web_promotion_view
        ],
      }
    ]
  },
  {
    title: PageTitles.FINANCE,
    pathName: PathNames.FINANCE,
    requiredPermission: [UserPermissions.finance_view],
    icon: (props) => <SideBarIcons.FinanceIcon {...props} />,
    children: [
      {
        title: PageTitles.SELLER_WALLET,
        path: AdminRoutes.ManageSellerWallet,
        requiredPermission: [
          UserPermissions.finance_view,
          UserPermissions.seller_wallet
        ],
      },
      {
        title: PageTitles.TAX_INVOICE_DN,
        path: AdminRoutes.ManageTaxInvoices,
        requiredPermission: [
          UserPermissions.finance_view,
          UserPermissions.seller_invoice_view
        ],
      },
      {
        title: PageTitles.MERCHANT_WALLET_REPORT,
        path: AdminRoutes.ManageMerchantWalletSummary,
        requiredPermission: [
          UserPermissions.finance_view,
          UserPermissions.sellers_view
        ],
      }
    ]
  },
  {
    title: PageTitles.USER_MANAGEMENT,
    pathName: PathNames.MANAGE_USERS,
    requiredPermission: [UserPermissions.user_management_view],
    icon: (props) => <SideBarIcons.UserManagementIcon {...props} />,
    children: [
      {
        title: PageTitles.CUSTOMERS,
        path: AdminRoutes.ManageCustomer,
        requiredPermission: [
          UserPermissions.user_management_view,
          UserPermissions.customers_view
        ],
      },
      {
        title: PageTitles.SELLERS,
        path: AdminRoutes.ManageSeller,
        requiredPermission: [
          UserPermissions.user_management_view,
          UserPermissions.sellers_view
        ],
      },
      {
        title: PageTitles.ADMIN,
        path: AdminRoutes.ManageAdmin,
        requiredPermission: [
          UserType.SUPERADMIN
        ],
      },
      {
        title: PageTitles.USER_DELETE_REQUEST,
        path: AdminRoutes.ManageDeleteRequests,
        requiredPermission: [
          UserPermissions.user_management_view,
          UserPermissions.delete_requests_view
        ],
      }, 
      {
        title: PageTitles.AFFILIATE_USERS,
        path: AdminRoutes.ManageAffiliateUsers,
        requiredPermission: [
          UserPermissions.user_management_view,
          UserPermissions.affiliate_users_view
        ],
      },
    ]
  },
  {
    title: PageTitles.EMAIL_NOTIFICATIONS,
    pathName: PathNames.EMAIL,
    requiredPermission: [UserPermissions.email_notifications_view],
    icon: (props) => <SideBarIcons.EmailNotificationIcon {...props} />,
    children: [
      {
        title: PageTitles.EMAIL_TEMPLATES,
        path: AdminRoutes.ManageEmail,
        requiredPermission: [
          UserPermissions.email_notifications_view,
          UserPermissions.email_templates_view
        ],
      },
      {
        title: PageTitles.USER_NEWSLETTER,
        path: AdminRoutes.ManageNewsletter,
        requiredPermission: [
          UserPermissions.email_notifications_view,
          UserPermissions.newsletter_view,
        ],
      }
    ]
  },
];


const sidebarGroupSecondItems = [
  {
    title: PageTitles.SETTINGS,
    pathName: PathNames.SETTINGS,
    requiredPermission: [UserPermissions.settings_view],
    icon: (props) => <SideBarIcons.SettingIcon {...props} />,
    children: [
      {
        title: PageTitles.SELLER_NOTICE,
        path: AdminRoutes.ManageSellerNotice,
        requiredPermission: [
          UserPermissions.settings_view,
          UserPermissions.web_notification_view
        ],
      },
      {
        title: PageTitles.SHIPPING_OPTIONS,
        path: AdminRoutes.ManageShippingOptions,
        requiredPermission: [
          UserPermissions.settings_view,
          UserPermissions.shipping_options_view,
        ],
      },
      {
        title: PageTitles.CANCEL_REASON,
        path: AdminRoutes.ManageCancelReasons,
        requiredPermission: [
          UserPermissions.settings_view,
          UserPermissions.cancel_reasons_view,
        ],
      },
      {
        title: PageTitles.WEB_ANNOUNCEMENT,
        path: AdminRoutes.ManageWebAnnouncement,
        requiredPermission: [
          UserPermissions.settings_view,
          UserPermissions.web_announcement_view
        ],
      },
      {
        title: PageTitles.PROHIBITED_KEYWORDS,
        path: AdminRoutes.ManageProhibitedKeywords,
        requiredPermission: [
          UserPermissions.settings_view,
          UserPermissions.prohibited_keywords_view
        ],
      },
      {
        title: PageTitles.PUBLIC_HOLIDAYS,
        path: AdminRoutes.ManagePublicHolidays,
        requiredPermission: [
          UserPermissions.settings_view,
          UserPermissions.ph_holidays_view
        ],
      }
    ]
  },
  {
    title: PageTitles.MY_PROFILE,
    path: AdminRoutes.ManageProfile,
    pathName: PathNames.PROFLE,
    icon: (props) => <SideBarIcons.ProfileIcon {...props} />,
    requiredPermission: [],
    children: []
  },
]

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const auth = useAuth();

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? true : storedSidebarExpanded === 'true');

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector('body').classList.add('sidebar-expanded');
    } else {
      document.querySelector('body').classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`
        flex flex-col
        absolute z-40 left-0 top-0 
        lg:static lg:left-auto lg:top-auto lg:translate-x-0 
        h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 
        lg:w-24 xl:w-auto lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 
        bg-slate-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'
          }`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between pr-3 mb-10 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-slate-500 hover:text-slate-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/" className="block">
            <img
              src={logo}
              alt="Logo"
            />
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <h3 className="pl-3 text-xs font-semibold uppercase text-slate-500">
              <span className="hidden w-6 text-center lg:block lg:sidebar-expanded:hidden 2xl:hidden" aria-hidden="true">
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Pages</span>
            </h3>
            <ul className="mt-3">
              {sidebarGroupItems.map((item, index) => (
                <SidebarLinkGroup key={index} activecondition={pathname.includes(item.pathName)}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        {item.children.length > 0 ? (
                          <>
                            {auth.checkPermission(item.requiredPermission) && (
                              <a
                                href="#0"
                                className={`block text-slate-200 hover:text-white truncate transition duration-150 ${pathname.includes(item.pathName) && 'hover:text-slate-200'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {/* Icon */}
                                    {item.icon && item.icon({ pathname: pathname, name: item.pathName })}
                                    <span className="ml-3 text-sm font-medium duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                                      {item.title}
                                    </span>
                                  </div>

                                  <div className="flex ml-2 shrink-0">
                                    <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                                    </svg>
                                  </div>
                                </div>
                              </a>
                            )}

                            <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                              <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                                {item.children.map((child, index) => (
                                  auth.checkPermission(child.requiredPermission) && (
                                    <li key={index} className="mb-1 last:mb-0">
                                      <NavLink
                                        key={index}
                                        end
                                        to={child.path}
                                        className={({ isActive }) =>
                                          'block text-slate-400 hover:text-slate-200 transition duration-150 truncate ' + (isActive ? '!text-indigo-500' : '')
                                        }
                                      >
                                        <span className="text-sm font-medium duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                                          {child.title}
                                        </span>
                                      </NavLink>
                                    </li>
                                  )))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          auth.checkPermission(item.requiredPermission) && (
                            <li key={index} className="mb-1 last:mb-0">
                              <NavLink
                                key={index}
                                end
                                to={item.path}
                                className={({ isActive }) =>
                                  'block text-slate-200 hover:text-white transition duration-150 truncate ' + (isActive ? '!text-indigo-500' : '')
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {item.icon && item.icon({ pathname: pathname, name: item.pathName })}
                                    <span className="ml-3 text-sm font-medium duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                                      {item.title}
                                    </span>
                                  </div>
                                  {item.title === 'Messages' && (
                                    <>
                                      {/* Badge */}
                                      <div className="flex flex-shrink-0 ml-2">
                                        <span className="inline-flex items-center justify-center h-5 px-2 text-xs font-medium text-white bg-indigo-500 rounded">4</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </NavLink>
                            </li>
                          )
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              ))}
            </ul>
          </div>

          {/* More group */}
          <div>
            <h3 className="pl-3 text-xs font-semibold uppercase text-slate-500">
              <span className="hidden w-6 text-center lg:block lg:sidebar-expanded:hidden 2xl:hidden" aria-hidden="true">
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Others</span>
            </h3>
            <ul className="mt-3">
              {sidebarGroupSecondItems.map((item, index) => (
                <SidebarLinkGroup key={index} activecondition={pathname.includes(item.pathName)}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        {item.children.length > 0 ? (
                          <>
                            <a
                              href="#0"
                              className={`block text-slate-200 hover:text-white truncate transition duration-150 ${pathname.includes(item.pathName) && 'hover:text-slate-200'
                                }`}
                              onClick={(e) => {
                                e.preventDefault();
                                sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {/* Icon */}
                                  {item.icon && item.icon({ pathname: pathname, name: item.pathName })}
                                  <span className="ml-3 text-sm font-medium duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                                    {item.title}
                                  </span>
                                </div>

                                <div className="flex ml-2 shrink-0">
                                  <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                                  </svg>
                                </div>
                              </div>
                            </a>

                            <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                              <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                                {item.children.map((child, index) => (
                                  <li key={index} className="mb-1 last:mb-0">
                                    <NavLink
                                      key={index}
                                      end
                                      to={child.path}
                                      className={({ isActive }) =>
                                        'block text-slate-400 hover:text-slate-200 transition duration-150 truncate ' + (isActive ? '!text-indigo-500' : '')
                                      }
                                    >
                                      <span className="text-sm font-medium duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                                        {child.title}
                                      </span>
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <li key={index} className="mb-1 last:mb-0">
                            <NavLink
                              key={index}
                              end
                              to={item.path}
                              className={({ isActive }) =>
                                'block text-slate-400 hover:text-slate-200 transition duration-150 truncate ' + (isActive ? '!text-indigo-500' : '')
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {item.icon && item.icon({ pathname: pathname, name: item.pathName })}
                                  <span className="ml-3 text-sm font-medium duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                                    {item.title}
                                  </span>
                                </div>
                              </div>
                            </NavLink>
                          </li>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              ))}
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        {/* <div className="justify-end hidden pt-3 mt-auto lg:inline-flex xl:hidden">
          <div className="px-3 py-2">
            <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="w-6 h-6 fill-current sidebar-expanded:rotate-180" viewBox="0 0 24 24">
                <path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                <path className="text-slate-600" d="M3 23H1V1h2z" />
              </svg>
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
}

export default Sidebar;