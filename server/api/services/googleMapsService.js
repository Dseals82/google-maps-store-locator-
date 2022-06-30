import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const google_maps_api_key = process.env.GOOGLE_MAPS_API_KEY

const googleMapsURL = process.env.GOOGLE_MAPS_URL;

class GoogleMapsService {
    async getCoordinates(zipCode){
        let coordinates = [];
       await axios.get(googleMapsURL, {
            params: {
              address: zipCode,
              key: google_maps_api_key,
            }
          }).then((resp) =>{
            const data = resp.data;
             coordinates = [
              data.results[0].geometry.location.lng,
              data.results[0].geometry.location.lat,
            ]
        }).catch((err)=>{
            throw new Error(err)
        });

        return coordinates;
    }
}

export default GoogleMapsService;

