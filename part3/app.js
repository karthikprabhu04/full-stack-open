const express = require("express");
const app = express();
let morgan = require("morgan")

app.use(express.json());

// Morgan use
morgan.token('body', function (req, res) { return JSON.stringify(req.body)})
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))


let notes = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Get people list
app.get("/api/persons", (req, res) => {
  res.json(notes);
});

// Get info list
app.get("/info", (req, res) => {
  notesNumber = notes.length;
  res.send(`Phonebook has info for ${notesNumber} people<br> ` + new Date());
});

// Get single person
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = notes.find((note) => note.id === id);
  if (!person) {
    return res.status(404).send({ error: "person not found" });
  }
  res.json(person);
});

// Delete single person
app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end()
});

// Add new person
app.post("/api/persons", (req, res) => {
  
  if ((!req.body.name) || !req.body.number) {
    return res.status(400).send({error: "Must submit both a name and number"})
  }

  if (notes.map(note => note.name.toLowerCase()).includes(req.body.name.toLowerCase())) {
    return res.status(400).send({error: "Name already in phonebook"})
  }
  
  const newPerson = {
    id: Math.floor(Math.random() * 1000000),
    name: req.body.name,
    number: req.body.number
  }

  notes = notes.concat(newPerson)

  res.json(newPerson)
})

// Run on port
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
