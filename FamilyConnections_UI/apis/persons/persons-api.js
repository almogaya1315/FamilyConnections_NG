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
  const filePath = '../../src/assets/texts/AllPersons.txt';

  try {
    const personsArrayJson = fileSystem.readFileSync(filePath, "utf-8");
    const connections = getConnectionsArray().connectionsArray;
    personsArrayJson.split('\n').forEach(p => {
      if (p != '') {
        const personObj = JSON.parse(p);
        personObj.FlatConnections = setPersonConnections(personObj, connections);
        persons.push(personObj);
      }
    });
    output = { personsArray: persons, error: null };
  } catch (e) {
    var message = "Error - Failed to get persons! " + e + e.stack;
    output = { personsArray: [], error: message };
  }
  return output;
}

function getConnectionsArray() {
  var output = {};
  const connections = [];
  const filePath = '../../src/assets/texts/AllConnections.txt';
  try {
    const connectionsArrayJson = fileSystem.readFileSync(filePath, "utf-8");
    connectionsArrayJson.split('\n').forEach(c => {
      if (c != '') {
        let parsed = JSON.parse(c);
        connections.push(parsed);
      }
    });
    output = { connectionsArray: connections, errpr: null };
  } catch (e) {
    var message = "Error - Failed to get connections! " + e;
    output = { connectionsArray: [], error: message };
  }

  return output;
}

function setPersonConnections(person, connections) {
  var personConnections = [];
  connections = connections ?? getConnectionsArray().connectionsArray;
  if (person != '') {
    connections.forEach(c => {
      if (c.TargetId == person.Id) {
        personConnections.push(c);
      }
    });
  }
  return personConnections;
}

app.post("/api/addPerson", (req, res) => {
  const filePath = '../../src/assets/texts/AllPersons.txt';
  var apiRes = { Valid: true, Message: '', Data: null };
  try {
    var newPerson = req.body;
    var personJson = JSON.stringify(newPerson);
    fileSystem.appendFileSync(filePath, personJson + '\n', "utf-8");
    apiRes.Message = newPerson.FullName + ' was added!';
  } catch (e) {
    apiRes = { Valid: false, Message: "Error in addPerson." + e.message, Data: null };
  }
  res.send(apiRes);
})

app.post("/api/addConnections", (req, res) => {
  console.log(`newConns: ${req.body}`);
  const filePath = '../../src/assets/texts/AllConnections.txt';
  var apiRes = { Valid: true, Message: '', Data: null };
  try {
    var newConns = req.body;
    newConns.forEach(flatConn => {
      var newFlatConJson = JSON.stringify(flatConn);
      fileSystem.appendFileSync(filePath, newFlatConJson + '\n', "utf-8");
    });
    
    apiRes.Message = newConns.length + ' connections were added!';
  } catch (e) {
    apiRes = { Valid: false, Message: "Error in addPerson." + e.message, Data: null };
  }
  res.send(apiRes);
})

app.post("/api/validateLogin", (req, res) => {
  var persons = getPersonsArray().personsArray;
  var loginCredentials = req.body;
  var person = persons.find(p => p.FullName == loginCredentials.FullName);
  if (person != undefined) {
    person.FlatConnections = setPersonConnections(person);
  }
  var loginRes = { Valid: true, Message: 'Valid', Person: person };
  if (person == undefined) {
    loginRes.Valid = false;
    loginRes.Message = "Person not found";
    loginRes.Persony = null;
  }
  else if (person.Password != loginCredentials.Password) {
    loginRes.Valid = false;
    loginRes.Message = "Incorrect Password";
    loginRes.Person = null;
  }
  res.send(loginRes);
});

app.post('/api/relatives', (req, res) => {
  var persons = getPersonsArray().personsArray;
  var flatConnections = req.body;
  var relatives = [];
  flatConnections.forEach(f => {
    var relative = persons.find(p => p.Id == f.RelatedId)
    relatives.push(relative);
  });
  res.send(relatives);
})

app.get('/api/connections', (req, res) => {
  const connsRes = getConnectionsArray();
  if (connsRes.error) {
    return res.status(500).json({ message: connsRes.error })
  } else {
    res.send(connsRes.connectionsArray);
  }
})

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
