const express = require("express");
const fileSystem = require("fs");
const app = express();
app.use(express.json());

app.get("/api/persons", (req, res) => {

  res.json(personsArray);

  //var filePath = '../../src/assets/texts/AllPersons.txt';
  //fileSystem.writeFile(filePath, JSON.stringify(personsArray, null, 2), (error) => { console.error("Error writing file:", error); })
  //fileSystem.readFile(filePath, "utf8", (error, data) => {
  //  if (error) {
  //    var message_ = "Error - Failed to get persons!";
  //    //console.error(message_, error);
  //    return res.status(500).json({ message: message_ })
  //  } else {
  //    try {
  //      console.error(data);
  //      //var personsArray = JSON.parse(data);
  //      return res.status(200).json(data);
  //      //res.send(data);
  //    } catch (e) {
  //      var message_ = "Error - Failed to parse JSON";
  //      console.error(message_, errory);
  //      return res.status(500).json({ message: message_ })
  //    }
  //  }
  //});
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

const personsArray = [
  {
    Id: 1,
    FullName: 'Lior Matsliah',
    DateOfBirth: new Date('23/05/1985'),
    DateOfBirthStr: '23/05/1985',
    Age: 39,
    PlaceOfBirth: 'Israel',
    Gender: 0,
    //FlatConnections: []
  },
  {
    Id: 2,
    FullName: 'Keren Matsliah',
    DateOfBirth: new Date('05/02/1984'),
    DateOfBirthStr: '05/02/1984',
    Age: 40,
    PlaceOfBirth: 'Israel',
    Gender: 1,
    //FlatConnections: []
  },
  {
    Id: 3,
    FullName: 'Gaya Matsliah',
    DateOfBirth: new Date('06/06/2013'),
    DateOfBirthStr: '06/06/2013',
    Age: 12,
    PlaceOfBirth: 'Israel',
    Gender: 1,
    //FlatConnections: []
  },
  {
    Id: 4,
    FullName: 'Almog Matsliah',
    DateOfBirth: new Date('26/03/2015'),
    DateOfBirthStr: '26/03/2015',
    Age: 10,
    PlaceOfBirth: 'Israel',
    Gender: 1,
    //FlatConnections: []
  },
];

app.listen(8081, () => console.log("API Server listening on port 8081!"));
//app.listen(8056, () => console.log("API Server listening on port 8056!"));
