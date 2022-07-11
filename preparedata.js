const fs = require('fs');
const path = require('path');

geojsonToCSV();
async function geojsonToCSV(){
    let filePath = "D:\\Resileo\\Sales\\SRKay\\waka\\CountryWithPortName.geojson";
    let writePath = "D:\\Resileo\\Sales\\SRKay\\waka\\CountryWithPortName.csv";

    let fileContent = JSON.parse(fs.readFileSync(filePath,'utf8'));
    console.log("No.of.ports",fileContent.features.length);
    let portColl = fileContent.features;
    let cnt = 0;
    let line ='';
    let lineheader = 'PortName,NameWoDiac,Country,Latitude,Longitude\n'
    for (i=0; i<portColl.length; i++){
      cnt++;
      line += portColl[i].properties.Name+","+portColl[i].properties.NameWoDiac+","+portColl[i].properties.Country+","+portColl[i].geometry.coordinates[0]+","+portColl[i].geometry.coordinates[1]+"\n";
    }
    let writeStream = fs.createWriteStream(writePath,{flags: 'w'});
    writeStream.write(lineheader);
    writeStream.write(line);    
    console.log("GeoJson to CSV file conversion completed with ",cnt,"lines");
}