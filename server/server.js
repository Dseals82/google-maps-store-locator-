import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Store } from './api/models/store.js';
import GoogleMapsService from './api/services/googleMapsService.js';
dotenv.config();
const googleMapsService = new GoogleMapsService();
const app = express();
const port = process.env.PORT;
const password = process.env.PASSWORD

app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', "*");
  next();
});

mongoose.connect(`mongodb+srv://admin:${password}@cluster0.wjvbb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  }
);

// app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: true}))


app.get('/api/stores', async (req, res) => {
  const zipCode = req.query.zip_code;
  await  googleMapsService.getCoordinates(zipCode)
  .then((coordinates) =>{
    Store.find({
      location: {
        $near: {
          $maxDistance: 3218, 
          $geometry:{
            type:"Point",
            coordinates: coordinates
          }         
        }
      }
    }, (err, stores)=>{
      if(err){
        res.status(500).send(err)
      }else{
        res.status(200).send(stores)
      }
    })
  }).catch((err)=>{
    console.log(err)
  });
});
app.post('/api/stores', function (req, res) {

    let dbStores = [];
    let stores = req.body;
    stores.forEach((store) => {
      dbStores.push({
        storeName: store.name,
        phoneNumber: store.phoneNumber,
        address: store.address,
        openStatusText: store.openStatusText,
        addressLines: store.addressLines,
        location: {
          type: 'Point',
          coordinates: [
            store.coordinates.longitude,
            store.coordinates.latitude
          ]
        }
      })
    })
    
    console.log('Stores: ' , dbStores)
    Store.create(dbStores, (err, stores) =>{
      if(err){
        res.status(500).send(err)
      }else{
        res.status(200).send(stores)
      }
    })
   
  })
  app.delete('/api/stores', function (req, res) {
    Store.deleteMany({},(err) =>{
      res.status(200).send(err)
    })
    res.send('Got a DELETE request at /api/stores')
  })






app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})