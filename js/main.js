/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);


// Initialize visualization, with creating the background elements by default
function initializeVisualization(createStaticElements){
	d3.json("data/citeology.json", function(data){
	    global.papers=data.papers;
	    global.computeMedianMaximalNormalizedCitationCountsPerYear();
	    sessionManager.loadPreviousSession();

	    algorithm.generateFringe();
	    view.initializeView(createStaticElements);
	});	
}

initializeVisualization(true);

// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    view.updateView(0);    // don't animate on resize
}
