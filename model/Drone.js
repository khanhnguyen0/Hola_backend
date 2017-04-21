var mongoose = require('mongoose');
var droneSchema = mongoose.Schema({
  name: {type:String},
  ownerEmail:{type:String, required:true},
  timeAdded: {type:Date, default: Date.now},
  activity:[{date:Date, log:String}],
  isFlying:{type:Boolean, default:false},
  flights:[{start:{type:Date},end:{type:Date}}]
})

module.exports = mongoose.model('Drone',droneSchema)
