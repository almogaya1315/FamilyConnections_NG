const express = require("express");
const fileSystem = require("fs");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/persons", async (req, res) => {

  //var filePath = '../../src/assets/texts/AllPersons.txt';
  //personsArray.forEach(p => {
  //  fileSystem.appendFile(filePath, `${JSON.stringify(p)}\n`, (err) => { });
  //});
  //res.send(personsArray);

  const personsRes = getPersonsArray();
  if (personsRes.error) {
    return res.status(500).json({ message: personsRes.error })
  } else {
    res.send(personsRes.personsArray);
  }
});

function getPersonsArray() {
  var output = {};
  var persons = [];
  var filePath = '../../src/assets/texts/AllPersons.txt';

  try {
    var personsArrayJson = fileSystem.readFileSync(filePath, "utf-8");
    personsArrayJson.split('\n').forEach(p => {
      if (p != '') {
        persons.push(JSON.parse(p));
      }
    });
    output = { personsArray: persons, errpr: null };
  } catch (e) {
    var message = "Error - Failed to get persons!" + e;
    output = { personsArray: [], error: message };
  }
  return output;
}

app.post("/api/validateLogin", (req, res) => {
  //console.log("Req body:", req.body);
  var persons = getPersonsArray().personsArray;
  var loginCredentials = req.body;
  var person = persons.find(p => p.Id == loginCredentials.Id);
  var loginRes = { Valid: true, Message: 'Valid' };
  if (person.Password != loginCredentials.Password) {
    loginRes.Valid = false;
    loginRes.Message = "Incorrect Password";
  }
  res.send(loginRes);
});

//const personsObj = {
//  1: {
//    Id: 1,
//    FullName: 'Lior Matsliah',
//    DateOfBirth: new Date('23/05/1985'),
//    DateOfBirthStr: '23/05/1985',
//    Age: 39,
//    PlaceOfBirth: 'Israel',
//    Gender: 0,
//    FlatConnections: []
//  },
//  2: {
//    Id: 2,
//    FullName: 'Keren Matsliah',
//    DateOfBirth: new Date('05/02/1984'),
//    DateOfBirthStr: '05/02/1984',
//    Age: 40,
//    PlaceOfBirth: 'Israel',
//    Gender: 1,
//    FlatConnections: []
//  },
//  3: {
//    Id: 3,
//    FullName: 'Gaya Matsliah',
//    DateOfBirth: new Date('06/06/2013'),
//    DateOfBirthStr: '06/06/2013',
//    Age: 12,
//    PlaceOfBirth: 'Israel',
//    Gender: 1,
//    FlatConnections: []
//  },
//  4: {
//    Id: 4,
//    FullName: 'Almog Matsliah',
//    DateOfBirth: new Date('26/03/2015'),
//    DateOfBirthStr: '26/03/2015',
//    Age: 10,
//    PlaceOfBirth: 'Israel',
//    Gender: 1,
//    FlatConnections: []
//  },
//};

//const personsArray = [
//  {
//    Id: 1,
//    FullName: 'Lior Matsliah',
//    DateOfBirth: new Date('23/05/1985'),
//    DateOfBirthStr: '23/05/1985',
//    Age: 39,
//    PlaceOfBirth: 'Israel',
//    Gender: 0,
//    FlatConnections: []
//  },
//  {
//    Id: 2,
//    FullName: 'Keren Matsliah',
//    DateOfBirth: new Date('05/02/1984'),
//    DateOfBirthStr: '05/02/1984',
//    Age: 40,
//    PlaceOfBirth: 'Israel',
//    Gender: 1,
//    FlatConnections: []
//  },
//  {
//    Id: 3,
//    FullName: 'Gaya Matsliah',
//    DateOfBirth: new Date('06/06/2013'),
//    DateOfBirthStr: '06/06/2013',
//    Age: 12,
//    PlaceOfBirth: 'Israel',
//    Gender: 1,
//    FlatConnections: []
//  },
//  {
//    Id: 4,
//    FullName: 'Almog Matsliah',
//    DateOfBirth: new Date('26/03/2015'),
//    DateOfBirthStr: '26/03/2015',
//    Age: 10,
//    PlaceOfBirth: 'Israel',
//    Gender: 1,
//    FlatConnections: []
//  },
//];

app.listen(8081, () => console.log("API Server listening on port 8081!"));
//app.listen(8056, () => console.log("API Server listening on port 8056!"));
