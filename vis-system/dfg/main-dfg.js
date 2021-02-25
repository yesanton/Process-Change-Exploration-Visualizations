// function to initialize the dfg graph
function configDFG(){
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
    config.threshold_arc_min = 150
    config.threshold_arc_diff_min = 10
    return config;
}



//function to draw dfg on 
function drawDFG(config_dfg, data){
    console.log("data:  _------>");

    console.log(data)
    console.log("dfg drawing start")

    let states = {}
    for (let j = 0 ; j < data.dfrs.length ; j+= 1){
        states[data.dfrs[j].act1] = {
            description: "description"
            }
            let temp_sum = data.dfrs[j].series_sum_each_arc;
            let temp_sum_diff = data.dfrs[j].series_sum_each_arc_diff

            if (temp_sum > config_dfg.threshold_arc_min){
                // // Set up the edges
                if (!(data.dfrs[j].series_sum_each_arc_diff === undefined)){
                    // the difference between the two datasets is larger than some value:
                    if (data.dfrs[j].series_sum_each_arc_diff > config_dfg.threshold_arc_diff_min){
                        console.log('deciding to draw the GREEN arc: ')
                        console.log(-1 * config_dfg.threshold_arc_diff_min)
                        console.log(data.dfrs[j].series_sum_each_arc_diff )


                        config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                            {
                                curve: d3.curveBasis, // cuvre the edges
                                labelStyle: 'stroke: green',
                                label: round_and_to_string(temp_sum) + ' ↑' + round_and_to_string(temp_sum_diff),
                                // additional options possible
                                style: "stroke: green; stroke-width: 3px;"// stroke-dasharray: 5, 5;",
                                ,arrowheadStyle: "fill: green"
                            })
                    } 
                    // the diff is smaller than some val
                    else if (data.dfrs[j].series_sum_each_arc_diff < -1 * config_dfg.threshold_arc_diff_min){
                        console.log('deciding to draw the red arc: ')
                        console.log(-1 * config_dfg.threshold_arc_diff_min)
                        console.log(data.dfrs[j].series_sum_each_arc_diff )

                        config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                            {
                                curve: d3.curveBasis, // cuvre the edges
                                label: round_and_to_string(temp_sum)
                                            + ' ↓' 
                                            + round_and_to_string(temp_sum_diff),
                                // additional options possible
                                style: "stroke: #f66; stroke-width: 3px;", 
                                arrowheadStyle: "fill: #f66"
                                
                            })
                    } else {
                        config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                            {
                                curve: d3.curveBasis, // cuvre the edges
                                label: round_and_to_string(temp_sum)
                            })
                    }
                } else {
                    // if (j === 0){
                        config_dfg.g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                            {
                                curve: d3.curveBasis, // cuvre the edges
                                label: round_and_to_string(temp_sum),

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

    console.log("><<< config_dfg.g:   ")

    console.log(config_dfg.g)
    console.log(states)
    console.log(1);

    
    // Add states to the graph, set labels, and style
    Object.keys(states).forEach(function(state) {
        var value = states[state];
        value.label = state;
        value.rx = value.ry = 5;
        config_dfg.g.setNode(state, value);
        // console.log(state + ' ' + value)
    });
    delete states;

    // //experiment
    // config_dfg.g.setEdge('a', 'b')
    // config_dfg.g.setEdge('a', 'c')
    // config_dfg.g.setEdge('c', 'b')

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
    var initialScale = 0.5;
    svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - config_dfg.g.graph().width * initialScale) / 2, 20).scale(initialScale));
    // svg.attr('height', config_dfg.g.graph().height * initialScale + 40);

    
}


function round_and_to_string(number){
    return Math.round(number).toString()
}
