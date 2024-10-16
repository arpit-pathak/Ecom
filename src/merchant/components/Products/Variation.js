import { useState, useEffect } from "react";
import "./variation.css";
import { MdDeleteForever, MdClose } from "react-icons/md";
import addVariantImg from "../../../assets/add-variant-img.svg";
import ls from "local-storage";
import { ApiCalls, Apis } from "../../utils/ApiCalls";
import { Constants, Media_Size_Limit } from "../../utils/Constants";
import { fileSizeCheck } from "../../utils/Helper";
import { toast } from "react-toastify";
import Select from "react-select";

//REFACTORED Variation section

// not yet done
//- css styling
//- option delete
//- option drag or change order ? if needed
//- api implementation
//- add validation to price and stock to only allow numbers
//- add validation to sku to be unique

/*
base on shopee video
1. only parent option has the upload photo * can confirm again
but i coded in a way that you can just add the img and input tags for the child option
2. price, stock, sku are recorded in 2 layers: first array is for variation 1 options, second array is for variation 2 options
3. for edit product, you just need to pass in productData props: productData is your json data from the product details api.
then you need to process it inside useEffect > then fill up all the useStates variables base
4. you still need to include other fields like discount price... etc.
5. to get the values here to the parent component which is the Add.js > you can either pass a callback props
or you can use createContext
6. images are saved in useState as well. images are converted to URLs blobs 
check online or chatgpt to check how to upload. should be able to upload since it is a blob data
*/

const discountTypes = [
  { value: "percentage", label: "% Discount" },
  { value: "fixed", label: "Sale Price" },
];

