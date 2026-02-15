import { useState, useEffect } from "react";
import server from "./server";

// Results component
const Results = ({ countryList, setNewSearch }) => {
  if (countryList.length > 10) {
    return <div>Too many matches, specify another filter</div>;
  } else if (countryList.length === 1) {
    return (
      <div>
        <h1>{countryList[0].name.common}</h1>
        <p>Capital: {countryList[0].capital} </p>
        <p>Area: {countryList[0].area}</p>
        <h1>Languages</h1>
        <ul>
          {Object.values(countryList[0].languages).map((lang) => {
            return <li key={lang}>{lang}</li>;
          })}
        </ul>
        <img
          src={countryList[0].flags.png}
          alt={countryList[0].flags.alt}
          width="150"
        />
      </div>
    );
  } else {
    return (
      <div>
        {countryList.map((country) => (
          <div>
            <div>
              {country.name.common}{" "}
              <button onClick={() => setNewSearch(country.name.common)}>
                Show
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

// App component
function App() {
  const [newSearch, setNewSearch] = useState("");
  const [countryList, setCountryList] = useState([]);

  const handleSearchChange = (e) => {
    setNewSearch(e.target.value);
  };

  useEffect(() => {
    server
      .getAll(newSearch)
      .then((countries) => setCountryList(countries))
      .catch((err) => console.log(err));
  }, [newSearch]);

  return (
    <div>
      <div>
        find countries <input value={newSearch} onChange={handleSearchChange} />
      </div>
      <Results countryList={countryList} setNewSearch={setNewSearch} />
    </div>
  );
}

export default App;
