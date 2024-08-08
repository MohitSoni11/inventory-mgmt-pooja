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

const PurchaseSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  uom: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  }
});

const SaleSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  lot: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  }
});

const Masters = mongoose.model('masters', MasterSchema);
const Skutypes = mongoose.model('skutypes', SkutypeSchema);
const Purchases = mongoose.model('purchases', PurchaseSchema);
const Sales = mongoose.model('sales', SaleSchema);

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
  });
});

app.post('/addmaster', (req, res) => {
  data = {
    type: req.body.type,
    brand: req.body.brand,
    name: req.body.name,
    uom: req.body.uom,
    margin: req.body.margin
  };

  // Adding skutype to db if it is a new one
  Skutypes.find({type: req.body.type})
  .then(result => {
    if (result.length == 0) {
      newSkutype = {
        type: req.body.type
      };

      Skutypes.insertMany([newSkutype]);
    }
  })
  .catch(error => console.error(error));

  Masters.insertMany([data]);
  res.redirect('/');
});

app.post('/purchase', (req, res) => {
  data = {
    date: req.body.date + "T" + req.body.time + "Z",
    name: req.body.name,
    stock: req.body.stock,
    uom: req.body.uom,
    cost: req.body.cost,
  };

  Purchases.insertMany([data]);
  res.redirect('/');
});

app.post('/sale', (req, res) => {
  data = {
    date: req.body.date + "T" + req.body.time + "Z",
    name: req.body.name,
    lot: req.body.lot,
    stock: req.body.stock,
    cost: req.body.cost,
  }

  Sales.insertMany([data]);
  res.redirect('/');
});

