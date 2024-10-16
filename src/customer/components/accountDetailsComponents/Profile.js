import React, { useState } from "react";
import { useFormik } from "formik";
import ImageUploading from "react-images-uploading";
import Loader from "../../../utils/loader";
import { personalInfoSchema, ChangePasswordSchema } from "../../schemas";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import { PopUpComponent } from "../GenericComponents";
import { Modal } from "../GenericComponents";
import { ImCross } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { setProfilePic } from "../../redux/reducers/profileReducer";
import commisionsSvg from "../../../assets/buyer/affiliate/commision.svg";
import ls from "local-storage";

//images & css
import "../../../index.css";

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaRegUser, FaUser, FaRegCopy, FaAngleRight } from "react-icons/fa";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

import { BsTelephone, BsGenderMale } from "react-icons/bs";

import {
  AiOutlineMail,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { MdOutlineEdit } from "react-icons/md";

import { BiKey } from "react-icons/bi";

//images
import ushopWhiteIcon from "../../../assets/buyer/ushopLogoBg.svg";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { AffiliateInfoModal } from "../affiliateCommissions/AffiliateConstants";

export default function Profile({ profile, setProfile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile_pic = useSelector((state) => state.profile.profile_pic);
  const [gender, setGender] = useState(profile?.gender);
  const [editPersonalInfo, setEditPersonalInfo] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [popupResult, setPopupResult] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [genderErrorMessage, setGenderErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showCfmPass, setShowCfmPass] = useState(false);
  const [openDeleteForm, setOpenDeleteForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("customer"));
  const [uploadImg, setUploadImg] = useState(false);
  const [images, setImages] = React.useState([]);
  const [isAccDelRequested, setIsAccDelRequested] = useState(false);
  const inputCss = "flex border px-3 py-2 w-full";
  const passwordRuleCss =
    "whitespace-nowrap border bg-gray-200 px-2 py-1 text-[10px]  md:text-[10px] text-[#8F909A]";
  const isAFfiliate = profile?.is_affiliate, affiliateUrl = profile?.affiliate_url;
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
  };

  const copyUrl = () => {
    setIsUrlCopied(true)
    navigator.clipboard.writeText(affiliateUrl)

    setTimeout(()=>setIsUrlCopied(false), 1000)

  }

  const passwordHandler = () => {
    if (
      !passwordForm.errors.newPassword &&
      !passwordForm.errors.confirmPassword
    ) {
      setLoading(true);
      const formData = {
        password: passwordForm.values.currentPassword,
        new_password: passwordForm.values.newPassword,
        confirm_password: passwordForm.values.confirmPassword,
      };
      BuyerApiCalls(
        formData,
        Apis.editPassword,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    } else {
      setLoading(false);
    }
  };

  const personalInfoHandler = () => {
    if (editPersonalInfo) {
      if (!userNameError && !phoneNumberError && !genderErrorMessage) {
        if (gender === null) {
          return setGenderErrorMessage("Gender cannot be empty");
        }
        setLoading(true);
        const formData = new FormData();
        formData.append("full_name", profileForm.values.userName);
        formData.append("gender", gender);
        BuyerApiCalls(
          formData,
          Apis.editProfile,
          "POST",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          },
          processRes
        );
      }
    } else {
      setEditPersonalInfo(!editPersonalInfo);
    }
  };
  const profileImgHandler = () => {
    if (images.length > 0) {
      setLoading(true);
      const formData = new FormData();
      console.log(images[0].file);
      formData.append("profile_image", images[0].file);
      BuyerApiCalls(
        formData,
        Apis.uploadProfileImg,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    }
  };
  const genderHandler = (event) => {
    if (event.target.value !== null) {
      setGender(event.target.value);
      setGenderErrorMessage(false);
    } else {
      setGenderErrorMessage("Gender cannot be empty");
    }
  };

  const profileForm = useFormik({
    initialValues: {
      userName: profile?.full_name || "",
      phoneNumber: profile?.contact_number || "",
    },
    validationSchema: personalInfoSchema,
  });

  const passwordForm = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: ChangePasswordSchema,
  });

  var userNameError =
    profileForm.errors.userName && profileForm.touched.userName
      ? "inputError"
      : "";
  var phoneNumberError =
    profileForm.errors.phoneNumber && profileForm.touched.phoneNumber
      ? "inputError"
      : "";
  var currentPasswordError =
    passwordForm.errors.currentPassword && passwordForm.touched.currentPassword
      ? "inputError"
      : "";
  var newPasswordError =
    passwordForm.errors.newPassword && passwordForm.touched.newPassword
      ? "inputError"
      : "";
  var confirmPasswordError =
    passwordForm.errors.confirmPassword && passwordForm.touched.confirmPassword
      ? "inputError"
      : "";

  const processRes = (res, api) => {
    if (res.data) {
      setLoading(false);
    }

    if (api === Apis.retrieveProfile) {
      setProfile(res.data.data);
      ls("promoPlatforms", res.data.data?.promotion_platform)
      return;
    }
    if (api === Apis.deleteAccount) {
      setOpenDeleteForm(false);
      setIsAccDelRequested(true);
      if (res.data.result === "SUCCESS") {
        setPopupResult("success");
        setPopupMessage(res.data.message);
        setOpenPopUp(true);
        return;
      }
    }

    if (api === Apis.editProfile) {
      if (res.data.result === "SUCCESS") {
        setPopupResult("success");
        setPopupMessage("Profile updated successfully");
        setEditPersonalInfo(!editPersonalInfo);
        ls("isAffiliateNameAvailable", true)
        BuyerApiCalls(
          {},
          Apis.retrieveProfile,
          "GET",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          },
          processRes
        );
      } else {
        setPopupResult("error");
        setPopupMessage(res.data.message);
      }
      setOpenPopUp(true);
      return;
    }
    if (api === Apis.editPassword) {
      if (res.data.result === "SUCCESS") {
        passwordForm.resetForm();
        setPopupResult("success");
        setPopupMessage("Password changed successfully");
        setEditPassword(false);
      } else {
        setPopupResult("error");
        setPopupMessage(res.data.message);
      }
      setOpenPopUp(true);
      return;
    }
    if (api === Apis.uploadProfileImg) {
      dispatch(setProfilePic(res.data.data.profile_pic));
      setUploadImg(false);
      BuyerApiCalls(
        {},
        Apis.retrieveProfile,
        "GET",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    }
  };

  return (
    <div className="flex flex-col flex-1 flex-wrap border-[1px] border-grey-300 rounded-[3px]">
      {openPopUp && (
        <PopUpComponent
          message={popupMessage}
          open={openPopUp}
          close={() => setOpenPopUp(false)}
          result={popupResult}
        ></PopUpComponent>
      )}
      {loading && (
        <div className="absolute top-1/2 left-1/2 z-10">
          <Loader></Loader>
        </div>
      )}

      {
        <Modal open={uploadImg} close={setUploadImg} width="562">
          <ImageUploading
            value={images}
            onChange={onChange}
            dataURLKey="data_url"
          >
            {({ imageList, onImageUpload, dragProps }) => (
              // write your building UI
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setUploadImg(false)}
                  className="justify-self-end"
                >
                  <ImCross></ImCross>
                </button>
                {imageList.map((image, index) => (
                  <div key={index} className="justify-self-center">
                    <img
                      src={image["data_url"]}
                      alt=""
                      className="w-[120px] h-[120px] relative bg-slate-100 border-transparent rounded-full flex items-center justify-center "
                    />
                  </div>
                ))}

                <button
                  className="border border-dashed border-black px-[40px] py-[10px] rounded text-center"
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  <div className="flex flex-col justify-center items-center text-center text-[12px]">
                    <p className="">Drag and drop here</p>
                    <p className="">or</p>
                    <p className="text-blue-500">browser</p>
                  </div>
                </button>
                <button
                  className="border border-black px-2 py-1 rounded text-[12px]"
                  onClick={() => profileImgHandler()}
                >
                  confirm
                </button>
              </div>
            )}
          </ImageUploading>
        </Modal>
      }

      <div className="relative bg-gradient-to-t from-orangeGradiant2 to-orangeGradiant1 flex flex-wrap grow justify-between h-[182px] items-center rounded-t-[3px] px-10">
        <div className="flex gap-[24px]  w-fit items-center">
          <div className="w-[101px] h-[101px] relative bg-slate-100 border-transparent rounded-full flex items-center justify-center ">
            {profile_pic !== null ? (
              <img
                src={profile_pic}
                alt=""
                className="flex w-24 h-auto rounded-full"
              />
            ) : (
              // <img src={FaRegUser} alt="" className="flex w-24 h-auto" />
              <FaUser className="w-14 h-14  text-slate-300" />
            )}
            {/* {profile?.profile_pic !== null ? (
              <img
                src={profile?.profile_pic}
                alt=""
                className="flex w-24 h-auto rounded-full"
              />
            ) : (
              // <img src={FaRegUser} alt="" className="flex w-24 h-auto" />
              <FaUser className="w-14 h-14  text-slate-300" />
            )} */}
            <button
              className="absolute bottom-0 right-0 border-transparent rounded-full p-2 bg-white hover:p-[10px] hover:transition-all hover:duration-200"
              onClick={() => setUploadImg(true)}
            >
              <MdOutlineEdit></MdOutlineEdit>
            </button>
          </div>

          <div className="flex-col gap-2">
            <p className="text-white font-semibold text-4">
              {profile?.full_name}
            </p>
            <div className="hidden flex gap-[4px] items-center text-white">
              <FontAwesomeIcon icon={faLocationDot} />
              <p className=" font-semibold text-4">Switzerland</p>
            </div>
          </div>
        </div>

        <img src={ushopWhiteIcon} className="hidden md:block h-min" alt="" />
      </div>

      <div className="px-4  ">
        <p className="pt-6 pb-3 text-[16px] font-bold">My Details</p>
        <p className="pb-2">
          Feel free to edit any of your details below so your account is up to
          date
        </p>
      </div>

      <div className="border-[12px] border-solid border-greyDivider"></div>

      <div className="px-4  pb-8">
        <div className="flex flex-1 justify-between">
          <p className="flex pt-6 pb-3 text-[16px] font-bold">
            Personal Details
          </p>
          {editPersonalInfo ? (
            <button
              onClick={() => {
                personalInfoHandler();
              }}
              className="flex pt-6 pb-3 underline text-orangeButton"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => personalInfoHandler()}
              className="flex pt-6 pb-3 underline text-orangeButton"
            >
              Edit Details
            </button>
          )}
        </div>
        {editPersonalInfo ? (
          <form className="flex flex-col w-full gap-4">
            <div className="flex items-center md:gap-[40px] w-full">
              <div className="flex flex-col w-full md:basis-1/2 ">
                <div className={inputCss}>
                  <input
                    type="text"
                    value={profileForm.values.userName}
                    placeholder="Full Name"
                    id="userName"
                    className="w-full"
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    required
                  ></input>
                </div>
              </div>
            </div>
            {profileForm.errors.userName && profileForm.touched.userName && (
              <p className="text-[14px]" id={userNameError}>
                {profileForm.errors.userName}
              </p>
            )}
            <div className="flex flex-col">
              <label className="mb-2">Gender</label>

              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === "male"}
                    onChange={genderHandler}
                  />
                  <label className="font-medium">Male</label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === "female"}
                    onChange={genderHandler}
                  />
                  <label className="font-medium">Female</label>
                </div>
              </div>
            </div>

            {genderErrorMessage && (
              <p className="text-[14px] " style={{ color: "red" }}>
                {genderErrorMessage}
              </p>
            )}
          </form>
        ) : (
          <div className="flex flex-row items-center flex-wrap justify-between md:justify-start  md:gap-[92px] ">
            <div className="flex items-center gap-2  ">
              <div className="w-7 h-7 flex items-center justify-center bg-paleOrange">
                <FaRegUser className="w-5 h-5  text-orangeButton" />
              </div>
              <p className="flex items-center">{profile?.full_name}</p>
            </div>

            <div className="flex items-center gap-2  ">
              <div className="w-7 h-7 flex items-center justify-center bg-paleOrange">
                <BsTelephone className="w-5 h-5  text-orangeButton" />
              </div>
              <p className="flex items-center">{profile?.contact_number}</p>
            </div>
            <div className="flex items-center gap-2  ">
              <div className="w-7 h-7 flex items-center justify-center bg-paleOrange">
                <BsGenderMale className="w-5 h-5  text-orangeButton" />
              </div>
              <p className="flex items-center">
                {" "}
                {profile?.gender === null ? "N.A" : profile?.gender}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="border-[12px] border-solid border-greyDivider"></div>
      <div className="px-4 pb-8">
        <div className="flex flex-1 justify-between">
          <p className="flex pt-6 pb-3 text-[16px] font-bold">Login Details</p>
          <div className="flex gap-4">
            {!editPassword ? (
              <button
                className="flex pt-6 pb-3 underline text-orangeButton"
                onClick={() => {
                  setEditPassword(true);
                }}
              >
                Change Password
              </button>
            ) : (
              <button
                className="flex pt-6 pb-3 underline text-orangeButton"
                onClick={() => {
                  passwordHandler();
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>
        {editPassword ? (
          <form className="flex flex-col gap-10 ">
            <div className="flex flex-col  gap-[10px] w-full">
              <div className="flex justify-between">
                <div className={inputCss}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.values.currentPassword}
                    placeholder="current password"
                    id="currentPassword"
                    className="w-full"
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    required
                  ></input>
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <AiOutlineEye fontSize={25}></AiOutlineEye>
                    ) : (
                      <AiOutlineEyeInvisible
                        fontSize={25}
                      ></AiOutlineEyeInvisible>
                    )}
                  </button>
                </div>
              </div>
              {passwordForm.errors.currentPassword &&
                passwordForm.touched.currentPassword && (
                  <p className="text-[14px]" id={currentPasswordError}>
                    {passwordForm.errors.currentPassword}
                  </p>
                )}

              <div className={inputCss}>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={passwordForm.values.newPassword}
                  placeholder="password"
                  id="newPassword"
                  className="w-full"
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  required
                ></input>
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? (
                    <AiOutlineEye fontSize={25}></AiOutlineEye>
                  ) : (
                    <AiOutlineEyeInvisible
                      fontSize={25}
                    ></AiOutlineEyeInvisible>
                  )}
                </button>
              </div>
              <div className="flex gap-4">
                <div className={passwordRuleCss}>Min 8 characters</div>
                <div className={passwordRuleCss}>1 Special</div>
                <div className={passwordRuleCss}>1 Uppercase</div>
                <div className={passwordRuleCss}>1 Numeric</div>
              </div>
              {passwordForm.errors.newPassword &&
                passwordForm.touched.newPassword && (
                  <p className="text-[14px]" id={newPasswordError}>
                    {passwordForm.errors.newPassword}
                  </p>
                )}

              <div className={inputCss}>
                <input
                  type={showCfmPass ? "text" : "password"}
                  value={passwordForm.values.confirmPassword}
                  placeholder="confirm password"
                  id="confirmPassword"
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  className="w-full"
                  required
                ></input>
                <button
                  type="button"
                  onClick={() => setShowCfmPass(!showCfmPass)}
                >
                  {showCfmPass ? (
                    <AiOutlineEye fontSize={25}></AiOutlineEye>
                  ) : (
                    <AiOutlineEyeInvisible
                      fontSize={25}
                    ></AiOutlineEyeInvisible>
                  )}
                </button>
              </div>
              {passwordForm.errors.confirmPassword &&
                passwordForm.touched.confirmPassword && (
                  <p className="text-[14px]" id={confirmPasswordError}>
                    {passwordForm.errors.confirmPassword}
                  </p>
                )}
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap  justify-between ">
            <div className="flex gap-10 ">
              <div className="flex items-center gap-2  ">
                <div className="md:w-7 md:h-7 flex items-center justify-center bg-paleOrange">
                  <AiOutlineMail className="w-5 h-5  text-orangeButton" />
                </div>
                <p className="flex items-center">{profile?.email}</p>
              </div>
              <div className="flex items-center gap-2  ">
                <div className="md:w-7 md:h-7 flex items-center justify-center bg-paleOrange">
                  <BiKey className="w-5 h-5  text-orangeButton" />
                </div>
                <p className="flex items-center">************</p>
              </div>
            </div>
            {!openDeleteForm ? (
              <button
                className={`capitalize ${
                  profile?.requested_for_delete === "Y" || isAccDelRequested
                    ? "bg-orange-200"
                    : "bg-orangeButton"
                } text-white px-2 py-1 rounded`}
                onClick={() => setOpenDeleteForm(!openDeleteForm)}
                disabled={
                  profile?.requested_for_delete === "Y"
                    ? true
                    : isAccDelRequested
                }
              >
                Request For Account Deletion
              </button>
            ) : (
              <Modal open={openDeleteForm} width="562">
                <div className="flex flex-col ">
                  <p className="text-[20px] font-semibold mb-3 capitalize">
                    Request for delete
                  </p>
                  <hr />
                  <p className="text-[14px] mt-2">
                    Are you sure you want to raise request to delete your
                    account?
                  </p>

                  <div className="flex justify-end mt-10">
                    <button
                      onClick={() =>
                        BuyerApiCalls(
                          {},
                          Apis.deleteAccount,
                          "GET",
                          {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${user.access}`,
                          },
                          processRes
                        )
                      }
                      className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setOpenDeleteForm(false)}
                      className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20"
                    >
                      No
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}
      </div>

      <div className="border-[12px] border-solid border-greyDivider"></div>
      <div className="px-4  pb-8">
        <p className="flex pt-6 pb-3 text-[16px] font-bold">
          Affiliate Commissions
        </p>
        <div className="flex justify-between sm:items-center gap-10 max-sm:flex-wrap">
          <div className="flex gap-3 items-start">
            <img
              src={commisionsSvg}
              alt="commissions"
              height={30}
              width={30}
              className="mt-1"
            />
            {isAFfiliate ? (
              <div className="text-sm">
                <p className="text-sm font-bold">
                  Your personalised affiliate link
                </p>
                <div className="h-12 mt-3 border border-orangeButton rounded-sm p-3 flex justify-between items-center gap-5 max-sm:w-full">
                  <p>{affiliateUrl}</p>
                  <FaRegCopy
                    size={20}
                    className="cp text-black"
                    onClick={copyUrl}
                  />
                </div>
                {isUrlCopied && (
                  <div className="px-2 h-6 text-orangeButton text-sm pt-0.5">
                    Copied
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm min-w-[350px]">
                <p>
                  Get your own unique link! Commissions will be automatically
                  credited to your wallet for any purchases shopped through your
                  link. Don’t miss out on your passive earnings!
                </p>
                <p
                  className="cp text-orangeButton underline text-sm mt-3"
                  onClick={() =>
                    window.open(
                      CustomerRoutes.HelpWithId.replace(
                        ":tab",
                        "vouchers-rewards"
                      ).replace(":slug", "what-is-u-shop-affiliate-programme"),
                      "_blank"
                    )
                  }
                >
                  How does uShop Affiliate programme work?
                </p>
              </div>
            )}
          </div>

          {isAFfiliate ? (
            <div
              className="bg-[#F5F5F6] cp rounded px-3 py-2 flex justify-between gap-4 items-center text-sm"
              onClick={() => navigate(CustomerRoutes.ViewAffiliateCommissions)}
            >
              <p>Lifetime Earnings</p>
              <div className="flex gap-1 items-center">
                <p className="font-bold">
                  $ {profile?.affiliate_earning?.lifetime_earning}
                </p>
                <FaAngleRight />
              </div>
            </div>
          ) : (
            <button
              className={`bg-orangeButton text-white px-2 py-1 rounded whitespace-nowrap`}
              onClick={() => {
                if (ls("isAffiliateNameAvailable"))
                  navigate(CustomerRoutes.AffiliateSignUp, {state: {
                    platformLinks: profile?.promotion_platform
                  }});
                else setShowModal(true);
              }}
            >
              Join Affiliate Programme
            </button>
          )}
        </div>
      </div>
      {showModal && <AffiliateInfoModal showModal={showModal} setShowModal={setShowModal} />}
    </div>
  );
}
