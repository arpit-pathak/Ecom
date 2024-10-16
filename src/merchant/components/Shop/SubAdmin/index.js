import { useEffect, useState } from "react";
import { MerchantRoutes } from "../../../../Routes";
import Navbar from "../../Navbar";
import { Sidebar } from "../../Parts";
import { LuUserSquare } from "react-icons/lu";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Modal } from "../../../../customer/components/GenericComponents";
import { IoIosWarning } from "react-icons/io";
import { ApiCalls, Apis } from "../../../utils/ApiCalls.js";
import { Constants } from "../../../utils/Constants.js";
import ls from "local-storage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../../../utils/Pagination/pagination.js";
import ModifySubAdminIcon from "../../../../assets/seller/modify-sub-admin.svg"

const SubAdminList = () => {
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);
  const navigate = useNavigate();
  // const [currentTab, setCurrentTab] = useState("subAdminList");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState(10);
  const [isMoreClicked, setIsMoreClicked] = useState([]);
  const [isDeleteUser, setIsDeleteUser] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [subAdminList, setSubAdminList] = useState([]);
  const [updateUserStatus, setUpdateUserStatus] = useState(false);
  const [userToUpdateStatus, setUserToupdateStatus] = useState(false)

  useEffect(() => {
   loadSubAdminList()
  }, [page, entries]);

  const loadSubAdminList = () =>{
    ApiCalls(
      {},
      Apis.getSubAdminList,
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      processResponse
    );
  }

  const processResponse = (res, api) => {
    if (res.data.result === "SUCCESS") {
      let rdata = res.data.data
      setSubAdminList(rdata?.user_list);
      setTotal(rdata?.total_records);
      setPages(rdata?.total_pages)
      setIsMoreClicked(new Array(rdata?.user_list.length).fill(false))

      ls("seller_modules", rdata?.seller_module);
    }
  };

  // const loadTab = (selectedTab) => {
  //   setCurrentTab(selectedTab);
  //   setPage(1);
  // };

  const deleteSubAdmin = () => {
    ApiCalls(
      {},
      Apis.deleteSubAdminUser + userIdToDelete + "/",
      "DELETE",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          toast.success(res.data.message);
          setIsDeleteUser(false)
          loadSubAdminList()
        } else toast.error(res.data.message);
      }
    );
  };

  const updateStatus = (userId, status) => {
    var formData = new FormData();
    formData.append("user_status", status);
    ApiCalls(
      formData,
      Apis.updateSubAdminStatus + userId + "/",
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      (res) => {
        if (res.data.result === "SUCCESS") {
          let list = subAdminList;
          let adminIdx = list.findIndex((item) => item.id_user === userId);
          list[adminIdx] = { ...list[adminIdx], user_status: status };
          setSubAdminList([...list]);
          toast.success(res.data.message);
          setUpdateUserStatus(false)
        } else toast.error(res.data.message);
      }
    );
  };

  const statusDiv = (type) => {
    if (type === "active") {
      return (
        <div className="w-20 text-center py-1 bg-[#E3F3DC] text-[#4EC317] rounded">
          Active
        </div>
      );
    } else {
      return (
        <div className="w-20 py-1 text-center bg-[#FFE9E9] text-[#FF3131] rounded">
          Inactive
        </div>
      );
    }
  };

  const toPage = (page) => {
    setPage(page);
  };

  const changeEntries = (e) => {
    setPage(1);
    setEntries(e.target.value);
  };

  const openInDetail = (subAdminData) => {
    navigate(MerchantRoutes.SubAdminDetails.replace(":id", subAdminData?.id_user), {
      state: {
        subAdminData: subAdminData,
        type: "view"
      }
    })
  };

  const updateSubAdminData = (subAdminData) => {
    navigate(MerchantRoutes.SubAdminUpdate.replace(":id", subAdminData?.id_user), {
      state: {
        subAdminData: subAdminData,
        type: "update"
      }
    })
  };

  return (
    <main className="app-merchant merchant-db">
      <Navbar theme="dashboard" />
      <Sidebar selectedMenu={4.4} />
      <div className="main-contents">
        <div className="breadcrumbs">
          <div className="page-title !font-bold !py-5">Sub-Admin Setting</div>

          <ul className="!py-5">
            <li>
              <a href={MerchantRoutes.Landing}>Home {">"}</a>
            </li>
            <li>
              <a href={MerchantRoutes.ShopProfile}>Shop {">"}</a>
            </li>
            <li className="!font-bold ">Sub-Admin Setting</li>
          </ul>
        </div>
        <div className="listing-page mt-5">
          <div className="body">
            {/* <ul className="tabs mb-4 !p-0">
              <li
                onClick={(e) => loadTab("subAdminList")}
                id="SubAdminList"
                className={currentTab === "subAdminList" ? "active" : ""}
              >
                Sub-Admin List
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => loadTab("privilegeManagement")}
                id="PrivilegeManagement"
                className={currentTab === "privilegeManagement" ? "active" : ""}
              >
                Privilege Management
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => loadTab("loginRecord")}
                id="LoginRecord"
                className={currentTab === "loginRecord" ? "active" : ""}
              >
                Login Record
                <div className="border"></div>
              </li>
            </ul> */}
            <div className="flex justify-between px-8 items-center gap-4 my-4">
              <p className="font-bold">Sub-Admin List</p>
              <button
                className="ml-8 mb-6 mt-3 text-center border-[1px] px-6 py-2 bg-orangeButton rounded-[4px] text-white text-[14px] 
              font-medium leading-6 min-w-[120px] h-[45px] hover:bg-amber-500 disabled:opacity-50 disabled:cursor-default"
                onClick={() => navigate(MerchantRoutes.CreateSubAdmin, {
                  state: {type: "create"}
                })}
              >
                Create Sub-Admin
              </button>
            </div>

            <div className="mb-6">
              <table id="financeTable">
                <thead className="px-4">
                  {/* {currentTab === "subAdminList" && ( */}
                  <tr>
                    <td width="33%" className="!pl-8">
                      Sub-Admin Name
                    </td>
                    <td width="20%">User Permissions</td>
                    <td width="17%">Status</td>
                    <td width="30%">Actions</td>
                  </tr>
                  {/* )} */}
                </thead>

                <tbody>
                  {total === 0 ? (
                    <tr>
                      <td width="33%"></td>
                      <td width="20%" className="text-center">
                        No data found
                      </td>
                      <td width="17%"></td>
                      <td width="30%"></td>
                    </tr>
                  ) : (
                    <>
                      {subAdminList.map((subAdmin, index) => {
                        return (
                          <>
                            <tr>
                              <td width="33%" className="!pl-8">
                                <div>
                                  <p>{subAdmin?.username}</p>
                                  <p className="text-[#999999]">
                                    {subAdmin?.email}
                                  </p>
                                </div>
                              </td>
                              <td width="20%">
                                {subAdmin?.user_permission.map((permission) => {
                                  return (
                                    <p className="font-semibold">
                                      {permission}
                                    </p>
                                  );
                                })}
                              </td>
                              <td width="17%">
                                {statusDiv(subAdmin?.user_status)}
                              </td>
                              <td width="30%">
                                <div className="text-[#2F80ED]">
                                  <div
                                    className="flex gap-2 items-center cp mb-1"
                                    onClick={() => updateSubAdminData(subAdmin)}
                                  >
                                    <img
                                      alt=""
                                      src={ModifySubAdminIcon}
                                      className="modify-sub-admin"
                                      onClick={(e) => this.socialLogin("fb")}
                                    />
                                    <p className="font-medium">
                                      Modify Sub-Admin Details
                                    </p>
                                  </div>
                                  <div
                                    className="flex gap-2 items-center cp mb-1"
                                    onClick={() => openInDetail(subAdmin)}
                                  >
                                    <LuUserSquare />
                                    <p className="font-medium">
                                      {" "}
                                      Check Details
                                    </p>
                                  </div>
                                  <div
                                    className="flex gap-1 items-center cp relative pb-3"
                                    onClick={() => {
                                      let clicks = isMoreClicked;
                                      clicks[index] = !clicks[index];
                                      setIsMoreClicked([...clicks]);
                                    }}
                                  >
                                    <p className="font-medium ml-6">More</p>
                                    <MdKeyboardArrowDown />
                                    {isMoreClicked[index] && (
                                      <div className="absolute bg-white shadow-md rounded-md p-3 top-[15px]">
                                        <p
                                          className="cp"
                                          onClick={() => {
                                            setUpdateUserStatus(true)
                                            setUserToupdateStatus(subAdmin)                                            
                                          }}
                                        >
                                          {subAdmin?.user_status === "active"
                                            ? "Deactivate"
                                            : "Activate"}
                                        </p>
                                        <p
                                          className="cp"
                                          onClick={() => {
                                            setIsDeleteUser(true);
                                            setUserIdToDelete(
                                              subAdmin?.id_user
                                            );
                                          }}
                                        >
                                          Delete
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                            <div className="w-full h-[1px] bg-[#E6E6E6]"></div>
                          </>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>

              <Pagination
                entries={entries}
                changeEntries={changeEntries}
                toPage={toPage}
                pages={pages}
                page={page}
                total={total}
              />
            </div>
            
            {isDeleteUser && (
              <Modal
                open={isDeleteUser}
                width="w-11/12 sm:w-[400px]"
                children={
                  <div>
                    <div className="flex gap-2  my-3">
                      <IoIosWarning color="#F5AB35" size={30} />
                      <p>Are you sure you want to delete this sub-admin account?</p>
                    </div>
                    <div className="flex justify-end gap-3 items-center mt-8">
                      <button
                        className="px-4 py-2 text-center rounded bg-orangeButton text-white"
                        onClick={() => deleteSubAdmin()}
                      >
                        Confirm
                      </button>
                      <button
                        className="px-4 py-2 text-center rounded bg-[#F1F1F1]"
                        onClick={() => setIsDeleteUser(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                }
              />
            )}

            {updateUserStatus && (
              <Modal
                open={updateUserStatus}
                width="w-11/12 sm:w-[400px]"
                children={
                  <div>
                    <div className="flex gap-2  my-3">
                      <IoIosWarning color="#F5AB35" size={30} />
                      <p>Are you sure to { userToUpdateStatus?.user_status === "active" ? "deactivate" : "activate"} this sub-admin account  ?</p>
                    </div>
                    <div className="flex justify-end gap-3 items-center mt-8">
                      <button
                        className="px-4 py-2 text-center rounded bg-orangeButton text-white"
                        onClick={() => updateStatus(
                          userToUpdateStatus?.id_user,
                          userToUpdateStatus?.user_status === "active"
                            ? "inactive"
                            : "active"
                        )}
                      >
                        Confirm
                      </button>
                      <button
                        className="px-4 py-2 text-center rounded bg-[#F1F1F1]"
                        onClick={() => setUpdateUserStatus(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SubAdminList;
