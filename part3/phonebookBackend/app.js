require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const Person = require("./models/person");

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.path);
  next();
});

// Get people list
app.get("/api/persons", (req, res) => {
  Person.find({}).then((people) => {
    res.json(people);
  });
});

// Get info list
app.get("/info", (req, res, next) => {
  Person.countDocuments([])
  .then(count => {
    res.send(`Phonebook has info for ${count} people<br> ` + new Date());
  })
  .catch(error => next(error))
});

// Get single person
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => next(error));
});

// Delete single person
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// Add new person
app.post("/api/persons", (req, res, next) => {
  if (!req.body.name || !req.body.phoneNumber) {
    return res.status(400).send({
      error: `Must submit both a name and number ${req.body.name} ${req.body.phoneNumber}`,
    });
  }

  Person.findOne({ name: req.body.name }).then(
    (existingPerson) => {
      if (existingPerson) {
        existingPerson.phoneNumber = req.body.phoneNumber;

        return existingPerson
          .save()
          .then((updatedPerson) => {
            console.log(`Updated ${req.body.name}'s number`);
            res.json(updatedPerson);
          })
          .catch((error) => next(error));
      }

      const newPerson = new Person({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
      });
    
      return newPerson
        .save()
        .then((savedPerson) => {
          res.json(savedPerson);
          console.log(
            `Added ${req.body.name} number ${req.body.phoneNumber} to phonebook`,
          );
        })
        .catch((error) => next(error));
    },
  );
});

// Unknown endpoint
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// Error handler
const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

// Run on port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
