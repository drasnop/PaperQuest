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

// Update the vis, with or without animating the transitions. The callback will be called at the end of all animations
 function updateVis(animate,callback){
    computeVisibleFringe();
    drawStaticElements();
    manageDynamicElements(animate);
    bindListeners();
}

//////////////////  Drawing functions   ///////////////////////


// Given the current windows dimensions, which papers can be displayed on the Fringe?
 function computeVisibleFringe(){
    global.visibleFringe=userData.getSortedAndPrunedFringe().slice(0,numberOfVisiblePapers());
}

// Create some svg elements, once and for all
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
    .attr("onclick","fringeView.updateVis(1)")

    d3.select("body").append("label")
    .attr("id","updateFringeAutomatically")
    .attr("class","visControl")
    .append("input")
    .attr("type","checkbox")
    d3.select("#updateFringeAutomatically")
    .append("span")
    .text("automatically")
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


// Manage papers on the fringe, with or without animating the transitions (TODO)
function manageDynamicElements(animate){

    //------------------DATA JOIN-------------------//
    // Join new data with old elements, if any

    var papers = svg.selectAll(".paper")
        .data(global.visibleFringe, function(d){ return global.visibleFringe.indexOf(d); })
        // using this key function is critical to ensure papers will change position when updating the fringe

    //--------------------ENTER---------------------//
    // Create new elements as needed

    var enteringPapers = papers.enter()
        .append("g")
        .attr("class","paper")

    enteringPapers.append("rect")
    .attr("class","card")

    enteringPapers.append("circle")
    .attr("class", "node")
    .style("fill", function(d) { return colorFromUpvoters(userData.papers[d].upvoters); })

    enteringPapers.append("circle")
    .attr("class", "innerNode")
    .style("fill","white")

    enteringPapers.append("text")
    .attr("class", "title")
    .classed("highlighted", function(d) {return userData.papers[d].selected;})
    .text(function(d) { return global.papers[d].title;} );

    enteringPapers.append("text")
    .attr("class", "metadata")
    .text(function(d) { return global.papers[d].year;} );

    //------------------ENTER+UPDATE-------------------//
    // Appending to the enter selection expands the update selection to include
    // entering elements; so, operations on the update selection after appending to
    // the enter selection will apply to both entering and updating nodes.

    var t0=papers.transition().duration(fringePapersPositionTransitionDuration[animate]).ease(fringePapersTransitionEasing)
    var t1;

    t0.select(".card")
    .attr("x", function(d) { return fringePaperXCard(d);} )
    .attr("y", function(d) { return fringePaperYCard(d);} )
    .attr("width", function(d) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    .attr("height",2*paperMaxRadius)

    t0.select(".node")
    .attr("cx", function(d) { return fringePaperX(d);} )
    .attr("cy", function(d) { return fringePaperY(d);} )
    .attr("r", function(d) {return radius(global.papers[d].citation_count);} ) 
    
    // staging the change of color by chaining transitions
    t0.each("end",function(){
        t1=d3.select(this).transition().duration(fringePapersColorTransitionDuration[animate])
        
        t1.select(".node")
        .style("fill", function(d) { return colorFromUpvoters(userData.papers[d].upvoters); })

        // end of animation callback ------ doesn't work
        t1.each("end",function(){
            console.log("callback")
            if(typeof(callback) === typeof(Function))
                callback();
        })
    })

    // I really don't understand why this doesn't work on page update (animate=false)
    // Basically the second animation cancels the first one, although the staging works fine when duration>0...
/*   t0.transition().duration(fringePapersColorTransitionDuration[animate])
    .select(".node")
    .style("fill", function(d) { return colorFromUpvoters(userData.papers[d].upvoters); })*/
    
    t0.select(".innerNode")
    .attr("cx", function(d) { return fringePaperX(d);} )
    .attr("cy", function(d) { return fringePaperY(d);} )
    .attr("r", function(d) {return radius(global.papers[d].citation_count)*paperInnerWhiteCircleRatio;} )

    t0.select(".title")
    .attr("x", function(d) { return fringePaperX(d)+paperMaxRadius+titleXOffset;} )
    .attr("y", function(d) {return fringePaperY(d)+titleBaselineOffset;} )

    t0.select(".metadata")
    .attr("x", function(d) { return fringePaperX(d)+paperMaxRadius+titleXOffset;} )
    .attr("y", function(d) {return fringePaperY(d)+paperHeights[0]+titleBaselineOffset;} )


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

    // highlight papers
    d3.selectAll(".paper")
    .on("mouseover",function() {
        d3.select(this).select(".node").attr("filter","url(#drop-shadow)")
        d3.select(this).select(".title").classed("highlighted",true)    // add class
        d3.select(this).select(".card")
            .classed("highlighted",true)
            .attr("width", function(d) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    })
    .on("mouseleave",function() {
        // remove shadow
        d3.select(this).select(".node").attr("filter","none")
        
        // keep the selected elements highlighted
        var nonSelectedOnly=d3.select(this)
            .filter(function(){ 
                // this is ugly as hell, but I don't know how to access d cleanly...
                var res;
                d3.select(this).each(function(d){
                    res=!userData.papers[d].selected;
                })
                return res;
            })
        nonSelectedOnly.select(".title").classed("highlighted",false)     // remove class
        nonSelectedOnly.select(".card").classed("highlighted",false)     // remove class
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
            paper.select(".card").attr("x", function(d) { return fringePaperXCard(d);} )
            paper.select(".node").attr("cx", function(d) { return fringePaperX(d);} )
            paper.select(".innerNode").attr("cx", function(d) { return fringePaperX(d);} )
            paper.select(".title").attr("x", function(d) { return fringePaperX(d)+paperMaxRadius+titleXOffset;} )
        
            if(userData.papers[d].selected)
                algorithm.updateRelevanceScoresWhenInserting(d);
            else
                algorithm.updateRelevanceScoresWhenRemoving(d);
        });
    })

    // detect zoom in and out
    svg.on("wheel",function(){

        // first, update the view if this hasn't been done before (slow)
        // unless we want to implement semantic zoom indepently of reordering the fringe, but that would be harder
        /*fringeView.updateVis(1, function(){

            // then, compute the new zoom level
            if(d3.event.wheelDelta<0){
                if(global.zoom<paperHeights.length-1)
                    global.zoom++;
                // if the user keeps scrolling down, this will be interpreted as a scrolling down
            }
            else{
                if(global.zoom>0)
                    global.zoom--;
            }
            console.log("zoom: "+global.zoom)

            // finally, update the view again, to take into account the new heights of the selected papers (fast)
            fringeView.updateVis(2);

        });*/
    
        // first, update the view if this hasn't been done before (slow)
        // unless we want to implement semantic zoom indepently of reordering the fringe, but that would be harder
        fringeView.updateVis(1);
        
        // then, compute the new zoom level
        if(d3.event.wheelDelta<0){
            if(global.zoom<paperHeights.length-1)
                global.zoom++;
            // if the user keeps scrolling down, this will be interpreted as a scrolling down
        }
        else{
            if(global.zoom>0)
                global.zoom--;
        }
        console.log("zoom: "+global.zoom)

        // finally, update the view again, to take into account the new heights of the selected papers (fast)
        fringeView.updateVis(2);
    })
}

