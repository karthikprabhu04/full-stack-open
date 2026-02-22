const mongoose = require("mongoose");

// if (process.argv.length < 3) {
//   console.log("give password as argument");
//   process.exit(1);
// }

// const password = process.argv[2];

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

// Schema
const personSchema = new mongoose.Schema({
  name: String,
  phoneNumber: Number,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Model
const Person = mongoose.model("Person", personSchema);

// Document
// if (process.argv.length === 2) {
//   console.log("phonebook:");
//   Person.find({}).then((result) => {
//     result.forEach((person) => {
//       console.log(`${person.name} ${person.phoneNumber}`);
//     });
//   });
// } else if (process.argv.length === 5) {
//   const name = process.argv[3];
//   const phoneNumber = process.argv[4];

//   const person = new Person({
//     name,
//     phoneNumber,
//   });

//   person.save().then((result) => {
//     console.log(`Added ${name} number ${phoneNumber} to phonebook`);
//   });
// }

module.exports = mongoose.model('Person', personSchema)