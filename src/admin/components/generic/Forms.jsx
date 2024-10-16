import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useValidator from "../../hooks/UseValidator";
import Button from "./Buttons";
import { FileUploadInput, RichTextEditor, Switch } from "../customInput/";
import { InputBoxStyle, TextAreaStyle, InputBoxWithPrefixStyle } from "../../styles/FormStyles";
import ReactFlagsSelect from "react-flags-select";
import { Link } from "react-router-dom";

/**
 * Generic Form component to build form with custom styles
 * @param {form elements} form
 * @param {custom form style} styles
 * @param {onSubmit callback function} onSubmit 
 * @param {onCancel callback function} onCancel 
 * @returns custom form with different form elements
 */

const BANNER_NAMES = ["banner_image", "mobile_banner_image"];

const Form = ({
  form,
  styles,
  onSubmit,
  onCancel,
  onBack,
  confirmButtonText,
  backButtonText,
  validationRequired = false,
  backButton = true,
  saveButton = true,
  needButtons = true,
  cancelButton = false,
  handleSelectChange,
  downloadBanner,
  countryHandler,
  checkUpdate = false
}) => {
  const editorRef = useRef(null); // create a ref to the editor instance
  const [showValidationMessage, validators] = useValidator(form, validationRequired);
  const [date, setDate] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const defaultFormData = {};
    form.forEach((field) => {
      if (
        field.name !== 'from_date' &&
        field.name !== 'to_date' &&
        field.defaultValue !== ""
      ) {
        defaultFormData[field.name] = field.defaultValue;
      }
    });
    setFormData(defaultFormData);
    showValidationMessage(false)
  }, [form]);

  const handleDateChange = (identifier, selectedDate) => {
    setDate((prevDate) => ({ ...prevDate, [identifier]: selectedDate }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let isValid = true
    Object.keys(validators).forEach((name) => {
      if (!validators[name].allValid()) {
        isValid = false
      }
    })
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const currentFormData = new FormData(e.target);
      let editorData;
      if (editorRef.current !== null) {
        editorData = editorRef.current.getData();
      }

      if(checkUpdate){
        for(var pair of currentFormData.entries()){
          if(pair[0] === "mobile_banner_image"){
            let actualimg = formData?.mobile_banner_image
            if(!actualimg) currentFormData.set('mobile_banner_image', actualimg);
            break;
          }
        }
      }
      onSubmit(currentFormData, editorData);
    } else {
      showValidationMessage(true)
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onCancel(true)
  };

  const handleExtraButton = (e) => {
    e.preventDefault();
    onBack(true)
  };

  const handleDownloadBanner = (e, field) => {
    e.preventDefault();

    if(field?.downloadType === "mobile") downloadBanner("mobile")
    else downloadBanner("web")
  };

  // name, type, row, disabled, label, options, defaultValue, style, imageUrl, imageAlt, validation, current_image
  const inputTypes = {
    textarea: (field) => (
      <textarea
        name={field.name}
        id={field.name}
        disabled={field.disabled}
        defaultValue={field.defaultValue}
        rows={field.row}
        className={TextAreaStyle}
        onChange={handleInputChange}
      />
    ),
    select: (field) => (
      <select
        name={field.name}
        id={field.name}
        defaultValue={field.defaultValue}
        className={InputBoxStyle}
        disabled={field.disabled}
        onChange={handleSelectChange}
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    datepicker: (field) => (
      <DatePicker
        name={field.name}
        minDate={new Date()}
        id={field.name}
        disabled={field.disabled}
        selected={date[field.name] || field.defaultValue}
        onChange={(selectedDate) => handleDateChange(field.name, selectedDate)}
        className={InputBoxStyle}
        dateFormat={field.date_format || "dd/MM/yyyy"}
      />
    ),
    richText: (field) => (
      <RichTextEditor
        data={field.defaultValue}
        onEditorInstance={(editor) => (editorRef.current = editor)}
        disabled={field.disabled}
      />
    ),
    image: (field) => (
      <img
        src={field.imageUrl}
        alt={field.imageAlt}
        height={field.height}
        width={field.width}
        className={field.imageUrl !== null && "mb-4"}
      />
    ),
    video: (field) => (
      <video controls width="400" height="300" src={field.videoUrl} />
    ),
    file: (field) => (
      <FileUploadInput
        name={field.name}
        style={styles.inputStyle}
        current_image={field.current_image}
        onFileChange={handleInputChange}
        title={field?.title}
      />
    ),
    switch: (field) => (
      <Switch
        name={field.name}
        value={field.defaultValue}
        onChange={handleInputChange}
        disabled={field.disabled}
      />
    ),
    radio: (field) => (
      <div className="flex gap-3 items-center">
        <label>
          <input
            type="radio"
            name={field.name}
            value={field.value1}
            checked={formData[field.name] === field.value1}
            onChange={handleInputChange}
          />
          {field.label1}
        </label>

        <label>
          <input
            type="radio"
            name={field.name}
            value={field.value2}
            checked={formData[field.name] === field.value2}
            onChange={handleInputChange}
          />
          {field.label2}
        </label>
      </div>
    ),
    noField: (field) => <></>,
    fieldWithPrefix: (field) => (
      <div className={InputBoxWithPrefixStyle}>
        <ReactFlagsSelect
          className="w-[150px] grid"
          countries={countryHandler?.individualCountryList}
          customLabels={countryHandler?.customLabels}
          selected={countryHandler.selectedCountry}
          onSelect={countryHandler.handleCountrySelection}
          selectedSize={14}
        />
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          disabled={field.disabled}
          defaultValue={field.defaultValue}
          className="w-full"
          onChange={handleInputChange}
        />
      </div>
    ),
    fieldWithSuffix: (field) => (
      <div className={InputBoxWithPrefixStyle}>
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          disabled={field.disabled}
          defaultValue={field.defaultValue}
          className="w-full"
          onChange={handleInputChange}
        />
        <div className="border-l-[1px] border-[#c1c1c1] py-2 px-[14px]">
          {field.unit}
        </div>
      </div>
    ),
    tags: (field) => {
      return (
        <>
          {field?.defaultValue?.length === 0 ? (
            <p>No tags found</p>
          ) : (
            <div className="flex gap-2 mt-4 flex-wrap items-center justify-start">
              {field.defaultValue.map((item, tagIndex) => {
                return (
                  <div
                    key={tagIndex}
                    className="px-2 py-1 rounded-md text-center text-sm text-black bg-[#e7e7e7] flex gap-2 items-center"
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          )}
        </>
      );
    },
    hyperLink : (field) =>(
      <Link to={field.url} target="_blank">{field.defaultValue}</Link>
    ),
    default: (field) => (
      <input
        type={field.type}
        name={field.name}
        id={field.name}
        disabled={field.disabled}
        defaultValue={field.defaultValue}
        className={InputBoxStyle}
        onChange={handleInputChange}
      />
    ),
  };

  return (
    <>
      <form className={styles.overall} onSubmit={handleSubmit}>
        <div className={styles.layout}>
          {form.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="my-2 block text-sm font-medium text-gray-700"
                id={`label_${field.name}`}
              >
                {field.label}{" "}
                {field.validation && field.validation.includes("required") && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {inputTypes[field.type]
                ? inputTypes[field.type](field)
                : inputTypes.default(field)}
              {validators[field.name] &&
                validators[field.name].message(
                  field.label,
                  formData[field.name],
                  field.validation
                )}

              {BANNER_NAMES.includes(field.name) && field?.imageUrl!==null && (
                <Button
                  type="download"
                  text="Download Banner Image"
                  onClick={(e) =>handleDownloadBanner(e,field)}
                  py="2"
                  px="3"
                />
              )}
               {BANNER_NAMES.includes(field.name) && field?.imageUrl === null && (
                <p>No banner uploaded by seller</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between py-2">
          {cancelButton && (
            <div className="flex">
              <Button
                type="cancel"
                text="Back"
                onClick={handleExtraButton}
                py="2"
                px="3"
              />
            </div>
          )}
          {needButtons && (
            <div className="flex flex-grow justify-end gap-4">
              {backButton && (
                <Button
                  type={backButtonText || "cancel"}
                  text={backButtonText || "Back"}
                  onClick={handleCancel}
                  py="2"
                  px="3"
                />
              )}
              {saveButton && (
                <Button
                  type="confirm"
                  text={confirmButtonText || "Save"}
                  py="2"
                  px="3"
                />
              )}
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default Form;
