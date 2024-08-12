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

const InventorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  }
});

const Masters = mongoose.model('masters', MasterSchema);
const Skutypes = mongoose.model('skutypes', SkutypeSchema);
const Purchases = mongoose.model('purchases', PurchaseSchema);
const Sales = mongoose.model('sales', SaleSchema);
const Inventory = mongoose.model('inventory_positions', InventorySchema);

/////////////////////////////
/********* Routing *********/
/////////////////////////////

app.get('/', async (req, res) => {
  const skutypes = await Skutypes.find({});
  const masterData = await Masters.find({});
  res.render('home', { skutypes: skutypes, masterData: masterData });
});

app.get('/inventory', async (req, res) => {
  const inventory_position = await Inventory.find({});
  res.render('inventory', { inventory_position: inventory_position });
});

app.post('/addmaster', async (req, res) => {
  const results = await Masters.find({ name: req.body.name });
  
  if (results.length == 0) {
    data = {
      type: req.body.type,
      brand: req.body.brand,
      name: req.body.name,
      uom: req.body.uom,
      margin: req.body.margin
    };

    await Masters.insertMany([data]);
  }  

  const resultsSku = await Skutypes.find({ type: req.body.type });
  
  if (resultsSku.length == 0) {
    await Skutypes.insertMany([{ type: req.body.type }]);
  }

  res.redirect('/');
});

app.post('/purchase', async (req, res) => {
  const data = {
    date: req.body.date + 'T' + req.body.time + 'Z',
    name: req.body.name,
    stock: req.body.stock,
    uom: req.body.uom,
    cost: req.body.cost,
  };

  const results = await Inventory.find({ name: req.body.name });

  if (results.length === 0) {
    const inventoryData = {
      name: req.body.name,
      stock: req.body.stock,
    };
    await Inventory.insertMany([inventoryData]);
  } else {
    await Inventory.updateOne(
      { name: req.body.name },
      { $inc: { stock: req.body.stock } }
    );
  }

  await Purchases.insertMany([data]);
  res.redirect('/');
});

app.post('/sale', async (req, res) => {
  data = {
    date: req.body.date + "T" + req.body.time + "Z",
    name: req.body.name,
    lot: req.body.lot,
    stock: req.body.stock,
    cost: req.body.cost,
  }

  await Inventory.updateOne(
      { name: req.body.name },
      { $inc: { stock: -1 * req.body.stock } }
    );

  await Sales.insertMany([data]);
  res.redirect('/');
});

