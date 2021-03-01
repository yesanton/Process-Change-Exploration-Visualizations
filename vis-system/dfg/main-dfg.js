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

    // console.log(Object.keys(data.activities_importance))

    let temp_activities_importance = Object.keys(data.activities_importance).map(function(key){
        return data.activities_importance[key];
    })
    config.node_color_scale = d3.scaleLinear().domain([d3.min(temp_activities_importance),d3.max(temp_activities_importance)])
                                              .range(["white", "green"])


    let t = data.dfrs.map(i => i.series_sum_each_arc)
    // console.log("t!________________________")
    // console.log(t)
    config.edge_size_scale = d3.scaleLinear().domain([d3.min(t),d3.max(t)])
                            .range([1, 4])
    return config;
}


//function to draw dfg on 
function drawDFG(data){     

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
        let temp_sum_diff = data.dfrs[j].series_sum_each_arc_diff
        if (temp_sum > config_dfg.threshold_arc_min){
            // // Set up the edges
            if (!(data.dfrs[j].series_sum_each_arc_diff === undefined)){
                // the difference between the two datasets is larger than some value:
                if (data.dfrs[j].series_sum_each_arc_diff > config_dfg.threshold_arc_diff_min){
                    config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                        {
                            curve: d3.curveBasis, // cuvre the edges
                            labelStyle: 'stroke: ' + colors["edge_future"],
                            label: round_and_to_string(temp_sum) + ' ↑' + round_and_to_string(temp_sum_diff),
                            // additional options possible
                            style: "stroke: green; stroke-width: " + config_dfg.edge_size_scale(data.dfrs[j].series_sum_each_arc) + "px;" // stroke-dasharray: 5, 5;",
                            ,arrowheadStyle: "fill: " + colors["edge_future"]
                        })
                } 
                // the diff is smaller than some val
                else if (data.dfrs[j].series_sum_each_arc_diff < -1 * config_dfg.threshold_arc_diff_min){
                    // console.log('deciding to draw the red arc: ')
                    // console.log(-1 * config_dfg.threshold_arc_diff_min)
                    // console.log(data.dfrs[j].series_sum_each_arc_diff )

                    config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                        {
                            curve: d3.curveBasis, // cuvre the edges
                            labelStyle: 'stroke: ' + colors["edge_past"],
                            label: round_and_to_string(temp_sum)
                                        + ' ↓' 
                                        + round_and_to_string(temp_sum_diff),
                            // additional options possible
                            style: "stroke: " + colors["edge_past"] + "; " + config_dfg.edge_size_scale(data.dfrs[j].series_sum_each_arc) + "px;", 
                            arrowheadStyle: "fill: " + colors["edge_past"]
                            
                        })
                } else {
                    config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                        {
                            curve: d3.curveBasis, // cuvre the edges
                            label: round_and_to_string(temp_sum),
                            style: "stroke-width: " + config_dfg.edge_size_scale(data.dfrs[j].series_sum_each_arc) + "px;", 
                            arrowheadStyle: "fill: black"

                        })
                }
            } else {
                config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                    {
                        curve: d3.curveBasis, // cuvre the edges
                        label: round_and_to_string(temp_sum),
                        style: "stroke-width: " + config_dfg.edge_size_scale(data.dfrs[j].series_sum_each_arc) + "px;", 
                        arrowheadStyle: "fill: " + colors['edge_neutral']
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
    // console.log('here we draw nodes! --->')
    // console.log(data)
    // console.log(states)
    Object.keys(states).forEach(function(state) {
        var value = states[state];
        value.label = state + " (" + Math.round(data.activities_importance[state]) + ")";
        value.rx = value.ry = 5;
        value.style = "fill: " + config_dfg.node_color_scale(data.activities_importance[state]);
        config_dfg.g.setNode(state, value);
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
