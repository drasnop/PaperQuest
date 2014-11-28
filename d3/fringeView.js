/*
* Creates, draw and specify interaction for the Fringe global.view
*/

// To create a class with static methods (basically, a namespace)
var fringeView = (function () {

// Except for the (static) background elements, everything is computed on-the-fly
 function initializeVis(){
    createStaticElements();
    updateVis();
}

// Update the vis after a change of zoom/window size 
 function updateVis(){
    computeVisibleFringe();
    drawStaticElements();
    manageDynamicElements();
    bindListeners();
}

function animatedUpdate(){
    console.log("animatedUpdate")
    updateVis()
}

//////////////////  Drawing functions   ///////////////////////


// Given the current windows dimensions, which papers can be displayed on the Fringe?
 function computeVisibleFringe(){
    global.visibleFringe=userData.getSortedAndPrunedFringe().slice(0,numberOfVisiblePapers());
}

// Create some svg elements once and for all
 function createStaticElements(){
    // toread
    svg.append("circle")
    .attr("id","toread")
    //.attr("class","shadowOnHover")    // for some reason the circle changes size when adding the shadow...

    // core
    svg.append("circle")
    .attr("id","core")
    .attr("class","shadowOnHover")  

    // controls
    d3.select("body").append("button")
    .attr("id","updateFringe")
    .attr("class","visControl")
    .text("Update fringe")
    .attr("onclick","fringeView.animatedUpdate()")

    d3.select("body").append("label")
    .attr("id","updateFringeContinuously")
    .attr("class","visControl")
    .append("input")
    .attr("type","checkbox")
    d3.select("#updateFringeContinuously")
    .append("span")
    .text("automatically")
}


function drawStaticElements(){
    d3.select("#updateFringe")
    .style("top",updateFringeButtonY()+"px")
    .style("left",updateFringeButtonX()+"px")

    d3.select("#updateFringeContinuously")
    .style("top",updateFringeButtonY()+3+"px")
    .style("left",updateFringeButtonX()+130+"px")

    // toread
    d3.select("#toread")
    .attr("cx",-toreadRadius[global.view]+toreadApparentWidth[global.view])
    .attr("cy","50%")
    .attr("r",toreadRadius[global.view])
    .style("fill",colors.toread[global.view])
    .style("stroke",colors.toreadBorder[global.view])
    .style("stroke-width",2)
    
    // core
    d3.select("#core")
    .attr("cx",-coreRadius[global.view]+coreApparentWidth[global.view])
    .attr("cy","50%")
    .attr("r",coreRadius[global.view])
    .style("fill",colors.core[global.view])
}


// Build the components of the vis, in the appropriate z-index order
function manageDynamicElements(){

    //------------------DATA JOIN-------------------//
    // Join new data with old elements, if any

    var papers = svg.selectAll(".paper").data(global.visibleFringe)


    //--------------------ENTER---------------------//
    // Create new elements as needed

    var enteringPapers = papers.enter()
        .append("g")
        .attr("class","paper")

    enteringPapers.append("circle")
    .attr("class", "node")
    .style("fill", function(d,i) { return colorFromUpvoters(userData.papers[d].upvoters); })  // eventually this style attr should be defined in drawVis based on a tag

    enteringPapers.append("circle")
    .attr("class", "innerNode")
    .style("fill","white")

    enteringPapers.append("text")
    .attr("class", "title")
    .classed("highlighted", function(d,i) {return userData.papers[d].selected;})
    .text(function(d,i) { return global.papers[d].title;} );


    //------------------ENTER+UPDATE-------------------//
    // Appending to the enter selection expands the update selection to include
    // entering elements; so, operations on the update selection after appending to
    // the enter selection will apply to both entering and updating nodes.

    papers.select(".node")
    .transition().duration("2000").ease("quad-in-out")
    .attr("cx", function(d,i) { return fringePaperX(d);} )
    .attr("cy", function(d,i) { return fringePaperY(d);} )
    .attr("r", function(d,i) {return radius(global.papers[d].citation_count);} )  

    papers.select(".innerNode")
    .transition().duration("2000").ease("quad-in-out")
    .attr("cx", function(d,i) { return fringePaperX(d);} )
    .attr("cy", function(d,i) { return fringePaperY(d);} )
    .attr("r", function(d,i) {return radius(global.papers[d].citation_count)*paperInnerWhiteCircleRatio;} )

    papers.select(".title")
    .transition().duration("2000").ease("quad-in-out")
    .attr("x", function(d,i) { return fringePaperX(d)+paperMaxRadius+titleXOffset;} )
    .attr("y", function(d,i) {return fringePaperY(d)+titleBaselineOffset;} )


    //--------------------EXIT---------------------//
    // Remove old elements as needed.

    papers.exit()     // I have no idea of what's going on there. Why just papers.exit().remove() doesn't work?
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

    // highlight papers
    d3.selectAll(".paper")
    .on("mouseover",function() {
        d3.select(this).select(".node").attr("filter","url(#drop-shadow)")
        d3.select(this).select(".title").classed("highlighted",true)    // add class
    })
    .on("mouseleave",function() {
        d3.select(this).select(".node").attr("filter","none")
        d3.select(this)
            // to keep the selected elements bold
            .filter(function(){ 
                // this is ugly as hell, but I don't know how to access d cleanly...
                var res;
                d3.select(this).each(function(d,i){
                    res=!userData.papers[d].selected;
                    //console.log(global.visibleFringe.indexOf(d))
                })
                return res;
            })
            .select(".title").attr("font-weight","normal").classed("highlighted",false)     // remove class
        })

    // clicking papers on the fringe translates them to the left
    .on("click",function() {
        var paper=d3.select(this);
        paper.each(function(d) {
            userData.papers[d].selected=!userData.papers[d].selected;

            // Updates the position of each element (so far I haven't found a way to simply offset the group, 
            // except by applying a transform to it, but this is not great (problems if redrawing in the meantime)
            // We need the index in the original list (visibleFringe), because here paper.each has only one element
            var i=userData.papers[d].index;
            paper.select(".node").attr("cx", function(d) { return fringePaperX(d);} )
            paper.select(".innerNode").attr("cx", function(d) { return fringePaperX(d);} )
            paper.select(".title").attr("x", function(d) { return fringePaperX(d)+paperMaxRadius+titleXOffset;} )
        
            if(userData.papers[d].selected)
                algorithm.updateRelevanceScoresWhenInserting(d);
            else
                algorithm.updateRelevanceScoresWhenRemoving(d);
        });
    })
}

////////////////    helper functions    //////////////

// Compute X coordinate for the i-th paper on the fringe, based on a circle
function fringePaperX(d){
    var h=window.innerHeight;
    var centerXoffset=-fringeRadius[global.view]+fringeApparentWidth[global.view];
    var selectedOffset=userData.papers[d].selected? paperXOffsetWhenSelected : 0 ;
    return centerXoffset+Math.sqrt(Math.pow(fringeRadius[global.view],2)-Math.pow(h/2-fringePaperY(d),2))+paperMaxRadius+selectedOffset;
}

// Compute Y coordinate for the i-th paper on the fringe
function fringePaperY(d){
    var index=global.visibleFringe.indexOf(d);
    console.log(index)
    return paperMaxRadius+index*(2*paperMaxRadius+paperMarginBottom);
}

// Compute how many papers can be displayed on the fringe
// taking into account some space at the bottom to show an update button
function numberOfVisiblePapers(){
    var availableHeight=window.innerHeight-fringeBottomMargin;
    return Math.floor(availableHeight/(2*paperMaxRadius+paperMarginBottom));
}

function updateFringeButtonY(){
    return window.innerHeight-2*paperMaxRadius-paperMarginBottom;
}

// Compute the horizontal position of the updateFringe button
function updateFringeButtonX(){
    var h=window.innerHeight;
    var centerXoffset=-fringeRadius[global.view]+fringeApparentWidth[global.view];
    return centerXoffset+Math.sqrt(Math.pow(fringeRadius[global.view],2)-Math.pow(h/2-updateFringeButtonY(),2))+paperMaxRadius+100;
}

// Compute a node radius from the citation count supplied, between min and max
// So far I'm interpolating with a sqrt, to emphasize the differences between 0 citations and a few
function radius(citationCount){
    return Math.min(paperMaxRadius, 
        paperMinRadius+(paperMaxRadius-paperMinRadius)*Math.sqrt(citationCount/citationCountCutoff));
}

// Return a random color except red or turquoise
function randomColor(){
    var keys=Object.keys(colors.tags);
    return colors.tags[keys[ keys.length * Math.random() << 0]];
}

function colorFromUpvoters(n){
    if(n>5)
        return colors.tags[4];
    return colors.tags[n-1];  // between 1..4
}

///////////////     Define public static methods, and return    /////////////

var fringeView = {};

fringeView.initializeVis=initializeVis;
fringeView.updateVis=updateVis;
fringeView.animatedUpdate=animatedUpdate;

return fringeView;

})();