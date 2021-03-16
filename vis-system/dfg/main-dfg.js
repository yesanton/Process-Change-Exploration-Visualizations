// function to initialize the dfg graph
function configDFG(data){
    // Create a new directed graph
    var g = new dagreD3.graphlib.Graph().setGraph({});
    g.graph().rankSep = 10; 
    g.graph().nodeSep = 10;
    g.graph().rankdir = "LR";
    g.graph().Schedule = true;
    g.graph().WBS = false;
    console.log(g)  
    config = {}
    config.g = g
    config.threshold_arc_min = 10
    config.threshold_arc_diff_min = 10
    config.coloring = "levelthreecolors" //"threecolors" // 

    config.dashes = {
        end: 'stroke-dasharray: 5, 10',
        start: 'stroke-dasharray: 5, 5'
    }
    // console.log(Object.keys(data.activity_count))
    let temp_activity_count = Object.keys(data.activity_count).map(function(key){
        return data.activity_count[key];
    })
    config.node_color_scale = d3.scaleLinear().domain([d3.min(temp_activity_count),d3.max(temp_activity_count)])
                                              .range(["white", "green"])

    // this is for diverging scale for the change information in nodes
    // config.node_color_scale_diff = d3.scaleLinear().domain([(d3.max(temp_activity_count) * -1),0,d3.max(temp_activity_count)])
    //                                           .range(["red", "white", "green"])

    config.node_end_start_color_scale = d3.scaleLinear().domain([d3.min(temp_activity_count),d3.max(temp_activity_count)])
                                              .range(["white", "orange"])

    let t = data.dfrs.map(i => i.series_sum_each_arc)
    // console.log("t!________________________")
    // console.log(t)
    config.edge_size_scale = d3.scaleLinear().domain([d3.min(t),d3.max(t)])
                            .range([1, 4])

    return config;
}