////////////////    helper functions    //////////////

// Compute the height of a paper on the fringe, depending on the zoom level and whether it is selected
function fringePaperHeight(d){
    // If the paper is not selected, its height decreases with the zoom level
    if(!userData.papers[d].selected)
        return 2*paperMaxRadius+paperMarginBottom;

    // If the paper is selected, its height increases with the zoom level
    var height=0;
    for(var i=0; i<=global.zoom; i++){
        height+=paperHeights[i];
    }
    return height;
}

// Compute X coordinate for a paper on the fringe, based on a circle
function fringePaperX(d){
    var h=window.innerHeight;
    var centerXoffset=-fringeRadius[global.view]+fringeApparentWidth[global.view];
    var selectedOffset=userData.papers[d].selected? paperXOffsetWhenSelected : 0 ;
    return centerXoffset+Math.sqrt(Math.pow(fringeRadius[global.view],2)-Math.pow(h/2-fringePaperY(d),2))+paperMaxRadius+selectedOffset;
}

// Compute Y coordinate for a paper on the fringe
function fringePaperY(d){
    var index=global.visibleFringe.indexOf(d);
    
    // compute the sum of the height of the papers that are above the current one in the fringe
    var offset=0;
    for(var i=0; i<index; i++){
        offset+=fringePaperHeight(global.visibleFringe[i])
    }   
    
    return offset+paperMaxRadius;
}

// Compute X coordinate for the "card" (the rectangle label) of a paper on the fringe
function fringePaperXCard(d){
    return fringePaperX(d)+paperMaxRadius+titleXOffset;
}

// Compute Y coordinate for the "card" (the rectangle label) of a paper on the fringe
function fringePaperYCard(d){
    return fringePaperY(d)-paperMaxRadius;
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

return fringeView;

})();