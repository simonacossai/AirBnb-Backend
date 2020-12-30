const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const server = express()
const placesRouter = require("./places");
const bookingRouter = require("./booking");
server.use(cors())

const port = process.env.PORT || 3001

server.use(express.json())
server.use("/places", placesRouter)
server.use("/booking", bookingRouter)
console.log(listEndpoints(server))

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})