import { useState, useEffect } from 'react'
import SimpleReactValidator from 'simple-react-validator'

/**
 * Custom react hook to use simple-react-validator in hooks
 * @param {form elements} form elements
 * @returns list of validators and show validation message function
 */
const useValidator = (form, validationRequired) => {
  const [validators, setValidators] = useState({})
  const [show, showValidationMessage] = useState(false)

  useEffect(() => {
    const createdValidators = {}
    if (!validationRequired) return
    form.forEach((field) => {
      const { name, validation, customMessage } = field
      if (validation) { //Add validation only if validation is required
        if (customMessage) {
          createdValidators[name] = new SimpleReactValidator({
            messages: customMessage,
            className: 'text-red-600 form-error',
          })
          //validators: customValidator,
        } else {
          createdValidators[name] = new SimpleReactValidator({
            className: 'text-red-600 form-error',
          })
        }
      }
    })
    setValidators(createdValidators)
  }, [form, validationRequired])

  if (show) {
    Object.keys(validators).forEach((name) => {
      validators[name].showMessages()
    })
  }

  return [showValidationMessage, validators]
}

export default useValidator


