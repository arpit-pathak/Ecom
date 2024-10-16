//icons
import { useEffect, useState, useRef } from "react";
import { BsChevronDown, BsChevronLeft, BsChevronUp } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import { fileSizeCheck } from "../../utils/Helper.js";
import { MdClose, MdOutlineInfo, MdSearch } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Tooltip as ReactTooltip } from "react-tooltip";

//components
import ls from "local-storage";
import Navbar from "../Navbar";
import { CustomerRoutes, MerchantRoutes } from "../../../Routes.js";
import { getId } from "../../../Utils";
import { ApiCalls, Apis } from "../../utils/ApiCalls";
import { Constants, Media_Size_Limit } from "../../utils/Constants";

import Editor from "ckeditor5-custom-build/build/ckeditor";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import addImage from "../../../assets/add-image-icon.svg";
import addImageTxt from "../../../assets/add-image-text.svg";
// import CountrySelect from "./countrySelector";

import VariationSection from "./Variation.js";
import { useNavigate } from "react-router-dom";
import { PRODUCT_STATUSES } from "../../utils/Constants";
import Select from "react-select";
import AllowProductDuplication from "./allowDuplicateProd.js";
import { AdminApis } from "../../../admin/utils/Constants.js";

const formSectionClass = "form-section py-[30px] px-[40px] bg-white";
//const formFont18500Class = 'text-[18px] text-black font-medium';
const formLabelClass = "flex flex-row justify-between cursor-pointer mb-[30px]";
const formLabelSvgClass = "text-[24px] text-black";
const hoverOrangeClass = "transition text-left hover:text-[#F5AB35]";

const discountTypes = [
  { value: "percentage", label: "% Discount" },
  { value: "fixed", label: "Sale Price" },
];

