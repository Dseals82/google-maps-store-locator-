import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeSchema = Schema({
  storeName: String,
  phoneNumber: String,
  address: {},
  openStatusText: String,
  addressLines: [],
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

storeSchema.index({ location: '2dsphere'}, {sparse:true});

export const Store =  mongoose.model('Store', storeSchema);
