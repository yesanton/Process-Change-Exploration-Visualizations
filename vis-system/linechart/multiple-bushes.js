function configLineplot(){
  var margin = {
    top: 10,
    right: 10,
    bottom: 30,
    left: 40
  },
  width = 960 - margin.left - margin.right,
  height = 150 - margin.top - margin.bottom;

  // let container = d3.select('#AirlinesChart') //TODO: use d3.select to select the element with id AirlinesChart 
  // container
  //     .attr("width", width)
  //     .attr('height', height)

  var svg = d3.select("#LineChart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("rect")
  .attr("class", "grid-background")
  .attr("width", width)
  .attr("height", height);

  config = {};
  config.svg = svg;
  config.width = width;
  config.height = height;
  config.margin = margin;

  return config
}


function drawLineplot(data, config_lineplot){
  console.log ("data from line chart")
  data_for_line_chart = []
  for (let i = 0 ; i < data.timestamps.length ; i++){
    data_for_line_chart.push({
      date: data.timestamps[i],
      value: data.series_sum[i] 
    })
  }

  console.log(data_for_line_chart)

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data_for_line_chart, function(d) { return d.date; }))
    .range([ 0, config_lineplot.width ]);
  config_lineplot.svg.append("g")
    .attr("transform", "translate(0," + config_lineplot.height + ")")
    .call(d3.axisBottom(x));

  console.log ("data from line chart2")

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data_for_line_chart, function(d) { return +d.value; })])
    .range([ config_lineplot.height, 0 ]);
  config_lineplot.svg.append("g")
    .call(d3.axisLeft(y));

  // Add the area
  config_lineplot.svg.append("path")
    .datum(data_for_line_chart)
    .attr("fill", "#cce5df")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5) 
    .attr("d", d3.area()
      .x(function(d) { return x(d.date) })
      .y0(y(0))
      .y1(function(d) { return y(d.value) })
    )
  // We initially generate a SVG group to keep our brushes' DOM elements in:
  var gBrushes = config_lineplot.svg.append('g')
    .attr("class", "brushes");

  // We also keep the actual d3-brush functions and their IDs in a list:
  var brushes = [];

  /* CREATE NEW BRUSH
  *
  * This creates a new brush. A brush is both a function (in our array) and a set of predefined DOM elements
  * Brushes also have selections. While the selection are empty (i.e. a suer hasn't yet dragged)
  * the brushes are invisible. We will add an initial brush when this viz starts. (see end of file)
  * Now imagine the user clicked, moved the mouse, and let go. They just gave a selection to the initial brush.
  * We now want to create a new brush.
  * However, imagine the user had simply dragged an existing brush--in that case we would not want to create a new one.
  * We will use the selection of a brush in brushend() to differentiate these cases.
  */
  function newBrush() {
    var brush = d3.brushX()
      .extent([[0, 0], [config_lineplot.width, config_lineplot.height]])
      .on("start", brushstart)
      .on("brush", brushed)
      .on("end", brushend);
    
    
    console.log('config-linepolot check')
    console.log(config_lineplot.width)
    brushes.push({id: brushes.length, brush: brush});

    function brushstart() {
      // your stuff here
    };

    function brushed() {
      // we only work with two brushes, in case more needed, update this part
      let selections = []

      for (let i of brushes){
        console.log('here in brushes')
        console.log(i)

        let brushID0 = i.id;
        console.log(brushID0)
        let brush0 = document.getElementById('brush-' + brushID0);
        
        let temp = d3.brushSelection(brush0)
        console.log(temp)
        if (temp){
          let t1 = x.invert(temp[0])
          let t2 = x.invert(temp[1])
          selections.push([t1,t2])
        }
        
      }      
      updateSelection(selections)

      // your stuff here
    }

    function brushend() {
      // Figure out if our latest brush has a selection
      var lastBrushID = brushes[brushes.length - 1].id;
      var lastBrush = document.getElementById('brush-' + lastBrushID);
      var selection = d3.brushSelection(lastBrush);

      // If it does, that means we need another one
      if (selection && selection[0] !== selection[1]) {
        if (brushes.length < 2) { // here we limit the brushes to only two
          newBrush();      
        }
      }

      // Always draw brushes
      drawBrushes();
    }
  }

  function drawBrushes() {
    var brushSelection = gBrushes
      .selectAll('.brush')
      .data(brushes, function (d){return d.id});

    // Set up new brushes
    brushSelection.enter()
      .insert("g", '.brush')
      .attr('class', 'brush')
      .attr('id', function(brush){ return "brush-" + brush.id; })
      .each(function(brushObject) {
        //call the brush
        brushObject.brush(d3.select(this));
      });

  /* REMOVE POINTER EVENTS ON BRUSH OVERLAYS
  *
  * This part is abbit tricky and requires knowledge of how brushes are implemented.
  * They register pointer events on a .overlay rectangle within them.
  * For existing brushes, make sure we disable their pointer events on their overlay.
  * This frees the overlay for the most current (as of yet with an empty selection) brush to listen for click and drag events
  * The moving and resizing is done with other parts of the brush, so that will still work.
  */
    brushSelection
      .each(function (brushObject){
        d3.select(this)
          .attr('class', 'brush')
          .selectAll('.overlay')
          .style('pointer-events', function() {
            var brush = brushObject.brush;
            if (brushObject.id === brushes.length-1 && brush !== undefined) {
              return 'all';
            } else {
              return 'none';
            }
          });
      })

    brushSelection.exit()
      .remove();

  }
  newBrush();
  drawBrushes();
  
}