//function to draw dfg on 
function drawDFG(data){     
    console.log(data)
    // initialize the dfg againt
    config_dfg = configDFG(data);
    // remove the previous plot
    d3.select("#DFGChart").selectAll("*").remove();

    // todo: stepwise color for the arcs in two brushed version
    let minmax_series_sums = determineMaxMinSeriesSum(data)
    console.log('datadatadatadatadatadatadatadatadatadatadatadata')
    console.log(minmax_series_sums)
    let scaleC = d3.scaleLinear().domain(minmax_series_sums).range(['red', 'black', 'green'])
    console.log(scaleC(0))
    
    let states = {}
    for (let j = 0 ; j < data.dfrs.length ; j+= 1){
        states[data.dfrs[j].act1] = {
            description: "description"
            }
        states[data.dfrs[j].act2] = {
            description: "description"
        }
        let temp_sum = data.dfrs[j].series_sum_each_arc;
        let temp_sum_prev = data.dfrs[j].series_sum_each_arc_prev
        let temp_sum_next = data.dfrs[j].series_sum_each_arc_next

        if (temp_sum > config_dfg.threshold_arc_min){
            // // Set up the edges
                // the difference between the two datasets is larger than some value:
            setEdgeWithParams(config_dfg, data.dfrs[j].act1, data.dfrs[j].act2,temp_sum, temp_sum_next, temp_sum_prev, scaleC)   
        }
    }
    
    // Add states to the graph, set labels, and style
    console.log('here we draw nodes! --->')
    // console.log(data)
    // console.log(states)
    Object.keys(states).forEach(function(state) {
        var value = states[state];
        // console.log(data.activity_count_prev)
        // console.log(data)
        if (!(data.activity_count_prev === undefined)) {
            value.label = state + " (" + Math.round(data.activity_count_prev[state]) + '→' + Math.round(data.activity_count[state]) + ")";
            // console.log(value.label)

        } else {
            value.label = state + " (" + Math.round(data.activity_count[state]) + ")";
        }
        value.rx = value.ry = 5;

        if (state === 'end' || state === 'start') {
            // console.log(state)
            value.shape = 'ellipse'
            value.style = "fill: " + config_dfg.node_end_start_color_scale(data.activity_count[state])
            config_dfg.g.setNode(state, value);
        } else {
            // if (!(data.activity_count_prev === undefined)) {
                // the diverging color schema for the difference 
                // value.style = "fill: " + config_dfg.node_color_scale_diff(data.activity_count[state]- data.activity_count_prev[state]);
            // } else {
                value.style = "fill: " + config_dfg.node_color_scale(data.activity_count[state]);
            // }
            
            config_dfg.g.setNode(state, value);
        }
    });
    delete states;
    // Create the renderer
    var render = new dagreD3.render();
    // render.edgeTension('linear')
    // Set up an SVG group so that we can translate the final graph.

    var svg = d3.select("#DFGChart");
    let inner = svg.append("g");
    
    // Set up zoom support
    var zoom = d3.zoom()
        .on("zoom", function(event) {
            inner.attr("transform", event.transform);
        });
    svg.call(zoom);
    
    // Simple function to style the tooltip for the given node.
    var styleTooltip = function(name, description) {
        return "<p class='name'>" + name + "</p><p class='description'>" + description + "</p>";
    };
    

    // Run the renderer. This is what draws the final graph.
    render(inner, config_dfg.g);
    
    inner.selectAll("config_lineplot.g.node")
        .attr("title", function(v) { return styleTooltip(v, config_dfg.g.node(v).description) })
        .each(function(v) { $(this).tipsy({ gravity: "w", opacity: 1, html: true}); });
    
    // add tooltip

    // console.log("inner: ")
    // console.log(config_dfg.g)

    // var styleTooltip = function(v,k) {
    //     return "<p class='name'>" + v + " </p><p class='description'> " + k + " </p>";
    // };

    // inner.selectAll("g.edgePath")
    //     .attr("title", function(v,k) { return styleTooltip(v,k) })
    //         .each(function(v,k) { $(this).tipsy({ gravity: "w", opacity: 1, html: true }); });



    // Center the graph
    
    
    let width_dfg = document.getElementById('DFGChart').getBoundingClientRect().width
    
    // this is the real height of the svg box
    let height_dfg_svg_box = document.getElementById('DFGChart').getBoundingClientRect().height;
    // this is the size of the graph inside of svg
    let height_dfg_actual = config_dfg.g.graph().height;
    // we scale the atual svg to the box that we have on the screen
    // we also calcualte here that the dfg will always be in the middle if it is smaller than the whole screen
    let initialScaleCalculated = (height_dfg_svg_box - position.padding_big) / height_dfg_actual;
    let initialScale = initialScaleCalculated < 0.9? initialScaleCalculated : 0.9

    // console.log(initialScale)
    let padding_top = 0
    if (initialScale >= 0.9){
        padding_top = (height_dfg_svg_box - (height_dfg_actual * initialScale)) / 2
    } else {
        padding_top = position.padding
    }

    // console.log(height_dfg_svg_box)
    // console.log(height_dfg_actual)
    // console.log('making adjustments of the dfg positioning')
    // console.log(padding_top)

    svg.call(zoom.transform, d3.zoomIdentity.translate((width_dfg - config_dfg.g.graph().width * initialScale) / 2, padding_top).scale(initialScale));
    // console.log("!!!!!!!!!!!!!@@@@@@@@@@@  " )
    // height_dfg_svg_box = document.getElementById('DFGChart').getBoundingClientRect().height;
    // height_dfg_actual = config_dfg.g.graph().height;
    // console.log(height_dfg_svg_box)
    // console.log(height_dfg_actual)

    
    // svg.attr('height', config_dfg.g.graph().height * initialScale + 40);
}


function round_and_to_string(number){
    return Math.round(number).toString()
}

// this code sets the style for the arcs
function edge_style(act1, act2, edge_scale_val, edge_type){
    if (act1 === 'start'){
        return "stroke: " + colors_start_end[edge_type] + "; stroke-width: " + config_dfg.edge_size_scale(edge_scale_val) + "px; stroke-dasharray: 4, 10"
    }
    else if (act2 === 'end') {
        return "stroke: " + colors_start_end[edge_type] + "; stroke-width: " + config_dfg.edge_size_scale(edge_scale_val) + "px; stroke-dasharray: 10, 4"
    } else {
        return "stroke: " + colors[edge_type] + "; stroke-width: " + config_dfg.edge_size_scale(edge_scale_val) + "px";
    }
    
}

