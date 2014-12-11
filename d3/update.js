// Manage papers on the fringe, with or without animating the transitions (TODO)
view.manageDynamicElements=function(animate){

//------------------DATA JOIN-------------------//
// Join new data with old elements, if any

var _visiblePapersCache = null;

function visiblePapers() {
  if (!_visiblePapersCache) {
    // First filter and reorder individual lists
    var fringe = global.visibleFringe;  // Filtering already happening in "computeVisibleFringe"
    var toread = P.toread().filter(global.allFilters);
    var core = P.core().filter(global.allFilters);

    // Mix them into a single list to feed to d3.
    _visiblePapersCache = fringe.concat(toread).concat(core);

    // Expire the cache.  Important, otherwise user wouldn't see any
    // additions or deletions of papers to the set.
    window.setTimeout(function() {
      _visiblePapersCache = null;
    }, 100);   // clear the cache after .1 seconds.  Dirty hack, should fix eventually.
  }
  return _visiblePapersCache;
}

var papers = svg.select("#fringe-papers").selectAll(".paper")
.data(visiblePapers(), function(p) { return visiblePapers().indexOf(p); })
    // using this key function is critical to ensure papers will change position when updating the fringe

papers.selectAll(".title")
  .text(function(p) {
  if (p.fringe) {
    return p.title;
  } else {
    var maxPixels = global.fringeApparentWidth - 4*parameters.paperMaxRadius - parameters.toreadPaperMargin - parameters.titleLeftMargin - parameters.toreadTitlePadding;
    return shorten(p.title, Math.round(maxPixels / parameters.pixelsPerLetter));
  }
});


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
            .outerRadius(function(p){ return external? radius(p,true) : radius(p,false); })
            .startAngle(0)
            .endAngle(external? -Math.PI : Math.PI)
        }

        glyph.append("path")
        .attr("class", "internalCitationsCircle")
        .attr("d", halfdisk(false))
        .style("fill", function(p) { return fringePaperInternalColor(p); })
        .attr("transform", function(p) { return "translate("+p.x+","+p.y+")"; })

        glyph.append("path")
        .attr("class", "externalCitationsCircle")
        .attr("d", halfdisk(true))
        .style("fill", function(p) { return fringePaperExternalColor(p); })
        .attr("transform", function(p) { return "translate("+p.x+","+p.y+")"; })
    }

    // the content of this tooltip is set dynamically, in the update section (below: "glyph title")
    glyph.append("svg:title")


zoom0.append("rect")
.attr("class","card")
.moveToBackOf("#fringe-papers")  // eventually we'll have to make these follow the selected papers during animations

zoom0.append("text")
.attr("class", "title")
.classed("highlighted", function(p) { return p.selected; })
.attr("dy",".35em")     // align ligne middle
.text(function(p) {
  if (p.fringe) {
    return p.title;
  } else {
    var maxPixels = global.fringeApparentWidth - 4*parameters.paperMaxRadius - parameters.toreadPaperMargin - parameters.titleLeftMargin - parameters.toreadTitlePadding;
    return shorten(p.title, Math.round(maxPixels / parameters.pixelsPerLetter));
  }
})
.style("opacity","0")   // otherwise it looks ugly when they come in - maybe not useful anymore...

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

// do not display papers that are at the bottom of the fringe (except in abstract view, for intuitive scrolling)
// TODO: bring to view selected papers that would be otherwise hidden
t0.style("visibility",function(p) {
    return p.visible || global.zoom>=2 ?
     "visible" : "hidden" ; })

// TODO: refactoring, not sure what this does, doesn't seem to trigger
// Antoine: the cards were the "background colors" behind the titles. Not really used at the moment. We should discuss this
t0.select(".card")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) { return p.y-parameters.paperMaxRadius;} )
.attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
.attr("height",2*parameters.paperMaxRadius)

if(global.butterfly){
    t0.select(".externalCitationsCircle")
    .attr("cx", function(p) { return p.x-radius(p,true);} )
    .attr("cy", function(p) { return p.y;} )
    .attr("r", function(p) {return radius(p,true);} )

    t0.select(".internalCitationsCircle")
    .attr("cx", function(p) { return p.x+radius(p,false);} )
    .attr("cy", function(p) { return p.y;} )
    .attr("r", function(p) {return radius(p,false);} )

    // the outerNodes (white borders to highlight selected papers) are shown only for the selected papers
    t0.select(".outerNode")
    .attr("cx", function(p) { return p.x-radius(p,true) ;} )
    .attr("cy", function(p) { return p.y;} )
    .attr("r", function(p) {return radius(p,true)+parameters.paperOuterBorderWidth;} )
    .style("display", function(p) { return p.selected ? "" : "none"; })
    //.moveToBackOf("#fringe-papers")  I'm not sure how to do this...
}
else{
    t0.select(".externalCitationsCircle")
    .attr("transform", function(p) { return "translate("+p.x+","+p.y+")"; })

    t0.select(".internalCitationsCircle")
    .attr("transform", function(p) { return "translate("+p.x+","+p.y+")"; })

    // the outerNodes (white borders to highlight selected papers) are shown only for the selected papers
    t0.select(".outerNode")
    .attr("cx", function(p) { return p.x;} )
    .attr("cy", function(p) { return p.y;} )
    .attr("r", function(p) {return maxRadius(p)+parameters.paperOuterBorderWidth;} )
    .style("display", function(p) { return p.selected ? "" : "none"; })
    //.moveToBackOf("#fringe-papers")
}

