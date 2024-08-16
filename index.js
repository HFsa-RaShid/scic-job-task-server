const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aq8mwv9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection


    const userCollection = client.db("new-jobtask").collection("users");
    const productCollection = client.db("new-jobtask").collection("products");



    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = {email: user.email}
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
          return res.send({message: 'user already exists', insertedId: null})
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });


    //   all users
      app.get('/users', async (req, res) => {
      
        const users = await userCollection.find().toArray();
        res.send(users);
    });

    // app.get('/products', async (req, res) => {
      
    //     const users = await productCollection.find().toArray();
    //     res.send(users);
      
    // });


    
    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortField = req.query.sortField || 'creationDate';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const searchQuery = req.query.search || '';
      const selectedBrand = req.query.brand || '';
      const selectedCategory = req.query.category || '';
      const minPrice = parseInt(req.query.minPrice) || 0;
      const maxPrice = parseInt(req.query.maxPrice) || Infinity;
  
      const startIndex = (page - 1) * limit;
  
      const filters = {};
  
      if (searchQuery) {
          filters.productName = { $regex: searchQuery, $options: 'i' };
      }
      
      if (selectedBrand) {
          filters.brand = selectedBrand;
      }
  
      if (selectedCategory) {
          filters.category = selectedCategory;
      }
  
      if (minPrice || maxPrice < Infinity) {
          filters.price = { $gte: minPrice, $lte: maxPrice };
      }
  
      const total = await productCollection.countDocuments(filters);
      const products = await productCollection.find(filters)
          .sort({ [sortField]: sortOrder })
          .limit(limit)
          .skip(startIndex)
          .toArray();
  
      const results = {
          total,
          page,
          limit,
          results: products,
      };
  
      if (startIndex + limit < total) {
          results.next = {
              page: page + 1,
              limit: limit,
          };
      }
  
      if (startIndex > 0) {
          results.previous = {
              page: page - 1,
              limit: limit,
          };
      }
  
      res.json(results);
  });
  
    
    
    
    
















    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task is running');
  });
  
  app.listen(port, () => {
    console.log(`task port, ${port}`);
  });