const express = require("express")
const path = require("path")
const fs = require("fs-extra")
const { check, validationResult } = require("express-validator")
//const generatePdf = require("../lib/pdf")
//const sendEmailWithAttachment = require("../lib/email")
const router = express.Router()
const bookingFilePath = path.join(__dirname, "booking.json")
const placesFilePath = path.join(__dirname, "..", "places", "places.json")

const placesValidation = [
    check("name").exists().notEmpty().withMessage("name is required and cannot be empty"),
    check("surname").exists().notEmpty().withMessage("surname is required and cannot be empty"),
    check("email").exists().notEmpty().withMessage("email is required and cannot be empty!").isEmail().withMessage("Please enter a valid email"),
    check("startDate").exists().withMessage("start date is required"),
    check("endDate").exists().withMessage("end date is required"),
  ]  


const readFile = async path => {
  const buffer = await fs.readFile(path)
  const text = buffer.toString()
  return JSON.parse(text)
}

const writeFile = async content => await fs.writeFile(placesFilePath, JSON.stringify(content))

//get all the element in the booking -GET
router.get("/", async (req, res, next) => {
  res.send(await readFile(bookingFilePath))
})

//add a new element to the booking -POST
router.post("/:id", async (req, res, next) => {
  try {
    const placesList = await readFile(placesFilePath)
    const place = placesList.find(place => place._id === req.params.id)
    place.booking.push({...req.body});
    if (!place) {
      const error = new Error("place not found")
      error.httpStatusCode = 404
      return next(error)
    }
    await writeFile([...placesList, place])
    res.status(201).send(place)
  } catch (e) {
    console.log(e)
    next(e)
  }
})

//remove an element from the booking -DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const placesList = await readFile(bookingFilePath)

    const productFound = placesList.find(
      product => product._id === req.params.id
    )

    if (productFound) {
      const filteredProducts = placesList.filter(
        product => product._id !== req.params.id
      )

      await writeFile(filteredProducts)
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