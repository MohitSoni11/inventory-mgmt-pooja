////////////////////////////////////////////
/********* Requiring npm Packages *********/
////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

//////////////////////////////////
/********* Creating App *********/
//////////////////////////////////

const hostname = '127.0.0.1';
const port = 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/////////////////////////////////////////
/********* Setting up Database *********/
/////////////////////////////////////////

mongoose.connect('mongodb://localhost:27017/db')
.then(() => (
    console.log('MongoDB connected.')
))
.catch(() => (
  console.log('ERROR: MongoDB could not connect.')
));

/////////////////////////////////////////////////////////
/********* MongoDB Collection Schemas & Models *********/
/////////////////////////////////////////////////////////

const MasterSchema = mongoose.Schema({
  type: { 
    type: String, 
    required: true 
  },
  brand: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  uom: { 
    type: String, 
    required: true
  },
  margin: { 
    type: Number, 
    required: true 
  }
});

const SkutypeSchema = mongoose.Schema({
  type: {
    type: String,
    required: true
  }
});

const Masters = mongoose.model('masters', MasterSchema);
const Skutypes = mongoose.model('skutypes', SkutypeSchema);

/////////////////////////////
/********* Routing *********/
/////////////////////////////

app.get('/', (req, res) => {
  Skutypes.find({})
  .then(skutypes => {
    res.render('home', {skutypes: skutypes});
  })
  .catch(err => {
    console.log(err);
  })
});

app.post('/addmaster', (req, res) => {
  data = {
    type: req.body.type,
    brand: req.body.brand,
    name: req.body.name,
    uom: req.body.uom,
    margin: req.body.margin
  };

  Masters.insertMany([data]);
  res.redirect('/');
});

app.post('/skutype', (req, res) => {
  data = {
    type: req.body.skutype
  };

  Skutypes.insertMany([data]);
  res.redirect('/');
});