const VariationSection = ({
  //use this props to pass the product data if the action is edit product
  productData,
  productId,
  setUpdate
}) => {
  //save as localstorage or create context using createContext for you to be able to use the values from this component to another component
  // const variationsInStorage = localStorage.getItem('product-variations');
  // console.log("variationsInStorage:", variationsInStorage);

  //vars
  //array of variation names eg: 'color', 'capacity'
  const [variationNames, setVariationNames] = useState([""]);
  const [variationIds, setVariationIds] = useState([[""]]);
  var [variationActualIds, setVariationActualIds] = useState([[""]]);

  //array of strings in array of variation options
  //eg: ['red', 'gold'], ['16gb', '62gb']
  const [variationOptions, setVariationOptions] = useState([[""]]);
  const [variationOptionsIds, setVariationOptionsIds] = useState([[""]]);
  const [variationOptionsImg, setVariationOptionsImg] = useState([[""]]);

  //2 dimension same as option image but
  //2nd array is using mapCountVariationInput to keep track on the duplicate input fields
  //because price is option x varname length so if we use the index from the map
  //it will have duplicate values
  let mapCountVariationInput = 0;
  var [variationOptionsPrice, setVariationOptionsPrice] = useState([[""]]);
  var [variationOptionsDiscount, setVariationOptionsDiscount] = useState([
    [""],
  ]);
  var [variationOptionsStock, setVariationOptionsStock] = useState([[""]]);
  var [variationOptionsSku, setVariationOptionsSku] = useState([[""]]);
  var [variationOptionsDiscountType, setVariationOptionsDiscountType] =
    useState([[discountTypes[0]]]);
  var [variationOptionsOnSale, setVariationOptionsOnSale] = useState([[false]]);

  const [applyToAllOnSale, setApplyToAllOnSale] = useState(false);
  const [applyToAllSymbol, setApplyToAllSymbol] = useState("%");

  //funcs
  const onChangeName = (variationIdx, e) => {
    const updatedValues = [...variationNames];
    updatedValues[variationIdx] = e.target.value;
    setVariationNames(updatedValues);
    setUpdate()
  };

  const onChangeOption = (variationIdx, variationOptionIdx, e) => {
    const updatedValues = [...variationOptions];
    updatedValues[variationIdx][variationOptionIdx] = e.target.value;

    const updatedOptionsDiscountType = [...variationOptionsDiscountType];
    updatedOptionsDiscountType[variationIdx][variationOptionIdx] = discountTypes[0];
    setVariationOptionsDiscountType(updatedOptionsDiscountType);

    setVariationOptions(updatedValues);
    setUpdate()
  };

  // event when user clicks enter > this will trigger to create another option
  const onBlurOption = (variationIdx, e) => {
    const updatedValues = [...variationOptions];
    const lengthUpdateValues = updatedValues[variationIdx].length;
    setVariationOptions(updatedValues);

    // Check if current e.target (input field) value is ""
    // If e.target has non-"" value, then check if the 'last' index in updatedValues exists
    if (e.target.value.length > 0) {
      if (
        updatedValues[variationIdx][lengthUpdateValues - 1].trim().length === 0
      ) {
        return;
      } else {
        // If e.target now has non-"" value & the next index in updatedValues does not exist,
        // then create a new index by pushing ('') to updatedValues
        // updatedValues[variationIdx].push('');

        updatedValues[variationIdx].push("");
        var parentVarLength = variationOptions[0].length;
        if (variationOptions[1])
          var beforeChildVarLength = variationOptions[1].length;

        // minus 1 from parentVarLength to account for element with value '', if any
        if (variationOptions[0][parentVarLength - 1] === "")
          parentVarLength = parentVarLength - 1;
        // minus 1 from beforeChildVarLength to account for element with value '', if any
        if (
          variationOptions[1] &&
          variationOptions[1][beforeChildVarLength - 1] === ""
        )
          beforeChildVarLength = beforeChildVarLength - 1;

        // for 1st variation, push all elements to the end of existing array
        if (variationIdx === 0) {
          const startingTotalCount = parentVarLength * beforeChildVarLength;
          for (var j = 0; j < beforeChildVarLength; j++) {
            variationOptionsPrice[1].splice(
              startingTotalCount - beforeChildVarLength + j,
              0,
              ""
            );
            variationOptionsDiscount[1].splice(
              startingTotalCount - beforeChildVarLength + j,
              0,
              ""
            );
            variationOptionsStock[1].splice(
              startingTotalCount - beforeChildVarLength + j,
              0,
              ""
            );
            variationOptionsSku[1].splice(
              startingTotalCount - beforeChildVarLength + j,
              0,
              ""
            );
            variationActualIds[1].splice(
              startingTotalCount - beforeChildVarLength + j,
              0,
              ""
            );
            variationOptionsDiscountType[1].splice(
              startingTotalCount - beforeChildVarLength + j,
              0,
              discountTypes[0]
            );
          }
        }
        // for 2nd variation, push elements to specific index based on the following rule
        else {
          // updatedValues[variationIdx].push('');
          for (var i = 0; i < parentVarLength; i++) {
            // splice the '' element at specific indices with default value "0"
            // (i * (beforeChildVarLength )) is to account for the newly added '' element at the prior iteration
            // hence, (beforeChildVarLength - 1 + (i * (beforeChildVarLength))) will always point to the correct starting index for the next iteration
            variationOptionsPrice[1].splice(
              beforeChildVarLength - 1 + i * beforeChildVarLength,
              0,
              ""
            );
            variationOptionsDiscount[1].splice(
              beforeChildVarLength - 1 + i * beforeChildVarLength,
              0,
              ""
            );
            variationOptionsStock[1].splice(
              beforeChildVarLength - 1 + i * beforeChildVarLength,
              0,
              ""
            );
            variationOptionsSku[1].splice(
              beforeChildVarLength - 1 + i * beforeChildVarLength,
              0,
              ""
            );
            variationActualIds[1].splice(
              beforeChildVarLength - 1 + i * beforeChildVarLength,
              0,
              ""
            );
            variationOptionsDiscountType[1].splice(
              beforeChildVarLength - 1 + i * beforeChildVarLength,
              0,
              discountTypes[0]
            );
          }
        }
      }
    }

    setTimeout(() => {
      const elements = document.getElementsByClassName(
        `variation-${variationIdx}-options`
      );
      if (elements.length > 0) {
        // elements[elements.length - 1].focus();
        e.target.focus();
      }
    }, 100);
  };

  const addVariation = () => {
    const updatedValues = [...variationNames];
    updatedValues.push("");
    setVariationNames(updatedValues);

    const updatedOptions = [...variationOptions];
    updatedOptions.push([""]);
    setVariationOptions(updatedOptions);

    const updatedOptionsImg = [...variationOptionsImg];
    updatedOptionsImg.push([""]);
    setVariationOptionsImg(updatedOptionsImg);

    const updatedOptionsPrice = [...variationOptionsPrice];
    updatedOptionsPrice.push([]);
    setVariationOptionsPrice(updatedOptionsPrice);

    const updatedOptionsDiscount = [...variationOptionsDiscount];
    updatedOptionsDiscount.push([]);
    setVariationOptionsDiscount(updatedOptionsDiscount);

    const updatedOptionsDiscountType = [...variationOptionsDiscountType];
    updatedOptionsDiscountType.push([discountTypes[0]]);
    setVariationOptionsDiscountType(updatedOptionsDiscountType);

    const updatedOptionsStock = [...variationOptionsStock];
    updatedOptionsStock.push([]);
    setVariationOptionsStock(updatedOptionsStock);

    const updatedOptionsSku = [...variationOptionsSku];
    updatedOptionsSku.push([]);
    setVariationOptionsSku(updatedOptionsSku);

    const updatedOptionsActualIds = [...variationActualIds];
    updatedOptionsActualIds.push([]);
    setVariationActualIds(updatedOptionsActualIds);

    const updatedOptionsOnSale = [...variationOptionsOnSale];
    updatedOptionsOnSale.push([false]);
    setVariationOptionsOnSale(updatedOptionsOnSale);

    setUpdate()
    //document.getElementById("delete-variation-2").style.display = "block";
    //document.getElementById("delete-variation-2").style.visibility = "visible";
  };

  const applyToAll = () => {
    const price = document.getElementById("aas-price").value;
    const stock = document.getElementById("aas-stock").value;

    let newArrayDiscount0  = [], newArrayDiscountType0 = [];
    let discount, discountType;
    if (applyToAllOnSale) {
      discount = document.getElementById("aas-discount").value;
      let discountValue =
        document.getElementById("aas-discountType").selectedOptions[0].value ??
        "";

      newArrayDiscount0 = [Array(variationOptions[0].length).fill(discount)];

      discountType = discountTypes.find((item) => item.value === discountValue);
      newArrayDiscountType0 = [
        Array(variationOptions[0].length).fill(discountType),
      ];
    } else {
      newArrayDiscount0 = [Array(variationOptions[0].length).fill("")];
      newArrayDiscountType0 = [
        Array(variationOptions[0].length).fill(discountTypes[0]),
      ];
    }
    // const sku = document.getElementById('aas-sku').value;

    const newArrayPrice0 = [Array(variationOptions[0].length).fill(price)];
    
    const newArrayStock0 = [Array(variationOptions[0].length).fill(stock)];
    const newArrayOnSale0 = [Array(variationOptions[0].length).fill(applyToAllOnSale)];

    // const newArraySku0 = [Array(variationOptions[0].length).fill(sku)];

    if (variationOptions.length > 1) {
      newArrayPrice0.push(
        Array(variationOptions[0].length * variationOptions[1].length).fill(
          price
        )
      );
      newArrayStock0.push(
        Array(variationOptions[0].length * variationOptions[1].length).fill(
          stock
        )
      );

      newArrayDiscount0.push(
          Array(variationOptions[0].length * variationOptions[1].length).fill(
            applyToAllOnSale ?  discount : ""
          )
        );
        newArrayDiscountType0.push(
          Array(variationOptions[0].length * variationOptions[1].length).fill(
            applyToAllOnSale ? discountType : discountTypes[0]
          )
        );
     

      // newArraySku0.push(Array(variationOptions[0].length * variationOptions[1].length).fill(sku))

      newArrayOnSale0.push(
        Array(variationOptions[0].length * variationOptions[1].length).fill(
          applyToAllOnSale
        )
      );
    }

    setVariationOptionsPrice([...newArrayPrice0]);
    setVariationOptionsStock([...newArrayStock0]);
    setVariationOptionsOnSale([...newArrayOnSale0])
    setVariationOptionsDiscount([...newArrayDiscount0]);
    setVariationOptionsDiscountType([...newArrayDiscountType0]);

    setUpdate()
    // setVariationOptionsSku([...newArraySku0]);
    //console.log("newArraySku0:", newArraySku0);
  };


  const onFileChange = (variationIdx, variationOptionIdx, el, imgSelector) => {
    var file = el.target.files[0];
    if (!file) return;

    let isCorrectFileSize = fileSizeCheck(file, Media_Size_Limit.img_max_size);
    if (isCorrectFileSize) {
      var imgValidator = imgSelector
        ? document.getElementById(imgSelector)
        : null;

      var reader = new FileReader();
      reader.onloadend = function () {
        // skip preview for now
        if (imgValidator) imgValidator.src = reader.result;

        setTimeout(() => {
          var imgData = {
            file: file,
            idx: variationOptionIdx,
            b64: reader.result,
          };
          
          if (!varImagesList) var varImagesList = [];
          var lenidx = varImagesList.length;
          var list = new DataTransfer();
          list.items.add(file);
          imgData.idx = lenidx;
          varImagesList[variationOptionIdx] = imgData;
        }, 100);
      };
      reader.readAsDataURL(file);
      setUpdate()
    } else toast.error("File size cannot exceed 2 MB");
  };

  const onChangePrice = (variationIdx, variationOptionIdx, el) => {
    const updatedValues = [...variationOptionsPrice];
    updatedValues[variationIdx][variationOptionIdx] = el.target.value;
    setVariationOptionsPrice(updatedValues);
    console.log("price: ", updatedValues);
    setUpdate()
  };

  const onChangeDiscount = (variationIdx, variationOptionIdx, el) => {
    const updatedValues = [...variationOptionsDiscount];
    updatedValues[variationIdx][variationOptionIdx] = el.target.value;
    setVariationOptionsDiscount(updatedValues);
    setUpdate()
  };

  const onChangeDiscountType = (variationIdx, variationOptionIdx, el) => {
    const updatedValues = [...variationOptionsDiscountType];
    updatedValues[variationIdx][variationOptionIdx] = el;
    setVariationOptionsDiscountType(updatedValues);
    setUpdate()
  };

  const onChangeOnSale = (variationIdx, variationOptionIdx) => {
    const updatedValues = [...variationOptionsOnSale];
    updatedValues[variationIdx][variationOptionIdx] = !updatedValues[variationIdx][variationOptionIdx];
    setVariationOptionsOnSale(updatedValues);
    setUpdate()
  };

  const onChangeStock = (variationIdx, variationOptionIdx, el) => {
    const updatedValues = [...variationOptionsStock];
    updatedValues[variationIdx][variationOptionIdx] = el.target.value;
    setVariationOptionsStock(updatedValues);
    setUpdate()
  };

  const onChangeSku = (variationIdx, variationOptionIdx, el) => {
    const updatedValues = [...variationOptionsSku];
    updatedValues[variationIdx][variationOptionIdx] = el.target.value;
    setVariationOptionsSku(updatedValues);
    setUpdate()
  };

  const removeVariantOption = async (var_idx, opt_idx) => {
    //call delete api
    if (variationOptionsIds[var_idx].length > 0) {
      try {
        let user = ls(Constants.localStorage.user);
        if (user) user = JSON.parse(user);

        let optionIds = [];
        if (var_idx === 0)
          optionIds.push(variationOptionsIds[var_idx][opt_idx]);
        else {
          let optionsList = variationOptionsIds[var_idx].filter(
            (val) => val.optionValue === variationOptions[var_idx][opt_idx]
          );
          optionIds = optionsList.map((val) => val.optionId);
        }

        optionIds.map(async (optionId) => {
          const fd = new FormData();
          fd.append("option_id", optionId);
          fd.append("id_product", productId);
          await ApiCalls(
            fd,
            Apis.productVariation,
            "DELETE",
            {
              Authorization: "Bearer " + user.access,
            },
            //process response
            (response, url) => {
              const data = response.data;
              if (data.result === "FAIL") {
                toast.error(data.message);
                return;
              }
              console.log("received data:", data.data);
              localStorage.setItem("m-add-product", JSON.stringify(data.data));
              toast.success(data.message);
            }
          );
        });
      } catch (e) {
        console.log("error delete option: ", e);
      }
    }

    if (variationOptions.length > 1) {
      var parentVarLength = variationOptions[0].length;
      if (variationOptions[0][parentVarLength - 1] === "") {
        parentVarLength = parentVarLength - 1;
      }
      var childVarLength = variationOptions[1].length;
      if (variationOptions[1][childVarLength - 1] === "") {
        childVarLength = childVarLength - 1;
      }

      // Approach 1: Removing option from 'parent' variation
      if (var_idx === 0) {
        const startingTotalCount = parentVarLength * childVarLength;
        // Identify starting index based on input opt_idx
        const startingSpliceIndex = opt_idx * childVarLength;

        if (startingSpliceIndex + childVarLength - 1 <= startingTotalCount) {
          // for 2 variation combinations, values are always stored in 1-st index in respective variationOptions{Attribute} list
          variationOptionsPrice[1].splice(startingSpliceIndex, childVarLength);
          variationOptionsDiscount[1].splice(
            startingSpliceIndex,
            childVarLength
          );
          variationOptionsStock[1].splice(startingSpliceIndex, childVarLength);
          variationOptionsSku[1].splice(startingSpliceIndex, childVarLength);
          variationActualIds[1].splice(startingSpliceIndex, childVarLength);
          variationOptionsDiscountType[1].splice(
            startingSpliceIndex,
            childVarLength
          );
          variationOptionsOnSale[1].splice(
            startingSpliceIndex,
            childVarLength
          );

          variationOptions[var_idx].splice(opt_idx, 1);
          // remove empty elements in array
          variationOptionsPrice[1] = variationOptionsPrice[1].filter(
            (val) => val
          );
          variationOptionsDiscount[1] = variationOptionsDiscount[1].filter(
            (val) => val
          );
          variationOptionsStock[1] = variationOptionsStock[1].filter(
            (val) => val
          );
          variationOptionsSku[1] = variationOptionsSku[1].filter((val) => val);
          variationActualIds[1] = variationActualIds[1].filter((val) => val);
          variationOptionsDiscountType[1] =  variationOptionsDiscountType[1].filter((val) => val);
          variationOptionsOnSale[1] =  variationOptionsOnSale[1].filter((val) => val);
        }
      }

      // Approach 2: Removing option from 'child' variation
      else if (var_idx === 1) {
        // for loop that iterates the same number of times as length of 'parent' variation option list
        for (var i = 0; i < parentVarLength; i++) {
          variationOptionsPrice[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );
          variationOptionsDiscount[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );
          variationOptionsStock[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );
          variationOptionsSku[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );
          variationActualIds[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );
          variationOptionsDiscountType[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );
          variationOptionsOnSale[var_idx].splice(
            opt_idx + i * (childVarLength - 1),
            1
          );

          // use (i * (childVarLength - 1) as increment because of the removal of empty elements in the array below)
          variationOptionsPrice[1] = variationOptionsPrice[1].filter(
            (val) => val
          );
          variationOptionsDiscount[1] = variationOptionsDiscount[1].filter(
            (val) => val
          );
          variationOptionsStock[1] = variationOptionsStock[1].filter(
            (val) => val
          );
          variationOptionsSku[1] = variationOptionsSku[1].filter((val) => val);
          variationActualIds[1] = variationActualIds[1].filter((val) => val);
          variationOptionsDiscountType[1] = variationOptionsDiscountType[1].filter((val) => val);
          variationOptionsOnSale[1] = variationOptionsOnSale[1].filter((val) => val);
        }
        variationOptions[var_idx].splice(opt_idx, 1);
      }
    } else {
      // do not allow delete of variation option if it is the only one remaining
      if (variationOptions[0].length === 1) return;
      else {
        // console.log("1 dimensional approach");
        variationOptions[var_idx].splice(opt_idx, 1);
        variationOptionsPrice[var_idx].splice(opt_idx, 1);
        variationOptionsDiscount[var_idx].splice(opt_idx, 1);
        variationOptionsStock[var_idx].splice(opt_idx, 1);
        variationOptionsSku[var_idx].splice(opt_idx, 1);
        variationActualIds[var_idx].splice(opt_idx, 1);
        variationOptionsDiscountType[var_idx].splice(opt_idx, 1);
        variationOptionsOnSale[var_idx].splice(opt_idx, 1);

        const updatedValues = [...variationOptions];
        setVariationOptions(updatedValues);
      }
    }

    const updatedValues = [...variationOptions];
    setVariationOptions(updatedValues);

    // filter existing variation option values

    // refresh state for respective variation options attributes
    setVariationOptionsPrice(variationOptionsPrice);
    setVariationOptionsDiscount(variationOptionsDiscount);
    setVariationOptionsStock(variationOptionsStock);
    setVariationOptionsSku(variationOptionsSku);
    setVariationActualIds(variationActualIds);
    setVariationOptionsDiscountType(variationOptionsDiscountType);
    setVariationOptionsOnSale(variationOptionsOnSale);
  };

  const removeVariant = async (var_idx) => {
    if (variationIds.length > 0 && productId && variationIds[var_idx]) {
      try {
        let user = ls(Constants.localStorage.user);
        if (user) user = JSON.parse(user);
        const deletedId = variationIds[var_idx];
        const fd = new FormData();

        fd.append("variation_id", deletedId);
        fd.append("id_product", productId);
        await ApiCalls(
          fd,
          Apis.productVariation,
          "DELETE",
          {
            Authorization: "Bearer " + user.access,
          },
          //process response
          (response, url) => {
            const data = response.data;
            if (data.result === "FAIL") {
              toast.error(data.message);
              return;
            }
            console.log("received data:", data.data);
            localStorage.setItem("m-add-product", JSON.stringify(data.data));
            toast.success(data.message);
          }
        );
      } catch (e) {
        console.log("error delete variation: ", e);
      }
    }

    variationOptions.splice(var_idx, 1);
    variationNames.splice(var_idx, 1);
    variationIds.splice(var_idx, 1);

    const updatedValues = [...variationOptions];

    setVariationOptions(updatedValues);

    const updatedNameValues = [...variationNames];
    setVariationNames(updatedNameValues);

    const updatedIdValues = [...variationIds];
    setVariationIds(updatedIdValues);
  };

  useEffect(() => {
    if (productData.length > 0) {
      let actualProductData = productData.filter(
        (variation) => variation.variation_value !== null
      );

      if (actualProductData.length > 0) {
        const parentVar = actualProductData[0];
        const childVar = parentVar.child;

        var vname, vid;
        if (childVar.length > 0) {
          vname = [parentVar?.variation_name, childVar[0]?.variation_name];
          vid = [parentVar?.variation_id, childVar[0]?.variation_id];
        } else {
          vname = [parentVar?.variation_name];
          vid = [parentVar?.variation_id];
        }

        setVariationNames([...new Set(vname)]);
        setVariationIds([...new Set(vid)]);

        //options
        let currentVariationOptions = [
          [...actualProductData.map((val) => val.variation_value), ""],
          [...parentVar?.child.map((val) => val.variation_value), ""],
        ];

        if(currentVariationOptions[1].length === 1 && currentVariationOptions[1][0] === ""){
          currentVariationOptions.splice(1,1);
        }

        setTimeout(() => {
          actualProductData.forEach((variation, variationOptionsIdx) => {
            let childArr = variation?.child ?? [];
            if (childArr.length === 0) {
              var imgValidator;
              if (variationNames.length > 1) {
                imgValidator = document.getElementById(
                  `product-img-validator-1-${variationOptionsIdx}`
                );
              } else {
                imgValidator = document.getElementById(
                  `product-img-validator-0-${variationOptionsIdx}`
                );
              }

              if (imgValidator) {
                let imgArr = actualProductData[variationOptionsIdx]?.image;
                imgValidator.src =
                  imgArr[imgArr.length - 1]?.img ?? addVariantImg;
              }
            } else {
              childArr.forEach((opt, v1optionidx) => {
                // let cidx = v1optionidx + variationOptionsIdx * childArr.length
                let cidx =
                  variation?.variation_value + "-" + opt?.variation_value;
                var childimgValidator = document.getElementById(
                  `product-img-validator-1-${cidx}`
                );

                if (childimgValidator) {
                  let imgArr = childArr[v1optionidx]?.image;
                  childimgValidator.src =
                    imgArr[imgArr.length - 1]?.img ??
                    actualProductData[variationOptionsIdx]?.image[0]?.img ??
                    addVariantImg;
                }
              });
            }
          });
        }, 200);

        setVariationOptions(currentVariationOptions);

        let optionIds = [];
        actualProductData.forEach((val) => {
          let childIds = [];
          if (val.child.length > 0) {
            childIds = val.child.map((childVal) => {
              return {
                optionValue: childVal.variation_value,
                optionId: childVal.id_product_variation,
              };
            });
          }
          optionIds.push(...childIds);
        });

        let baseIds = [];
        actualProductData.map((parentVal) =>
          baseIds.push(parentVal.id_product_variation)
        );

        setVariationOptionsIds([baseIds, optionIds]);

        //price
        let optionPrices = [];
        actualProductData.forEach((val, idx) => {
          let childPrices = [];
          if (val.child.length > 0) {
            childPrices = val.child.map((childVal) => childVal.price);
          }
          optionPrices.push(...childPrices);
        });
        setVariationOptionsPrice([
          [...actualProductData.map((val) => val.price)],
          optionPrices,
        ]);

        //discount
        let optionDiscount = [];
        actualProductData.forEach((val) => {
          let childDiscount = [];
          if (val.child.length > 0) {
            childDiscount = val.child.map((childVal) =>
              childVal?.discount_type === "fixed"
                ? childVal?.discounted_price
                : childVal?.discount
            );
          }
          optionDiscount.push(...childDiscount);
        });
        setVariationOptionsDiscount([
          [...actualProductData.map((val) => val?.discount_type === "fixed" ? val?.discounted_price : val?.discount)],
          optionDiscount,
        ]);

        //discount type
        let optionDiscountType = [];
        actualProductData.forEach((val) => {
          let childDiscountType = [];
          if (val.child.length > 0) {
            childDiscountType = val.child.map(
              (childVal) => {
                return discountTypes.find(item => item.value === childVal?.discount_type) ?? discountTypes[0]
              }
            );
          }
          optionDiscountType.push(...childDiscountType);
        });
        setVariationOptionsDiscountType([
          [...actualProductData.map((val) => discountTypes.find(item => item.value === val?.discount_type) ?? discountTypes[0])],
          optionDiscountType,
        ]);

        //stock
        let optionStock = [];
        actualProductData.forEach((val) => {
          let childStock = [];
          if (val.child.length > 0) {
            childStock = val.child.map((childVal) => childVal.stock);
          }
          optionStock.push(...childStock);
        });
        setVariationOptionsStock([
          [...actualProductData.map((val) => val.stock)],
          optionStock,
        ]);

        //sku
        let optionSku = [];
        actualProductData.forEach((val) => {
          let childSku = [];
          if (val.child.length > 0) {
            childSku = val.child.map((childVal) => childVal.sku);
          }
          optionSku.push(...childSku);
        });
        setVariationOptionsSku([
          [...actualProductData.map((val) => val.sku)],
          optionSku,
        ]);

        //on sale 
        let optionOnSale = [];
        actualProductData.forEach((val) => {
          let childOnSale = [];
          if (val.child.length > 0) {
            childOnSale = val.child.map(
              (childVal) =>  childVal.discount > 0
            );
          }
          optionOnSale.push(...childOnSale);
        });
        setVariationOptionsOnSale([
          [...actualProductData.map((val) => val.discount > 0)],
          optionOnSale,
        ]);

        //id
        let optionActualIds = [];
        actualProductData.forEach((val) => {
          let childActualIds = [];
          if (val.child.length > 0) {
            childActualIds = val.child.map(
              (childVal) => childVal.id_product_variation
            );
          }
          optionActualIds.push(...childActualIds);
        });
        setVariationActualIds([
          [...actualProductData.map((val) => val.id_product_variation)],
          optionActualIds,
        ]);
      }
    }
  }, [productData]);

  const divTable = () => {
    return (
      <>
        <div className="variations_table">
          {/* apply to all */}
          <div className="apply-all-section grid grid-cols-6 gap-3 variant-info mb-8">
            <div className=" font-medium text-base relative top-2 text-right pr-4 div_apply_all_vInfo">
              Variation Information
            </div>
            <div className="div_apply_all_vInfo">
              <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                <input
                  type="number"
                  id={"aas-price"}
                  placeholder="Price"
                  className="!border-0"
                />
                <p className="text-grey4Border text-xs">SGD</p>
              </div>
            </div>
            <div className="div_apply_all_vInfo">
              <div className="flex items-center flex-row w-full gap-[15px] xl:gap-10 mb-3">
                <label className=" shrink-0">On Sale</label>
                <label className="switch !top-0">
                  <input
                    type="checkbox"
                    id="variantsSwitch"
                    className="!w-[30px]"
                    value={applyToAllOnSale}
                    onChange={(e) => {
                      setApplyToAllOnSale(!applyToAllOnSale);
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              {applyToAllOnSale ? (
                <select
                  placeholder="Discount Type"
                  id="aas-discountType"
                  onChange={(e)=>{
                    setApplyToAllSymbol(
                      e.target.value === "percentage" ? "%" : "SGD"
                    );
                    document.getElementById("aas-discount").value = "";
                  }
                  }
                >
                  {discountTypes.map((item) => (
                    <option value={item.value}>{item.label}</option>
                  ))}
                </select>
              ) : null}
            </div>
            <div className="div_apply_all_vInfo">
              <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                <input
                  type="number"
                  id={"aas-discount"}
                  placeholder="--"
                  disabled={!applyToAllOnSale}
                  className="!border-0 disabled:text-grey4Border disabled:placeholder-grey4Border"
                />
                <p className="text-grey4Border text-xs">{applyToAllSymbol}</p>
              </div>
            </div>
            <div className="div_apply_all_vInfo">
              <input type="number" id={"aas-stock"} placeholder="Stock" />
            </div>
            {/* <div className="div_apply_all_vInfo">
                  <input
                    type="text"
                    id={"aas-sku"}
                    placeholder="Please Input SKU"
                  />
                </div> */}
            <div className="site-btn btn-default div_apply_all_vInfo !h-[42px]">
              <button type="button" onClick={() => applyToAll()}>
                Apply To All
              </button>
            </div>
          </div>

          <div className="flex flex-row  overflow-auto">
            {/* meta data */}
            <div className="vtable-variation-metadata">
              <div className="vtable-header !bg-neutral-500 text-white text-[14px] py-[5px]">
                {variationNames.length > 0 && variationNames.length <= 2 && (
                  <div className="shrink-0 w-[150px] text-center">
                    Variations
                  </div>
                )}
                {/* {variationNames.length === 1 && (
                      <>
                        <div className="shrink-0 w-[150px] text-center">
                          {variationNames[0] !== ""
                            ? variationNames[0]
                            : "Variation"}
                        </div>
                      </>
                    )}
                    {variationNames.length === 2 && (
                      <>
                        <div className="shrink-0 w-[150px] text-center">
                          {variationNames[0] !== ""
                            ? `${variationNames[0] ?? "" + variationNames[1] !== "" ? " & " + variationNames[1] : ""}`
                            : "Variation"}
                        </div>
                      </>
                    )} */}
                <div>*Price</div>
                <div>Sale Status</div>
                <div>*Stock</div>
                <div>*SKU</div>
              </div>

              {/* if only 1 variation */}
              {variationNames.length === 1 && (
                <>
                  {variationOptions[0].map((v1option, v1optionidx) => {
                    const minh = variationOptions[1]
                      ? variationOptions[1].length * 40
                      : 50;
                    return v1option.length > 0 ? (
                      <div
                        key={`variation-meta-${v1optionidx}`}
                        className={`min-h-[80px] vtable-contents items-center`}
                      >
                        <div
                          key={`variation-opt-0-${v1optionidx}`}
                          id={`variation-opt-0-${v1optionidx}`}
                          className={`text-center font-bold pt-1 mb-[10px]
                                                 min-h-[${minh}px] 
                                                 ${
                                                   v1option.length === 0
                                                     ? "hidden"
                                                     : ""
                                                 }`}
                        >
                          {v1option}

                          <div className="">
                            <input
                              type={"file"}
                              accept="image/*"
                              className="hidden"
                              id={"variant-image-0-" + v1optionidx}
                              onChange={(e) =>
                                onFileChange(
                                  0,
                                  v1optionidx,
                                  e,
                                  `product-img-validator-0-${v1optionidx}`
                                )
                              }
                            />
                            <img
                              className="w-[50px] cursor-pointer mr-auto ml-auto block variant-img"
                              src={addVariantImg}
                              alt=""
                              id={`product-img-validator-0-${v1optionidx}`}
                            />
                            <p className="text-[11px] text-black mt-1 font-light">
                              Note: File max size 2MB
                            </p>
                          </div>
                        </div>
                        <div className="py-4 px-2">
                          <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                            <input
                              placeholder="Please Input"
                              className="!border-0"
                              type="number"
                              value={
                                v1optionidx >= 0 &&
                                v1optionidx < variationOptionsPrice[0].length
                                  ? variationOptionsPrice[0][v1optionidx]
                                  : ""
                              }
                              onChange={(e) => onChangePrice(0, v1optionidx, e)}
                            />

                            <p className="text-grey4Border text-xs">SGD</p>
                          </div>
                        </div>
                        <div className="py-4 px-2">
                          <div className="flex items-center flex-row w-full gap-[15px] xl:gap-10 mb-3 justify-center">
                            <label className=" shrink-0">On Sale</label>
                            <label className="switch !top-0">
                              <input
                                type="checkbox"
                                id="variantsSwitch"
                                className="!w-[30px]"
                                checked={
                                  v1optionidx >= 0 &&
                                  v1optionidx < variationOptionsOnSale[0].length
                                    ? variationOptionsOnSale[0][v1optionidx]
                                    : false
                                }
                                onChange={(e) => {
                                  onChangeOnSale(0, v1optionidx);
                                }}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                          {v1optionidx >= 0 &&
                          v1optionidx < variationOptionsOnSale[0].length &&
                          variationOptionsOnSale[0][v1optionidx] ? (
                            <>
                              <Select
                                id="discount_type"
                                name="discount_type"
                                options={discountTypes}
                                value={{
                                  label:
                                    variationOptionsDiscountType[0][v1optionidx]
                                      ?.label ?? "",
                                }}
                                placeholder="Discount Type"
                                className="text-sm mb-2 w-full"
                                onChange={(e) => {
                                  onChangeDiscountType(0, v1optionidx, e);
                                }}
                              />
                              <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                                <input
                                  placeholder="Please Input"
                                  className="!border-0"
                                  value={
                                    variationOptionsDiscount[0][v1optionidx]
                                  }
                                  onChange={(e) =>
                                    onChangeDiscount(0, v1optionidx, e)
                                  }
                                />
                                <p className="text-grey4Border text-sm">
                                  {variationOptionsDiscountType[0][v1optionidx]
                                    ?.label === "Sale Price"
                                    ? "SGD"
                                    : "%"}
                                </p>
                              </div>
                            </>
                          ) : null}
                        </div>
                        <div className="py-4 px-2">
                          <input
                            placeholder="Please Input"
                            // defaultValue={0}
                            className="text-center"
                            value={
                              v1optionidx >= 0 &&
                              v1optionidx < variationOptionsStock[0].length
                                ? variationOptionsStock[0][v1optionidx]
                                : ""
                            }
                            onChange={(e) => onChangeStock(0, v1optionidx, e)}
                          />
                        </div>
                        <div className="py-4 px-2">
                          <input
                            placeholder="Please Input"
                            className="text-center"
                            value={
                              v1optionidx >= 0 &&
                              v1optionidx < variationOptionsSku[0].length
                                ? variationOptionsSku[0][v1optionidx]
                                : ""
                            }
                            onChange={(e) => onChangeSku(0, v1optionidx, e)}
                          />
                        </div>
                      </div>
                    ) : (
                      <></>
                    );
                  })}
                </>
              )}

              {/* display when 2 variations */}
              {variationNames.length === 2 && (
                <>
                  {variationOptions[0].map((v1option, v1optionidx) => {
                    return v1option.length > 0 ? (
                      <div
                        key={`variation-meta-${v1optionidx}`}
                        className={`min-h-[100px] vtable-contents flex flex-col`}
                        id={`variation-meta-${v1optionidx}`}
                      >
                        {variationOptions[1].map((opt, variationOptionsIdx) => {
                          const cidx = v1option + "-" + opt;
                          // const cidx = variationOptionsIdx + v1optionidx * (variationOptions[1].length-1);
                          let xCount = mapCountVariationInput;
                          // consider only variation options with values which have not been left as ""
                          if (v1option.length > 0 && opt.length > 0)
                            mapCountVariationInput++;
                          return (
                            <div
                              key={`variation-meta-${cidx}-${variationOptionsIdx}`}
                              className={`${
                                opt.length > 0 && opt !== "" ? "" : "!hidden"
                              } mb-[10px] vtable-contents text-center !border-none items-center`}
                            >
                              {/* {mapCountVariationInput} */}
                              {opt.length > 0 ? (
                                <div
                                  className="mt-1 text-center font-bold min-h-[50px] h-[100px]"
                                  key={`variation-opt-1-${cidx}`}
                                  id={`variation-opt-1-${cidx}`}
                                >
                                  {/* base on shopee video variation 2 dont have image upload */}
                                  {v1option}
                                  {", " + opt}

                                  <div className="">
                                    <input
                                      type={"file"}
                                      accept="image/*"
                                      className="hidden"
                                      id={"variant-image-1-" + cidx}
                                      onChange={(e) =>
                                        onFileChange(
                                          1,
                                          cidx,
                                          e,
                                          `product-img-validator-1-${cidx}`
                                        )
                                      }
                                    />
                                    <img
                                      className="w-[50px] cursor-pointer mr-auto ml-auto block variant-img"
                                      src={addVariantImg}
                                      alt=""
                                      id={`product-img-validator-1-${cidx}`}
                                    />
                                    <p className="text-[11px] text-black mt-1 font-light">
                                      Note: File max size 2MB
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                              <div className="py-4 px-2">
                                <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                                  <input
                                    placeholder="Please Input"
                                    className="!border-0"
                                    value={
                                      xCount >= 0 &&
                                      xCount < variationOptionsPrice[1].length
                                        ? variationOptionsPrice[1][xCount] ?? ""
                                        : ""
                                    }
                                    type="number"
                                    onChange={(e) =>
                                      onChangePrice(1, xCount, e)
                                    }
                                  />

                                  <p className="text-grey4Border text-xs">
                                    SGD
                                  </p>
                                </div>
                              </div>
                              
                              <div className="py-4 px-2">
                                <div className="flex items-center flex-row w-full gap-[15px] xl:gap-10 mb-3 justify-center">
                                  <label className=" shrink-0">On Sale</label>
                                  <label className="switch !top-0">
                                    <input
                                      type="checkbox"
                                      id="variantsSwitch"
                                      className="!w-[30px]"
                                      checked={
                                        xCount >= 0 &&
                                        xCount <
                                          variationOptionsOnSale[1].length
                                          ? variationOptionsOnSale[1][xCount]
                                          : false
                                      }
                                      onChange={(e) => {
                                        onChangeOnSale(1, xCount);
                                      }}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                                {xCount >= 0 &&
                                xCount < variationOptionsOnSale[1].length &&
                                variationOptionsOnSale[1][xCount] ? (
                                  <>
                                    <Select
                                      id="discount_type"
                                      name="discount_type"
                                      options={discountTypes}
                                      value={{
                                        label:
                                          variationOptionsDiscountType[1][
                                            xCount
                                          ]?.label ?? "",
                                      }}
                                      placeholder="Discount Type"
                                      className="text-sm mb-2 w-full"
                                      onChange={(e) => {
                                        onChangeDiscountType(1, xCount, e);
                                      }}
                                    />
                                    <div className="flex justify-between border border-grey4Border rounded-md items-center pr-3">
                                      <input
                                        placeholder="Please Input"
                                        className="!border-0"
                                        value={
                                          variationOptionsDiscount[1][xCount]
                                        }
                                        onChange={(e) =>
                                          onChangeDiscount(1, xCount, e)
                                        }
                                      />
                                      <p className="text-grey4Border text-sm">
                                        {variationOptionsDiscountType[1][xCount]
                                          ?.label === "Sale Price"
                                          ? "SGD"
                                          : "%"}
                                      </p>
                                    </div>
                                  </>
                                ) : null}
                              </div>

                              <div className="py-4 px-2">
                                <input
                                  placeholder="Please Input"
                                  className="text-center"
                                  // defaultValue={0}
                                  value={
                                    variationOptionsIdx >= 0 &&
                                    xCount < variationOptionsStock[1].length
                                      ? variationOptionsStock[1][xCount]
                                      : ""
                                  }
                                  onChange={(e) => onChangeStock(1, xCount, e)}
                                />
                              </div>
                              <div className="py-4 px-2">
                                <input
                                  placeholder="Please Input"
                                  className="text-center"
                                  value={
                                    variationOptionsIdx >= 0 &&
                                    xCount < variationOptionsSku[1].length
                                      ? variationOptionsSku[1][xCount] ?? ""
                                      : ""
                                  }
                                  onChange={(e) => onChangeSku(1, xCount, e)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <></>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <input
        hidden
        id="retrieve-variation"
        type="button"
        onClick={(e) => {
          const parentOptsFiltered = variationOptions[0].filter(
            (val) => val !== ""
          );
          let runningIdx = 0;
          const parentOpts = [
            ...parentOptsFiltered.map((varOpt, ixx) => {
              const childOptsFiltered =
                variationOptions[1] && variationOptions[1].length > 0
                  ? variationOptions[1].filter((val) => val !== "")
                  : [];
              const childOpts = [
                ...childOptsFiltered.map((cvarOpt, idx) => {
                  let discount = 0;
                  if(variationOptionsOnSale[1][runningIdx]){
                    discount = variationOptionsDiscount[1][runningIdx] === "" ? 0 : 
                    parseFloat(variationOptionsDiscount[1][runningIdx]).toFixed(2);
                    if (
                      variationOptionsDiscountType[1][runningIdx]?.value ===
                      "fixed"
                    )
                      discount = parseFloat(variationOptionsPrice[1][runningIdx] - discount).toFixed(2);
                  }
                  
                  const d = {
                    price: variationOptionsPrice[1][runningIdx],
                    discount: discount,
                    discount_type: variationOptionsOnSale[1][runningIdx] ? 
                     variationOptionsDiscountType[1][runningIdx]?.value ?? "" : "percentage",
                    stock: variationOptionsStock[1][runningIdx],
                    sku: variationOptionsSku[1][runningIdx],
                    img: varOpt + "-" + cvarOpt,
                    // `${idx}${ixx}`,
                    name: cvarOpt,
                    id: variationActualIds[1][runningIdx],
                    variant: null,
                  };
                  runningIdx++;
                  return d;
                }),
              ];
              const childVariant =
                variationNames.length === 2
                  ? {
                      options: childOpts,
                      name: variationNames[1],
                      id: "",
                    }
                  : null;

              let parentDiscount = 0;
              if (variationOptionsOnSale[0][ixx]) {
                parentDiscount =
                  variationOptionsDiscount[0][ixx] === ""
                    ? 0
                    : parseFloat(variationOptionsDiscount[0][ixx]).toFixed(2);

                if (variationNames.length === 2) {
                  if (
                    variationOptionsDiscountType[1][ixx]?.value ===
                    "fixed"
                  )
                    parentDiscount =
                      parseFloat(variationOptionsPrice[1][ixx] - parentDiscount).toFixed(2);
                } else {
                  if (
                    variationOptionsDiscountType[0][ixx]?.value ===
                    "fixed"
                  )
                    parentDiscount =
                    (parseFloat(variationOptionsPrice[0][ixx]) - parentDiscount).toFixed(2);
                }
              }

              return {
                price: childVariant!== null ? null :variationOptionsPrice[0][ixx],
                discount: parentDiscount,
                discount_type: variationOptionsOnSale[0][ixx] ? variationOptionsDiscountType[0][ixx]?.value ?? "" : "percentage",
                stock: childVariant!== null ? null : variationOptionsStock[0][ixx],
                sku: childVariant!== null ? null : variationOptionsSku[0][ixx],
                img: ixx,
                name: varOpt,
                id: variationActualIds[0][ixx] ?? "",
                variant: childVariant,
              };
            }),
          ];

          //first layer
          const varData = [
            {
              options: parentOpts,
              name: variationNames[0],
              id: "",
            },
          ];

          e.target.value = JSON.stringify(varData);
          // console.log("retrieved value:", varData);
        }}
      />
      {/* Variation Section */}
      {variationNames && (
        <>
          <div className="variations">
            {variationNames.map((varname, variationIdx) => (
              <div
                key={`variation-${variationIdx}`}
                id={`variation-${variationIdx}`}
                className="mb-[20px]"
              >
                <div className="vname grid grid-cols-12">
                  <span className="font-bold col-span-10">
                    {" "}
                    Variation {variationIdx + 1}{" "}
                  </span>
                  <input
                    type="text"
                    id={`variation-${variationIdx + 1}-name`}
                    className=" bg-pink-500  col-span-3"
                    value={varname}
                    onChange={(e) => onChangeName(variationIdx, e)}
                    maxLength={14}
                    placeholder={
                      variationIdx === 0 ? "e.g.: Color" : "e.g.: Material"
                    }
                  />
                  <span className="col-span-1 text-center text-gray-400 mt-2">
                    {varname ? varname.length : 0}/14
                  </span>

                  {variationIdx === 0 && variationNames.length === 1 ? (
                    <></>
                  ) : (
                    <MdClose
                      onClick={() => {
                        removeVariant(variationIdx);
                      }}
                      className="text-red-400 col-span-1 m-3 cursor-pointer"
                      id="delete-variation-2"
                    />
                  )}
                </div>

                <div id={`variation-1-options`} className="mt-5">
                  <span className="font-bold">Options</span>
                  {/* map all items */}
                  <div className="grid grid-cols-12 ">
                    {variationOptions[variationIdx].map((val, idx) => {
                      return (
                        <div
                          key={`v1-opts-${idx}`}
                          className="mb-3 grid grid-cols-5 col-span-5"
                        >
                          <input
                            type="text"
                            value={
                              variationOptions[variationIdx] &&
                              variationOptions[variationIdx].length > 0
                                ? variationOptions[variationIdx][idx] ?? ""
                                : ""
                            }
                            className={`variation-${variationIdx}-options bg-pink-500 col-span-3`}
                            onChange={(e) =>
                              onChangeOption(variationIdx, idx, e)
                            }
                            maxLength={30}
                            onKeyDown={(e) => onBlurOption(variationIdx, e)}
                            placeholder={
                              variationIdx === 0
                                ? variationOptions[variationIdx].length > 2
                                  ? ""
                                  : "e.g.: Red, Green, Blue, etc."
                                : variationOptions[variationIdx].length > 2
                                ? ""
                                : "e.g.: Plastic, Glass, Rubber, etc."
                            }
                          />

                          <span className="col-span-1 text-center text-gray-400 mt-2">
                            {variationOptions[variationIdx] &&
                            variationOptions[variationIdx].length > 0
                              ? variationOptions[variationIdx][idx].length
                              : 0}
                            /30
                          </span>

                          {variationOptions[variationIdx] &&
                          idx === variationOptions[variationIdx].length - 1 ? (
                            <div className="col-span-1"></div>
                          ) : variationOptions[variationIdx].length <= 2 ? (
                            <div className="p-3 text-red-400 col-span-1">
                              <div>
                                {" "}
                                <MdDeleteForever className="cursor-disabled" />{" "}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 text-red-400 col-span-1">
                              <div
                                onClick={() => {
                                  removeVariantOption(variationIdx, idx);
                                }}
                              >
                                {" "}
                                <MdDeleteForever className="cursor-pointer" />{" "}
                              </div>
                            </div>
                          )}
                          <div className="col-span-1">&nbsp;</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {variationNames.length === 1 && (
              <>
                <div id="add-variation" className="grid grid-cols-4 mb-10">
                  <button
                    className="site-btn btn-default"
                    type="button"
                    onClick={addVariation}
                  >
                    Add Variation 2
                  </button>
                </div>
              </>
            )}
          </div>

          {variationNames[0].length > 0 &&
            variationOptions[0].length > 0 &&
            variationOptions[0][0].length > 0 && <>{divTable()}</>}
        </>
      )}
    </>
  );
};

export default VariationSection;
