//=====================Importing Module and Packages=====================//
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const { default: mongoose } = require('mongoose');
const route = require('./routes/route.js');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb+srv://raj_3028:kWaM507ps0Icsdg0@cluster0.pw23ckf.mongodb.net/group16Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is Connected.."))
    .catch(error => console.log(error));


//===== Global Middleware for Console the Date, Time, IP Address and Print the perticular API Route Name when you will hit that API ========//
app.use(
    function globalMiddleWare(req, res, next) {
        const dateTime = moment().format('YYYY-MM-DD hh:mm:ss');
        console.log(`||--->> Date: ${dateTime}  ||--->> IP Address: ${req.ip}  ||--->> Route Called: ${req.originalUrl} ----- ||`);
        next();
    }
);

//===================== Global Middleware for All Route =====================//
app.use('/', route);

//===================== It will Handle error When Wrong Route( not declared ) inputted  =====================//
// app.use(function (req, res) {
//     var err = new Error("/ invalid path params provided /");
//     return res.status(404).send({ status: "ERROR", error: err.message });
// });


app.listen(PORT, () => { console.log(`Express App Running on Port >> ${PORT}...`) });