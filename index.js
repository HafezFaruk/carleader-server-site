const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0hj4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('conneckt todad');
        const database = client.db('carLeader');
        const carCollection = database.collection('services');
        const ordersCollection = database.collection("orders");
        const reviewCollection = database.collection("review");
        const contactCollection = database.collection("contact");
            
        //post api for services insert
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });
        //post api for contact from
        app.post('/contact', async (req, res) => {
            const contact = req.body;
            const result = await contactCollection.insertOne(contact);
            res.json(result)
        });


        //GET API for show data home
        app.get('/services', async (req, res) => {
            const cursor = carCollection.find({}).limit(6);
            const services = await cursor.toArray();
            res.send(services);
        });
        //GET API for show data explore
        app.get('/explore', async (req, res) => {
            const cursor = carCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        //GET API for show data review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // GET Single Service id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await carCollection.findOne(query);
            res.json(service);
        })

        // Add Orders API
        app.post('/placeorder', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

       

        app.get('/orders/:email',async(req,res)=>{
            const email = req.params.email;
            const filter = {email:email}
              // console.log(email);
            const result = await ordersCollection.find(filter).toArray()
            console.log(result);
            res.send(result)
          })

        

         // cancel an order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting user with id ', result);
            res.json(result);
          })

            // dynamic api for update products
            app.get('/orders/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const order = await ordersCollection.findOne(query);
                console.log('load user with id: ', id);
                res.send(order);
            })


        //update status
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
            $set: {
                status: updatedOrder.status,
            },
        };
        const result = await ordersCollection.updateOne(filter, updateDoc, options)
        console.log('updating', id)
        res.json(result)
        })

           
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running my car leader')
})
app.listen(port, () => {
    console.log('listening on port', port);
});