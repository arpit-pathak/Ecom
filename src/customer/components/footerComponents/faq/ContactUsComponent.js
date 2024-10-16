import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import Select from "react-select";
import { useFormik } from 'formik';
import * as Yup from "yup";

//icons
import { BiCloudUpload } from "react-icons/bi";
import { BsFillChatDotsFill } from "react-icons/bs";

//images
import contactUsImg from "../../../../assets/buyer/faq_contactUs.svg";
import alert from "../../../../assets/buyer/alert.svg";
import { AiFillWarning } from 'react-icons/ai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import successGif from '../../../../assets/success.gif';

import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import { CommonApis } from "../../../../Utils";
import Loader, { PageLoader } from "../../../../utils/loader";
import { Modal } from "../../GenericComponents";

const ContactUsSchema = Yup.object().shape({
  usertype: Yup.string().required("Usertype is required"),
  username: Yup.string().required("Username is required")
    .test("is-mail-or-phone", "Username should be either mail or phone number",
      (value) => {
        return Yup.string().email().isValidSync(value) || validatePhone(parseInt(value ?? '0'));
      }),
  description: Yup.string().required("Description is required"),
  image: Yup.mixed().notRequired(),
  captchaVerified: Yup.bool().oneOf([true], "Please verify captcha")
});

const validatePhone = (phone) => {
  return Yup.number().integer().positive().test(
    (phone) => {
      return (phone && phone.toString().length >= 8 && phone.toString().length <= 14) ? true : false;
    }
  ).isValidSync(phone);
};

