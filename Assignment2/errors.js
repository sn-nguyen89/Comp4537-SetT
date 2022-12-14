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

class PokemonNoToken extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonNoToken";
    this.message = "Invalid Token";
    this.pokeErrCode = 400;
  }
}

class PokemonNotAdmin extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonNotAdmin";
    this.message = "Not admin";
    this.pokeErrCode = 400;
  }
}

class PokemonNotUser extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonNotUser";
    this.message = "Not a user";
    this.pokeErrCode = 400;
  }
}

class PokemonBadPassword extends PokemonBadRequest {
  constructor(message) {
    super(message);
    this.name = "PokemonBadPassword";
    this.message = "Wrong Password";
    this.pokeErrCode = 400;
  }
}

module.exports = {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
  PokemonNoToken,
  PokemonNotAdmin,
  PokemonNotUser,
  PokemonBadPassword,
};
