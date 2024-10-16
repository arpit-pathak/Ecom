import { Form, Button } from "../../../generic";
import { GridStyle } from "../../../../styles/FormStyles";
import { ApiCalls, AdminApis, HttpStatus, Messages } from "../../../../utils";
import { useCallback, useEffect, useState } from "react";
import { showToast } from "../../../generic/Alerts";
import useAuth from "../../../../hooks/UseAuth";
import CustomizedSection from "../../../generic/CustomizedSection";
import EditProductDataForm from "./EditProductDataForm";

export default function ViewProductDetail({ onClose, productId, isEdit }) {
  const auth = useAuth();
  const [product, setProduct] = useState(null);
  const [sections, setSections] = useState([]);

  const getData = useCallback(async () => {
    await ApiCalls(
      AdminApis.viewProduct + productId + "/",
      "GET",
      {},
      false,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          let product = response.data?.data ?? null;
          if (product) {
            let coverImg = product?.image_media.find(
              (item) => item.is_cover === "y"
            );
            let newImgMedia = product?.image_media.filter(
              (item) => item.is_cover === "n"
            );
            product = {
              ...product,
              coverImg: coverImg,
              images: newImgMedia,
            };
          }
          setProduct(product);
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  }, [auth]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleShippingConfirmation = async (formData) => {
    let actualFormData = new FormData();
    let pre_order = "";
    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
      if (pair[0] === "pre_order") {
        pre_order = pair[1];
      }
      if (pair[0] === "day_to_ship" && pre_order === "n") {
      } else actualFormData.append(pair[0], pair[1]);
    }

    let url = AdminApis.editProductShipping + productId + "/";
    await ApiCalls(url, "POST", actualFormData, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "edit-product-details");
          onClose({ add: true });
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  };


  useEffect(() => {
    if (product) {
      let imgs = [];
      for (let i = 0; i < product?.images.length; i++) {
        let newImg = {
          name: "img" + (i + 1),
          type: "image",
          label: "Image " + (i + 1),
          disabled: "{true}",
          imageUrl: product?.images[i].img,
          imageAlt: "",
          height: 200,
          width: 200,
        };

        imgs.push(newImg);
      }

      const productDetails = [
        {
          name: "category1",
          type: "text",
          label: "Main Category",
          disabled: isEdit ? false : true,
          defaultValue: product?.categories[0]?.name,
        },
        {
          name: "category2",
          type: "text",
          label: "Sub Category",
          disabled: isEdit ? false : true,
          defaultValue: product?.categories[1]?.name,
        },
        {
          name: "category3",
          type: "text",
          label: "Child Category",
          disabled: isEdit ? false : true,
          defaultValue: product?.categories[2]?.name ?? "",
        },
        {
          name: "",
          type: "noField",
        },
        {
          name: "name",
          type: "text",
          disabled: isEdit ? false : true,
          label: "Product Name",
          defaultValue: product?.name,
        },
        {
          name: "brand",
          type: "text",
          label: "Brand",
          disabled: isEdit ? false : true,
          defaultValue: product?.brand_name,
        },
        {
          name: "tags",
          type: "tags",
          label: "Tags",
          disabled: isEdit ? false : true,
          defaultValue: product?.tags,
        },
        {
          name: "cover_image",
          type: "image",
          label: "Cover Image",
          disabled: isEdit ? false : true,
          imageUrl: product?.coverImg?.img,
          imageAlt: "No cover image",
          height: 200,
          width: 200,
        },
        {
          name: "cover_video",
          type: "video",
          label: "Cover Video",
          disabled: isEdit ? false : true,
          videoUrl: product?.image_video[0]?.vdo,
        },
      ];

      const shippingDetails = [
        {
          name: "weight",
          type: "fieldWithSuffix",
          disabled: isEdit ? false : true,
          label: "Parcel Weight",
          defaultValue: product?.dimension[0]?.weight ?? "-",
          unit: "Kg"
        },
        {
          name: "height",
          type: "fieldWithSuffix",
          disabled: isEdit ? false : true,
          label: "Parcel Height",
          defaultValue: product?.dimension[0]?.height ?? "-",
          unit: "Cm"
        },
        {
          name: "width",
          type: "fieldWithSuffix",
          disabled: isEdit ? false : true,
          label: "Parcel Width",
          defaultValue: product?.dimension[0]?.width ?? "-",
          unit: "Cm"
        },
        {
          name: "length",
          type: "fieldWithSuffix",
          disabled: isEdit ? false : true,
          label: "Parcel Length",
          defaultValue: product?.dimension[0]?.length ?? "-",
          unit: "Cm"
        },
        {
          name: "pre_order",
          type: "radio",
          disabled: isEdit ? false : true,
          label: "Needs Pre Order",
          defaultValue: product?.pre_order ?? "n",
          label1: "Yes",
          value1: "y",
          label2: "No",
          value2: "n",
        },
        {
          name: "day_to_ship",
          type: "text",
          disabled: isEdit ? false : true,
          label: "No. of days to ship",
          defaultValue: product?.day_to_ship,
        },
        {
          name: "all_day_receiving",
          type: "switch",
          disabled: isEdit ? false : true,
          label: "All Day Receiving (10AM-10PM)",
          defaultValue: product?.all_day_receiving,
        },
      ];

      let variationDetails = [];
      let variationCount = 0;
      let result;
      if (product?.variations.length > 0) {
        if (product?.variations_option === "off") {
          variationCount++;
          result = getVariationFields(product?.variations[0]);
          variationDetails.push([...result]);
        } else {
          product?.variations.forEach((variation, ix) => {
            if (variation?.child.length > 0) {
              variation?.child.forEach((childVariation, idx) => {
                variationCount++;
                result = getVariationFields({
                  ...childVariation,
                  parentName: variation?.variation_name,
                  parentValue: variation?.variation_value,
                });
                variationDetails.push([...result]);
              });
            } else {
              variationCount++;
              result = getVariationFields(variation);
              variationDetails.push([...result]);
            }
          });
        }
      }

      let variationForms = [];  
      for (let j = 0; j < variationDetails.length; j++) {
        variationForms.push({
          title: `Variation ${j + 1} Details`,
          isOpen: false,
          form: (
            <Form
              form={[...variationDetails[j]]}
              styles={GridStyle}
              needButtons={false}
            />
          ),
        });
      }

      let productSections = [
        {
          title: "Product Details",
          isOpen: true,
          form: 
         
            <EditProductDataForm product={product} isEdit={isEdit} />
          // ) : (
          //   <Form
          //     form={[
          //       ...productDetails,
          //       ...imgs,
          //       {
          //         name: "description",
          //         type: "richText",
          //         disabled: "{true}",
          //         label: "Product Description",
          //         defaultValue: product?.description,
          //       },
          //     ]}
          //     styles={GridStyle}
          //     needButtons={false}
          //   />
          // ),
        },
        ...variationForms,
        {
          title: "Shipping Details",
          isOpen: false,
          form: (
            <Form
              form={[...shippingDetails]}
              styles={GridStyle}
              needButtons={isEdit ? true : false}
              saveButton={isEdit ? true : false}
              backButton={false}
              onSubmit={handleShippingConfirmation}
            />
          ),
        },
      ];
      setSections([...productSections]);
    }
  }, [product]);

  const getVariationFields = (variation) => {
    let data = [];
    let isonsale = variation?.discount > 0;

    let varName = "",
      varVal = "";
    if (variation?.parentName) {
      varName = variation?.parentName + ", " + variation?.variation_name;
      varVal = variation?.parentValue + ", " + variation?.variation_value;
    } else {
      varName = variation?.variation_name ?? "";
      varVal = variation?.variation_value ?? "";
    }

    if (varName !== "" && varVal !== "") {
      data = [
        {
          name: "variaton_name",
          type: "text",
          label: "Variation Name",
          disabled: "{true}",
          defaultValue: varName,
        },
        {
          name: "variaton_value",
          type: "text",
          label: "Variation Value",
          disabled: "{true}",
          defaultValue: varVal,
        },
      ];
    }

    data = [
      ...data,
      {
        name: "price",
        type: "text",
        label: "Price",
        disabled: "{true}",
        defaultValue: variation?.price,
      },
      {
        name: "stock",
        type: "text",
        label: "Stock",
        disabled: "{true}",
        defaultValue: variation?.stock,
      },
      {
        name: "sku",
        type: "text",
        label: "SKU",
        disabled: "{true}",
        defaultValue: variation?.sku,
      },
      {
        name: "is_on_sale",
        type: "switch",
        disabled: true,
        label: "On Sale",
        defaultValue: isonsale ? "on" : "off",
      },
    ];

    if (isonsale) {
      let distype = variation?.discount_type;
      let saleDetails = [
        {
          name: "discount_type",
          type: "select",
          label: "Discount tYpe",
          options: [
            { value: "percentage", label: "% Discount" },
            { value: "fixed", label: "Sale Price" },
          ],
          disabled: true,
          defaultValue: distype ?? "percentage",
        },
      ];

      if (distype === "percentage") {
        saleDetails.push({
          name: "discount",
          type: "text",
          label: "Discount",
          disabled: "{true}",
          defaultValue: variation?.discount + " %",
        });
      } else {
        saleDetails.push({
          name: "flat_discount",
          type: "text",
          label: "Flat Discount",
          disabled: "{true}",
          defaultValue: variation?.fixed_price_discount + " SGD",
        });
      }

      data = [...data, ...saleDetails];
    }
    return data;
  };


  return (
    <>
      {sections?.length === 0 ? (
        <div>{Messages.LOADING}</div>
      ) : (
        <>
          <Button
            onClick={() => onClose({ edit: "true" })}
            text="Back"
            type="cancel"
            py="2"
            px="3"
          />
          <div className="h-3"></div>
          {sections?.map((section, index) => (
            <CustomizedSection
              key={index}
              title={section.title}
              form={section.form}
              isOpen={section.isOpen}
            />
          ))}
          <Button
            onClick={() => onClose({ edit: "true" })}
            text="Back"
            type="cancel"
            py="2"
            px="3"
          />
        </>
      )}
    </>
  );
}
