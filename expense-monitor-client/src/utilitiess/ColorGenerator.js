let d3 = require('d3-scale-chromatic');

export let getColors = (dataLength) => {
    let colorStart = Math.round(Math.random()*100)/100;
    var intervalSize = 1 / dataLength;
    // console.info('ColorGenerator(): colorStart- ',colorStart+' intervalSize- ',intervalSize);
    var colors = [];
  
    for (let i = 0; i < dataLength; i++) {
        // console.info('('+(colorStart + (i*intervalSize))+' , '+(colorStart + ((i+1)*intervalSize))+')');
        colors.push(d3.interpolateWarm((colorStart + (i*intervalSize)), (colorStart + ((i+1)*intervalSize))));
    }
    return colors;
}  