t0.select(".glyph")
.style("opacity", function(p) {
    if(((p.fringe && !p.selected) && !userData.newInterestingPapers.hasOwnProperty(p.doi))
     && (userData.newInterestingPapers.length>0 || P.selected().length>0)  && global.zoom>0)
        return parameters.opacityOfNonSelectedPapers[global.zoom];
    return 1; })

d3.selectAll(".glyph title")
.text(function(p){ console.log(p.getNormalizedConnectivityScore() + " " +global.minConnectivityScore); return p.citation_count + " (" + Math.round(p.getNormalizedExternalCitationCount()*100) + "%) external citations, " +
    p.citations.length + " (" + Math.round(p.getNormalizedInternalCitationCount()*100) + "%) internal citations; " +
    p.connectivity + " (" + Math.round(p.getNormalizedConnectivityScore()*100) + "%) connectivity.";
})

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
            view.updateFringe();
            global.animationWaiting=false;
        }
    })
});

// I really don't understand why this doesn't work on page update (animate=false)
// Basically the second animation cancels the first one, although the staging works fine when duration>0...
/*   t0.transition().duration(fringePapersColorTransitionDuration[animate])
.select(".externalCitationsCircle")
.style("fill", function(d) { return colorFromConnectivity(userData.papers[d].getNormalizedConnectivityScore); })*/

t0.select(".title")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) {return p.y;} )
.style("opacity", function(p) {
    if(((p.fringe && !p.selected) && !userData.newInterestingPapers.hasOwnProperty(p.doi)) && (userData.newInterestingPapers.length>0 || P.selected().length>0))
        return parameters.opacityOfNonSelectedPapers[global.zoom];
    return 1; })
.attr("transform", function(p) {
    // for horizontal and vertical scaling: matrix(sx, 0, 0, sy, x-sx*x, y-sy*y)
    var scaling="matrix(" + parameters.compressionRatio[global.zoom] + ",0,0," + parameters.compressionRatio[global.zoom] +","
                + (p.x-parameters.compressionRatio[global.zoom]*p.x) +","
                + (p.y-parameters.compressionRatio[global.zoom]*p.y) +")";

    if(((p.fringe && !p.selected) && !userData.newInterestingPapers.hasOwnProperty(p.doi)) && (userData.newInterestingPapers.length>0 || P.selected().length>0))
        return scaling;
    return null; })

/* the following elements are sometimes not visible. we use a fade-in to show and hide them,
* but it also necessary to remove them from the display when they aren't suppose to be there,
* otherwise they will impede selection of other elements (as they may be drawn on top of these). */

t0.select(".metadata")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) {return p.y+parameters.metadataYoffset;} )
.style("opacity", function(p) { return (p.selected && global.zoom>=1) ? 1: 0;})
.style("display", function(p) { return (p.selected && global.zoom>=1) ? "": "none";})

t0.selectAll(".abstractWrapper")
.attr("x", function(p) { return fringePaperLabelX(p);} )
.attr("y", function(p) {return p.y+parameters.metadataYoffset+parameters.abstractYoffset;} )
.attr("width",parameters.abstractLineWidth)
.attr("height", function(p) { return p.abstractHeight;})
.style("display", function(p) { return (p.selected && global.zoom>=2) ? "": "none";})

t0.selectAll(".abstract")
.style("height", function(p) { return (p.selected && global.zoom>=2) ?
                                        p.abstractHeight+"px": "0px";})

/*d3.select("#bottomPane")
.moveToFrontOf("#fringe-papers")*/

//--------------------EXIT---------------------//
// Remove old elements as needed.

papers.exit()
    // Trying to shrink the exiting papers. Works, but the coordinate space is not relative to current position => big translation
/*        .transition().duration(fringePapersPositionTransitionDuration[animate])
.attr("transform","matrix(1,0,0,.5,0,0)")*/
.remove();
}
