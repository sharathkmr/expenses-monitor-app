const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const config = require('./mongoConfig');
var cors = require('cors');

const app = express();
// to parse the req body
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// to accept the CORS reqs
app.use(cors());

var port = process.env.PORT || 8080;

const router = express.Router();

const mongoClient = mongo.MongoClient;
let mdb;

//console.log(config);

mongoClient.connect(config.mongodbConfig.uriAtlas, (err, db) => {
    if (err) throw err;
    mdb = db.db(config.mongodbConfig.db);
});

/* endpoint - /getExpenses 
 * to get all income and expense data base on the year
 * 
*/
router.get('/getExpenses', (req, res) => {
    let { username, year } = req.body;
    if(!username && !year) {
        username = req.query.username;
        year = req.query.year;
    }
    var query = {year : Number(year)};
    mdb.collection(username).find(query).toArray(function(err, result) {
        if (err) return res.json({ success: false, error: err });

        return res.json({ success: true, data: result });
    });
});

/* endpoint - /saveExpense 
 * to save income or expense data to a document based on the year
 * without sorting the document
*/
router.post('/saveExpense', (req, res) => {
    let body = req.body;
    let queryExp = {year : Number(body.year)};

    let data;
    if (body.logIncome) {
        data = body.income;
    } else {
        data = body.data;
    }

    data.date = new Date(data.date);

    let reqBody = {};

    if (body.logIncome) {
        reqBody.income = data;
    } else {
        reqBody.data = data;
    }

    mdb.collection(body.username).findOneAndUpdate(queryExp, { $addToSet: reqBody }, function (err, result) {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: result });
    });
});

/* endpoint - /saveExpenseWithSort 
 * to save income or expense data to a document baesd on the year.
 * and sort the document based on the date in the income or expense
*/
router.post('/saveExpenseWithSort', (req, res) => {
    let body = req.body;
    let queryExp = {year : Number(body.year)};

    let data;
    if (body.logIncome) {
        data = body.income;
    } else {
        data = body.data;
    }

    data.date = new Date(data.date);

    let reqBody = {};

    if (body.logIncome) {
        reqBody.income = {
            $each : [data],
            $sort : body.sort
        };
    } else {
        reqBody.data = {
            $each : [data],
            $sort : body.sort
        };
    }

    mdb.collection(body.username).findOneAndUpdate(queryExp, { $push: reqBody }, function (err, result) {
        if (err) return res.json({ success: false, error: err });

        return res.json({ success: true, data: result });
    });
});

app.use('/api', router);
app.listen(port, () => {console.log('LISTENING ON PORT '+port)});