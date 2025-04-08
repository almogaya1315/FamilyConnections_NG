const express = require("express");
const fileSystem = require("fs");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/persons", (req, res) => {

  var filePath = '../../src/assets/texts/AllPersons.txt';
  //personsArray.forEach(p => {
  //  fileSystem.appendFile(filePath, `${JSON.stringify(p)}\n`, (err) => { });
  //});
  //res.send(personsArray);

  fileSystem.readFile(filePath, "utf8", (error, data) => {
    if (error) {
      var message_ = "Error - Failed to get persons!";
      //console.error(message_, error);
      return res.status(500).json({ message: message_ })
    } else {
      try {
        //console.log("DATA:\n" + data);
        //var split_ = data.split('\n');
        //console.log(`SPLIT: (${split_.length})\n` + split_);

        var personsArray = [];
        data.split('\n').forEach(p => {
          if (p != '') {
            //console.log("FOREACH PERSON:\n" + p);
            //var parsed = JSON.parse(p);
            //console.log("PARSED:\n" + parsed);
            personsArray.push(JSON.parse(p));
          }
        });

        //console.error("ARRAY:\n" + personsArray);
        //return res.status(200).json(personsArray);
        res.send(personsArray);
      } catch (e) {
        var message_ = "Error - Failed to parse JSON";
        console.error(message_, e);
        return res.status(500).json({ message: message_ })
      }
    }
  });

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
