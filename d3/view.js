 /*
* Creates, draw and specify interaction for the Fringe
*/

// To create a class with static methods (basically, a namespace)
var view = (function () {

var leftViewClipPath;

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

function manageDynamicElements(animate){
    return view.manageDynamicElements(animate);
}

// Create some svg elements, once and for all
function createStaticElements(){
  // toread
  svg.append("circle")
    .attr("id","toread")
    //.attr("class","shadowOnHover")    // for some reason the circle changes size when adding the shadow...

  var arc = d3.svg.arc()
    .innerRadius(parameters.fringeRadius - 2)
    .outerRadius(parameters.fringeRadius + 2)
    .startAngle(0)
    .endAngle(3);

  svg.append("g")
    .attr("id", "fringe-separator")
    .append("path")
    .attr("d", arc);

  // core
  svg.append("rect")
    .attr("id","core")

    // controls
    d3.select("body").append("button")
    .attr("id","updateFringe")
    .attr("class","visControl")
    .text("Update fringe")
    .attr("onclick","view.updateFringe()")
    .attr("disabled","disabled");   // there's nothing to update when the fringe has just been created

    d3.select("body").append("label")
    .attr("id","updateFringeAutomatically")
    .attr("class","visControl")
    .append("input")
    .attr("type","checkbox")
    .attr("onclick","global.updateAutomatically=!global.updateAutomatically; view.updateFringe()")
    d3.select("#updateFringeAutomatically")
    .append("span")
    .text("automatically")

  svg.append("rect")
    .attr("id", "core-separator");

  // clipping path for the left side views
  leftViewClipPath = svg.append("clipPath")
    .attr("id", "left-views")
    .append("circle");

    svg.append("g")
    .attr("id","fringe-papers")
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
    .attr("cx", -parameters.fringeRadius + global.fringeApparentWidth)
    .attr("cy","50%")
    .attr("r",parameters.fringeRadius)
    .style("fill",colors.toread)
    .style("stroke",colors.toreadBorder)
    .style("stroke-width",2)

  leftViewClipPath
    .attr("cx",-parameters.fringeRadius + global.fringeApparentWidth)
    .attr("cy","50%")
    .attr("r",parameters.fringeRadius);

  // core
  var core = d3.select("#core")
    .attr("x", 0)
    .attr("y", global.toReadHeight)
    .attr("width", global.fringeApparentWidth)
    .attr("height", window.innerHeight - global.toReadHeight)
    .attr("clip-path", "url(#left-views)")
    .style("fill",colors.core);

  // coreSeparator
  var dragCore = d3.behavior.drag()
    .on("drag", function(d, i) {
      global.toReadHeight = d3.event.y;
      d3.select(this).attr("y", d3.event.y);
      core.attr("y", global.toReadHeight);
      core.attr("height", window.innerHeight - global.toReadHeight);
    });

  d3.select("#core-separator")
    .attr("x", 0)
    .attr("y", global.toReadHeight)
    .attr("width", window.innerWidth)
    .attr("height", 5)
    .attr("clip-path", "url(#left-views)")
//    .attr("draggable", false)  // no drag shadow
    .style("fill", colors.coreDivisor)
    .style("stroke", colors.coreDivisor)
    .style("fill-opacity", 0.5)
    .call(dragCore);

  // fringeSeparator
  var dragFringe = d3.behavior.drag()
    .on("drag", function(d, i) {
      global.fringeApparentWidth = d3.event.x;
      updateVis(0);
    });

  d3.select("#fringe-separator")
    .attr("transform", "translate(" + (-parameters.fringeRadius + global.fringeApparentWidth) + "," + (window.innerHeight / 2) + ")")
    .style("fill", colors.toreadBorder)
    .call(dragFringe);
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
        view.updateVis(2);
    })
}


///////////////     Define public static methods, and return    /////////////

var view = {};

view.initializeVis=initializeVis;
view.updateVis=updateVis;
view.updateFringe=updateFringe;

return view;

})();
