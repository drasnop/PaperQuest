/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.json("data/citeology.json", function(data){
  // Cache the dataset
  global.papers = data.papers;
  // Initialize some global parameters
  global.minYear = d3.min(Object.keys(global.papers), function(doi) { return global.papers[doi].year; });
  global.maxYear = d3.max(Object.keys(global.papers), function(doi) { return global.papers[doi].year; });
  global.computeMedianMaximalNormalizedCitationCountsPerYear();
  // Restore data from previous session
  sessionManager.loadPreviousSession();

  algorithm.generateFringe();
  view.initializeVis();
});


// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    view.updateVis(0);    // don't animate on resize
}