const AddProduct = ({ level }) => {
  let idProduct = getId(window.location.pathname);
  const pageTitle = idProduct ? "Edit Product" : "Add Product";
  document.title = pageTitle + " | uShop";

  const navigate = useNavigate();
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);

  const addedProduct = localStorage.getItem("m-add-product")
    ? JSON.parse(localStorage.getItem("m-add-product"))
    : null;

  //options
  const [showCategory, setShowCategory] = useState(true);
  const [showShipping, setShowShipping] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  // const [showOptional, setShowOptional] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [isSaveDraft, setIsSaveDraft] = useState(false);

  const [updateSection1, setUpdateSection1] = useState(false);
  const [updateSection2, setUpdateSection2] = useState(false);
  const [updateSection3, setUpdateSection3] = useState(false);
  const [updateSection4, setUpdateSection4] = useState(false);

  //selections
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [hasMoreCat1, setHasMoreCat1] = useState(true);
  const [category1, setCategory1] = useState([]);
  const [category1Page, setCategory1Page] = useState(1);

  //cat 2
  const [hasMoreCat2, setHasMoreCat2] = useState(true);
  const [category2, setCategory2] = useState([]);
  const [category2Page, setCategory2Page] = useState(1);

  //cat 3
  const [hasMoreCat3, setHasMoreCat3] = useState(true);
  const [category3, setCategory3] = useState([]);
  const [category3Page, setCategory3Page] = useState(1);

  //category search
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  //product images
  const [coverImage, setCoverImage] = useState(null);
  const [coverVideo, setCoverVideo] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productImageFiles, setProductImageFiles] = useState([]);

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [maxShownImage, setMaxShowImage] = useState(0);

  //uploaded state
  const [addedProductId, setAddedProductId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedCover, setUploadedCover] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  //fields
  const [brand, setBrand] = useState("");
  const [errorBrand, setErrorBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  const [errorName, setErrorName] = useState("");
  const [prodStatus, setProdStatus] = useState("");
  const [allDayReceive, setAllDayReceive] = useState("off");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState([]);
  const [isOnLoad, setIsOnLoad] = useState(true);
  // const [showMetaDesc, setShowMetaDesc] = useState(false);

  //variation
  const [isManyVariants, setIsManyVariants] = useState(false);
  const [variationPrice, setVariationPrice] = useState("");
  const [variationStock, setVariationStock] = useState("");
  const [variationSku, setVariationSku] = useState("");
  const [variationDiscount, setVariationDiscount] = useState("");
  const [variationId, setVariationId] = useState(null);
  const [variationDiscountType, setVariationDiscountType] = useState(
    discountTypes[0]
  );
  const [isOnSale, setIsOnSale] = useState(false);

  //shipping
  const [shippingWeight, setShippingWeight] = useState("");
  const [errorShippingWeight, setErrorShippingWeight] = useState("");
  const [shippingWidth, setShippingWidth] = useState("");
  const [shippingLength, setShippingLength] = useState("");
  const [shippingHeight, setShippingHeight] = useState("");
  const [errorShippingSize, setErrorShippingSize] = useState("");
  const [productVariation, setProductVariation] = useState([]);
  const [needPreorder, setNeedPreorder] = useState("n");
  const [daysToShip, setDaysToShip] = useState("");
  const [daysToShipErr, setDaysToShipErr] = useState("");

  //options
  const [optionalDetails, setOptionalDetails] = useState([]);
  const [warrantyDuration, setWarrantyDuration] = useState(null);
  const [packSize, setPackSize] = useState(null);
  const [warrantyType, setWarrantyType] = useState(null);
  const [safetyMark, setSafetyMark] = useState(null);

  //prod image validation
  const [isNewlyAddedImg, setIsNewlyAddedImg] = useState([]);
  
  //prod duplication confirmation
  const [prodDuplicationConfirmation, showProdDuplicationConfirmation] = useState(false)
  const [allowDuplicate, setAllowDuplicate] = useState(false)
  const [submitType, setSubmitType] = useState("")

  const [currentClick, setCurrentClick] = useState("prod-details");

  const videoEl = useRef(null); //prod video
  const listItemRefs1 = useRef([]);
  const listItemRefs2 = useRef([]);
  const listItemRefs3 = useRef([]);

  // async function addOptionalDetail(e) {
  //   const oname = document.getElementById("new_option_name").value;
  //   const ovalue = document.getElementById("new_option_value").value;
  //   if (oname === "" || ovalue === "") {
  //     toast.error("Option name and value are required");
  //     return;
  //   }

  //   const newOptions = optionalDetails;
  //   newOptions.push({
  //     name: oname,
  //     value: ovalue,
  //   });
  //   setOptionalDetails([...newOptions]);
  //   setUpdateSection4(true);

  //   //reset
  //   document.getElementById("new_option_name").value = "";
  //   document.getElementById("new_option_value").value = "";
  // }

  // async function removeOption(idx) {
  //   setOptionalDetails(optionalDetails.filter((val, index) => index !== idx));
  //   setUpdateSection4(true);
  // }

  const bringCategoryToView = (selCategoryId, category, listItemRefs) => {
    const index = category.findIndex(
      (item) => item.id_category === selCategoryId
    );
    // Scroll to the item if it exists
    if (index !== -1 && listItemRefs?.current[index]) {
      listItemRefs?.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  useEffect(() => {
    if (category1.length > 10 && selectedCategory[0]) {
      bringCategoryToView(
        selectedCategory[0]?.id_category,
        category1,
        listItemRefs1,
      );
    }
    if (category2.length > 0 && selectedCategory[1]) {
      setTimeout(
        () =>
          bringCategoryToView(
            selectedCategory[1]?.id_category,
            category2,
            listItemRefs2,
          ),
        1000
      );
    }
    if (category3.length > 0 && selectedCategory[2]) {
      setTimeout(
        () =>
          bringCategoryToView(
            selectedCategory[2]?.id_category,
            category3,
            listItemRefs3,
          ),
        1500
      );
    }
  }, [selectedCategory, category1, category2, category3]);
  //funcs
  const handleFileInputChange = (event, idx) => {
    const file = event.target.files[0];
    if (file) {
      if (idx === 0) {
        if (!fileSizeCheck(file, Media_Size_Limit.img_max_size)) {
          toast.error("Image size cannot exceed 4 MB", {
            position: "bottom-right",
          });
          return;
        }
        setUpdateSection1(true);
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (idx === 0) {
          setCoverImage(e.target.result);
          setCoverImageFile(file);
        }

        if (idx === 7) {
          if (fileSizeCheck(file, Media_Size_Limit.vid_max_size)) {
            setCoverVideo(e.target.result);
            setUpdateSection1(true);
          } else
            toast.error("File size is exceeding the limit", {
              position: "bottom-right",
            });
        }

        let newlyAddedCheck = isNewlyAddedImg;
        newlyAddedCheck[idx] = true;
        setIsNewlyAddedImg(newlyAddedCheck);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilesInputChange = (event) => {
    let files = event.target.files;
    let fileEntries = Array.from(files);

    //prevent adding same image file again
    // let uniqueFiles = fileEntries.filter((newFile) => {
    //   return !productImageFiles.some(
    //     (existingFile) => existingFile.name === newFile.name
    //   );
    // });

    let startingIndex = productImages.length;
    if (uploadedImages.length > 0) startingIndex = uploadedImages.length;

    //allow max 6 files excluding cover photo
    let newLength = fileEntries.length + startingIndex;

    if (newLength < 7) {
      let imageArr = [...productImages],
        imageFiles = [...productImageFiles],
        newlyAddedCheck = [...isNewlyAddedImg];

      fileEntries.forEach((file, index) => {
        if (file) {
          //file size check
          if (!fileSizeCheck(file, Media_Size_Limit.img_max_size)) {
            toast.error("Image size cannot exceed 4 MB", {
              position: "bottom-right",
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            imageArr[startingIndex + index] = e.target.result;
            imageFiles[startingIndex + index] = file;
            newlyAddedCheck[startingIndex + index] = true;

            let imglist = [...uploadedImages]
            imglist.push(e.target.result);

            setProductImages([...imageArr]);
            setProductImageFiles([...imageFiles]);
            setIsNewlyAddedImg([...newlyAddedCheck]);
            setUploadedImages([...imglist])
             
          };
          reader.readAsDataURL(file);
        }
      });
      setMaxShowImage(newLength);
      setUpdateSection1(true);
    } else {
      toast.error("More than 6 images are not allowed");
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoEl.current;
    if (!video) return;

    if (video.duration > 60 || video.duration < 10) {
      setCoverVideo(null);
      toast.error("Video duration is not within the allowed limit", {
        position: "bottom-right",
      });
    }
  };

  useEffect(()=>{
    if(allowDuplicate) submitForm(submitType)
  },[allowDuplicate])

  async function submitProductDetails() {
    try {
      let fd = new FormData();
      const productName = document.getElementById("product-name");
      //check category
      const filteredArray = selectedCategory.filter((item) => item !== null);
      if (filteredArray.length === 0) {
        toast.error("Product category is required.");
        setIsPublishing(false);
        setIsSaveDraft(false);
        return;
      }

      //check name
      if (
        !productName ||
        (productName && ["", null].indexOf(productName.value) > -1)
      ) {
        setErrorName("Product name is required.");
        toast.error("Product name is required.");
        setIsPublishing(false);
        setIsSaveDraft(false);
        return;
      }

      //check brand
      if (!brand || (brand && ["", null].indexOf(brand) > -1)) {
        setErrorBrand("Brand is required.");
        toast.error("Brand is required.");
        setIsPublishing(false);
        setIsSaveDraft(false);
        return;
      }

      // const coverimg = document.getElementById(`upload-cover`);
      // if (coverimg && coverimg.files.length > 0) fd.append("product_cover_image", coverimg.files[0]);
      // const imagesCount = 5;
      // for (var x = 0; x < imagesCount; x++) {
      //     const img = document.getElementById(`upload-image${x + 1}`);
      //     if (img && img.files.length > 0) {
      //         console.log("img files: ", img.files[0]);
      //         fd.append("product_image[]", img.files[0]);
      //     }
      // }

      if (coverImageFile) fd.append("product_cover_image", coverImageFile);
      if (productImageFiles[0] && isNewlyAddedImg[0])
        fd.append("product_image[]", productImageFiles[0]);
      if (productImageFiles[1] && isNewlyAddedImg[1])
        fd.append("product_image[]", productImageFiles[1]);
      if (productImageFiles[2] && isNewlyAddedImg[2])
        fd.append("product_image[]", productImageFiles[2]);
      if (productImageFiles[3] && isNewlyAddedImg[3])
        fd.append("product_image[]", productImageFiles[3]);
      if (productImageFiles[4] && isNewlyAddedImg[4])
        fd.append("product_image[]", productImageFiles[4]);
      if (productImageFiles[5] && isNewlyAddedImg[5])
        fd.append("product_image[]", productImageFiles[5]);

      const vid = document.getElementById(`upload-covervid`);
      if (vid && vid.files.length > 0)
        fd.append("product_cover_video", vid.files[0]);

      fd.append("product_name", productName.value);
      fd.append("product_desc", description);
      fd.append("brand", brand);
      fd.append(
        "category_id",
        filteredArray[filteredArray.length - 1].id_category
      );

      if(allowDuplicate) fd.append("allow_duplicate", allowDuplicate);
      
      if(metaDescription) fd.append("meta_description", metaDescription);

      if (tags.length > 0) fd.append("tags", tags.join());

      if (idProduct) {
        fd.append("id_product", idProduct);
      } else if (addedProductId) {
        fd.append("id_product", addedProductId);
      }

      await ApiCalls(
        fd,
        Apis.productDetail,
        "POST",
        {
          Authorization: "Bearer " + user.access,
          "Content-Type": "multipart/form-data",
        },
        //prices response
        (response, apiUrl) => {
          const data = response.data;
          if (data.result === "FAIL") {
            if(data?.error_list?.is_duplicate) {
              showProdDuplicationConfirmation(true)
              return;
            }
            toast.error(`(e) ${data.message}`);
            if (data.message_code === "redirect_to_shipping_setting") {
              setTimeout(() => navigate(MerchantRoutes.ShippingSettings), 1000);
            }

            return;
          }
          setUpdateSection1(false);
          setProductStates(data.data);
          localStorage.setItem("m-add-product", JSON.stringify(data.data));
          toast.success("Saved product details", { position: "bottom-right" });
        },
        null
      );

      // const config = {
      //     headers: {
      //         "Authorization": "Bearer " + user.access,
      //         'content-type': 'multipart/form-data',
      //     },
      // };
      // axios.post(baseUrl + Apis.productDetail, fd, config).then((response) => {
      //     const data = response.data;
      //     if (data.result === "FAIL") {
      //         toast.error(`(e) ${data.message}`)
      //         return;
      //     }

      //     setProductStates(data.data);
      //     localStorage.setItem("m-add-product", JSON.stringify(data.data));
      // });
    } catch (e) {
      toast.error(`Something went wrong. Please try again (e) ${e}`);
    }
  }

  async function submitShippingDetails(prod) {
    try {
      if (shippingWeight === "") {
        setErrorShippingWeight("Weight is required.");
        return;
      }

      if (
        shippingHeight === "" ||
        shippingWidth === "" ||
        shippingLength === ""
      ) {
        setErrorShippingSize("Width, length and height are required.");
        return;
      }

      if (needPreorder === "y") {
        if (daysToShip === "") {
          setDaysToShipErr("Please fill no. of days to ship");
          return;
        } else if (daysToShip > 14 || daysToShip < 1) {
          setDaysToShipErr("Can be max 14 days and min 1 day");
          return;
        }
        setDaysToShipErr("");
      }

      let fd = new FormData();
      fd.append("weight", shippingWeight);
      fd.append("width", shippingWidth);
      fd.append("length", shippingLength);
      fd.append("height", shippingHeight);
      fd.append("pre_order", needPreorder === "" ? "n" : needPreorder);
      if (needPreorder === "y") fd.append("day_to_ship", daysToShip);

      fd.append("id_product", prod.id_product);
      fd.append("all_day_receiving", allDayReceive);

      await ApiCalls(
        fd,
        Apis.shippingDetail,
        "POST",
        {
          Authorization: "Bearer " + user.access,
        }, //prices response
        (response, apiUrl) => {
          const data = response.data;
          if (data.result === "FAIL") {
            toast.error(`(e) ${data.message}`);
            return;
          }

          setUpdateSection3(false);
          setProductStates(data.data);
          localStorage.setItem("m-add-product", JSON.stringify(data.data));
          toast.success("Saved shipping details", { position: "bottom-right" });
        },
        null
      );
    } catch (e) {
      toast.error(`Something went wrong. Please try again (e) ${e}`);
      setIsPublishing(false);
      setIsSaveDraft(false);
    }
  }

  async function submitOptions(prod) {
    try {
      let fd = new FormData();
      if (prod.optional)
        fd.append("id_option", prod.optional.id_product_detail);
      fd.append("country_id", 1);
      fd.append("warranty_duration", warrantyDuration ? warrantyDuration : 0);
      fd.append("warranty_type", warrantyType ? warrantyType : "off-side");
      fd.append("safety_mark", safetyMark);
      //pack size sent but not saved
      if (["", null].indexOf(packSize) < 0) fd.append("pack_size", packSize);
      fd.append("options", JSON.stringify(optionalDetails));
      fd.append("id_product", prod.id_product);
      await ApiCalls(
        fd,
        Apis.productOptions,
        "POST",
        {
          Authorization: "Bearer " + user.access,
        },
        //process
        (response, url) => {
          const data = response.data;
          if (data.result === "FAIL") {
            toast.error(`(e) ${data.message}`);
            return;
          }

          setUpdateSection4(false);
          setProductStates(data.data);
          localStorage.setItem("m-add-product", JSON.stringify(data.data));
          toast.success("Saved product options", { position: "bottom-right" });
        }
      );
    } catch (e) {
      toast.error(`Something went wrong. Please try again (e) ${e}`);
      setIsPublishing(false);
      setIsSaveDraft(false);
    }
  }

  async function submitVariant(prod) {
    if (!isManyVariants) {
      if (variationPrice === "") {
        toast.error("Variation price is mandatory");
        return;
      }
      if (variationStock === "") {
        toast.error("Variation stock is mandatory");
        return;
      }
    }

    try {
      let fd = new FormData();
      if (isManyVariants) {
        //click the hidden retrieve button to process the data
        const hiddenInput = document.getElementById("retrieve-variation");
        hiddenInput.click();
        let fullVal = JSON.parse(hiddenInput.value);

        //prep images
        fullVal[0].options.forEach((val, idx) => {
          let fileInput = document.getElementById(`variant-image-0-${idx}`);
          if (fileInput && fileInput.files[0]) {
            val.img = `${idx}`;
            const selectedFile = fileInput.files[0];
            fd.append(`variation_image_${idx}`, selectedFile);
          }

          //child
          if (val.variant && val.variant.options.length > 0) {
            // let currentLen =  val.variant.options.length
            val.variant.options.forEach((valx, idxx) => {
              // let cidx = idxx + idx * currentLen
              let cidx = val.name + "-" + valx.name;
              const fileInputx = document.getElementById(
                `variant-image-1-${cidx}`
              );
              if (fileInputx.files[0]) {
                valx.img = `${idxx}${idx}`;
                const selectedFilex = fileInputx.files[0];
                fd.append(`variation_image_${idxx}${idx}`, selectedFilex);
              }
            });
          }
        });

        //full value
        fd.append("variation_json", JSON.stringify(fullVal));
        console.log("finalval: ", fullVal);
      } else {
        let discount_per = variationDiscount;
        if (isOnSale) {
          if (variationDiscount === "" || variationDiscount === "0") {
            if (variationDiscountType.value === "percentage")
              toast.error("Please enter valid discount percent");
            else toast.error("Please enter valid sale price");
            return;
          } else {
            discount_per =
              variationDiscount === "" ? 0 : parseFloat(variationDiscount);
            if (variationDiscountType.value === "fixed")
              discount_per = variationPrice - discount_per;
          }
        }
        fd.append("price", variationPrice);
        fd.append(
          "discount_type",
          isOnSale ? variationDiscountType?.value ?? "" : ""
        );
        fd.append("discount_per", discount_per);
        fd.append("stock", variationStock);
        fd.append("sku", variationSku);
        if (variationId) fd.append("variation_id", variationId);
      }
      fd.append("variations_option", isManyVariants ? "on" : "off");

      fd.append("id_product", prod.id_product);

      await ApiCalls(
        fd,
        Apis.productVariation,
        "POST",
        {
          Authorization: "Bearer " + user.access,
        },
        //process response
        (response, url) => {
          const data = response.data;
          if (data.result === "FAIL") {
            toast.error(`(e) ${data.message}`);
            return;
          }

          setUpdateSection2(false);
          setProductStates(data.data);
          localStorage.setItem("m-add-product", JSON.stringify(data.data));
          toast.success("Saved product variations", {
            position: "bottom-right",
          });
        }
      );
    } catch (e) {
      toast.error(`Something went wrong. Please try again (e) ${e}`);
      setIsPublishing(false);
      setIsSaveDraft(false);
    }
  }

  async function submitForm(type) {
    try {
      setSubmitType(type)
      if (type === "publish") setIsPublishing(true);
      else setIsSaveDraft(true);

      //product details
      if (updateSection1) await submitProductDetails();

      const prod = localStorage.getItem("m-add-product")
        ? JSON.parse(localStorage.getItem("m-add-product"))
        : null;
      if (prod === null) {
        console.log(
          "no product detail. unable to proceed saving shipping details"
        );
        setIsPublishing(false);
        setIsSaveDraft(false);
        return;
      }
      //variation
      if (updateSection2) await submitVariant(prod);

      //shipping
      if (updateSection3) await submitShippingDetails(prod);
      if (updateSection4) await submitOptions(prod);

      setIsPublishing(false);
      setIsSaveDraft(false);
      setIsSave(true);
      //is editing
      if (idProduct) {
        if (
          prod?.product_detail?.status_id === PRODUCT_STATUSES.DRAFT &&
          type === "publish"
        )
          updateProdStatus(type, prod?.id_product);
      }
      //new product
      else {
        if (type === "preview") return;
        updateProdStatus(type, prod.id_product);
      }
    } catch (e) {
      toast.error(`Something went wrong. Please try again (e) ${e}`, {
        position: "bottom-right",
      });
    }
  }

  async function updateProdStatus(type, prodId) {
    try {
      var fd = new FormData();
      fd.append(
        "status_id",
        type === "draft" ? PRODUCT_STATUSES.DRAFT : PRODUCT_STATUSES.ACTIVE
      );
      await ApiCalls(
        fd,
        Apis.updateProductStatus + prodId + "/",
        "POST",
        {
          Authorization: "Bearer " + user.access,
        },
        //process response
        (response, url) => {
          const data = response.data;
          if (data.result === "FAIL") {
            toast.error(`(e) ${data.message}`);
            return;
          }
          if (type === "publish") setProdStatus("Active");
          else if (type === "draft") setProdStatus("Draft");

          toast.success("Product has been saved successfully.");
        }
      );
    } catch (e) {
      toast.error(
        `Product status update failed. Please try again later (e) ${e}`,
        {
          position: "bottom-right",
        }
      );
    }
  }

  async function fetchProduct() {
    await ApiCalls(
      null,
      Apis.product + idProduct + "/",
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      //process
      (response, url) => {
        const data = response.data;
        if (data.result === "FAIL") {
          toast.error(`(e) ${data.message}`);
          return;
        }
        const productDetails = {
          id_product: data.data.id_product,
          product_detail: { ...data.data },
        };
        setProductStates(productDetails);
        localStorage.setItem("m-add-product", JSON.stringify(productDetails));
        setIsSave(true);
        let selCat = data.data.categories;
        if (idProduct) {
          preloadCategories(selCat);
        }
      }
    );
  }

  const preloadCategories = async (selCat) => {
    await loadCategory(1, category2Page, selCat[0].id_category, true);
    await loadCategory(2, category3Page, selCat[1].id_category, true);
  };

  const onChangeName = (event) => {
    const val = event.target.value;
    setProductName(val);
    setUpdateSection1(true);
    if (val === "" || val === null) {
      setErrorName("Product name is required.");
      return;
    }
    setErrorName("");
  };

  const onChangeMetaDescription = (event) => {
    const val = event.target.value;
    setMetaDescription(val);
    setUpdateSection1(true);
  };

  const onChangeDescription = (event) => {
    //tis function is called on page load setting updateSection1 value to true during edit
    //isOnLoad is a control variable to avoid that
    if (isOnLoad) {
      setDescription(event.getData());
      setIsOnLoad(false);
    } else {
      setDescription(event.getData());
      setUpdateSection1(true);
    }
  };

  const setProductStates = (p) => {
    const productData = p.product_detail;
    setAddedProductId(p.id_product);
    setProductName(productData.name);
    setDescription(productData.description);
    setMetaDescription(productData.meta_description)
    setBrand(productData.brand_name);
    setProdStatus(productData?.status_name);
    setAllDayReceive(productData?.all_day_receiving);
    setSelectedCategory(productData.categories);
    setTags(productData?.tags);
    setDaysToShip(
      productData?.day_to_ship === 0 ? "" : productData?.day_to_ship
    );
    setNeedPreorder(productData?.pre_order);
    if (productData.image_video.length > 0)
      setUploadedVideo(productData.image_video[0]);

    let isManyVariant = productData?.variations_option === "on" ?? false;
    setIsManyVariants(isManyVariant);

    //variants
    const variants = productData.variations;
    if (variants && variants.length > 0) {
      const parentVariant = variants[0];
      //multiple variations
      if (
        (variants && variants.length > 1) ||
        (parentVariant.child && parentVariant.child.length > 0)
      )
        setProductVariation(variants);
      else {
        if (isManyVariant) setProductVariation(variants);
        setVariationPrice(variants[0].price);
        setVariationSku(variants[0].sku ?? "");
        setVariationDiscountType(
          discountTypes.find(
            (item) => item.value === variants[0].discount_type
          ) ?? discountTypes[0]
        );
        setVariationDiscount(
          variants[0]?.discount_type === "fixed"
            ? variants[0]?.discounted_price ?? ""
            : variants[0].discount === 0
            ? ""
            : variants[0].discount
        );
        setVariationStock(variants[0].stock);
        setVariationId(variants[0].id_product_variation);
        if (variants[0].discount > 0) setIsOnSale(true);
      }
    }

    const productSize = productData.dimension;
    if (productSize.length > 0) {
      setShippingHeight(productSize[0].height);
      setShippingWidth(productSize[0].width);
      setShippingLength(productSize[0].length);
      setShippingWeight(productSize[0].weight);
    }

    //image
    if (productData.image_media.length > 0) {
      var pmedia = [...productData.image_media];
      const pcoverIdx = pmedia.filter((val) => val.is_cover === "y");
      if (pcoverIdx.length > 0) {
        setUploadedCover(pcoverIdx[0]);
      }

      let uploadImgs = [
        ...pmedia.filter(
          (val) => val.is_cover === "n" && val.product_variation_id === null
        ),
      ];
      setUploadedImages(uploadImgs);
      setProductImages([])
      setMaxShowImage(uploadImgs.length);
      let alreadyExistingCount = pmedia.length;
      let newlyAddedCheck = [];
      Array.from({ length: 8 }, (_, index) =>
        newlyAddedCheck.push(index < alreadyExistingCount ? false : true)
      );
      setIsNewlyAddedImg(newlyAddedCheck);
    }

    //optional details
    // const opts = productData.optional;
    // if (opts) {
    //   if(opts.option_details){
    //     const optDetails = JSON.parse(opts.option_details);
    //     if (optDetails.length > 0) setOptionalDetails([...optDetails]);
    //   }
    //   if (opts.safety_mark) setSafetyMark(opts.safety_mark);
    //   if (opts.pack_size) setPackSize(opts.pack_size);
    //   setWarrantyDuration(opts.warranty_duration);
    //   setWarrantyType(opts.warranty_type);
    // }
  };

  //use effects
  async function loadCategory(level, page, parent_id, refresh, fetch_all, searchValue) {
    var fd = new FormData();
    fd.append("parent_id", parent_id);
    fd.append("list_length", 10);
    fd.append("page", page);
    fd.append("category_name", searchValue ?? "");
    fd.append("fetch_all", fetch_all ?? "n");

    await ApiCalls(
      fd,
      Apis.listCategory,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      //prcocess
      (response, url) => {
        //console.log("response", response);
        if (response.status !== 200) {
          console.log("error fetch category");
          return;
        }
        const ldata = response.data.data;
        if (ldata.categories.length === 0 || fetch_all==="y") {
          if (level === 0) setHasMoreCat1(false);
          if (level === 1) setHasMoreCat2(false);
          if (level === 2) setHasMoreCat3(false);
          if(ldata.categories.length === 0) return;
        }

        const firstCategory = ldata.categories[0];
        if (firstCategory.parent_id === null) {
          if (ldata.categories.length > 0) {
            const ncat = refresh ? [] : category1;
            if (ldata.categories.length < 10) setHasMoreCat1(false);
            setCategory1([...ncat, ...ldata.categories]);
          }
        } else {
          if (level === 1 && parent_id === firstCategory.parent_id) {
            const ncat = refresh ? [] : category2;
            if (ldata.categories.length < 10) setHasMoreCat2(false);
            setCategory2([...ncat, ...ldata.categories]);
          }
          if (level === 2 && parent_id === firstCategory.parent_id) {
            const ncat = refresh ? [] : category3;
            if (ldata.categories.length < 10) setHasMoreCat3(false);
            setCategory3([...ncat, ...ldata.categories]);
          }
        }
      }
    );
  }

  async function deleteMedia(media, which) {
    var fd = new FormData();
    if (idProduct) {
      fd.append("id_product", idProduct);
    } else if (addedProductId) {
      fd.append("id_product", addedProductId);
    }
    fd.append("id_product_media", media.id_product_media);
    ApiCalls(
      fd,
      Apis.deleteProductMedia,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      //process response
      (response, url) => {
        console.log("deleted media:", response);
        if (response.status !== 200) {
          console.log("error delete media");
          return;
        }

        const ldata = response.data;
        if (ldata.result === "SUCCESS") {
          toast.success(ldata.message);

          //update localstorage
          var product = localStorage.getItem("m-add-product")
            ? JSON.parse(localStorage.getItem("m-add-product"))
            : null;
          if (which === "video") {
            product.product_detail.image_video = [];
            localStorage.setItem(
              "m-add-product",
              JSON.stringify({ ...product })
            );
            setUploadedVideo(null);
          }

          if (which === "image") {
            var im = [...product.product_detail.image_media];
            im = im.filter(
              (val) => val.id_product_media !== media.id_product_media
            );
            product.product_detail.image_media = [...im];
            localStorage.setItem(
              "m-add-product",
              JSON.stringify({ ...product })
            );
            if (media.is_cover === "y") setUploadedCover(null);
            if (media.is_cover === "n") {
              setUploadedImages([...im.filter((val) => val.is_cover === "n")]);

              let alreadyExistingCount = im.length;
              let newlyAddedCheck = [];
              Array.from({ length: 8 }, (_, index) =>
                newlyAddedCheck.push(
                  index < alreadyExistingCount ? false : true
                )
              );
              setIsNewlyAddedImg(newlyAddedCheck);
            }
          }
        }
      },
      null
    );
  }

  function callDeleteMedia(idx) {
    let imgList = [...productImages];
    imgList.splice(idx, 1);
    setProductImages([...imgList]);
    let imgFilesList = [...productImageFiles];
    imgFilesList.splice(idx, 1);
    setProductImageFiles([...imgFilesList]);
    setMaxShowImage(maxShownImage - 1);

    let imgList1 = [...uploadedImages];
    imgList1.splice(idx, 1);
    setUploadedImages([...imgList1]);
    if (uploadedImages[idx]) deleteMedia(uploadedImages[idx], "image");
  }

  useEffect(() => {
    loadCategory(0, category1Page, 0, true, "n", "");
    let newlyAddedCheck = [];
    Array.from({ length: 8 }, (_) => newlyAddedCheck.push(false));
    setIsNewlyAddedImg(newlyAddedCheck);
  }, []);

  //update if product is already added
  //load existing product
  useEffect(() => {
    if (idProduct) fetchProduct();
    if (addedProduct) setProductStates(addedProduct);
  }, []);

  const handleNeedPreOrder = (e) => {
    setNeedPreorder(e.target.value);
    setUpdateSection3(true);
    setDaysToShipErr("");
  };

  const calcOffer = () => {
    if (variationDiscountType.label === "% Discount") {
      let discPrice =
        variationPrice - variationPrice * (parseFloat(variationDiscount) / 100);
      return discPrice.toFixed(2);
    } else {
      let discPrice = variationPrice - variationDiscount;
      let discountPercentage = ((discPrice * 100) / variationPrice).toFixed(1);
      return discountPercentage + "% off";
    }
  };

  const categorySearch = async (e) => {
    const keyword = e.target.value;
    setSearchKey(keyword);

    if (keyword.length === 0) {
      setSearchResult([]);
      return;
    }

    if (keyword.length > 2) {
      var fd = new FormData();
      fd.append("category_name", keyword);
      await ApiCalls(
        fd,
        Apis.categorySearch,
        "POST",
        {
          Authorization: "Bearer " + user.access,
        },
        (response, url) => {
          const resultCategories = response.data.data.categories;
          setSearchResult(resultCategories);
        }
      );
    }
  };

  const categorySelection = async (item, level) => {
    setHasMoreCat3(true);

    if (level === 3) setSearchKey(item?.name);
    else if (level === 2) setSearchKey(item?.level_two[0]?.name);
    else setSearchKey(item?.level_two[0]?.level_three[0]?.name);

    const updatedSelected = [...selectedCategory];
    if (item?.parent_id === null) {
      updatedSelected[0] = item;
      updatedSelected[1] = null;
      updatedSelected[2] = null;
      setCategory3([]);
      setSelectedCategory(updatedSelected);
      await loadCategory(0, category1Page, 0, true,"y"); // item?.name
      await loadCategory(1, category2Page, item.id_category, true,"y");
    } else {
      let level2 = item?.level_two;
      if (level2[0]?.parent_id === null) {
        console.log(item, level);
        
        setHasMoreCat3(false);
        setCategory3([]);
        await loadCategory(0, category1Page, 0, true,"y"); // level2[0]?.name
        await loadCategory(1, category2Page, item?.parent_id, true,"y");

        if (level === 2) {
          updatedSelected[0] = level2[0];
          updatedSelected[1] = null;
          updatedSelected[2] = null;
        } else {
          updatedSelected[0] = level2[0];
          updatedSelected[1] = item;
          updatedSelected[2] = null;
          await loadCategory(2, category3Page, item?.id_category, true,"y");
        }
        setSelectedCategory(updatedSelected);
    
      } else {
        console.log("elseee")
        let level3 = level2[0]?.level_three;
        if (level3) {
          if (level === 1) {
            updatedSelected[0] = level3[0];
            updatedSelected[1] = null;
            updatedSelected[2] = null;
          } else if (level === 2) {
            updatedSelected[0] = level3[0];
            updatedSelected[1] = level2[0];
            updatedSelected[2] = null;
          } else {
            updatedSelected[0] = level3[0];
            updatedSelected[1] = level2[0];
            updatedSelected[2] = item;
          }
          setSelectedCategory(updatedSelected);
          await loadCategory(0, category1Page, 0, true,"y"); // level3[0]?.name
          await loadCategory(1, category2Page, level2[0]?.parent_id, true,"y");
          if (level !== 1)
            await loadCategory(2, category3Page, item?.parent_id, true,"y");
        } else {
           loadCategory(2, category3Page, level2[0]?.parent_id, true,"y");
        }
      }
    }

    setSearchResult([])
  };

  return (
    <>
      {/* <ToastContainer
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        position={toast.POSITION.BOTTOM_RIGHT}
      /> */}
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />

        {/* breadcrumbs */}
        <div
          className={`${
            level === 1 ? "main-contents" : "main-contents ws"
          } sticky top-0 z-[5]`}
        >
          <div className="breadcrumbs">
            <div className="page-title flex flex-row items-center gap-[12px]">
              <button
                className=""
                onClick={() => navigate(MerchantRoutes.Products)}
              >
                <BsChevronLeft />
              </button>{" "}
              {pageTitle}
            </div>

            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              <li>
                <a href={MerchantRoutes.Products}>My Products {">"}</a>
              </li>
              {level > 1 && <li>{pageTitle}</li>}
            </ul>
          </div>
        </div>

        {/* form */}
        <div
          id="add-edit-product"
          className="pb-[70px] px-[65px] flex flex-row gap-[30px]"
        >
          <div className="w-[20%] bg-white pl-4 pt-5 h-48">
            <ul>
              <li className="mb-3">
                <a href="#product-details">
                  <p
                    className={`${
                      currentClick === "prod-details"
                        ? "text-orangeButton"
                        : "text-black"
                    }`}
                    onClick={() => setCurrentClick("prod-details")}
                  >
                    Product Details
                  </p>
                </a>
              </li>
              <li className="mb-3">
                <a href="#seo-marketing" className="text-black">
                  <p
                    className={`${
                      currentClick === "seo-marketing"
                        ? "text-orangeButton"
                        : "text-black"
                    }`}
                    onClick={() => setCurrentClick("seo-marketing")}
                  >
                    SEO Marketing
                  </p>
                </a>
              </li>
              <li className="mb-3">
                <a href="#product-variants" className="text-black">
                  <p
                    className={`${
                      currentClick === "prod-attributes"
                        ? "text-orangeButton"
                        : "text-black"
                    }`}
                    onClick={() => setCurrentClick("prod-attributes")}
                  >
                    Product Attributes
                  </p>
                </a>
              </li>
              <li className="mb-3">
                <a href="#product-dimensions" className="text-black">
                  <p
                    className={`${
                      currentClick === "shipping-details"
                        ? "text-orangeButton"
                        : "text-black"
                    }`}
                    onClick={() => setCurrentClick("shipping-details")}
                  >
                    Shipping Details
                  </p>
                </a>
              </li>
              <li className="mb-3">
                <a href="#optional-details" className="text-black">
                  <p
                    className={`${
                      currentClick === "others"
                        ? "text-orangeButton"
                        : "text-black"
                    }`}
                    onClick={() => setCurrentClick("others")}
                  >
                    Others
                  </p>
                </a>
              </li>
            </ul>
          </div>
          <form className="flex flex-col gap-[24px] w-[80%] shrink min-h-[2000px]">
            {/* category and product detail */}
            <div id="product-details" className={`${formSectionClass}`}>
              <label className={`${formLabelClass}`}>
                Select Category
                <div className="flex gap-3 items-center">
                  <div className="bg-white w-56 ml-2 flex justify-between border border-gray-300 rounded-md items-center relative">
                    <input
                      placeholder="Search category.."
                      type="text"
                      className="!border-0"
                      value={searchKey}
                      onChange={categorySearch}
                    />
                    <MdClose
                      onClick={() => {
                        setSearchKey("");
                        setSearchResult([]);
                      }}
                      className="text-gray-400 cursor-pointer mr-3"
                    />
                    {searchResult.length > 0 ? (
                      <div className="absolute top-11 w-56 bg-white overflow-auto h-56 shadow-md py-2">
                        {searchResult.map((item) => {
                          let level2, level3;
                          level2 = item?.level_two && item?.level_two[0];
                          level3 =
                            level2?.level_three && level2?.level_three[0];

                          return (
                            <div className="ml-0.5">
                              <div className="flex gap-1 mb-1">
                                <MdSearch />
                                <p
                                  className="text-sm"
                                  onClick={() => categorySelection(item, 3)}
                                >
                                  {item?.name}
                                </p>
                              </div>
                              {level2 && (
                                <div
                                  className="flex gap-1 mb-1 ml-6"
                                  onClick={() => categorySelection(item, 2)}
                                >
                                  <p className="text-sm text-grey4Border">in</p>
                                  <p className="text-sm">{level2?.name}</p>
                                </div>
                              )}
                              {level3 && (
                                <div
                                  className="flex gap-1 mb-1 ml-12"
                                  onClick={() => categorySelection(item, 1)}
                                >
                                  <p className="text-sm text-grey4Border">in</p>
                                  <p className="text-sm">{level3?.name}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  <div onClick={() => setShowCategory(!showCategory)}>
                    {showCategory ? (
                      <BsChevronUp className={`${formLabelSvgClass}`} />
                    ) : (
                      <BsChevronDown className={`${formLabelSvgClass}`} />
                    )}
                  </div>
                </div>
              </label>

              <div id="section-body" className={showCategory ? "" : "hidden"}>
                {/* search category */}

                {/* list category */}
                <div className="text-[#F5AB35] w-full text-right text-[12px] font-medium mbottom-[6px]">
                  {selectedCategory[0] && (
                    <>
                      <span>{selectedCategory[0].name}</span>
                    </>
                  )}
                  {selectedCategory[1] && (
                    <>
                      <span>
                        {" "}
                        {`>`} {selectedCategory[1].name}{" "}
                      </span>
                    </>
                  )}
                  {selectedCategory[2] && (
                    <>
                      <span>
                        {" "}
                        {`>`} {selectedCategory[2].name}{" "}
                      </span>
                    </>
                  )}
                </div>

                {/* category grid col 3 */}
                <div className="boxshadow grid grid-cols-3 text-[18px] text-[#4F4F4F] font-medium w-full mb-[50px]">
                  <div className="py-[20px] overflow-y-auto flex flex-col gap-[20px] h-[250px] bg-white">
                    {category1.map((val, idx) => {
                      return (
                        <button
                          ref={(el) => (listItemRefs1.current[idx] = el)}
                          type="button"
                          key={idx + "category1"}
                          className={`${hoverOrangeClass} 
                                ${
                                  selectedCategory[0] &&
                                  val.id_category ===
                                    selectedCategory[0].id_category
                                    ? "text-[#F5AB35]"
                                    : ""
                                } px-[25px]`}
                          onClick={() => {
                            const updatedSelected = [...selectedCategory];
                            updatedSelected[0] = val;
                            updatedSelected[1] = null;
                            updatedSelected[2] = null;
                            setSelectedCategory(updatedSelected);
                            setUpdateSection1(true);
                            //console.log("set selected category 0 to: ", updatedSelected);

                            //reset category 2
                            setCategory2Page(1);
                            setCategory2([]);

                            //reset category 3
                            setCategory3Page(1);
                            setCategory3([]);

                            //then load cat 2
                            loadCategory(
                              1,
                              category2Page,
                              val.id_category,
                              true
                            );
                          }}
                        >
                          {val.name}
                        </button>
                      );
                    })}

                    {hasMoreCat1 && (
                      <>
                        <button
                          type="button"
                          className={`${hoverOrangeClass} text-sm px-[25px]`}
                          onClick={() => {
                            const cpage = category1Page + 1;
                            setCategory1Page(cpage);
                            loadCategory(0, cpage, 0, false);
                          }}
                        >
                          Load More..
                        </button>
                      </>
                    )}
                  </div>
                  <div className="py-[20px] overflow-y-auto flex flex-col gap-[20px] h-[250px]">
                    {category2.map((val, idx) => {
                      return (
                        <button
                          type="button"
                          ref={(el) => (listItemRefs2.current[idx] = el)}
                          key={idx + "category2"}
                          className={`${hoverOrangeClass} 
                                ${
                                  selectedCategory[1] &&
                                  val.id_category ===
                                    selectedCategory[1].id_category
                                    ? "text-[#F5AB35]"
                                    : ""
                                } px-[25px]`}
                          onClick={() => {
                            const updatedSelected = [...selectedCategory];
                            updatedSelected[1] = val;
                            updatedSelected[2] = null;
                            setSelectedCategory(updatedSelected);
                            setUpdateSection1(true);
                            //console.log("set selected category 1 to: ", updatedSelected);

                            //reset category 3
                            setCategory3Page(1);
                            setCategory3([]);

                            //then load cat 2
                            loadCategory(
                              2,
                              category3Page,
                              val.id_category,
                              true
                            );
                          }}
                        >
                          {val.name}
                        </button>
                      );
                    })}

                    {hasMoreCat2 && selectedCategory[0] && (
                      <>
                        <button
                          type="button"
                          className={`${hoverOrangeClass} text-sm px-[25px]`}
                          onClick={() => {
                            const cpage = category2Page + 1;
                            setCategory2Page(cpage);
                            loadCategory(
                              1,
                              cpage,
                              selectedCategory[1].id_category,
                              false
                            );
                          }}
                        >
                          Load More..
                        </button>
                      </>
                    )}
                  </div>
                  <div className="py-[20px] overflow-y-auto flex flex-col gap-[20px] h-[250px]">
                    {category3.map((val, idx) => {
                      return (
                        <button
                          type="button"
                          ref={(el) => (listItemRefs3.current[idx] = el)}
                          key={idx + "category2"}
                          className={`${hoverOrangeClass} 
                                ${
                                  selectedCategory[2] &&
                                  val.id_category ===
                                    selectedCategory[2].id_category
                                    ? "text-[#F5AB35]"
                                    : ""
                                } px-[25px]`}
                          onClick={() => {
                            const updatedSelected = [...selectedCategory];
                            updatedSelected[2] = val;
                            setSelectedCategory(updatedSelected);
                            setUpdateSection1(true);
                            //console.log("set selected category 2 to: ", updatedSelected);
                          }}
                        >
                          {val.name}
                        </button>
                      );
                    })}

                    {hasMoreCat3 && selectedCategory[1] && (
                      <>
                        <button
                          type="button"
                          className={`${hoverOrangeClass} text-sm px-[25px]`}
                          onClick={() => {
                            const cpage = category3Page + 1;
                            setCategory3Page(cpage);
                            loadCategory(
                              2,
                              cpage,
                              selectedCategory[2].id_category,
                              false
                            );
                          }}
                        >
                          Load More..
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* product details */}
                <div className="product-details text-[#4F4F4F] flex flex-col gap-[30px]">
                  <label className={`${formLabelClass}`}>Product Details</label>

                  {/* name */}
                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      Product Name
                    </div>

                    <div className="w-full">
                      <input
                        placeholder={"Enter Product Name"}
                        value={productName}
                        id="product-name"
                        onChange={(e) => onChangeName(e)}
                      />
                      {errorName && (
                        <>
                          <div className="text-red-600 text-[14px]">
                            {errorName}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* brand */}
                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      Brand
                    </div>

                    <div className="w-full">
                      <input
                        placeholder={"Enter Brand"}
                        value={brand}
                        id="product-brand"
                        onChange={(e) => {
                          setBrand(e.target.value);
                          setUpdateSection1(true);
                          if (e.target.value === "") {
                            setErrorBrand("Brand is required.");
                            return;
                          }
                          setErrorBrand("");
                        }}
                      />
                      {errorBrand && (
                        <>
                          <div className="text-red-600 text-[14px]">
                            {errorBrand}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* images */}
                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      Product Images
                      <br />
                      <small className="text-[14px]">(max 7)</small>
                      <div className="text-[14px]">
                        (Individual file max size: 2 MB)
                      </div>
                      <div className="text-[14px]">
                        To remove image background, consider using either tool:
                      </div>
                      <div className="site-btn btn-border-primary ml-5 my-2 max-md:mb-2">
                        <a
                          href="https://www.photoroom.com/api/remove-background"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PhotoRoom
                        </a>
                      </div>
                      <div className="site-btn btn-border-primary ml-5 my-2 max-md:mb-2">
                        <a
                          href="https://www.remove.bg/upload"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          RemoveBG
                        </a>
                      </div>
                    </div>

                    {/* New product images handler */}
                    <div className="flex flex-row gap-[12px] flex-wrap">
                      {/* cover image */}
                      <div className="flex flex-col gap-[14px]">
                        <input
                          type={"file"}
                          accept="image/*"
                          className="hidden"
                          id="upload-cover"
                          onChange={(e) => handleFileInputChange(e, 0)}
                        />
                        <div className="relative">
                          <img
                            src={
                              coverImage || uploadedCover
                                ? coverImage
                                  ? coverImage
                                  : uploadedCover.img
                                : addImage
                            }
                            alt=""
                            className=" cursor-pointer max-w-[100px]"
                            onClick={() => {
                              document.getElementById("upload-cover").click();
                            }}
                          />
                          {!coverImage && !uploadedCover && (
                            <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                              400px by 400px
                            </span>
                          )}
                        </div>
                        <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                          Cover Photo
                          {(coverImage || uploadedCover) && (
                            <MdDeleteForever
                              className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                              onClick={() => {
                                document.getElementById("upload-cover").value =
                                  null;
                                setCoverImage(null);
                                setCoverImageFile(null);
                                if (uploadedCover)
                                  deleteMedia(uploadedCover, "image");
                              }}
                            />
                          )}
                        </label>
                      </div>

                      {/* images section */}
                      {productImages[0] || uploadedImages[0] ? (
                        <div className="flex flex-col gap-[14px]">
                          <div className="relative">
                            <img
                              src={
                                productImages[0] || uploadedImages[0]
                                  ? productImages[0]
                                    ? productImages[0]
                                    : uploadedImages[0].img
                                  : addImage
                              }
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                            />
                            {!productImages[0] && !uploadedImages[0] && (
                              <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                                400px by 400px
                              </span>
                            )}
                          </div>
                          <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                            Image 1
                            {(productImages[0] || uploadedImages[0]) && (
                              <MdDeleteForever
                                className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                                onClick={() => callDeleteMedia(0)}
                              />
                            )}
                          </label>
                        </div>
                      ) : null}

                      {productImages[1] || uploadedImages[1] ? (
                        <div className="flex flex-col gap-[14px]">
                          <div className="relative">
                            <img
                              src={
                                productImages[1] || uploadedImages[1]
                                  ? productImages[1]
                                    ? productImages[1]
                                    : uploadedImages[1].img
                                  : addImage
                              }
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                            />
                            {!productImages[1] && !uploadedImages[1] && (
                              <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                                400px by 400px
                              </span>
                            )}
                          </div>
                          <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                            Image 2
                            {(productImages[1] || uploadedImages[1]) && (
                              <MdDeleteForever
                                className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                                onClick={() => callDeleteMedia(1)}
                              />
                            )}
                          </label>
                        </div>
                      ) : null}

                      {productImages[2] || uploadedImages[2] ? (
                        <div className="flex flex-col gap-[14px]">
                          <div className="relative">
                            <img
                              src={
                                productImages[2] || uploadedImages[2]
                                  ? productImages[2]
                                    ? productImages[2]
                                    : uploadedImages[2].img
                                  : addImage
                              }
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                            />
                            {!productImages[2] && !uploadedImages[2] && (
                              <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                                400px by 400px
                              </span>
                            )}
                          </div>
                          <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                            Image 3
                            {(productImages[2] || uploadedImages[2]) && (
                              <MdDeleteForever
                                className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                                onClick={() => callDeleteMedia(2)}
                              />
                            )}
                          </label>
                        </div>
                      ) : null}

                      {productImages[3] || uploadedImages[3] ? (
                        <div className="flex flex-col gap-[14px]">
                          <div className="relative">
                            <img
                              src={
                                productImages[3] || uploadedImages[3]
                                  ? productImages[3]
                                    ? productImages[3]
                                    : uploadedImages[3].img
                                  : addImage
                              }
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                            />
                            {!productImages[3] && !uploadedImages[3] && (
                              <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                                400px by 400px
                              </span>
                            )}
                          </div>
                          <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                            Image 4
                            {(productImages[3] || uploadedImages[3]) && (
                              <MdDeleteForever
                                className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                                onClick={() => callDeleteMedia(3)}
                              />
                            )}
                          </label>
                        </div>
                      ) : null}

                      {productImages[4] || uploadedImages[4] ? (
                        <div className="flex flex-col gap-[14px]">
                          <div className="relative">
                            <img
                              src={
                                productImages[4] || uploadedImages[4]
                                  ? productImages[4]
                                    ? productImages[4]
                                    : uploadedImages[4].img
                                  : addImage
                              }
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                            />
                            {!productImages[4] && !uploadedImages[4] && (
                              <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                                400px by 400px
                              </span>
                            )}
                          </div>
                          <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                            Image 5
                            {(productImages[4] || uploadedImages[4]) && (
                              <MdDeleteForever
                                className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                                onClick={() => callDeleteMedia(4)}
                              />
                            )}
                          </label>
                        </div>
                      ) : null}

                      {productImages[5] || uploadedImages[5] ? (
                        <div className="flex flex-col gap-[14px]">
                          <div className="relative">
                            <img
                              src={
                                productImages[5] || uploadedImages[5]
                                  ? productImages[5]
                                    ? productImages[5]
                                    : uploadedImages[5].img
                                  : addImage
                              }
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                            />
                            {!productImages[5] && !uploadedImages[5] && (
                              <span className="z-[10] text-center w-full text-[10px] block absolute bottom-[6px]">
                                400px by 400px
                              </span>
                            )}
                          </div>
                          <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                            Image 6
                            {(productImages[5] || uploadedImages[5]) && (
                              <MdDeleteForever
                                className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                                onClick={() => callDeleteMedia(5)}
                              />
                            )}
                          </label>
                        </div>
                      ) : null}

                      {maxShownImage < 6 && (
                        <div className="flex flex-col gap-[14px] relative">
                          <input
                            type="file"
                            accept="image/*"
                            name="files[]"
                            className="opacity-0 absolute h-24"
                            multiple
                            id={`upload-images`}
                            onChange={(e) => handleFilesInputChange(e)}
                          />
                          <img
                            src={addImageTxt}
                            alt=""
                            className=" cursor-pointer max-w-[100px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* video */}
                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      Product Video
                    </div>

                    <div className="flex flex-row gap-[12px] max-lg:flex-wrap">
                      <div className="flex flex-col gap-[14px]">
                        <input
                          type={"file"}
                          accept="video/*"
                          className="hidden"
                          id="upload-covervid"
                          onChange={(e) => handleFileInputChange(e, 7)}
                        />

                        {coverVideo === null && uploadedVideo === null ? (
                          <>
                            <img
                              src={addImage}
                              alt=""
                              className=" cursor-pointer max-w-[100px]"
                              onClick={() => {
                                document
                                  .getElementById("upload-covervid")
                                  .click();
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <video
                              controls
                              width="400"
                              height="300"
                              src={coverVideo ? coverVideo : uploadedVideo.vdo}
                              onLoadedMetadata={handleLoadedMetadata}
                              ref={videoEl}
                            />
                          </>
                        )}

                        <label className="text-[#000] text-[14px] font-medium flex flex-row gap-[10px] items-center">
                          Cover Video
                          {(coverVideo || uploadedVideo) && (
                            <MdDeleteForever
                              className="text-[#ff0000] cursor-pointer animate__animated animate__fadeInDown"
                              onClick={() => {
                                document.getElementById(
                                  "upload-covervid"
                                ).value = null;
                                setCoverVideo(null);
                                if (uploadedVideo)
                                  deleteMedia(uploadedVideo, "video");
                              }}
                            />
                          )}
                        </label>
                      </div>

                      <div className="description text-[#B1B1B1] text-[14px]">
                        <p>
                          1. Size : Max 7 Mb,resolution should not exceed
                          1280x1280px
                        </p>
                        <p>2. Duration : 10s-60s</p>
                        <p>3. Format: MP4</p>
                        <p>
                          4. Note: Your product will be listed, and video will
                          be displayed after it has been 100% uploaded.
                          {/* You can publish this listing while the
                            video is being processed. Video will be shown in
                            listing once successfully processed. */}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* description */}
                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      Product Description
                    </div>

                    <div className="w-[80%]">
                      <CKEditor
                        editor={Editor}
                        id="product-description"
                        data={description}
                        onReady={(editor) => {
                          // You can store the "editor" and use when it is needed.
                          // console.log( 'Editor is ready to use!', editor );
                          editor.editing.view.change((writer) => {
                            writer.setStyle(
                              "min-height",
                              "350px",
                              editor.editing.view.document.getRoot()
                            );
                          });
                          // editor.plugins.get('WordCount').on('update', (evt, stats) => {
                          //     this.setState({
                          //         char_count: stats.characters,
                          //     })
                          // });
                        }}
                        onChange={(e, editor) => onChangeDescription(editor)}
                        config={{ 
                            simpleUpload:{
                              // The URL that the images are uploaded to.
                              uploadUrl: AdminApis.imageUpload,
                              // Headers sent along with the XMLHttpRequest to the upload server.
                              headers: {
                                  Authorization: `Bearer ${user.access}`
                            }
                      },}}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      <p>Tags</p>
                      <p className="text-sm">
                        (Add keywords to connect related products. Tags will not
                        be shown in your store.)
                      </p>
                    </div>
                    <div className="w-full">
                      <input
                        placeholder={"Type and press enter to add tag.."}
                        value={currentTag}
                        id="product-current-tag"
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            let value = event.target.value
                            let newTags = []
                            if(value.includes(",")){
                              newTags = value.split(",")
                            } else if(value.includes("#")){
                              newTags = value.split("#")
                              newTags.splice(0,1)
                            }else newTags.push(value)

                            let tagList = [...tags, ...newTags];
                            setTags(tagList);
                            setUpdateSection1(true);
                            setCurrentTag("");
                          }
                        }}
                      />
                      <div className="flex gap-2 mt-4 flex-wrap items-center justify-start">
                        {tags.map((item, tagIndex) => {
                          return (
                            <div className="px-2 py-1 rounded-md text-center text-sm text-black bg-[#e7e7e7] flex gap-2 items-center">
                              {item}
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="cp"
                                onClick={() => {
                                  let tagList = [...tags];
                                  tagList.splice(tagIndex, 1);
                                  setTags(tagList);
                                  setUpdateSection1(true);
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* seo */}
            <div id="seo-marketing" className={`${formSectionClass}`}>
              <label
                className={`${formLabelClass}`}
                onClick={() => setShowSeo(!showSeo)}
              >
                SEO Marketing
                {showSeo ? (
                  <BsChevronUp className={`${formLabelSvgClass}`} />
                ) : (
                  <BsChevronDown className={`${formLabelSvgClass}`} />
                )}
              </label>

              {/* seo meta desc */}
              <div className={`${
                    showSeo ? "" : "hidden"
                  } flex flex-row items-start gap-[35px]`}>
                <div className="flex items-center gap-2">
                  <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                    <p></p>Meta Description
                    <p className="text-sm">(Max 200 characters allowed)</p>
                  </div>
                  {/* <div
                    className="h-5 w-5 rounded-2xl bg-[#DEDBD2] flex justify-center items-center relative cp"
                    onMouseLeave={() => setShowMetaDesc(false)}
                    onMouseOver={() => setShowMetaDesc(true)}
                  >
                    <BsQuestion size={20} color="#737373" />
                    {showMetaDesc && (
                      <div className="absolute w-72 bg-gray-200 rounded-md p-2 top-8 left-0 text-gray-500 text-xs mb-3 z-10">
                        <p className="font-bold"></p>
                        <br />
                      </div>
                    )}
                  </div> */}
                </div>
                  <div className="w-full">
                    <textarea
                      maxlength={200}
                      rows={4}
                      value={metaDescription}
                      placeholder={"Enter Meta Description"}
                      id="orderComment"
                      className="w-full text-sm border border-[#bdbdbd] rounded p-2"
                      onChange={(e) => onChangeMetaDescription(e)}
                    />
                  </div>
              </div>
            </div>
            {/* variations */}
            <div id="product-variants" className={`${formSectionClass}`}>
              <label
                className={`${formLabelClass}`}
                onClick={() => setShowVariants(!showVariants)}
              >
                Product Attributes
                {showVariants ? (
                  <BsChevronUp className={`${formLabelSvgClass}`} />
                ) : (
                  <BsChevronDown className={`${formLabelSvgClass}`} />
                )}
              </label>
              <div
                id="section-body2"
                className={`${
                  showVariants ? "" : "hidden"
                } flex flex-col gap-[30px]`}
              >
                <div className="flex flex-row items-center gap-[30px]">
                  <label>Variants</label>
                  <label className="switch !top-0">
                    <input
                      type="checkbox"
                      id="variantsSwitch"
                      checked={isManyVariants}
                      onChange={(e) => {
                        setIsManyVariants(!isManyVariants);
                        setUpdateSection2(true);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* single var */}
                <div
                  className={`${
                    isManyVariants ? "hidden" : ""
                  } flex flex-col gap-[30px]`}
                >
                  <div className="flex flex-row items-center gap-[30px]">
                    <label
                      id="lbl_novariant_price"
                      className="w-[100px] shrink-0"
                    >
                      <span className="">Price *</span>
                    </label>
                    <div className="text-field ws40">
                      <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                        <input
                          placeholder={"Please Input"}
                          value={variationPrice}
                          onChange={(e) => {
                            setVariationPrice(e.target.value);
                            setUpdateSection2(true);
                          }}
                          id="defaultPriceInput"
                          type="number"
                          min={0}
                          className="!border-0"
                        />

                        <p className="text-grey4Border text-xs">SGD</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center flex-row w-full gap-[30px]">
                    <label className="w-[100px] shrink-0">On Sale</label>
                    <div className="flex gap-5 ws40 items-center">
                      <label className="switch !top-0">
                        <input
                          type="checkbox"
                          id="variantsSwitch"
                          checked={isOnSale}
                          className="!w-[30px]"
                          onChange={(e) => {
                            setIsOnSale(!isOnSale);
                            setVariationDiscount("");
                            setVariationDiscountType(discountTypes[0]);
                            setUpdateSection2(true);
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                      {isOnSale ? (
                        <Select
                          id="discount_type"
                          name="discount_type"
                          options={discountTypes}
                          placeholder="Discount Type"
                          className="text-sm w-full"
                          value={{ label: variationDiscountType.label }}
                          onChange={(e) => {
                            setVariationDiscountType(e);
                            setVariationDiscount("");
                            setUpdateSection2(true);
                          }}
                        />
                      ) : (
                        <div className="w-full"></div>
                      )}
                    </div>

                    {productName &&
                    ((isOnSale &&
                      variationDiscount &&
                      variationDiscount !== 0) ||
                      (!isOnSale && variationPrice)) ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-grey4Border text-xs italic">
                          Preview
                        </p>
                        <p className="text-black text-base font-semibold">
                          {productName}
                        </p>
                        {!isOnSale ? (
                          <p className="text-black text-base font-semibold">
                            {parseFloat(variationPrice)?.toFixed(2)}
                          </p>
                        ) : (
                          <div className="flex gap-5">
                            <p className="text-base text-orangeButton font-semibold">
                              {variationDiscountType.label === "Sale Price"
                                ? parseFloat(variationDiscount).toFixed(2)
                                : calcOffer()}
                            </p>
                            <p className="text-black font-semibold text-base line-through decoration-orangeButton">
                              {parseFloat(variationPrice).toFixed(2)}
                            </p>

                            <div
                              className={`text-[12px] bg-red-500 text-white rounded-[2px] px-[4px] py-[2px]`}
                            >
                              {variationDiscountType.label === "Sale Price"
                                ? calcOffer()
                                : variationDiscount + "% off"}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {isOnSale && (
                    <div className="flex flex-row items-center gap-[30px]">
                      <label
                        id="lbl_novariant_price"
                        className="w-[100px] shrink-0"
                      >
                        <span className="">{variationDiscountType.label}</span>
                      </label>
                      <div className="text-field ws40 h-[38px]">
                        <div className="relative">
                          <input
                            placeholder={"Please Input"}
                            value={variationDiscount ?? ""}
                            onChange={(e) => {
                              setVariationDiscount(e.target.value);
                              setUpdateSection2(true);
                            }}
                            id="defaultDiscountInput"
                            type="number"
                            min={0}
                            className="!py-2"
                          />
                          <p className="absolute top-2.5 left-28 text-grey4Border text-sm">
                            {variationDiscountType.label === "Sale Price"
                              ? "SGD"
                              : "%"}
                          </p>
                          {variationDiscount ? (
                            <div
                              className={`discount-price absolute right-2.5 top-2.5 text-[12px] bg-red-500 text-white rounded-[2px] px-[4px] py-[2px]`}
                            >
                              {variationDiscountType.label !== "Sale Price"
                                ? "$ " + calcOffer()
                                : calcOffer()}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-row items-center gap-[30px]">
                    <label
                      id="lbl_novariant_stock"
                      className="w-[100px] shrink-0"
                    >
                      <span>Stock *</span>
                    </label>
                    <div className="text-field ws40">
                      <div className="">
                        <input
                          placeholder={"Please Input"}
                          value={variationStock}
                          onChange={(e) => {
                            setVariationStock(e.target.value);
                            setUpdateSection2(true);
                          }}
                          id="defaultStockInput"
                          type="number"
                          min={0}
                        />
                      </div>
                      {/* <p id="variantsOff_stock_msg" className="text-red-600 hidden">
                                            The stock field is required.
                                        </p> */}
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-[30px]">
                    <label className="w-[100px] shrink-0">
                      <span>SKU</span>
                    </label>
                    <div className="text-field ws40">
                      <div className="">
                        <input
                          placeholder={"Please Input"}
                          value={variationSku}
                          onChange={(e) => {
                            setVariationSku(e.target.value);
                            setUpdateSection2(true);
                          }}
                          id="defaultSKUInput"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* multiple vvar */}
                <div className={`${isManyVariants ? "" : "hidden"}`}>
                  <VariationSection
                    productData={productVariation}
                    productId={addedProductId}
                    setUpdate={() => setUpdateSection2(true)}
                  />
                </div>
              </div>
            </div>

            {/* shipping details */}
            <div id="product-dimensions" className={`${formSectionClass}`}>
              <label
                className={`${formLabelClass}`}
                onClick={() => setShowShipping(!showShipping)}
              >
                Shipping Details
                {showShipping ? (
                  <BsChevronUp className={`${formLabelSvgClass}`} />
                ) : (
                  <BsChevronDown className={`${formLabelSvgClass}`} />
                )}
              </label>

              <div
                id="section-body3"
                className={`${
                  showShipping ? "" : "hidden"
                } flex flex-col gap-[30px]`}
              >
                <div className="flex flex-row gap-[35px]">
                  <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                    Weight *
                  </div>

                  <div className="w-full">
                    <div className="rounded-[6px] border-[#C1C1C1] border-[1px] flex flex-row text-[#000] text-[14px] items-center">
                      <input
                        type="number"
                        min={0}
                        placeholder={"Please input (KG)"}
                        value={shippingWeight}
                        id="shipping-weight"
                        className="w-full !border-none"
                        onChange={(e) => {
                          setShippingWeight(e.target.value);
                          setUpdateSection3(true);
                          if (e.target.value === "") {
                            setErrorShippingWeight(
                              "Shipping weight is required."
                            );
                            return;
                          }
                          setErrorShippingWeight("");
                        }}
                      />
                      <div className="border-l-[1px] border-[#c1c1c1] p-[14px]">
                        Kg
                      </div>
                    </div>
                    {errorShippingWeight !== "" && (
                      <>
                        <div className="text-red-600 text-[14px]">
                          {errorShippingWeight}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-row gap-[35px]">
                  <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                    Parcel Size *
                  </div>

                  <div className="w-full">
                    <div className={`grid grid-cols-3 gap-[10px]`}>
                      <div className="rounded-[6px] border-[#C1C1C1] border-[1px] flex flex-row text-[#000] text-[14px] items-center">
                        <input
                          type="number"
                          min={0}
                          id="shipping-width"
                          className="w-full !border-none"
                          placeholder="W"
                          value={shippingWidth}
                          onChange={(e) => {
                            setShippingWidth(e.target.value);
                            setUpdateSection3(true);
                            setErrorShippingSize(
                              e.target.value !== "" ? "" : "Width is required."
                            );
                          }}
                        />
                        <div className="border-l-[1px] border-[#c1c1c1] p-[14px]">
                          cm
                        </div>
                      </div>

                      <div className="rounded-[6px] border-[#C1C1C1] border-[1px] flex flex-row text-[#000] text-[14px] items-center">
                        <input
                          type="number"
                          min={0}
                          id="shipping-length"
                          className="w-full !border-none"
                          placeholder="L"
                          value={shippingLength}
                          onChange={(e) => {
                            setShippingLength(e.target.value);
                            setUpdateSection3(true);
                            setErrorShippingSize(
                              e.target.value !== "" ? "" : "Length is required."
                            );
                          }}
                        />
                        <div className="border-l-[1px] border-[#c1c1c1] p-[14px]">
                          cm
                        </div>
                      </div>

                      <div className="rounded-[6px] border-[#C1C1C1] border-[1px] flex flex-row text-[#000] text-[14px] items-center">
                        <input
                          type="number"
                          min={0}
                          id="shipping-height"
                          className="w-full !border-none"
                          placeholder="H"
                          value={shippingHeight}
                          onChange={(e) => {
                            setShippingHeight(e.target.value);
                            setUpdateSection3(true);
                            setErrorShippingSize(
                              e.target.value !== "" ? "" : "Height is required."
                            );
                          }}
                        />
                        <div className="border-l-[1px] border-[#c1c1c1] p-[14px]">
                          cm
                        </div>
                      </div>
                    </div>
                    {errorShippingSize !== "" && (
                      <div className="text-red-600 text-[14px]">
                        {errorShippingSize}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row gap-[35px] items-center">
                  <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                    <div className="flex gap-1 items-center">
                      All Day Receiving
                      <MdOutlineInfo data-tooltip-id="allDayReceiving" />
                      <ReactTooltip
                        id="allDayReceiving"
                        place="top"
                        content="Only select this option if this product is suitable for 10am - 10pm delivery"
                      />
                    </div>
                    <p>(10AM - 10PM)</p>
                  </div>
                  <label className="switch !top-0">
                    <input
                      type="checkbox"
                      id="variantsSwitch"
                      defaultChecked={allDayReceive === "on" ? true : false}
                      checked={allDayReceive === "on" ? true : false}
                      onChange={(e) => {
                        setAllDayReceive(e.target.checked ? "on" : "off");
                        setUpdateSection3(true);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="flex flex-row gap-[35px]">
                  <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                    Needs Pre-order
                  </div>
                  <div className="flex gap-4">
                    <div className="flex gap-1 items-center">
                      <input
                        type="radio"
                        name="yes"
                        value="y"
                        checked={needPreorder === "y"}
                        onChange={handleNeedPreOrder}
                      />
                      Yes
                    </div>
                    <div className="flex gap-1 items-center">
                      <input
                        type="radio"
                        name="no"
                        value="n"
                        checked={needPreorder === "n"}
                        onChange={handleNeedPreOrder}
                      />
                      No
                    </div>
                  </div>
                </div>

                {needPreorder === "y" && (
                  <div className="flex flex-row gap-[35px]">
                    <div className="text-right text-[16px] font-medium w-[160px] shrink-0">
                      No. of Days to Ship
                    </div>
                    <div className="w-full">
                      <input
                        type="number"
                        id="day-to-ship"
                        className="w-full"
                        placeholder="Please input (No. of days to ship)"
                        value={daysToShip}
                        onChange={(e) => {
                          setDaysToShip(e.target.value);
                          setUpdateSection3(true);
                          setDaysToShipErr(
                            e.target.value !== ""
                              ? ""
                              : "Days to ship is required."
                          );
                        }}
                      />
                      {daysToShipErr !== "" && (
                        <div className="text-red-600 text-[14px] mt-1">
                          {daysToShipErr}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* options  */}
            {/* <div id="optional-details" className={`${formSectionClass}`}>
              <label
                className={`${formLabelClass}`}
                onClick={() => setShowOptional(!showOptional)}
              >
                Additional Details (optional)
                {showOptional ? (
                  <BsChevronUp className={`${formLabelSvgClass}`} />
                ) : (
                  <BsChevronDown className={`${formLabelSvgClass}`} />
                )}
              </label>

              <div
                id="section-body4"
                className={`${
                  showOptional ? "" : "hidden"
                } flex flex-col gap-[30px]`}
              >
                //option form
                <div className="new-option mb-7">
                  <div className="text-field option-label mb-4">
                    <input
                      placeholder="Please enter option field"
                      id="new_option_name"
                    />
                  </div>
                  <div className="text-field mb-5">
                    <input
                      placeholder="Please enter value"
                      id="new_option_value"
                    />
                  </div>
                  <button
                    className="site-btn btn-default"
                    type="button"
                    onClick={(e) => addOptionalDetail(e)}
                  >
                    Add Option
                  </button>
                </div>

                //display option
                <div className="grid grid-cols-2 gap-[15px]">
                  {optionalDetails.map((item, i) => (
                    <div
                      key={"options-" + i}
                      className="opt-grid flex flex-row gap-[15px] items-center"
                    >
                      <label className="font-medium text-base">
                        Option name: {item.name}
                      </label>
                      <input value={item.value} disabled />
                      <MdDeleteForever
                        className="delete-option"
                        onClick={(e) => removeOption(i)}
                      />
                    </div>
                  ))}
                </div>

               // extra fields
                <div className="accordion-body mt-5">
                  <div className="fields">
                    <div className="grid grid-cols-4 mb-5">
                      <label className="float-right text-right text-bold m-3 pr-2">
                        Country of Origin
                      </label>
                      <div className="text-field border mr-1">
                        <div className="rounded border-slate-300">
                          <CountrySelect />
                        </div>
                      </div>

                      <label className="float-right text-right text-bold m-3 pr-2">
                        Safety Mark
                      </label>
                      <div className="text-field border mr-1">
                        <select
                          name="smRadio"
                          id="smRadio"
                          onChange={(e) => setSafetyMark(e.target.value)}
                          value={safetyMark}
                        >
                          <option value="none">
                            Select a Safety Mark option
                          </option>
                          <option value="y">Yes </option>
                          <option value="n">No</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 mb-5">
                      <label className="float-right text-right text-bold m-3 pr-2">
                        Warranty Duration
                      </label>
                      <div className="text-field border mr-1">
                        <input
                          placeholder={"Please Input"}
                          id="wdInput"
                          value={warrantyDuration}
                          type="text"
                          min={0}
                          onChange={(e) => setWarrantyDuration(e.target.value)}
                        />
                      </div>

                      <label className="float-right text-right text-bold m-3 pr-2">
                        Warranty Type
                      </label>
                      <div className="text-field border mr-1">
                        <select
                          name="wtRadio"
                          id="wtRadio"
                          onChange={(e) => setWarrantyType(e.target.value)}
                          value={warrantyType}
                        >
                          <option value="none">Select a Warranty Type</option>
                          <option value="on-site">On-Site</option>
                          <option value="off-site">Off-Site</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4">
                      <label className="float-right text-right text-bold m-3 pr-2">
                        Pack Size
                      </label>
                      <div>
                        <div className="text-field border mr-1">
                          <input
                            placeholder={"Please Input"}
                            id="packSize"
                            value={packSize}
                            type="number"
                            min={0}
                            onChange={(e) => setPackSize(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </form>

          {/* legend */}
          {/* < div id="legend" className='w-[15%] relative' >
                    <div className='l2-legend hidden lg:block'>
                        <div className='bar'><span></span></div>
                        <ul>
                            <li><a href='#product-details'>Product Details</a></li>
                            <li><a href='#product-variants'>Product Attributes</a></li>
                            <li><a href='#product-dimensions'>Shipping Details</a></li>
                            <li><a href='#optional-details'>Others</a></li>
                        </ul>
                    </div>
                </div > */}
        </div>

        {/* buttons */}
        <div className="flex w-full">
          <div className="w-[20%]"></div>
          <div className="flex flex-row justify-between w-[80%] bottom-[0] py-[20px] fixed px-[20px] ml-[65px] bg-[#FCFCFC]">
            {/* <div>
                <button
                  type="button"
                  className="px-[16px] py-[8px] bg-[#F5AB35] text-white rounded-[4px]"
                  onClick={async () => {
                    if (addedProduct === null) {
                      toast.promise(submitForm(true), {
                        pending: "Preparing the preview",
                        success: "Redirecting you to preview page",
                      });
                    }
                    const slug =
                      addedProduct && addedProduct.product_detail
                        ? addedProduct.product_detail.slug
                        : addedProduct.slug;
                    localStorage.setItem("productID", addedProductId);
                    window.open(CustomerRoutes.Preview, "_blank");
                  }}
                >
                  Preview
                </button>
              </div> */}

            {/* buttons */}
            <div className="flex flex-row justify-between w-[80%] bottom-[0] py-[20px] fixed px-[20px] ml-[65px] bg-[#FCFCFC]">
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-[16px] py-[8px] border-[1px] border-[#F5AB35] bg-[#F5AB35] text-white rounded-[4px] text-[12px]"
                  onClick={() => submitForm("draft")}
                  disabled={isSaveDraft}
                >
                  {isSaveDraft
                    ? "Saving in Progress"
                    : prodStatus === "Active"
                    ? "Save"
                    : "Save As Draft"}
                </button>
                <button
                  type="button"
                  className={`px-[16px] py-[8px] ${
                    isSave && prodStatus === "Active"
                      ? "bg-[#F5AB35] "
                      : "bg-slate-300 "
                  } text-white  rounded-[4px]`}
                  disabled={isSave && prodStatus === "Active" ? false : true}
                  onClick={async () => {
                    localStorage.setItem("productID", addedProductId);
                    window.open(CustomerRoutes.Preview, "_blank");
                  }}
                >
                  Preview
                </button>
              </div>

              {prodStatus !== "Active" && (
                <div className="flex flex-row gap-[16px]">
                  <button
                    type="button"
                    className="px-[16px] py-[8px] border-[1px] border-[#BDBDBD] text-[#BDBDBD] rounded-[4px] text-[12px]"
                    onClick={() => {
                      document.location.replace(MerchantRoutes.Products);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-[16px] py-[8px] border-[1px] border-[#F5AB35] bg-[#F5AB35] text-white rounded-[4px] text-[12px]"
                    onClick={() => submitForm("publish")}
                    disabled={isPublishing}
                  >
                    {isPublishing ? <>Publishing in Progress</> : <>Publish</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <AllowProductDuplication
        showPopup={prodDuplicationConfirmation}
        closePopup={() => showProdDuplicationConfirmation(false)}
        onAllow={() => {
          showProdDuplicationConfirmation(false);
          setAllowDuplicate(true);
        }}
      />
    </>
  );
};

export default AddProduct;
