/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.tsv("data/SmallDataset.tsv", function(data){
    createVis(data);
    drawVis();
    bindListeners();
});


// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    drawVis();
}