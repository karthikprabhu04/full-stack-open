import { useState, useEffect } from "react";
// import axios from "axios";
import server from "./server";

// Filter search
const Filter = ({ newSearch, handleSearchChange }) => {
  return (
    <p>
      filter shown with{" "}
      <input value={newSearch} onChange={handleSearchChange} />
    </p>
  );
};

// Fill in form to add people
const PersonForm = ({
  addName,
  newName,
  handleNameChange,
  newNumber,
  handleNumberChange,
}) => {
  return (
    <div>
      <form onSubmit={addName}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  );
};

// List of people taking into account the search phrase
const Persons = ({ persons, newSearch, setPersons }) => {
  return (
    <div>
      {persons
        .filter((person) =>
          person.name.toLowerCase().includes(newSearch.toLowerCase()),
        )
        .map((person) => (
          <div>
            <p key={person.name}>
              {person.name} {person.number}
              {/* Delete button and update list */}
              <button
                onClick={() => {
                  if (window.confirm("Confirm deletion?")) {
                    server
                      .deleteEntry(person.id)
                      .then(() => server.getAll())
                      .then((list) => setPersons(list));
                  }
                }}
              >
                Delete
              </button>
            </p>
          </div>
        ))}
    </div>
  );
};

// Main App to display items
const App = () => {
  const [persons, setPersons] = useState([]);
  useEffect(() => {
    server.getAll().then((list) => setPersons(list));
  }, []);

  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newSearch, setNewSearch] = useState("");

  // Adding name to server
  const addName = (e) => {
    e.preventDefault();

    const personObject = {
      name: newName,
      number: newNumber,
    };
    const exists = persons.some((person) => person.name === newName);
    if (exists) {
      // Change number if name already in the list
      window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`,
      );
      const id = persons.find((person) => person.name === newName).id;
      server
        .update(id, personObject)
        .then(() => server.getAll())
        .then((list) => setPersons(list));
    } else {
      // Add to database and update list
      server
        .create(personObject)
        .then(() => {
          return server.getAll();
        })
        .then((list) => setPersons(list));

      // Clear form data
      setNewName("");
      setNewNumber("");
    }
  };

  // Form entry changes
  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value);
  };

  const handleSearchChange = (e) => {
    setNewSearch(e.target.value);
  };

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter newSearch={newSearch} handleSearchChange={handleSearchChange} />

      <h2>add a new</h2>

      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>

      <Persons
        persons={persons}
        newSearch={newSearch}
        setPersons={setPersons}
      />
    </div>
  );
};

export default App;
