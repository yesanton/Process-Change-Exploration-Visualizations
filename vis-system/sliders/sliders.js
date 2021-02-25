// for further help with sliders, documentation is here https://github.com/johnwalley/d3-simple-slider

console.log('in the making slider code')
var slider = d3
    .sliderVertical()
    .min(0)
    .max(100)
    .step(1)
    .width(300)
    .height('400')
    .displayValue(true)
    .on('onchange', (val) => {
        // do somethng with the value 
    });

var slider2 = d3
    .sliderVertical()
    .min(0)
    .max(100)
    .step(1)
    .width(300)
    .height(400)
    .displayValue(true)
    .on('onchange', (val) => {
        // do something with the value 
    });

let slider1svg = d3.select('#SliderDivId')
    .append('svg')
    .attr('width', '6vw')
    .attr('height', "60vh")
slider1svg
    .append('g')
    .attr('transform', 'translate(60,30)')
    .call(slider);
slider1svg.append('g').attr('transform', 'translate(0,10)').append('text').text('Path slider')


let slider2svg = d3.select('#SliderDivId')
    .append('svg')
    .attr('width', '6vw')
    .attr('height', "60vh")
slider2svg
    .append('g')
    .attr('transform', 'translate(60,30)')
    .call(slider2);

slider2svg.append('g').attr('transform', 'translate(0,10)').append('text').text('Activities slider')