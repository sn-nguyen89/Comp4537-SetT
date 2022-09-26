const express = require('express')

// var { unicornsJSON } = require('./data.js')

const app = express()
const port = 5000

app.use(express.json())

const { writeFile, readFile } = require('fs')
const util = require('util')
const writeFileAsync = util.promisify(writeFile)
const readFileAsync = util.promisify(readFile)
var unicornsJSON = []

app.listen(process.env.PORT || port, async () => {
  try {
    unicornsJSON = await readFileAsync('./data.json', 'utf-8')
    if (!unicornsJSON) {
      console.log("Could not read the file");
      return
    }
    unicornsJSON = JSON.parse(unicornsJSON)
    console.log(unicornsJSON);
  } catch (error) {
    console.log(error);
  }

  console.log(`Example app listening on port ${port}`)
})

app.post('/api/v1/unicorn', (req, res) => {
  unicornsJSON.push(req.body)
  //update the file
  writeFileAsync('./data.json', JSON.stringify(unicornsJSON), 'utf-8')
    .then(() => { })
    .catch((err) => { console.log(err); })
  res.json(req.body)
})

  
app.get('/api/v1/unicorn/:id', (req, res) => {
  var found = false
  for (i = 0; i < unicornsJSON.length; i++) {
    if (unicornsJSON[i]._id == req.params.id) {
      found = true
      break
    }
  }

  if (found) { res.json(unicornsJSON[i]); return }
  res.json({ msg: "not found" })
})

app.get('/api/v1/unicorns', (req, res) => {
  res.json(unicornsJSON)
})
  
app.patch('/api/v1/unicorn/:id', (req, res) => {
  unicornsJSON = unicornsJSON.map(({ ...aUnicorn }) => {
    if (aUnicorn._id == req.body._id) {
      console.log("Bingo!");
      return req.body
    } else
      return aUnicorn
  })
  writeFileAsync('./data.json', JSON.stringify(unicornsJSON), 'utf-8')
  .then(() => { })
  .catch((err) => { console.log(err); })
  res.send("Updated successfully!")
})

app.delete('/api/v1/unicorn/:id', (req, res) => {
  unicornsJSON = unicornsJSON.filter((element) => element._id != req.params.id)
  writeFileAsync('./data.json', JSON.stringify(unicornsJSON), 'utf-8')
  .then(() => { })
  .catch((err) => { console.log(err); })

  res.send("Deleted successfully?")
})
  