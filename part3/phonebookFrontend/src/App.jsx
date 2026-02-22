import { useState, useEffect } from "react";
import server from "./server";
import Notification from "./notification";
import ErrorBlock from "./error";
import "./styles.css";

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
const Persons = ({ persons, newSearch, setPersons, setErrorMessage }) => {
  return (
    <div>
      {persons
        .filter((person) =>
          person.name.toLowerCase().includes(newSearch.toLowerCase()),
        )
        .map((person) => (
          <div>
            <p key={person.id}>
              {person.name} {person.phoneNumber}
              {/* Delete button and update list */}
              <button
                onClick={() => {
                  if (window.confirm("Confirm deletion?")) {
                    server
                      .deleteEntry(person.id)
                      .then(() => server.getAll())
                      .then((list) => setPersons(list))
                      .catch((error) => {
                        setErrorMessage(
                          error.response?.data?.error ||
                            "Failed to delete entry",
                        );
                        setTimeout(() => setErrorMessage(null), 3000);
                      });
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

  // All states
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newSearch, setNewSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Adding name to server
  const addName = (e) => {
    e.preventDefault();

    const personObject = {
      name: newName,
      phoneNumber: newNumber,
    };

    console.log(personObject);

    server
      .create(personObject)
      .then(() => server.getAll())
      .then((list) => {
        setPersons(list);
        // Notification successful
        setMessage("Added person");
        setTimeout(() => setMessage(null), 3000);
        // Clear form data
        setNewName("");
        setNewNumber("");
      })
      .catch((error) => {
        console.log(error);
        setMessage(error.response.data.error);
        setTimeout(() => setMessage(null), 3000);
      });
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

      <Notification message={message} />
      <ErrorBlock errorMessage={errorMessage} />

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
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};

export default App;
