/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
/*var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);*/


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.json("data/citeology.json", function(data){
    global.papers=data.papers;
    initializeVis();
});


/*// Dynamic resize
window.onresize = function(){
    initializeVis();
}*/

function initializeVis(){

    function internalCitationCounts() {
      var internalCitationCounts = [];
      for(var doi in global.papers){
        internalCitationCounts.push(P(doi).getInternalCitationCount())
      }
      return internalCitationCounts;
    }

    function externalCitationCounts() {
      var externalCitationCounts = [];
      for(var doi in global.papers){
        externalCitationCounts.push(P(doi).citation_count)
      }
      return externalCitationCounts;
    }

    var values = internalCitationCounts();
    console.log("number of papers: "+values.length)

    var width=window.innerWidth/2,
        height=window.innerHeight/2;

    var svgInternal=d3.select("body").append("svg");
    histogram(svgInternal,width,height,internalCitationCounts(),20,20);
    
    var svgExternal=d3.select("body").append("svg");
    histogram(svgExternal,width,height,externalCitationCounts(),20,400);
}