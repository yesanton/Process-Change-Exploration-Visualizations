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
    return g;
}

//function to draw dfg on 
function drawDFG(g, data){
    console.log("dfg drawing start")
    let states = {}
    for (let j = 0 ; j < data.dfrs.length ; j+= 1){
        states[data.dfrs[j].act1] = {
            description: "description"
            }
            let temp_sum = d3.sum(data.dfrs[j].series) 
            if (temp_sum > 150){
                // // Set up the edges
                g.setEdge(data.dfrs[j].act1, data.dfrs[j].act2, 
                    {
                        curve: d3.curveBasis, // cuvre the edges
                        label: temp_sum
                        // additional options possible
                        // style: "stroke: #aaa;   stroke-dasharray: 5, 10;" 
                        // ,curve: d3.curveBasis
                        // ,arrowheadStyle: "fill: #aaa"
                        // ,labelpos: 'c'
                        // ,label: 'pruned'
                        // ,labelStyle: 'stroke: #aaa'
                        // labeloffset: 5
                        // arrowhead: 'undirected'
                    })
            }
    }

    console.log('at the end of the draw DFG section4')
    console.log(states)

    // Add states to the graph, set labels, and style
    Object.keys(states).forEach(function(state) {
        var value = states[state];
        value.label = state;
        value.rx = value.ry = 5;
        g.setNode(state, value);
    });
    
    console.log('at the end of the draw DFG section3')
    // Create the renderer
    var render = new dagreD3.render();
    // render.edgeTension('linear')
    // Set up an SVG group so that we can translate the final graph.
    var svg = d3.select("#DFGChart"),
        inner = svg.append("g");
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
    console.log('at the end of the draw DFG section2')
    

    // Run the renderer. This is what draws the final graph.
    render(inner, g);
    
    inner.selectAll("g.node")
        .attr("title", function(v) { return styleTooltip(v, g.node(v).description) })
        .each(function(v) { $(this).tipsy({ gravity: "w", opacity: 1, html: true}); });
    
    // Center the graph
    var initialScale = 0.75;
    svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
    svg.attr('height', g.graph().height * initialScale + 40);
    console.log('at the end of the draw DFG section');

}