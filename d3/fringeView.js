 /*
* Creates, draw and specify interaction for the Fringe global.view
*/

// To create a class with static methods (basically, a namespace)
var fringeView = (function () {

// Except for the (static) background elements, everything is computed on-the-fly
function initializeVis(){
    createStaticElements();
    updateVis(0);   //don't animate at creation
}

// Update the vis, with different animation speeds. If animate=0, no animation.
function updateVis(animate){
    computeVisibleFringe();
    drawStaticElements();
    manageDynamicElements(animate);
    bindListeners();
}

// Update fringe and animate the change
function updateFringe() {
    algorithm.updateFringe();
    updateVis(1);
    // the updateFringe button becomes useless until new papers are (de)selected
    d3.select("#updateFringe").attr("disabled","disabled");
}

//////////////////  Drawing functions   ///////////////////////


// Given the current windows dimensions, which papers can be displayed on the Fringe?
function computeVisibleFringe(){
  global.visibleFringe = P.sortedFringe().slice(0,maxNumberOfVisiblePapers());
}

// Create some svg elements, once and for all
function createStaticElements(){
    // toread
    svg.append("circle")
    .attr("id","toread")
    //.attr("class","shadowOnHover")    // for some reason the circle changes size when adding the shadow...

  // core
  svg.append("rect")
    .attr("id","core")

    // controls
    d3.select("body").append("button")
    .attr("id","updateFringe")
    .attr("class","visControl")
    .text("Update fringe")
    .attr("onclick","fringeView.updateFringe()")
    .attr("disabled","disabled");   // there's nothing to update when the fringe has just been created

    d3.select("body").append("label")
    .attr("id","updateFringeAutomatically")
    .attr("class","visControl")
    .append("input")
    .attr("type","checkbox")
    .attr("onclick","global.updateAutomatically=!global.updateAutomatically; fringeView.updateFringe()")
    d3.select("#updateFringeAutomatically")
    .append("span")
    .text("automatically")

  svg.append("rect")
  .attr("id", "core-divisor");
}

// draw the static elements at their appropriate positions
function drawStaticElements(){
    d3.select("#updateFringe")
    .style("top",updateFringeButtonY()+"px")
    .style("left",updateFringeButtonX()+"px")

    d3.select("#updateFringeAutomatically")
    .style("top",updateFringeButtonY()+3+"px")
    .style("left",updateFringeButtonX()+130+"px")

    // toread
    d3.select("#toread")
    .attr("cx",-parameters.fringeRadius+global.fringeApparentWidth)
    .attr("cy","50%")
    .attr("r",parameters.fringeRadius)
    .style("fill",colors.toread)
    .style("stroke",colors.toreadBorder)
    .style("stroke-width",2)
    
  // clipping path for the left side views
  svg.append("clipPath")
    .attr("id", "left-views")
    .append("circle")
    .attr("cx",-toreadRadius[global.view]+toreadApparentWidth[global.view])
    .attr("cy","50%")
    .attr("r",toreadRadius[global.view]);
}


// Manage papers on the fringe, with or without animating the transitions (TODO)
function manageDynamicElements(animate){

  // core
  var core = d3.select("#core")
    .attr("x", 0)
    .attr("y", global.toReadHeight)
    .attr("width", toreadApparentWidth[global.view])
    .attr("height", window.innerHeight - global.toReadHeight)
    .attr("clip-path", "url(#left-views")
    .style("fill",colors.core[global.view]);

  // coreDivisor
  var drag = d3.behavior.drag()
    .on("drag", function(d, i) {
      global.toReadHeight = d3.event.y;
      d3.select(this).attr("y", d3.event.y);
      core.attr("y", global.toReadHeight);
      core.attr("height", window.innerHeight - global.toReadHeight);
    });

  d3.select("#core-divisor")
    .attr("x", 0)
    .attr("y", global.toReadHeight)
    .attr("width", global.fringeApparentWidth)
    .attr("height", 5)
    .attr("clip-path", "url(#left-views")
//    .attr("draggable", false)  // no drag shadow
    .style("fill", colors.coreDivisor)
    .style("stroke", colors.coreDivisor)
    .style("fill-opacity", 0.5)
    .call(drag);

  

  //------------------DATA JOIN-------------------//
    // Join new data with old elements, if any

    var papers = svg.selectAll(".paper")
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
        .style("fill", function(p) { return fringePaperInternalColor(p); })
        .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })


    zoom0.append("rect")
    .attr("class","card")
    .moveToBackOf(svg)  // eventually we'll have to make these follow the selected papers during animations

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
    .attr("x", function(p) { return fringePaperXCard(p);} )
    .attr("y", function(p) { return fringePaperYCard(p);} )
    .attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    .attr("height",2*parameters.paperMaxRadius)

    t0.select(".externalCitationsCircle")
    .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })
    
    t0.select(".internalCitationsCircle")
    .attr("transform", function(p) { return "translate("+fringePaperX(p)+","+fringePaperY(p)+")"; })    

    // The change of color should occur AFTER the papers have moved to their new positions
    t0.call(endAll, function () {
        // A new transition is generated after all elements of t0 have finished
        var t1=papers.transition().duration(parameters.fringePapersColorTransitionDuration[animate]);

        t1.select(".externalCitationsCircle")
        .style("fill", function(p) { return fringePaperInternalColor(p); })

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

    // the outerNodes (white borders to highlight selected papers) are shown only for the selected papers
    t0.select(".outerNode")
    .attr("cx", function(p) { return fringePaperX(p);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return maxRadius(p)+parameters.paperOuterBorderWidth;} )
    .style("display", function(p) { return p.selected ? "" : "none"; })

    // I really don't understand why this doesn't work on page update (animate=false)
    // Basically the second animation cancels the first one, although the staging works fine when duration>0...
/*   t0.transition().duration(fringePapersColorTransitionDuration[animate])
    .select(".externalCitationsCircle")
    .style("fill", function(d) { return colorFromUpvoters(userData.papers[d].upvoters); })*/
    

    t0.select(".title")
    .attr("x", function(p) { return fringePaperX(p)+parameters.paperMaxRadius+parameters.titleLeftMargin;} )
    .attr("y", function(p) {return fringePaperY(p);} )
    .style("opacity","1")

    /* the following elements are sometimes not visible. we use a fade-in to show and hide them,
    * but it also necessary to remove them from the display when they aren't suppose to be there,
    * otherwise they will impede selection of other elements (as they may be drawn on top of these). */

    t0.select(".metadata")
    .attr("x", function(p) { return fringePaperX(p)+parameters.paperMaxRadius+parameters.titleLeftMargin;} )
    .attr("y", function(p) {return fringePaperY(p)+parameters.metadataYoffset;} )
    .style("opacity", function(p) { return (p.selected && global.zoom>=1) ? 1: 0;})
    .style("display", function(p) { return (p.selected && global.zoom>=1) ? "": "none";})

    t0.selectAll(".abstractWrapper")
    .attr("x", function(p) { return fringePaperX(p)+parameters.paperMaxRadius+parameters.titleLeftMargin;} )
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


// Specify interaction
function bindListeners(){

    d3.selectAll(".shadowOnHover")
    .on("mouseover",function() {
        d3.select(this).attr("filter","url(#drop-shadow)")
    })
    .on("mouseleave",function() {
        d3.select(this).attr("filter","none")
    })

    // highlight nodes and titles
    d3.selectAll(".zoom0")
    .on("mouseover",function() {
        d3.select(this).select(".internalCitationsCircle").attr("filter","url(#drop-shadow)")
        d3.select(this).select(".title").classed("highlighted",true)    // add class
        d3.select(this).select(".card")
        .classed("highlighted",true)
        .attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    })
    .on("mouseleave",function() {
        // remove shadow
        d3.select(this).select(".internalCitationsCircle").attr("filter","none")
        
        // keep the selected elements highlighted
        var nonSelectedOnly=d3.select(this)
        .filter(function(){ 
                // this is ugly as hell, but I don't know how to access d cleanly...
                var res;
                d3.select(this).each(function(p) {
                    res=!p.selected;
                })
                return res;
            })
        nonSelectedOnly.select(".title").classed("highlighted",false)     // remove class
        nonSelectedOnly.select(".card").classed("highlighted",false)     // remove class
    })

    // clicking papers on the fringe translates them to the left
    .on("mousedown",function() {
        var paper=d3.select(this);
        paper.each(function(p) {
            p.selected = !p.selected;

            // Add or remove the paper to the list that will update the fringe
            if(p.selected)
              userData.addNewSelected(p);
            else
              userData.removeSelected(p);

            // Enable or disable the updateFringe button, if new papers have been (de)selected
            if((userData.newSelectedPapers.length>0 || userData.newDeselectedPapers.length>0) && !global.updateAutomatically)
                d3.select("#updateFringe").attr("disabled",null);
            else
                d3.select("#updateFringe").attr("disabled","disabled");

            // Update the vis to move the selected papers left or right
            // (using different animation speeds depending on the zoom level, just because it's pretty)
            switch(global.zoom){
                case 0:
                updateVis(4);
                break;
                case 1:
                case 2:
                updateVis(3);
                break;
                case 3:
                updateVis(2);
                break;
            }
        });
    })

    // After (de)selecting a paper, update the fringe if updateAutomatically is true
    .on("mouseup",function(){

        if(!global.updateAutomatically)
            return;

        // We have to make sure that the animation for "selected" is finished   
        if(!global.animationRunning)
            updateFringe();
        else    
            global.animationWaiting=true; // otherwise we wait for it to end
    })

    // detect zoom in and out
    svg.on("wheel",function(){

        // Do nothing if it is a browser zoom (ctrl+wheel)
        if(d3.event.ctrlKey)
            return;

        // compute the new zoom level
        if(d3.event.deltaY>0){
            if(global.zoom<2)
                global.zoom++;
            else
                global.scrollOffset-=parameters.amountOfVerticalScrolling;
            // if the user keeps scrolling down, this will be interpreted as a scrolling down
        }
        else{
            if(global.scrollOffset<0)
                global.scrollOffset+=parameters.amountOfVerticalScrolling;
            else{
                if(global.zoom>0)
                    global.zoom--;
            }
        }
        console.log("zoom: "+global.zoom)

        // Update the view (quickly), to take into account the new heights of the selected papers
        fringeView.updateVis(2);
    })
}


///////////////     Define public static methods, and return    /////////////

var fringeView = {};

fringeView.initializeVis=initializeVis;
fringeView.updateVis=updateVis;
fringeView.updateFringe=updateFringe;

return fringeView;

})();
