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
    console.log('datadatadatadatadatadatadatadatadatadatadatadata')
    console.log(data)
    // initialize the dfg againt
    config_dfg = configDFG(data);
    // remove the previous plot
    d3.select("#DFGChart").selectAll("*").remove();
    
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
            if (!(temp_sum_prev === undefined)){
                // the difference between the two datasets is larger than some value:
                // if (data.dfrs[j].series_sum_each_arc_diff > config_dfg.threshold_arc_diff_min){
                if (temp_sum_next > temp_sum_prev){
                    config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                        {
                            curve: d3.curveBasis, // cuvre the edges
                            labelStyle: 'stroke: ' + colors["edge_future"],
                            // label: round_and_to_string(temp_sum) + ' ↑' + round_and_to_string(temp_sum_diff),
                            label: round_and_to_string(temp_sum_prev)  
                                                        + '→' 
                                                        + round_and_to_string(temp_sum_next),
                            // additional options possible
                            style: edge_style(data.dfrs[j].act1, data.dfrs[j].act2, temp_sum, "edge_future"),
                            arrowheadStyle: arrow_style(data.dfrs[j].act1, data.dfrs[j].act2, 'edge_future')
                        })
                } 
                // the diff is smaller than some val
                // else if (data.dfrs[j].series_sum_each_arc_diff < -1 * config_dfg.threshold_arc_diff_min){
                else if (temp_sum_next < temp_sum_prev){
                    config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                        {
                            curve: d3.curveBasis, // cuvre the edges
                            labelStyle: 'stroke: ' + colors["edge_past"],
                            // label: round_and_to_string(temp_sum)
                            //             + ' ↓' 
                            //             + round_and_to_string(temp_sum_diff),
                            label: round_and_to_string(temp_sum_prev)
                                        + '→' 
                                        + round_and_to_string(temp_sum_next),
                            // additional options possible
                            style: edge_style(data.dfrs[j].act1, data.dfrs[j].act2, temp_sum, "edge_past"), 
                            arrowheadStyle: arrow_style(data.dfrs[j].act1, data.dfrs[j].act2,"edge_past")
                        })
                    
                } else {
                    config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                        {
                            curve: d3.curveBasis, // cuvre the edges
                            label: round_and_to_string(temp_sum_prev)
                                                    + '→' 
                                                    + round_and_to_string(temp_sum_next),
                            style: edge_style(data.dfrs[j].act1, data.dfrs[j].act2, temp_sum, "edge_neutral"), 
                            arrowheadStyle: arrow_style(data.dfrs[j].act1, data.dfrs[j].act2,'edge_neutral')

                        })
                    
                }
            } else {
                config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                    {
                        curve: d3.curveBasis, // cuvre the edges
                        label: round_and_to_string(temp_sum),
                        style: edge_style(data.dfrs[j].act1, data.dfrs[j].act2, temp_sum, "edge_neutral"), 
                        arrowheadStyle: arrow_style(data.dfrs[j].act1, data.dfrs[j].act2,'edge_neutral')
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