// Manage papers on the fringe, with or without animating the transitions (TODO)
view.manageDynamicElements=function(animate){

//------------------DATA JOIN-------------------//
// Join new data with old elements, if any

var papers = svg.select("#fringe-papers").selectAll(".paper")
.data(global.visibleFringe, function(p) { return global.visibleFringe.indexOf(p); })
    // using this key function is critical to ensure papers will change position when updating the fringe


//--------------------ENTER---------------------//
// Create new elements as needed

var enteringPapers = papers.enter()
.append("g")
.attr("class","paper")
.attr("id", function(p) { return p.doi;})

// group of visible elements at lowest zoom level (= glyph + title)
var zoom0 = enteringPapers.append("g")
.attr("class","zoom0")

    // group of elements that make up a glyph showing citation counts and number of upvoters
    var glyph = zoom0.append("g")
    .attr("class","glyph")

    glyph.append("circle")
    .attr("class","outerNode")
    .style("fill","white")

    if(global.butterfly){
        glyph.append("circle")
        .attr("class", "internalCitationsCircle")
        .style("fill", function(p) { return fringePaperInternalColor(p); })

        glyph.append("circle")
        .attr("class", "externalCitationsCircle")
        .style("fill", function(p) { return fringePaperInternalColor(p); })
    }
    else{
        var halfdisk=function(external){
            return d3.svg.arc()
            .innerRadius(0)
            .outerRadius(function(d){ return external? radius(d,true) : radius(d,false); })
            .startAngle(0)
            .endAngle(external? -Math.PI : Math.PI)
        }

        glyph.append("path")
        .attr("class", "internalCitationsCircle")
        .attr("d", halfdisk(false))
        .style("fill", function(p) { return fringePaperInternalColor(p); })
        .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })

        glyph.append("path")
        .attr("class", "externalCitationsCircle")
        .attr("d", halfdisk(true))
        .style("fill", function(p) { return fringePaperExternalColor(p); })
        .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })  
    }


zoom0.append("rect")
.attr("class","card")
.moveToBackOf("#fringe-papers")  // eventually we'll have to make these follow the selected papers during animations

zoom0.append("text")
.attr("class", "title")
.classed("highlighted", function(p) { return p.selected; })
.attr("dy",".35em")     // align ligne middle
.text(function(p) { return p.title; })
.style("opacity","0")   // otherwise it looks ugly when they come in
.append("svg:title")
.text(function(p){ return p.citation_count + " external, " + p.citations.length + " internal; "
    + p.citation_count/parameters.externalCitationCountCutoff+ " adjusted external, "
    + p.citations.length/parameters.internalCitationCountCutoff+ " adjusted internal";})

enteringPapers.append("a")
.attr("xlink:href",function(p) { return "http://dl.acm.org/citation.cfm?id="+p.doi.slice(p.doi.indexOf("/")+1); })
.attr("xlink:show","new")   // open in a new tab
.append("text")
.attr("class", "metadata")
.text(function(p) { return p.metadataToString(); } )
.style("opacity","0")       // used for smooth fade-in apparition

enteringPapers.append("foreignObject")
.attr("class","abstractWrapper")
.append("xhtml:body")
.append("div")
.attr("class","abstract")
.text(function(p) { return p.abstract; })
.style("width", parameters.abstractLineWidth+"px")
.each(function(p) {
  // stores the height of the abstract, to be used later
  p.abstractHeight = d3.select(this).node().offsetHeight;
})
.style("height","0px")   // for a nice unfolding entrance animation

//------------------ENTER+UPDATE-------------------//
// Appending to the enter selection expands the update selection to include
// entering elements; so, operations on the update selection after appending to
// the enter selection will apply to both entering and updating nodes.

var t0=papers.transition().duration(parameters.fringePapersPositionTransitionDuration[animate]).ease(parameters.fringePapersTransitionEasing)
global.animationRunning=true;

t0.each(function(p) {
    if(!p.selected && !userData.newSelectedPapers.hasOwnProperty(p.doi)){
        // for horizontal and vertical scaling: matrix(sx, 0, 0, sy, x-sx*x, y-sy*y)
        var scaling="matrix(" + parameters.compressionRatio[global.zoom] + ",0,0," + parameters.compressionRatio[global.zoom] +","
            + (fringePaperX(p)-parameters.compressionRatio[global.zoom]*fringePaperX(p)) +","
            + (fringePaperY(p)-parameters.compressionRatio[global.zoom]*fringePaperY(p)) +")";   

        d3.select(this).attr("transform",scaling)

        if(userData.newSelectedPapers.length>0 || P.selected().length>0)
            d3.select(this).style("opacity", parameters.opacityOfNonSelectedPapers[global.zoom])
        else
            d3.select(this).style("opacity",1)
    }
    else{
        d3.select(this).attr("transform",null)
        d3.select(this).style("opacity",1)
    }

})

