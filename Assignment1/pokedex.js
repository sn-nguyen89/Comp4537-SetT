const express = require('express')
const app = express();
//const axios = require('axios'),default to run on my machine
const axios = require('axios').default
const mongoose = require('mongoose')
const port = 5000;

let pokemonModel;
let enumTypes = [];
const { Schema } = mongoose;

app.listen(process.env.PORT || 5000, async () => {
    try {
        let typesData = await axios.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json")
        let pokemonData = await axios.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json");
        await mongoose.connect('mongodb+srv://User1:sykXsu9eWTUJpZXT@cluster0.105m0fe.mongodb.net/Assignment1?retryWrites=true&w=majority')
        pokemonData = JSON.parse(JSON.stringify(pokemonData.data).split('"Sp. Attack":').join('"Special Attack":').split('"Sp. Defense":').join('"Special Defense":'))
        for (let i = 0; i < typesData.data.length; i++) {
            enumTypes.push(typesData.data[i].english)
        }

        const pokemonSchema = new Schema({

            "id":  {
                unique: true,
                type :Number
            },
            "name": {
                'english': {
                    type: String,
                    maxLength: 20
                },
                'japanese': String,
                'chinese': String,
                'french': String
            },
            "type": {
                type: [String],
                enum: enumTypes
            },
            'base': {
                'HP': Number,
                'Attack': Number,
                'Defense': Number,
                'Special Attack': Number,
                'Special Defense': Number,
                'Speed': Number
            },
        });
        pokemonModel = mongoose.model('pokemons', pokemonSchema);
        await pokemonModel.deleteMany({})
        await pokemonModel.insertMany(pokemonData)

    }
    catch (error) {
        res.json({ errMsg: "db reading .. err.  Check with server devs" })
    }
    console.log(`Example app listening on port ${port}`)
})

app.get('/api/v1/pokemon', (req, res) => {
    pokemonModel.find({})
        .then(docs => {
            res.json(docs)
        })
        .catch(err => {
            res.json({ errMsg: "db reading .. err.  Check with server devs" })
        })
})

// - get a pokemon
app.get('/api/v1/pokemon/:id', (req, res) => {
    pokemonModel.find({ id: `${req.params.id}` })
        .then(docs => {
            if (docs != "") {
                res.json(docs)
            } else {
                res.json({ errMsg: "Pokemon not found" })
            }

        })
        .catch(err => {
            res.json({ errMsg: "Cast Error: pass pokemon id between 1 and 811" })
        })
})

// - get all the pokemons after the 10th. List only Two.
app.get('/api/v1/pokemons', (req, res) => {
    pokemonModel.find().skip(req.query.after).limit(req.query.count)
        .then(docs => {
            if (docs != "") {
                res.json(docs)
            } else {
                res.json({ errMsg: "Pokemon not found" })
            }
        })
        .catch(err => {
            res.json({ msg: "db reading .. err.  Check with server devs" })
        })
})

// - get a pokemon Image URL
app.get('/api/v1/pokemonImage/:id', (req, res) => {
    res.json({ url: `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${req.params.id}.png` })
})

app.use(express.json())
// - create a pokemon
app.post('/api/v1/pokemon', async (req, res) => {
    try {
            await pokemonModel.create(req.body)
            res.json({msg:"Added Successfully"}) 

    } catch(error) {
        let findPokemon = await pokemonModel.findOne({ id: req.body.id }) 
        if (findPokemon) {
            res.json({ errMsg: "Pokemon Duplicate" })
        } else {
        res.json({errMsg: "ValidationError: check your parameters"})
        }
    }
})

// - upsert a whole pokemon document
app.put('/api/v1/pokemon/:id', (req, res) => {
    pokemonModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true }, function (err, pokeInfo) {

        if (err) {
            res.json({errMsg: "ValidationError: check your parameters"})
        } else {
            res.json({ msg: "Updated Successfully", pokeInfo})
        }

    });
})

// - patch a pokemon document or a portion of the pokemon document
app.patch('/api/v1/pokemon/:id', (req, res) => {

    pokemonModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }, function (err, pokeInfo) {
        if (err) {
            res.json({errMsg: "ValidationError: check your parameters"})
        } else {
            res.json({ msg: "Updated Successfully",pokeInfo})
        }

    });
})

// - delete a  pokemon 
app.delete('/api/v1/pokemon/:id', async (req, res) => {
    let pokeInfo = await pokemonModel.findOne({ id: req.body.id })
    pokemonModel.deleteOne({ id: req.params.id },  function (err, result) {
        
        if(result.deletedCount) {
            res.send({msg:"Deleted Successfully!", pokeInfo})
        } else {
            res.send({errMsg: "Pokemon not found"})
        }
    })

})

//Midterm Prep
// app.get('/pokemonsAdvancedFiltering/', async (req , res) => {
//     let {id,base,type,name,page,hitsPerPage,sort,filteredProperties} = req.query
//     page = page || 1
//     hitsPerPage = hitsPerPage || 5

//     if (type) {
//         req.query.type = {
//           $in: type.split(",").map(item => item.trim())
//         }
//       }
      
//     if (sort) {
//         req.query.sort = sort.split(",").join(' ') 
//     }

//     if (filteredProperties) {
//         req.query.filteredProperties ='-_id ' + filteredProperties.split(",").join(' ')
//     }

//     console.log(req.query.filteredProperties)
    
//     // if(req.query.length != null){
//         let pokemons = await pokemonModel.find(req.query, req.query.filteredProperties).sort(req.query.sort).skip((Number(page)-1)*Number(hitsPerPage)).limit(Number(hitsPerPage))

//         res.send({hits:pokemons, nbHits:pokemons.length, page: page, nbPages: (pokemons.length)/Number(hitsPerPage), query: req.query, params: req.url.substring(req.url.indexOf('?') + 1 )})
//     // } else{
//     //     let pokemons = await pokemonModel.find({})
//     //     res.send(pokemons)
//     // }
// })

//Final exam question
app.get('/pokemonsAdvancedFiltering/', async (req , res) => {
        let {id,base,type,name,comparisonOperators} = req.query
        const regex = /(a|b|c)/g;
        // console.log(req.query.comparisonOperators)
        if (comparisonOperators) {
        req.query.comparisonOperators = comparisonOperators.split(",").map(item => item.trim())
        req.query.comparisonOperators.forEach(item => {
            item.split(/[<>=!]/g)
        })
        //assuming that i can split the string
        req.query.comparison
    

        console.log(req.query.comparisonOperators)

        }

    })




app.get('*', function (req, res) {
    res.json({ msg: "Improper route. Check API docs plz." })
})