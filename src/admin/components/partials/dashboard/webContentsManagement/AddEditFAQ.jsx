import { showToast } from "../../../generic/Alerts";
import { FormStyle } from "../../../../styles/FormStyles";
import {
  ApiCalls,
  AdminApis,
  HttpStatus,
  GeneralStatusChoices,
  ReverseStatusMapping,
  Messages,
} from "../../../../utils";
import { Form } from "../../../generic";
import useAuth from "../../../../hooks/UseAuth";
import { useEffect, useState } from "react";

export default function AddEditFAQ({ onClose, props, choices }) {
  const auth = useAuth();
  const [fields, setFields] = useState([]);
  const [faqSubCatList, setFaqSubCatList] = useState([]);
  const [initialRender, setInitialRender] = useState(true);
  const [faqCategoryChoices, setFaqCategoryChoices] = useState([]);

  const fetchCategories = async(url) => {
    await ApiCalls(
      url,
      "GET",
      {},
      false,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          let faqChoices = response.data?.data?.records?.map(item => {
              return {"label": item?.name, "id":item?.id_faq_category , "value": item?.name}
          })
          setFaqCategoryChoices(faqChoices);

          if (faqChoices.length > 0) {
            if (props?.faq_sub_category_name && initialRender) {
              let c1Index = faqChoices.findIndex(
                (item) => item?.label === props?.faq_category_name
              );

              let url =
                AdminApis.faqCategoryList + faqChoices[c1Index].id + "/";
              fetchSubCategories(url);
            } else {
              let url = AdminApis.faqCategoryList + faqChoices[0].id + "/";
              fetchSubCategories(url);
            }
          } else setFaqSubCatList([]);
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error", "faq-contents");
      });
  }

  const fetchSubCategories = async (url) => {
    await ApiCalls(url, "GET", {}, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          let subChoices = response.data?.data?.records?.map((item) => {
            return {
              label: item?.name,
              value: item?.name,
              id: item?.id_faq_category,
            };
          });
          setFaqSubCatList(subChoices);
        }
      })
      .catch((error) => {
        showToast(error.response.message, "error", "product-category");
      });
  };

  const handleSelectChange = async (e) => {
    if(e.target.name === "faq_type"){
      let url = AdminApis.faqCategoryList + "?faq_type="+ e.target.value;
      fetchCategories(url);
    }
    else if (e.target.name === "faq_category") {
      let category = faqCategoryChoices.find(
        (item) => item?.label === e.target.value
      );
      let url = AdminApis.faqCategoryList + category.id + "/";
      fetchSubCategories(url);
    }
  };

  useEffect(() => {
    const formFields = [
      {
        name: "faq_type",
        type: "select",
        label: "FAQ For",
        options: choices,
        defaultValue: props?.faq_type ?? "return & refund",
      },
      {
        name: "faq_category",
        type: "select",
        label: "FAQ Category",
        options: faqCategoryChoices,
        defaultValue: props?.faq_category_name ?? faqCategoryChoices[0]?.value,
      },
      {
        name: "faq_sub_category",
        type: "select",
        label: "FAQ Sub Category",
        options: faqSubCatList,
        disabled: faqSubCatList.length === 0 ? true : false,
        defaultValue: props?.faq_sub_category_name ?? faqSubCatList[0]?.value ?? null
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        options: GeneralStatusChoices,
        defaultValue: ReverseStatusMapping(props?.status),
      },
      {
        name: "question",
        type: "text",
        label: "Question",
        validation: "required",
        defaultValue: props?.question ?? "",
      },
      {
        name: "answer",
        type: "richText",
        label: "Answer",
        defaultValue: props?.answer ?? "",
      },
    ];

    if(props?.faq_sub_category_name && initialRender){
      if(faqSubCatList.length > 0) {
        setFields([...formFields])
        setInitialRender(false)
      }
    }else setFields([...formFields]);
    
  }, [faqSubCatList, faqCategoryChoices]);

  useEffect(()=>{
    let url= AdminApis.faqCategoryList
    if(props) url += "?faq_type="+ props?.faq_type;
    else url += "?faq_type="+ choices[0].value;

    fetchCategories(url);
  },[props])

  const handleConfirmation = async (formData, editorData) => {
    const url = props?.id_faq
      ? `${AdminApis.editFaq}${props.id_faq}/`
      : AdminApis.addFaq;
    formData.append("answer", editorData);

    for (var [key, value] of formData.entries()) {
      if (key === "faq_category") {
        let category = faqCategoryChoices.find((item) => item?.label === value);
        formData.append("faq_category_id", category?.id);
      }
      if (key === "faq_sub_category") {
        let subCategory = faqSubCatList.find((item) => item?.label === value);
        formData.delete("faq_category_id");
        formData.append("faq_category_id", subCategory?.id);
      }
    }

    formData.delete("faq_category");
    formData.delete("faq_sub_category");

    await ApiCalls(url, "POST", formData, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "add-edit-faq");
          onClose({ add: true });
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  };

  return (
    <>
      {fields?.length === 0 ? (
        <div>{Messages.LOADING}</div>
      ) : (
        <>
          <Form
            form={fields}
            styles={FormStyle}
            onCancel={() => onClose({ add: false })}
            onSubmit={handleConfirmation}
            validationRequired={true}
            handleSelectChange={handleSelectChange}
          />
        </>
      )}
    </>
  );
}
