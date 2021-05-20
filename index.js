const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()
const port = 3500

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('resume'))
app.use(fileUpload())
const { DB_USER, DB_PASS, DB_NAME } = process.env

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.mlivs.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const employerCollection = client.db("jobmarket").collection("jobpost");
    const employeeCollection = client.db("employeeDetails").collection("Applied Candidate");
    const adminsCollection = client.db("jobmarket").collection("employer");
    app.post('/addjobpost', (req, res) => {
        const newJobPost = req.body
        employerCollection.insertOne(newJobPost)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/applyjob', (req, res) => {
        const file = req.files.file
        const name = req.body.name
        const email = req.body.email
        const number = req.body.number
        const applyDate = req.body.applyDate
        const position = req.body.position
        const newApplyJob = {
            name: name,
            email: email,
            number: number,
            file: file,
            applyDate: applyDate,
            position: position
        }
        employeeCollection.insertOne(newApplyJob)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(error => console.log(error))
    })
     app.post('/addEmployer', (req, res) => {
        const newAdmin = req.body
        adminsCollection.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });
    app.get('/employer', (req, res) => {
            const userEmail = req.query.email
            adminsCollection.find({ email: userEmail })
                .toArray((error, document) => {
                    res.send(document[0])
                })
        });
        
    app.get('/appliedcandidate', (req, res) => {
            const userEmail = req.query.email
            employeeCollection.find({ email: userEmail })
                .toArray((error, document) => {
                    res.send(document)
                })
        });
    app.get('/allcandidate', (req, res) => {
            employeeCollection.find({})
                .toArray((error, document) => {
                    res.send(document)
                })
        });

    app.get('/alljobs', (req, res) => {
        employerCollection.find({})
            .toArray((error, documents) => {
                res.send(documents)
            })
    });
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
    
});
        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

app.listen(process.env.PORT || port)
