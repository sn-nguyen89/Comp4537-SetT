import React from "react";
import PokemonImage from "./PokemonImage";

function page({ currentPokemons, currentPage }) {
  return (
    <div>
      <h1>Page number {currentPage}</h1>
      <div className="pokemonlist">
        {currentPokemons.map((item) => {
          return <PokemonImage key={item.id} pokemon={item} />;
        })}
      </div>
    </div>
  );
}

export default page;
