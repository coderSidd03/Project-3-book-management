//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require('../Controller/userController');


//===================== User Registration(Post API) =====================//
router.post("/register", createUser);

//===================== User Login(Post API) =====================//
router.post("/login", loginUser);



//===================== It will Handle error When Wrong Route( not declared ) inputted =====================//
router.all('/*', (req, res) => { return res.status(404).send({ status: 'ERROR', error: '/ invalid path params provided /' }) });


//=====================Module Export=====================//
module.exports = router;   