import React from "react";

function PokemonImage({ pokemon }) {
  const getId = (id) => {
    if (id < 10) return `00${id}`;
    if (id < 100) return `0${id}`;
    return id;
  };

  return (
    <>
      <img
        src={`https://github.com/fanzeyi/pokemon.json/raw/master/images/${getId(
          pokemon.id
        )}.png`}
      />
    </>
  );
}

export default PokemonImage;