function arrow_style(act1, act2, edge_type){
    if (act1 === 'start'){
        return "fill: " + colors_start_end[edge_type]
    }
    else if (act2 === 'end') {
        return "fill: " + colors_start_end[edge_type]
    } else {
        return "fill: " + colors[edge_type];
    } 
}


// this code sets the style for the arcs
function edge_style_colorlevels(act1, act2, edge_scale_val,  color){
    if (act1 === 'start'){
        return "stroke: " + color + "; stroke-width: " + config_dfg.edge_size_scale(edge_scale_val) + "px; stroke-dasharray: 4, 10"
    }
    else if (act2 === 'end') {
        return "stroke: " + color + "; stroke-width: " + config_dfg.edge_size_scale(edge_scale_val) + "px; stroke-dasharray: 10, 4"
    } else {
        return "stroke: " + color + "; stroke-width: " + config_dfg.edge_size_scale(edge_scale_val) + "px";
    }
    
}


// todo: stepwise color for the arcs in two brushed version
function determineMaxMinSeriesSum(data) {
    let mi = Infinity;
    let ma = 0;
    console.log('here -<<')
    console.log(data)
    for (let i = 0; i < data.dfrs.length ; i += 1){
        let t = data.dfrs[i].series_sum_each_arc_next - data.dfrs[i].series_sum_each_arc_prev;
        if (mi > t) {
            mi = t;
        } 
        if (ma < t) {
            ma = t;
        }
    }
    console.log('here ->>')
    return [mi, 0, ma]
}



function setEdgeWithParams(config, act1, act2, sum, sum_next, sum_prev = undefined, scaleC = undefined){
    // we are dealing with two brushed regions
    if (sum_prev) {
        let temp_diff = sum_next - sum_prev;
        if (config.coloring === "threecolors") {
            let color = "edge_neutral"
            if (temp_diff > 0) {
                color = "edge_future"
            } else if (temp_diff < 0) {
                color = "edge_past"
            }
            config.g.setEdge(act1, act2, 
                {
                    curve: d3.curveBasis, // cuvre the edges
                    labelStyle: 'stroke: ' + colors[color],
                    // label: round_and_to_string(temp_sum) + ' ↑' + round_and_to_string(temp_sum_diff),
                    label: round_and_to_string(sum_prev)  
                                                + '→' 
                                                + round_and_to_string(sum_next),
                    // additional options possible
                    // style: edge_style(data.dfrs[j].act1, data.dfrs[j].act2, temp_sum, "edge_future"),
                    style: edge_style(act1, act2, sum, color),
                    arrowheadStyle: arrow_style(act1, act2, color)
                })
        } else if (config.coloring === "levelthreecolors") {
            // console.log(d3.color(scaleC(temp_diff)).formatHex()) // this is formatting from RGB to HEX
            config.g.setEdge(act1, act2, 
                {
                    curve: d3.curveBasis, // cuvre the edges
                    labelStyle: 'stroke: ' + d3.color(scaleC(temp_diff)).formatHex(),
                    label: round_and_to_string(sum_prev)  
                                                + '→' 
                                                + round_and_to_string(sum_next),
                    style: edge_style_colorlevels(act1, act2, sum, d3.color(scaleC(temp_diff)).formatHex()),
                    arrowheadStyle: "fill: " +  d3.color(scaleC(temp_diff)).formatHex()
                })
        }
        
    } else {
        config_dfg.g.setEdge(act1, act2, 
            {
                curve: d3.curveBasis, // cuvre the edges
                label: round_and_to_string(sum),
                style: edge_style(act1, act2, sum, "edge_neutral"), 
                arrowheadStyle: arrow_style(act1, act2,'edge_neutral')
                //style: "stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;",
                // arrowheadStyle: "fill: #f66" 
                // additional options possible
                // style: "stroke: #aaa;   stroke-dasharray: 5, 10;" 
                // ,curve: d3.curveBasis
                // ,arrowheadStyle: "fill: #aaa"
                // ,labelpos: 'c'
                // label: 'pruned'
                // ,labelStyle: 'stroke: #aaa'
                // labeloffset: 5
                // arrowhead: 'undirected'
            })

    }
    
}