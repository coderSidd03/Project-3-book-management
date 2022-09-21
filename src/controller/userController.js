const userModel = require("../Model/userModel")
const JWT = require('jsonwebtoken')
const { checkInputsPresent, checkString, validateName, validateEmail, validatePassword, validateTitle, validateMobileNo } = require('../Validator/validator')


//<<<=====================  Api for Registration User   =====================>>>//
const createUser = async (req, res) => {

    try {
        let user = req.body;

        //=====================Destructuring User Data =====================//
        let { title, name, phone, email, password, address } = user

        //=====================Checking User input is Present or Not =====================//
        if (!checkInputsPresent(user)) return res.status(400).send({ status: false, msg: "Data is not found." });

        //=====================Checking Mandotory Field=====================//
        //=====================Validation of Title=====================//
        if (!checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title  [ in string ]." });
        if (!validateTitle(title)) return res.status(400).send({ status: false, msg: "Invalid Title! Please put between ('Mr' or 'Mrs' or 'Miss')." });

        //=====================Validation of Name=====================//
        if (!checkString(name)) return res.status(400).send({ status: false, message: "Please Provide Name  [ in string ]." });
        if (!validateName(name)) return res.status(400).send({ status: false, msg: "Invalid Name Provided" });

        //=====================Validation of Phone Number=====================//
        if (!checkString(phone)) return res.status(400).send({ status: false, message: "Please Provide Phone Number  [ in string ]." });
        if (!validateMobileNo(phone)) return res.status(400).send({ status: false, msg: "Invalid Phone Number Provided." });

        //=====================Validation of EmailID=====================//
        if (!checkString(email)) return res.status(400).send({ status: false, message: "Please Provide EmailID  [ in string ]." });
        if (!validateEmail(email)) return res.status(400).send({ status: false, msg: "Invalid EmailID Provided." });

        //=====================Validation of Password=====================//
        if (!checkString(password)) return res.status(400).send({ status: false, message: "Please Provide Password  [ in string ]." });
        if (!validatePassword(password)) return res.status(400).send({ status: false, msg: "Invalid Password Provided." });


        //<<<=====================Checking Address is Present or not.=====================>>>//
        if (address) {
            let { street, city, pincode } = address
            //=====================Validation of Street Address=====================//
            if (!checkString(street)) return res.status(400).send({ status: false, message: "Please Provide Valid Street Address  [ in string ]." });
            if (!validateName(street)) return res.status(400).send({ status: false, msg: "Invalid Street Provided." });

            //=====================Validation of City Address=====================//
            if (!checkString(city)) return res.status(400).send({ status: false, message: "Please Provide Valid City Address  [ in string ]." });
            if (!validateName(city)) return res.status(400).send({ status: false, msg: "Invalid City Provided." });

            //=====================Validation of Address Pincode=====================//
            if ( !( (/^[1-9][0-9]{5}$/).test(pincode) ) ) return res.status(400).send({ status: false, msg: "Invalid Pincode Provided." });
        }

        //=====================Fetching Phone No. from DB and Checking Duplicate Phone No. is Present or Not=====================//
        let checkPhonePresent = await userModel.findOne({ phone: phone });
        if (checkPhonePresent) return res.status(409).send({ status: false, message: `phone: ${phone} is already registered!! Please Use different Phone Number.` });

        //=====================Fetching Email from DB and Checking Duplicate Email is Present or Not=====================//
        let checkEmailPresent = await userModel.findOne({ email: email });
        if (checkEmailPresent) return res.status(409).send({ status: false, msg: `email: ${email} is already registered!! Please Use Different EmailId for Registration.` });



        //x=====================User Registration=====================x//
        let createUser = await userModel.create(user);

        res.status(201).send({ status: true, msg: `${name}, your registration sucessfull.`, data: createUser });

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message });
    }
}


//<<<=====================This function used for User LogIn=====================>>>//
const loginUser = async (req, res) => {

    try {

        let { email, password } = req.body;
        //=====================Checking Mandotory Field=====================//
        if (!checkInputsPresent(req.body)) { return res.status(400).send({ status: false, msg: "Provide Mandatory Fields ( email & password )." }) };

        //=====================Checking any of these are present in string and Format of Email & Password by the help of Regex=====================//
        if (!checkString(email)) return res.status(400).send({ status: false, message: "Please Provide EmailID  [ in string ]." });
        if (!validateEmail(email)) { return res.status(400).send({ status: false, msg: "Please Check EmailID." }) };
        
        if (!checkString(password)) return res.status(400).send({ status: false, message: "Please Provide Password  [ in string ]." });
        if (!validatePassword(password)) { return res.status(400).send({ status: false, msg: "Re-enter your Correct Password." }) };

        //=====================Fetch Data from DB=====================//
        let userData = await userModel.findOne({ email: email, password: password });
        if (!userData) { return res.status(400).send({ status: false, msg: "User is not exist. You need to register first." }) };

        //x=====================Token Generation by using JWT=====================x//
        let payload = {
            userId: userData['_id'].toString(),
            userName: userData.name,
            EmailId: userData.email,
            Project: "Books Management",
            Batch: 'Plutonium',
            group: '16',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 30
        };
        let token = JWT.sign({ payload }, "We-are-from-Group-16", { expiresIn: 60 * 30 });

        //x=====================Set Key with value in Response Header=====================x//
        res.setHeader("x-api-key", token);

        //=====================Send Token in Response Body=====================//
        res.status(200).send({ status: true, msg: "Token Created Sucessfully", token: token });

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message });
    }

}


//=====================Module Export=====================//
module.exports = { createUser, loginUser }