// var margin = {
//   top: 10,
//   right: 10,
//   bottom: 30,
//   left: 40
// },
// width = 960 - margin.left - margin.right,
// height = 150 - margin.top - margin.bottom;

// // let container = d3.select('#AirlinesChart') //TODO: use d3.select to select the element with id AirlinesChart 
// // container
// //     .attr("width", width)
// //     .attr('height', height)

// var svg = d3.select("#LineChart").append("svg")
// .attr("width", width + margin.left + margin.right)
// .attr("height", height + margin.top + margin.bottom)
// .append("g")
// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg.append("rect")
// .attr("class", "grid-background")
// .attr("width", width)
// .attr("height", height);




// //Read the data
// // d3.csv("3_TwoNumOrdered_comma.csv",
// d3.csv("sample.csv",
// // When reading the csv, I must format variables:
// function(d){
//   return { date : d3.timeParse("%m/%d/%Y")(d.date), value : (+d.ab + +d.bc + +d.ac) }
// })
// .then(
// // Now I can use this dataset:
// function(data) {
//   // Add X axis --> it is a date format
//   var x = d3.scaleTime()
//     .domain(d3.extent(data, function(d) { return d.date; }))
//     .range([ 0, width ]);
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x));

//   // Add Y axis
//   var y = d3.scaleLinear()
//     .domain([0, d3.max(data, function(d) { return +d.value; })])
//     .range([ height, 0 ]);
//   svg.append("g")
//     .call(d3.axisLeft(y));

//   // Add the area
//   svg.append("path")
//     .datum(data)
//     .attr("fill", "#cce5df")
//     .attr("stroke", "#69b3a2")
//     .attr("stroke-width", 1.5) 
//     .attr("d", d3.area()
//       .x(function(d) { return x(d.date) })
//       .y0(y(0))
//       .y1(function(d) { return y(d.value) })
//       )
// // We initially generate a SVG group to keep our brushes' DOM elements in:
// var gBrushes = svg.append('g')
// .attr("class", "brushes");

// // We also keep the actual d3-brush functions and their IDs in a list:
// var brushes = [];

// /* CREATE NEW BRUSH
// *
// * This creates a new brush. A brush is both a function (in our array) and a set of predefined DOM elements
// * Brushes also have selections. While the selection are empty (i.e. a suer hasn't yet dragged)
// * the brushes are invisible. We will add an initial brush when this viz starts. (see end of file)
// * Now imagine the user clicked, moved the mouse, and let go. They just gave a selection to the initial brush.
// * We now want to create a new brush.
// * However, imagine the user had simply dragged an existing brush--in that case we would not want to create a new one.
// * We will use the selection of a brush in brushend() to differentiate these cases.
// */
// function newBrush() {
// var brush = d3.brushX()
//   .extent([[0, 0], [width, height]])
//   .on("start", brushstart)
//   .on("brush", brushed)
//   .on("end", brushend);

// brushes.push({id: brushes.length, brush: brush});

// function brushstart() {
//   // your stuff here
// };

// function brushed() {
//   // your stuff here
// }

// function brushend() {

//   // Figure out if our latest brush has a selection
//   var lastBrushID = brushes[brushes.length - 1].id;
//   var lastBrush = document.getElementById('brush-' + lastBrushID);
//   var selection = d3.brushSelection(lastBrush);

//   // If it does, that means we need another one
//   if (selection && selection[0] !== selection[1]) {
//     if (brushes.length < 2) { // here we limit the brushes to only two
//       newBrush();      
//     }
//   }

//   // Always draw brushes
//   drawBrushes();
// }
// }

// function drawBrushes() {

// var brushSelection = gBrushes
//   .selectAll('.brush')
//   .data(brushes, function (d){return d.id});

// // Set up new brushes
// brushSelection.enter()
//   .insert("g", '.brush')
//   .attr('class', 'brush')
//   .attr('id', function(brush){ return "brush-" + brush.id; })
//   .each(function(brushObject) {
//     //call the brush
//     brushObject.brush(d3.select(this));
//   });

// /* REMOVE POINTER EVENTS ON BRUSH OVERLAYS
//  *
//  * This part is abbit tricky and requires knowledge of how brushes are implemented.
//  * They register pointer events on a .overlay rectangle within them.
//  * For existing brushes, make sure we disable their pointer events on their overlay.
//  * This frees the overlay for the most current (as of yet with an empty selection) brush to listen for click and drag events
//  * The moving and resizing is done with other parts of the brush, so that will still work.
//  */
// brushSelection
//   .each(function (brushObject){
//     d3.select(this)
//       .attr('class', 'brush')
//       .selectAll('.overlay')
//       .style('pointer-events', function() {
//         var brush = brushObject.brush;
//         if (brushObject.id === brushes.length-1 && brush !== undefined) {
//           return 'all';
//         } else {
//           return 'none';
//         }
//       });
//   })

// brushSelection.exit()
//   .remove();
// }

// newBrush();
// drawBrushes();
// })
//   .catch(function(error){
//     console.log('cannot import file')
// })