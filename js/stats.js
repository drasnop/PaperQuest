/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",1.5*window.innerHeight);


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.json("data/citeology.json", function(data){
    global.papers=data.papers;
    initializeVis();
});


// Dynamic resize
window.onresize = function(){
    svg.remove();
    
    svg=d3.select("body").append("svg")
    .attr("width",window.innerWidth)
    .attr("height",1.5*window.innerHeight)
    
    initializeVis();
}

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

    function externalVsInternal(){
        var externalVsInternal = [];
        for(var doi in global.papers){
            externalVsInternal.push({
                "y":P(doi).getInternalCitationCount(),
                "x":P(doi).citation_count
            });
        }
        return externalVsInternal;
    }

    function timeVsExternal(){
        var timeVsExternal = [];
        for(var doi in global.papers){
            timeVsExternal.push({
                "x":P(doi).year,
                "y":P(doi).citation_count
            });
        }
        return timeVsExternal;
    }

    function timeVsACC(){
        var timeVsACC = [];
        for(var doi in global.papers){
            timeVsACC.push({
                "x":P(doi).year,
                "y":P(doi).adjustedCitationCount()
            });
        }
        return timeVsACC;
    }

    var width=window.innerWidth/2,
        height=window.innerHeight/2;

    var histogramInternal=svg.append("g");
    histogram(histogramInternal,width,height,internalCitationCounts(),20,20);
    
    var histogramExternal=svg.append("g")
        .attr("transform", "translate("+width+",0)");
    histogram(histogramExternal,width,height,externalCitationCounts(),20,400);

    var scatterplotexternalVsInternal=svg.append("g")
        .attr("transform", "translate(0,"+height+")");
    scatterplot(scatterplotexternalVsInternal,width,height,externalVsInternal(),true,false);

    var scatterplotTimeVsExternal=svg.append("g")
        .attr("transform", "translate(0,"+2*height+")");
    scatterplot(scatterplotTimeVsExternal,width,height,timeVsExternal(),true,true);

    var scatterplotTimeVsACC=svg.append("g")
        .attr("transform", "translate("+width+","+2*height+")");
    scatterplot(scatterplotTimeVsACC,width,height,timeVsACC(),false,true);
}