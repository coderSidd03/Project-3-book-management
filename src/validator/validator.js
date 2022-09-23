const ObjectId = require('mongoose').Types.ObjectId;

//<<<==================================== Function for validation =======================================>>>//

//===================== Checking that there is something as Input =====================//
const checkInputsPresent = (value) => { return (Object.keys(value).length > 0); }

//===================== Validating that the Input must be a non-empty String =====================//
// const checkString = (value) => { return ((typeof (value) === 'string' && value.trim().length > 0)); }

const checkString = (value) => {
    if (typeof value == "number" || typeof value == "undefined" || typeof value == null) return false;
    if (typeof value == "string" && value.trim().length == 0) return false;
    return true;
}

//===================== Function to validate the input value with Regex =====================//
const validateId = (id) => { return ObjectId.isValid(id) }
const validateName = (value) => { return (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(value)); }
const validateEmail = (value) => { return (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(value)); }
const validatePassword = (value) => { return (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(value)); }
const validateMobileNo = (value) => { return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(value)); }
const validateTitle = (value) => { return ["Mr", "Mrs", "Miss"].indexOf(value) !== -1 }
const validatePincode = (value) => { return (/^[1-9][0-9]{5}$/).test(value) }

const validateISBN = (value) => { return (/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/g).test(value) }
const validateDate = (value) => { return (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(value) }


//=====================Module Export=====================//
module.exports = { checkInputsPresent, checkString, validatePincode, validateName, validateEmail, validatePassword, validateTitle, validateMobileNo, validateISBN, validateDate, validateId }