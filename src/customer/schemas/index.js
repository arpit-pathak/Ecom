import * as yup from "yup";

//Minimum eight characters, at least one letter,one number and 1 special character
const passwordRules =
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$";

export const loginSchema = yup.object().shape({
  emailOrNumber: yup.string().required("Email or phone number is required"),
  password: yup
    .string()
    .min(8)
    .required("password is required")
    .matches(passwordRules, {
      message:
        "Password must contain one upper,low case character,a numeric number and a special character",
    }),
});

export const registerSchema = yup.object().shape({
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]+$/, "Phone number can only contain digits [0-9] ")
    .min(8, "Phone number must be 8 digits")
    .max(8, "Phone number must be 8 digits"),
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]+$/, "OTP can only contain digits [0-9]")
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
  userName: yup.string().min(2).required("User Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8)
    .required("Password is required")
    .matches(passwordRules, {
      message:
        "Password must contain one upper,low case character,a numeric number and a special character",
    }),

  confirmPassword: yup
    .string()
    .min(8)
    .required("Confirm password is required")
    .matches(passwordRules, {
      message:
        "Password must contain one upper,low case character,a numeric number and a special character",
    })
    .oneOf([yup.ref("password"), null], "password must match"),

  tc: yup
  .bool()
  .oneOf([true], "Please agree to Terms & Conditions.")
  .required("Please agree to Terms & Conditions."),

  dpn: yup
  .bool()
  .oneOf([true], "Please agree to Data Protection Notice.")
  .required("Please agree to Data Protection Notice.")
});

export const personalInfoSchema = yup.object().shape({
  userName: yup.string().min(2).required("User Name is required"),
  phoneNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]+$/, "Phone number can only contain digits [0-9] ")
    .min(8, "Phone number must be 8 digits")
    .max(8, "Phone number must be 8 digits"),
});


export const ChangePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .max(30)
    .required("current password is required"),
  newPassword: yup
    .string()
    .min(8)
    .max(30)
    .required("new password is required")
    .matches(passwordRules, {
      message:
        "Password must contain one upper,low case character,a numeric number and a special character",
    }),

  confirmPassword: yup
    .string()
    .min(8)
    .max(30)
    .required("Confirm password is required")
    .matches(passwordRules, {
      message:
        "Password must contain one upper,low case character,a numeric number and a special character",
    })
    .oneOf([yup.ref("newPassword"), null], "password must match"),
});

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
});
