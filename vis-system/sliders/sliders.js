// for further help with sliders, documentation is here https://github.com/johnwalley/d3-simple-slider

console.log('in the making slider code')
var pathSlider = d3
    .sliderVertical()
    .min(0)
    .max(1)
    .step(0.01)
    .width(300)
    .height('400')
    .tickFormat(d3.format('.0%'))
    .ticks(2)
    .default(1)
    .displayValue(true)
    .on('onchange', (valPath) => {
        // do somethng with the value 
        updatePathAndActivitySliders(
            // scaless are used in order to allow for the lower values of the percentage
            // to still have some paths and activities
            d3.scaleLinear()   
                .domain([0, 1]) // unit: km
                .range([0.1, 1])(valPath), 
            undefined);
    });

var activitySlider = d3
    .sliderVertical()
    .min(0)
    .default(1)
    .max(1)
    .step(0.01)
    .width(300)
    .ticks(2)
    .height(400)
    .tickFormat(d3.format('.0%'))
    .displayValue(true)
    .on('onchange', (valActivity) => {
        // do something with the value 
        
        updatePathAndActivitySliders(undefined, 
            d3.scaleLinear()   
                .domain([0, 1]) // unit: km
                .range([0.1, 1])(valActivity)
            );
    });

let pathSliderSvg = d3.select('#SliderDivId')
    .append('svg')
    .attr('width', '6vw')
    .attr('height', "70vh")
    pathSliderSvg
    .append('g')
    .attr('transform', 'translate(60,30)')
    .call(pathSlider);
pathSliderSvg.append('g').attr('transform', 'translate(0,10)').append('text').text('Path slider')


let activitySliderSvg = d3.select('#SliderDivId')
    .append('svg')
    .attr('width', '6vw')
    .attr('height', "70vh")
    activitySliderSvg
    .append('g')
    .attr('transform', 'translate(60,30)')
    .call(activitySlider);    
activitySliderSvg.append('g').attr('transform', 'translate(0,10)').append('text').text('Activities slider')