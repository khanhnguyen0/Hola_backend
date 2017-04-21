const express = require('express')
const app = express()
const server = require('http').Server(app)
const cors = require('cors')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')

var PORT = process.env.PORT || 5000
mongoose.connect('mongodb://localhost:27017/drones')

const Drone = require('./model/Drone');
const User = require('./model/User')

const corsOption = {
    origin: "*",
    credentials: true
}

app.use(bodyparser.json())
app.use('/', cors(corsOption))



app.post('/login', function(req, res) {
    console.log('user logging in')
    User.findOne({
        email: req.body.email.toLowerCase(),
        password: req.body.password
    }, (err, u) => {
        if (err)
            return res.send(500, 'Database error')
        if (u) {
            return res.json({username: u.username, email:u.email, id: u._id, success: true})
        } else {
            return res.json({success: false})
        }
    })
})

app.post('/drones', (req,res)=>{
  console.log('Finding drones for user ',req.body.email)
  Drone.find({ownerEmail:req.body.email},(err,d)=>{
    if (err){
      console.log('Error looking for drones', err);
      return res.status(500).send('Database error')
    }
    // console.log(d)
    return res.json(d)
  })
})

app.get('/drones/:id', (req,res)=>{
  console.log('Details for drones ',req.params.id)
  Drone.findOne({_id:req.params.id},(err,d)=>{
    if (err){
      console.log('Error looking for drones', err);
      return res.status(500).send('Database error')
    }
    console.log(d)
    return res.json(d)
  })
})

app.get('/drones/delete/:id', (req,res)=>{
  console.log('Deleting drone ', req.params.id )
  Drone.remove({_id:req.params.id}, (err,d)=>{
    // console.log(err,d
    if (err) return res.status(500).send('Database error');
    return res.status(200).send('deleted successfully')
  })
})

app.post('/drones/update/', (req,res)=> {
  console.log('Updating drone id :',req.body._id);
  console.log(req.body);
  Drone.update({_id:req.body._id}, req.body, (err)=>{
    if (err) return res.status(500).send('Database error');
    return res.status(200).send('Updated successfully')
  })
})

app.post('/drones/newdrone', function(req, res) {
    console.log('Adding new drone for user ', req.body)
    var d = new Drone({ownerEmail: req.body.email, name: req.body.name, timeAdded: new Date, isFlying: false})
    d.save((err, d) => {
        if (err) {
            console.log(err)
            return res.status(500).send('Database Error')
        }
        return res.json({id: d._id})
    })
})

app.post('/drones/fly', function(req, res) {
    console.log('drone id ', req.body.id, ' is flying')
    Drone.findOne({
        _id: req.body.id
    }, (err, d) => {
        if (err) {
            console.log(err)
            return res.status(500).send('Database Error')
        }
        if (d.isFlying) {
            d.flights[d.flights.length - 1].end = new Date;
        } else {
            d.flights.push({start: new Date});
        }

        d.isFlying = !d.isFlying
        d.save((err, d) => {
            if (err) {
                console.log('Error updating drone: ', err);
                return res.status(500).send('Database error')
            }
            return res.json({success: true});
        })
    })
})

app.post('/register', function(req, res) {
    console.log('registering new user')
    var u = new User({username: req.body.username, password: req.body.password, email: req.body.email.toLowerCase()})
    u.save((err, u) => {
        if (err) {
            console.log(err)
            if (err.code == 11000)
                return res.json({err: 11000})
            return res.status(500).send('Database Error')
        }
        res.json({id: u._id})
    })
})

server.listen(PORT, () => {
    console.log('Running on port', PORT)
})
