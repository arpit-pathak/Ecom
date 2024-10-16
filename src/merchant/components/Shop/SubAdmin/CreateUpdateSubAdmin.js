import { useEffect, useState } from "react";
import { MerchantRoutes } from "../../../../Routes.js";
import Navbar from "../../Navbar.js";
import { Sidebar } from "../../Parts.js";
import ls from "local-storage";
import { ApiCalls, Apis } from "../../../utils/ApiCalls.js";
import { Constants } from "../../../utils/Constants.js";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

// const checkboxStyle = {
//   appearance: "none",
//   width: "10px",
//   height: "20px",
//   border: "2px solid #ccc",
//   borderRadius: "4px",
//   position: "relative",
//   outline: "none",
// };

const CreateUpdateSubAdmin = () => {
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);
  const navigate = useNavigate();

  const { state } = useLocation();
  const subAdminData = state?.subAdminData;
  const actionType = state?.type;

  const sellerModules = ls("seller_modules") ?? [];
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isChecked, setIsChecked] = useState([]);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (actionType === "create" || actionType === "update") setIsEditable(true);

    if (subAdminData) {
      setUserName(subAdminData?.username);
      setEmail(subAdminData?.email);
      setMobile(subAdminData?.contact_number);
      if (sellerModules.length > 0) {
        let accessModules = [];
        let permissions = subAdminData?.user_permission;
        for (let i = 0; i < permissions.length; i++) {
          let idx = sellerModules.findIndex(
            (item) => item?.module_slug === permissions[i]
          );
          if (idx > -1) {
            accessModules.push(idx);
          }
        }
        setIsChecked([...accessModules]);
      }
    }
  }, []);

  const handleCheckboxChange = (index) => {
    let checks = isChecked;
    if (!checks.includes(index)) checks.push(index);
    else {
      checks = checks.filter((item) => item !== index);
    }
    setIsChecked([...checks]);
  };

  const validateValues = () => {
    if (
      username &&
      email &&
      mobile &&
      username !== "" &&
      mobile !== "" &&
      email !== "" &&
      isChecked.length > 0
    )
      return true;
    else {
      toast.error("Please fill in all mandatory fields to proceed");
      return false;
    }
  };

  const callUpdateSubAdminDetails = (type) => {
    if (validateValues()) {
      var formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("contact_number", mobile);
      for (let i = 0; i < isChecked.length; i++) {
        formData.append(
          "allowed_module[]",
          sellerModules[isChecked[i]]?.module_slug
        );
      }
      ApiCalls(
        formData,
        actionType === "create"
          ? Apis.createSubAdmin
          : Apis.updateSubAdminDetails + subAdminData?.id_user + "/",
        "POST",
        {
          Authorization: "Bearer " + user.access,
        },
        (res) => {
          if (res.data.result === "SUCCESS") {
            toast.success(res.data.message);
            setTimeout(() => navigate(MerchantRoutes.SubAdminList), 1000);
          } else toast.error(res.data.message);
        }
      );
    }
  };

  const handleFieldChange = (e, type) => {
    switch (type) {
      case "username":
        setUserName(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        break;
      case "mobile":
        setMobile(e.target.value);
        break;
      default:
        console.log(e.target.value);
    }
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

            <li>
              <a href={MerchantRoutes.SubAdminList}>Sub-Admin Setting {">"}</a>
            </li>
            <li className="!font-bold ">Create Sub-Admin</li>
          </ul>
        </div>
        <div className="listing-page mt-5 mb-10">
          <div className="body p-10">
            <div
              onClick={() => navigate(-1)}
              className="!text-black font-normal mb-6 cp"
            >
              {"<"}&nbsp;Back
            </div>
            {/* sub admin username */}
            <div className="flex gap-2 items-center">
              <p className="w-48 text-[15px] font-semibold">
                <span className="text-red-500">*</span> Username
              </p>
              <input
                id="username"
                type="text"
                placeholder="Username"
                disabled={!isEditable}
                value={username}
                onChange={(e) => handleFieldChange(e, "username")}
                className="appearance-none w-full sm:w-1/2 max-w-[500px] px-3 py-2 border border-gray-300 rounded-md 
                                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
              />
            </div>

            {/* sub admin email */}
            <div className="flex gap-2 items-center mt-8">
              <p className="w-48 text-[15px] font-semibold">
                <span className="text-red-500">*</span> Email
              </p>
              <input
                id="email"
                type="text"
                placeholder="Email"
                disabled={!isEditable}
                value={email}
                onChange={(e) => handleFieldChange(e, "email")}
                className="appearance-none w-full sm:w-1/2 max-w-[500px] px-3 py-2 border border-gray-300 rounded-md 
                                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
              />
            </div>

            {/* sub admin mobile */}
            <div className="flex gap-2 items-center mt-8">
              <p className="w-48 text-[15px] font-semibold">
                <span className="text-red-500">*</span> Mobile Number
              </p>
              <input
                id="mobile"
                type="text"
                placeholder="Mobile Number"
                disabled={!isEditable}
                value={mobile}
                onChange={(e) => handleFieldChange(e, "mobile")}
                className="appearance-none w-full sm:w-1/2 max-w-[500px] px-3 py-2 border border-gray-300 rounded-md 
                                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
              />
            </div>

            <>
              <p className="w-48 text-[15px] font-semibold mt-8 mb-4">
                <span className="text-red-500">*</span> Allowed Modules
              </p>
              <div className="grid grid-cols-2 gap-10 p-4 items-center sm:w-[500px] w-full">
                {sellerModules.map((item, idx) => {
                  return (
                    <div className="flex gap-1 items-center">
                      <label
                        style={{ display: "inline-block", cursor: "pointer" }}
                        id="check_label"
                      >
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={isChecked.includes(idx)}
                          onChange={() => handleCheckboxChange(idx)}
                        />
                      </label>
                      <p>{item?.module_name}</p>
                    </div>
                  );
                })}
              </div>
            </>

            {actionType !== "view" && (
              <button
                className=" my-4 text-center border-[1px] px-6 py-2 bg-orangeButton rounded-[4px] text-white text-[14px] 
                font-medium leading-6 min-w-[120px] h-[45px] hover:bg-amber-500 disabled:opacity-50 disabled:cursor-default"
                onClick={callUpdateSubAdminDetails}
              >
                {actionType === "update" ? "Update" : "Confirm"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateUpdateSubAdmin;
