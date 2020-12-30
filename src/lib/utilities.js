const {readJSON,writeJSON} = require("fs-extra")
const {join} = require("path")

const placesPath = join(__dirname, "../places/places.json")


const readDB = async filePath => {
  try {
    const fileJson = await readJSON(filePath)
    return fileJson
  } catch (error) {
    throw new Error(error)
  }
}

const writeDB = async (filePath, fileContent) => {
  try {
    await writeJSON(filePath, fileContent)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  getPlaces: async () => readDB(placesPath),
  writePlaces: async placesData => writeDB(placesPath, placesData),
}