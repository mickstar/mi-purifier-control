/* eslint-disable */

const miio = require('miio');
const fs = require('fs');
const filename = "air.csv"
// Create a new device over the given address
miio.device({
	address: '11.1.1.51' // update this
}).then(device => {
	if(device.hasCapability('power')) {
        x = 0;
        setInterval(function(){
            updateLog(device);
            // every 12 hours, set to high speed for 3 minutes.
            // this is to better allow the sensor to detect air.
            if (x % (60 * 12) == 0){
                setSpeed(device, 10);
                timeout = 1;
            }else{
                autoAdjust(device);
            }
            x ++;
        }, 60 * 1000); // every minute
	}
}).catch(console.error);

function updateLog(device){
    var timestamp = Math.floor(Date.now());
    var mode = device.mode;
    var level = device.favoriteLevel;
    var aqi = device.aqi;
    var temperature = device.temperature;
    var humidity = device.humidity;
    createFileIfNotExists(filename);
    line = `${timestamp},${mode},${level},${aqi},${temperature},${humidity}`;
    console.log(line);
    fs.appendFileSync(filename, line + "\n");
}
function createFileIfNotExists(fn){
    header = ["timestamp","mode","level","aqi", "temperature", "humidity"];
     try{
         fs.writeFileSync(fn, header.map(x=>`"${x}"`).join() + "\n", {flag : 'wx'});
     }
     catch(e) {
         return;
     }
}
function setSpeed(device,speed){
    device.setMode("favorite")
    device.setFavoriteLevel(speed);
}
var timeout = 0;
var previous_aqi = null;
function autoAdjust(device){
    var aqi = device.aqi;
    if (previous_aqi != null && aqi > previous_aqi){
        console.log(`air quality worsened! from ${previous_aqi} to ${aqi}`);
        timeout = 0; //allows for step up.
    }
    if (timeout > 0){
        timeout --;
        return;
    }
    console.log(`readjusting for ${aqi}`);
    if (aqi <= 11){
        setSpeed(device, 2);
    }
    else if (aqi <= 20){
        setSpeed(device, 6);
        timeout = 5;
    }
    else if (aqi <= 30){
        setSpeed(device, 10);
        timeout = 5;
    }
    else if (aqi > 30){
        setSpeed(device, 12);
        timeout = 5;
    }
    previous_aqi = aqi;
}
