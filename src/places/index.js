const express= require("express");
const { check, validationResult } = require("express-validator")
const uniqid = require("uniqid")
const { getPlaces, writePlaces } = require("../lib/utilities")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const {writeFile,createReadStream} = require("fs-extra")
const path = require("path")
const fs = require("fs")
const upload = multer({});

const placesValidation = [
    check("title").exists().notEmpty().withMessage("title is required and cannot be empty"),
    check("description").exists().notEmpty().withMessage("description is required and cannot be empty!"),
    check("price").exists().isInt().withMessage("price is required and must be an integer")
  ]  

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "places"
    }
})
const cloudMulter =  multer({ storage: cloudStorage})
const router = express.Router()

// CREATE a new place -GET
router.post("/", cloudMulter.array("placePhoto", 4), async (req, res, next) =>{
    try{           
        const newPlace = JSON.parse(req.body.place)
         newPlace.image = [];
         newPlace.bookings=[];
         newPlace._id = uniqid()
        req.files.map((file) =>
        newPlace.image.push(file.path))
        const currentPlaces = await getPlaces()
        currentPlaces.push(newPlace)
        await writePlaces(currentPlaces)
        res.status(201).send(newPlace)
    }
    catch(ex){
        console.log(ex)
        next(ex)
    }
})

//fetch all places -GET
router.get("/", async (req, res, next) => {
    try {
        const places = await getPlaces()

        if (req.query && req.query.category) {
            const filteredPlaces = places.filter(
                place =>
                place.hasOwnProperty("category") &&
                place.category === req.query.category
            )
            res.send(filteredPlaces)
        } else {
            res.send(places)
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

//fetch a specific place by id -GET
router.get("/:id", async (req, res, next) => {
    try {
        const places = await getPlaces()
        const placeFound = places.filter(place => place._id === req.params.id)
        if (placeFound) {
            res.send(placeFound)
        } else {
            res.send("Error 404:the place you're searching for has not been found")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})


//edit a specific place -PUT
router.put(
    "/:id",
    async (req, res, next) => {
      try {
  
          const places = await getPlaces()
          const placeIndex = places.findIndex(
            place => place._id === req.params.id
          )
          if (placeIndex !== -1) {
            const updatedPlaces = [
              ...places.slice(0, placeIndex),
              {
                ...places[placeIndex],
                ...req.body
              },
              ...places.slice(placeIndex + 1),
            ]
            await writePlaces(updatedPlaces)
            res.send(updatedPlaces)
          } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
          }
      } catch (error) {
        console.log(error)
        next(error)
      }
    }
  )

//remove a specific place -DELETE
router.delete("/:id", async (req, res, next) => {
    try {
      const places = await getPlaces()
  
      const placeFound = places.find(
        place => place._id === req.params.placeId
      )
  
      if (placeFound) {
        const filteredplaces = places.filter(
          place => place._id !== req.params.placeId
        )
  
        await writePlaces(filteredplaces)
        res.status(204).send()
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  })

module.exports = router