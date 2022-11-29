import React, { useEffect, useState } from "react";
import Page from "./Page";
import Pagination from "./Pagination";
import axios from "axios";
function App({ types, checkedState }) {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(10);

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json"
      )
      .then((res) => res.data)
      .then((data) => {
        // filter based on the checkedState
        console.log(checkedState);
        data = data.filter((pokemon) =>
          checkedState.every(
            (checked, i) => !checked || pokemon.type.includes(types.current[i])
          )
        );
        console.log(data);
        return data;
      })
      .then((res) => {
        setPokemons(res);
      })
      .catch((err) => console.log("err", err));
  }, [checkedState]);

  const indexOfLastPokemonList = currentPage * pokemonsPerPage;
  const indexOfFirstPokemonList = indexOfLastPokemonList - pokemonsPerPage;
  const currentPokemons = pokemons.slice(
    indexOfFirstPokemonList,
    indexOfLastPokemonList
  );
  const numberOfPages = Math.floor(pokemons.length / pokemonsPerPage);

  return (
    <>
      <Page currentPokemons={currentPokemons} currentPage={currentPage} />
      <Pagination
        numberOfPages={numberOfPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}

export default App;