export default function ContactUsComp() {
  const options = [
    { label: "Buyer", value: "Buyer" },
    { label: "Seller", value: "Seller" },
  ];

  const [imgName, setImgName] = useState("");
  const [faq, setFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShowMsg, setIsShowMsg] = useState(false);
  const [message, setMessage] = useState("");
  const [siteKey, setSiteKey] = useState("");
  const [isSiteKeyLoading, setIsSiteKeyLoading] = useState("");

  const formik = useFormik({
    initialValues: {
      usertype: '',
      username: '',
      description: '',
      image: null,
      captchaVerified: false
    },
    validationSchema: ContactUsSchema,
    onSubmit: (values,{resetForm}) => {
      submitContactUsForm(values, resetForm);
    },
  });

  const processRes = (res) => {
    setFaq(res.data.data.user_faq);
  };

  useEffect(() => {
     //fetching captcha key
     setIsSiteKeyLoading(true)
     BuyerApiCalls({},
       CommonApis.settings,
       "POST", {}, (res,api) => {
         setSiteKey(res.data.data.google_recaptcha_key)
         setIsSiteKeyLoading(false)
       });

    let formData = new FormData();
    formData.append("faq_type", "contact us");
    BuyerApiCalls(formData, Apis.retreiveFaq, "POST", {}, processRes);
  }, []);

  const onComplete = () => {
    formik.setFieldValue("captchaVerified", !formik.values.captchaVerified);
  };

  const submitContactUsForm = (values, resetForm) => {
    setIsSubmitting(true)

    let fd = new FormData();
    fd.append("user_type", values.usertype);
    fd.append("username", values.username);
    fd.append("description", values.description);
    fd.append("image", values.image);

    BuyerApiCalls(
      fd,
      Apis.contactUs,
      "POST",
      {
        "Content-Type": "multipart/form-data"
      },
      (res, api) => {
        setIsSubmitting(false);
        setMessage(res.data)
        setIsShowMsg(true);

        if (res.data.result === "SUCCESS") {
          formik.setFieldValue("usertype", "")
          formik.setFieldValue("username", "")
          formik.setFieldValue("captchaVerified", false);
          formik.setFieldValue("image", null);
          formik.setFieldValue("description", "");
          setImgName("")
          resetForm()
        }

        setTimeout(() => {
          setIsShowMsg(false)
          setMessage("")
        }, 2000)

      }
    );
  }

  const imgSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var file = e.target.files[0]
      setImgName(file.name)
      formik.setFieldValue("image", file);
    }
  }

  const cardComponent = (index, contact, question, iconText, answer) => {
    return (
      <div
        key={index}
        className="border-transparent rounded-lg flex flex-col items-center p-5 space-y-2 shadow-lg text-center md:items-start md:text-left"
      >
        <div className="border p-2 rounded-full w-min h-min bg-gray-200 text-amber-400">
          <BsFillChatDotsFill />
        </div>
        <p className="font-bold text-xl text-[#FF9019]">{contact}</p>
        <p className="font-semibold">{question}</p>
        <div className="flex flex-row space-x-2">
          <img src={alert} alt=""></img> <p>{iconText}</p>
        </div>
        <p> {answer} </p>
      </div>
    );
  };

  const msgPopup = () => {
    return <Modal
      width="w-4/12"
      open={isShowMsg}
      children={
        <div>
          <span className="flex justify-end cp"
            onClick={() => setIsShowMsg(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </span>
          {message.result === 'SUCCESS' ?
            <img src={successGif} alt='' className="modal-icon" />
            : <AiFillWarning className='modal-icon' />}
          <div className='poptitle font-medium text-center'>
            {message.message}
          </div>
        </div>}
    />;
  }

  return (
    <div>
      {faq && faq.length > 0
        ? faq.map((item, index) => {
            const lowercaseQuestion = item.question.toLowerCase();
            const isCustomerServiceRelated =
              lowercaseQuestion.includes("customer service");
            if (isCustomerServiceRelated) {
              return (
                <div
                  key={index}
                  className="px-14 text-center md:items-start md:text-left"
                >
                  <p className="text-[19px] mb-[18px] font-medium">
                    {item.question}
                  </p>
                  <p>{item.answer}</p>
                </div>
              );
            } else {
              return null;
            }
          })
        : null}
      {isSiteKeyLoading ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col justify-between md:flex-row mb-[60px]">
          <img src={contactUsImg} alt="" />
          <form
            className="flex flex-col p-10 space-y-5 shadow-md mx-4"
            onSubmit={formik.handleSubmit}
          >
            <p className="uppercase text-xl font-bold">contact us</p>
            <p>
              Have a question/problem? Please write here, and we will reply back
              soonest.
            </p>

            {/* usertype */}
            <p className="font-bold">Are you a buyer or seller?</p>
            <Select
              id="usertype"
              name="usertype"
              options={options}
              value={{label: formik.values.usertype}}
              placeholder="Select type of user"
              onChange={(e) => formik.setFieldValue("usertype", e.value)}
              className="text-sm"
            />
            {formik.touched.usertype && formik.errors.usertype ? (
              <span className="text-xs text-red-600 !mt-2">
                {formik.errors.usertype}
              </span>
            ) : null}

            {/* username */}
            <p className="font-bold">Ushop Username</p>
            <div className="border h-[46px] flex items-center rounded">
              <input
                type="text"
                placeholder="Enter email or mobile number"
                value={formik.values.username}
                onChange={(e) =>
                  formik.setFieldValue("username", e.target.value)
                }
                className="w-full h-full px-2"
              />
            </div>
            {formik.touched.username && formik.errors.username ? (
              <span className="text-xs text-red-600 !mt-2">
                {formik.errors.username}
              </span>
            ) : null}

            {/* image */}
            <p className="font-bold">Upload File</p>
            <div className=" flex flex-col h-40 items-center justify-center border border-amber-500 border-dashed relative	">
              <BiCloudUpload size={55} />
              <p className="cp z-2">
                {imgName ? imgName : "Drag and drop here or "}
                {!imgName && (
                  <Link to="" className="text-blue-600">
                    Browse
                  </Link>
                )}
              </p>
              <input
                type="file"
                id="image"
                name="image"
                onChange={imgSelection}
                className="cp absolute bottom-8 opacity-0"
              />
            </div>
            {formik.touched.image && formik.errors.image ? (
              <span className="text-xs text-red-600 !mt-2">
                {formik.errors.image}
              </span>
            ) : null}

            {/* description */}
            <p className="font-bold">Description</p>
            <div className=" flex p-5 h-40 border items-start">
              <textarea
                placeholder="Write Description"
                className="h-full w-full justify-start"
                value={formik.values.description}
                onChange={(e) =>
                  formik.setFieldValue("description", e.target.value)
                }
              />
            </div>
            {formik.touched.description && formik.errors.description ? (
              <span className="text-xs text-red-600 !mt-2">
                {formik.errors.description}
              </span>
            ) : null}

            {/* captcha verification */}
            {siteKey !== ""  &&  <ReCAPTCHA
                sitekey={siteKey}
                // sitekey="6LcDiy4pAAAAAKZwl70A0biEGdt4SiCeQkJTfo5_"
                onChange={onComplete}
              />}
            {formik.touched.captchaVerified && formik.errors.captchaVerified ? (
              <span className="text-xs text-red-600 !mt-2">
                {formik.errors.captchaVerified}
              </span>
            ) : null}

            <div className="flex flex-row space-x-5">
              <button
                type="button"
                className="flex-grow py-2  bg-[#E3E1E1] border rounded-md text-[18px] font-medium"
              >
                Cancel
              </button>
              <button
                // disabled={!formik.values.captchaVerified}
                type="submit"
                style={{ backgroundColor: "orange" }}
                className="flex-grow py-2 bg-orangeButton text-white border rounded-md text-[18px] font-medium"
              >
                {isSubmitting ? <Loader /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="flex justify-between mx-4 md:space-x-5 md:flex-row flex-col mb-10">
        {faq && faq.length > 0
          ? faq.map((item, index) => {
              const lowercaseQuestion = item.question.toLowerCase();
              const isCustomerServiceRelated =
                lowercaseQuestion.includes("customer service");
              if (!isCustomerServiceRelated) {
                const stringParts = item.answer.split("\n");
                const [contact, question, iconText, answer] = stringParts;

                return cardComponent(
                  index,
                  contact,
                  question,
                  iconText,
                  answer
                );
              } else {
                return null;
              }
            })
          : null}
      </div>

      {isShowMsg && msgPopup()}
    </div>
  );
}
