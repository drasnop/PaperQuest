/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",2*window.innerHeight);


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
    .attr("height",2*window.innerHeight)
    
    initializeVis();
}

function initializeVis(){

    var papers=Object.keys(global.papers);

/*  // Remove the papers for which we didn't get the Google citation count
    var papersForExternalCitations=Object.keys(global.papers).filter(function(doi){
        return !(global.papers[doi].citation_count==0 && global.papers[doi].citations.length>0);
    })*/

    function internalCitationCounts() {
      var internalCitationCounts = [];
      papers.forEach(function(doi){
        internalCitationCounts.push(P(doi).getInternalCitationCount())
      })
      return internalCitationCounts;
    }

    function externalCitationCounts() {
      var externalCitationCounts = [];
      papers.forEach(function(doi){
        externalCitationCounts.push(P(doi).citation_count)
      })
      return externalCitationCounts;
    }

    function externalVsInternal(){
        var externalVsInternal = [];
        papers.forEach(function(doi){
            externalVsInternal.push({
                "y":P(doi).getInternalCitationCount(),
                "x":P(doi).citation_count
            });
        })
        return externalVsInternal;
    }

    function timeVsExternal(){
        var timeVsExternal = [];
        papers.forEach(function(doi){
            timeVsExternal.push({
                "x":P(doi).year,
                "y":P(doi).citation_count
            });
        })
        return timeVsExternal;
    }

    function timeVsInternal(){
        var timeVsInternal = [];
        papers.forEach(function(doi){
            timeVsInternal.push({
                "x":P(doi).year,
                "y":P(doi).getInternalCitationCount()
            });
        })
        return timeVsInternal;
    }

    function timeVsOldACC(){
        var timeVsOldACC = [];
        papers.forEach(function(doi){
            timeVsOldACC.push({
                "x":P(doi).year,
                "y":P(doi).adjustedCitationCount()
            });
        })
        return timeVsOldACC;
    }

    function timeVsACC(){
        var timeVsACC = [];
        papers.forEach(function(doi){
            timeVsACC.push({
                "x":P(doi).year,
                "y":P(doi).getMaximumNormalizedCitationCount()
            });
        })
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


    var scatterplotTimeVsInternal=svg.append("g")
        .attr("transform", "translate("+0+","+2*height+")");
    scatterplot(scatterplotTimeVsInternal,width,height,timeVsInternal(),true,true);

    var scatterplotTimeVsExternal=svg.append("g")
        .attr("transform", "translate("+width+","+2*height+")");
    scatterplot(scatterplotTimeVsExternal,width,height,timeVsExternal(),true,true);


    var scatterplotTimeVsOldACC=svg.append("g")
        .attr("transform", "translate("+0+","+3*height+")");
    scatterplot(scatterplotTimeVsOldACC,width,height,timeVsOldACC(),false,true);

    var scatterplotTimeVsACC=svg.append("g")
        .attr("transform", "translate("+width+","+3*height+")");
    scatterplot(scatterplotTimeVsACC,width,height,timeVsACC(),false,true);
}