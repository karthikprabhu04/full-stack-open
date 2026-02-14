import { useState } from "react";

const Filter = ({ newSearch, handleSearchChange }) => {
  return (
    <p>
      filter shown with{" "}
      <input value={newSearch} onChange={handleSearchChange} />
    </p>
  );
};

const PersonForm = ({addName, newName, handleNameChange, newNumber, handleNumberChange}) => {
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
  )
}

const Persons = ({persons, newSearch}) => {
  return (
  <div>
    {persons
    .filter((person) =>
      person.name.toLowerCase().includes(newSearch.toLowerCase()),
    )
    .map((person) => (
      <p key={person.name}>
        {person.name} {person.number}
      </p>
    ))}
  </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([
    { name: "Arto Hellas", number: "040-123456", id: 1 },
    { name: "Ada Lovelace", number: "39-44-5323523", id: 2 },
    { name: "Dan Abramov", number: "12-43-234345", id: 3 },
    { name: "Mary Poppendieck", number: "39-23-6423122", id: 4 },
  ]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newSearch, setNewSearch] = useState("");

  const addName = (e) => {
    e.preventDefault();

    const personObject = {
      name: newName,
      number: newNumber,
    };
    const exists = persons.some((person) => person.name === newName);
    if (exists) {
      alert(`${newName} already exists`);
    } else {
      setPersons(persons.concat(personObject));
      setNewName("");
      setNewNumber("");
    }
  };

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

      <Filter newSearch={newSearch} handleSearchChange={handleSearchChange}/>

      <h2>add a new</h2>

      <PersonForm addName={addName} newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange}/>

      <h2>Numbers</h2>

      <Persons persons={persons} newSearch={newSearch}/>
    </div>
  );
};

export default App;
