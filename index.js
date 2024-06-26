const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 3000
//
app.use(cors());
app.use(express.json());

console.log();
console.log();
const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpklxw3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const usersCollection = client.db("greenmindDB").collection('users')
    const productsCollection = client.db("greenmindDB").collection('products')



    // products api
    // store
  //   app.get('/product', async (req, res) => {
  //     const page = parseInt(req.query.page);
  //     const size = parseInt(req.query.size);
  //     const category = req.query.category;
  
  //     const query = category && category !== 'All' ? { category } : {};
  
  //     const cursor = productsCollection.find(query).skip(page * size).limit(size);
  //     const totalCount = await productsCollection.countDocuments(query);
  //     console.log(page, size, category, 'backend');
  //     const result = await cursor.toArray();
  //     res.send({ totalCount, products: result });
  // });
  
  app.get('/product', async (req, res) => {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const category = req.query.category;
    const sort = req.query.sort;
    const brand = req.query.brand; // New

    let query = category && category !== 'All' ? { category } : {};
    const sortOrder = sort === 'asc' ? 1 : -1;

    // Add brand filter if provided
    if (brand) {
        query = { ...query, brand };
    }

    const cursor = productsCollection.find(query).sort({ price: sortOrder }).skip(page * size).limit(size);
    const totalCount = await productsCollection.countDocuments(query);
    console.log(page, size, category, sort, brand, 'backend'); // Updated log
    const result = await cursor.toArray();
    res.send({ totalCount, products: result });
});




    app.get('/product/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await productsCollection.findOne(query);
      res.send(result)
    })


    // app.get('/product/:category', async (req, res) => {
    
    //     const category = req.params.category;
    //     const query = { category: category };
    //     const result = await productsCollection.find(query).toArray();
    
    //     res.send(result);
      
    // });

  
    

    app.get('/productCount' , async(req, res)=> {
      const count =await productsCollection.estimatedDocumentCount();
      res.send({count})
    })

    app.post ('/product', async(req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result)
    })

    // user api

    app.get('/users', async (req, res) => {
        const result = await usersCollection.find().toArray()
        res.send(result)
      })

      
    app.get('/users/admin/:email', async(req, res)=> {
        const email = req.params.email
       
        const query = {email: email}
        const user =  await usersCollection.findOne(query)
        let admin = false
        if(user){
            admin = user?.role === 'admin'
        }
        res.send(admin)
    })

      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result)
      })

      app.patch('/users/admin/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updatedDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result)
      })
  
      app.delete('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await usersCollection.deleteOne(query)
        res.send(result)
      })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send( 'greenmind is running')
});

app.listen(port, ()=> {
    console.log('Greenmind is running on' , port);
})
