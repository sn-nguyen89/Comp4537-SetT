import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Search from "./SearchType";
import axios from "axios";

function Main() {
  const [checkedState, setCheckedState] = useState([]);
  const types = useRef([]);

  useEffect(() => {
    async function getTypes() {
      const result = await axios.get(
        "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json"
      );
      types.current = result.data.map((type) => type.english);
      setCheckedState(new Array(result.data.length).fill(false));
    }
    getTypes();
  }, []);

  return (
    <>
      <Search
        types={types}
        checkedState={checkedState}
        setCheckedState={setCheckedState}
      />
      <App types={types} checkedState={checkedState} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<Main />);