// TODO: refactoring, not sure what this does, doesn't seem to trigger
// Antoine: the cards were the "background colors" behind the titles. Not really used at the moment. We should discuss this
t0.select(".card")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) { return fringePaperY(p)-parameters.paperMaxRadius;} )
.attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
.attr("height",2*parameters.paperMaxRadius)

if(global.butterfly){
    t0.select(".externalCitationsCircle")
    .attr("cx", function(p) { return fringePaperX(p)-radius(p,true);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return radius(p,true);} )

    t0.select(".internalCitationsCircle")
    .attr("cx", function(p) { return fringePaperX(p)+radius(p,false);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return radius(p,false);} )

    // the outerNodes (white borders to highlight selected papers) are shown only for the selected papers
    t0.select(".outerNode")
    .attr("cx", function(p) { return fringePaperX(p)-radius(p,true) ;} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return radius(p,true)+parameters.paperOuterBorderWidth;} )
    .style("display", function(p) { return p.selected ? "" : "none"; })
    //.moveToBackOf("#fringe-papers")  I'm not sure how to do this...
}
else{
    t0.select(".externalCitationsCircle")
    .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })
    
    t0.select(".internalCitationsCircle")
    .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })     

    // the outerNodes (white borders to highlight selected papers) are shown only for the selected papers
    t0.select(".outerNode")
    .attr("cx", function(p) { return fringePaperX(p);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return maxRadius(p)+parameters.paperOuterBorderWidth;} )
    .style("display", function(p) { return p.selected ? "" : "none"; })   
    //.moveToBackOf("#fringe-papers")    
}

// The change of color should occur AFTER the papers have moved to their new positions
t0.call(endAll, function () {
    // A new transition is generated after all elements of t0 have finished
    var t1=papers.transition().duration(parameters.fringePapersColorTransitionDuration[animate]);

    t1.select(".externalCitationsCircle")
    .style("fill", function(p) { return fringePaperExternalColor(p); })

    t1.select(".internalCitationsCircle")
    .style("fill", function(p) { return fringePaperInternalColor(p); })

    // When t1 finishes, check whether an animation is waiting (for update automatically)
    t1.call(endAll, function(){
        global.animationRunning=false;
        if(global.animationWaiting){
            updateFringe();
            global.animationWaiting=false;
        }
    })
});

// I really don't understand why this doesn't work on page update (animate=false)
// Basically the second animation cancels the first one, although the staging works fine when duration>0...
/*   t0.transition().duration(fringePapersColorTransitionDuration[animate])
.select(".externalCitationsCircle")
.style("fill", function(d) { return colorFromUpvoters(userData.papers[d].upvoters); })*/


t0.select(".title")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) {return fringePaperY(p);} )
.style("opacity","1")

/* the following elements are sometimes not visible. we use a fade-in to show and hide them,
* but it also necessary to remove them from the display when they aren't suppose to be there,
* otherwise they will impede selection of other elements (as they may be drawn on top of these). */

t0.select(".metadata")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) {return fringePaperY(p)+parameters.metadataYoffset;} )
.style("opacity", function(p) { return (p.selected && global.zoom>=1) ? 1: 0;})
.style("display", function(p) { return (p.selected && global.zoom>=1) ? "": "none";})

t0.selectAll(".abstractWrapper")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) {return fringePaperY(p)+parameters.metadataYoffset+parameters.abstractYoffset;} )
.attr("width",parameters.abstractLineWidth)
.attr("height", function(p) { return p.abstractHeight;})

t0.selectAll(".abstract")
.style("height", function(p) { return (p.selected && global.zoom>=2) ?
                                        p.abstractHeight+"px": "0px";})


//--------------------EXIT---------------------//
// Remove old elements as needed.

papers.exit()
    // Trying to shrink the exiting papers. Works, but the coordinate space is not relative to current position => big translation     
/*        .transition().duration(fringePapersPositionTransitionDuration[animate])
.attr("transform","matrix(1,0,0,.5,0,0)")*/
.remove();
}