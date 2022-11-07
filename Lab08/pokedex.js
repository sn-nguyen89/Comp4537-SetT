const express = require("express");
const app = express();
const axios = require("axios");
const mongoose = require("mongoose");
const e = require("express");
const port = 5000;

let pokemonModel;
let enumTypes = [];
const { Schema } = mongoose;

const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

class PokemonBadRequest extends Error {
  constructor(message) {
    super(message);
    this.name = "PokemonBadRequest";
    this.message = "Error - Bad request: check the API doc";
    this.pokeErrCode = 400;
  }
}

class PokemonNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "PokemonNotFoundError";
    this.message = "Error - Pokemon was not found: check your request";
    this.pokeErrCode = 400;
  }
}

class PokemonDbError extends Error {
  constructor(message) {
    super(message);
    this.name = "PokemonDbError";
    this.message = "Error - DB error: Contact API owners for more info.";
    this.pokeErrCode = 500;
  }
}

class PokemonDuplicateError extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonDuplicateError";
    this.message =
      "Error - PokemonDuplicateError: The Pokemons has already been inserted.";
    this.pokeErrCode = 400;
  }
}

class PokemonBadRequestMissingID extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonBadRequestMissingID";
    this.message = "Error - Bad request: check the API doc";
    this.pokeErrCode = 400;
  }
}

class PokemonBadRequestMissingAfter extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonBadRequestMissingAfter";
    this.message = "Error - Bad request: check the API doc";
    this.pokeErrCode = 400;
  }
}

class PokemonNoSuchRouteError extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonNoSuchRouteError";
    this.message = "Error - Improper Route: check the API doc";
    this.pokeErrCode = 404;
  }
}

app.listen(process.env.PORT || 5000, async (req, res, next) => {
  try {
    let typesData = await axios.get(
      "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json"
    );
    let pokemonData = await axios.get(
      "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json"
    );
    await mongoose.connect(
      "mongodb+srv://User1:sykXsu9eWTUJpZXT@cluster0.105m0fe.mongodb.net/Assignment1?retryWrites=true&w=majority"
    );
    pokemonData = JSON.parse(
      JSON.stringify(pokemonData.data)
        .split('"Sp. Attack":')
        .join('"Special Attack":')
        .split('"Sp. Defense":')
        .join('"Special Defense":')
    );
    for (let i = 0; i < typesData.data.length; i++) {
      enumTypes.push(typesData.data[i].english);
    }

    const pokemonSchema = new Schema({
      id: {
        unique: true,
        type: Number,
      },
      name: {
        english: {
          type: String,
          maxLength: 20,
        },
        japanese: String,
        chinese: String,
        french: String,
      },
      type: {
        type: [String],
        enum: enumTypes,
      },
      base: {
        HP: Number,
        Attack: Number,
        Defense: Number,
        "Special Attack": Number,
        "Special Defense": Number,
        Speed: Number,
      },
    });
    pokemonModel = mongoose.model("pokemons", pokemonSchema);
    await pokemonModel.deleteMany({});
    await pokemonModel.insertMany(pokemonData);
  } catch (error) {
    next(new PokemonDbError());
  }
  console.log(`Example app listening on port ${port}`);
});

app.get(
  "/api/v1/pokemon",
  asyncWrapper((req, res) => {
    let docs = pokemonModel.find({});
    if (docs) {
      res.json(docs);
    } else {
      throw new PokemonDbError();
    }
  })
);

// - get a pokemon
app.get(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    let docs = await pokemonModel.find({ id: `${req.params.id}` });
    if (docs != "") {
      res.json(docs);
    } else {
      throw new PokemonNotFoundError();
    }
  })
);

// - get all the pokemons after the 10th. List only Two.
app.get(
  "/api/v1/pokemons",
  asyncWrapper(async (req, res) => {
    let doc = await pokemonModel
      .find()
      .skip(req.query.after)
      .limit(req.query.count);

    if (docs != "") {
      res.json(docs);
    } else {
      throw new PokemonBadRequestMissingAfter();
    }
  })
);

// - get a pokemon Image URL
app.get("/api/v1/pokemonImage/:id", (req, res) => {
  res.json({
    url: `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${req.params.id}.png`,
  });
});

app.use(express.json());
// - create a pokemon
app.post(
  "/api/v1/pokemon",
  asyncWrapper(async (req, res) => {
    if (!req.body.id) {
      throw new PokemonBadRequest();
    }
    let findPokemon = await pokemonModel.findOne({ id: req.body.id });
    if (findPokemon) {
      throw new PokemonDuplicateError();
    }
    let pokemon = await pokemonModel.create(req.body);
    res.json({ msg: "Added Successfully" });
  })
);

// - upsert a whole pokemon document
app.put(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    let pokemon = await pokemonModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, upsert: true }
    );
    if (pokemon) {
      res.json({ msg: "Updated Successfully", pokeInfo: pokemon });
    } else {
      throw new PokemonNotFoundError();
    }
  })
);

// - patch a pokemon document or a portion of the pokemon document
app.patch(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    let pokemon = await pokemonModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, upsert: true }
    );
    if (pokemon) {
      res.json({ msg: "Updated Successfully", pokeInfo: pokemon });
    } else {
      throw new PokemonNotFoundError();
    }
  })
);

// - delete a  pokemon
app.delete("/api/v1/pokemon/:id", async (req, res, next) => {
  let pokeInfo = await pokemonModel.findOne({ id: req.body.id });
  pokemonModel.deleteOne({ id: req.params.id }, function (err, result) {
    if (result.deletedCount) {
      res.send({ msg: "Deleted Successfully!", pokeInfo });
    } else {
      next(new PokemonNotFoundError());
    }
  });
});

//Midterm Prep
app.get("/pokemonsAdvancedFiltering/", async (req, res) => {
  let { id, base, type, name, page, hitsPerPage, sort, filteredProperties } =
    req.query;
  page = page || 1;
  hitsPerPage = hitsPerPage || 5;

  if (type) {
    req.query.type = {
      $in: type.split(",").map((item) => item.trim()),
    };
  }

  if (sort) {
    req.query.sort = sort.split(",").join(" ");
  }

  if (filteredProperties) {
    req.query.filteredProperties =
      "-_id " + filteredProperties.split(",").join(" ");
  }

  console.log(req.query.filteredProperties);

  // if(req.query.length != null){
  let pokemons = await pokemonModel
    .find(req.query, req.query.filteredProperties)
    .sort(req.query.sort)
    .skip((Number(page) - 1) * Number(hitsPerPage))
    .limit(Number(hitsPerPage));

  res.send({
    hits: pokemons,
    nbHits: pokemons.length,
    page: page,
    nbPages: pokemons.length / Number(hitsPerPage),
    query: req.query,
    params: req.url.substring(req.url.indexOf("?") + 1),
  });
  // } else{
  //     let pokemons = await pokemonModel.find({})
  //     res.send(pokemons)
  // }
});

app.get("*", function (req, res, next) {
  throw new PokemonNoSuchRouteError();
});

app.use((err, req, res, next) => {
  if (err.pokeErrCode) res.status(err.pokeErrCode);
  else res.status(500);
  res.send(err.message);
});
