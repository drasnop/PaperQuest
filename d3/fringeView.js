/*
* Creates, draw and specify interaction for the Fringe global.view
*/


// To create a class with static methods (basically, a namespace)
var fringeView = {}

// Except for the (static) background elements, everything is computed on-the-fly
fringeView.initializeVis=function(){
    fringeView.createStaticElements();
    fringeView.updateVis();
}

// Update the vis after a change of zoom/window size 
fringeView.updateVis=function(){
    fringeView.computeVisibleFringe();
    console.log(userData.visibleFringe.length);
    fringeView.manageDynamicElements();
    fringeView.drawVis();
    fringeView.bindListeners();
}


//////////////////  Drawing functions   ///////////////////////


// Given the current windows dimensions, which papers can be displayed on the Fringe?
fringeView.computeVisibleFringe=function(){
    userData.visibleFringe=userData.fringe.slice(0,fringeView.numberOfVisiblePapers());
}

// Create some svg elements once and for all
fringeView.createStaticElements=function(){
    // toread
    svg.append("circle")
    .attr("id","toread")
    //.attr("class","shadowOnHover")    // for some reason the circle changes size when adding the shadow...

    // core
    svg.append("circle")
    .attr("id","core")
    .attr("class","shadowOnHover")  
}

// Build the components of the vis, in the appropriate z-index order
fringeView.manageDynamicElements=function(){

    // fringe
    var papers = svg.selectAll(".paper")
    .data(userData.visibleFringe)       // what is the selection on this line? svg?

    .enter()
        .append("g")
        .attr("class","paper")

    papers.append("circle")
    .attr("class", "node")
    .style("fill",fringeView.randomColor)  // eventually this style attr should be defined in drawVis based on a tag

    papers.append("circle")
    .attr("class", "innerNode")

    papers.append("text")
    .attr("class", "title")
    .text(function(d,i) {return d.title;} );

    svg.selectAll(".paper")     // I have no idea of what's going on there. Why just paper.exit().remove() doesn't work?
    .data(userData.visibleFringe)
    .exit().remove();
}


// Specify positions and styles
fringeView.drawVis=function(){
    // fringe
    d3.selectAll(".paper")
    .attr("transform",null)    // remove any temporary transformation

    d3.selectAll(".node")
    .attr("cx", function(d,i) { return fringeView.fringePaperX(d,i);} )
    .attr("cy", function(d,i) { return fringeView.fringePaperY(i);} )
    .attr("r", function(d,i) {return fringeView.radius(d.year);} )  

    d3.selectAll(".innerNode")
    .attr("cx", function(d,i) { return fringeView.fringePaperX(d,i);} )
    .attr("cy", function(d,i) { return fringeView.fringePaperY(i);} )
    .attr("r", function(d,i) {return fringeView.radius(d.year)*paperInnerWhiteCircleRatio;} )
    .style("fill","white")

    d3.selectAll(".title")
    .attr("x", function(d,i) { return fringeView.fringePaperX(d,i)+paperMaxRadius+titleXOffset;} )
    .attr("y", function(d,i) {return fringeView.fringePaperY(i)+titleBaselineOffset;} )
    .classed("highlighted", function(d,i) {return d.selected;})

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


// Specify interaction
fringeView.bindListeners=function(){

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
                    res=!d.selected;
                })
                return res;
            })
            .select(".title").attr("font-weight","normal").classed("highlighted",false)     // remove class
        })

    // clicking papers on the fringe translates them to the left
    .on("click",function() {
        var paper=d3.select(this);
        paper.each(function(d,i) {
            d.selected=!d.selected;
        
            // Here it is hard to compute fringePaperX(d,i), because we don't know which i this paper corresponds to
            // (maybe we'll store this eventually,but...)
            // So apply a temporary transform to the entire group
            if(d.selected)
                paper.attr("transform", "translate(" + paperXOffsetWhenSelected + ", 0)")
            else
                paper.attr("transform", null)
        });
    })
}

////////////////    helper functions    //////////////

// Compute X coordinate for the i-th paper on the fringe, based on a circle
fringeView.fringePaperX=function(d,i){
    var h=window.innerHeight;
    var centerXoffset=-fringeRadius[global.view]+fringeApparentWidth[global.view];
    var selectedOffset=d.selected? paperXOffsetWhenSelected : 0 ;
    return centerXoffset+Math.sqrt(Math.pow(fringeRadius[global.view],2)-Math.pow(h/2-fringeView.fringePaperY(i),2))+paperMaxRadius+selectedOffset;
}

// Compute Y coordinate for the i-th paper on the fringe
fringeView.fringePaperY=function(i){
    return paperMaxRadius+i*(2*paperMaxRadius+paperMarginBottom);
}

// Compute how many papers can be displayed on the fringe
// taking into account some space at the bottom to show an update button
fringeView.numberOfVisiblePapers=function(){
    var availableHeight=window.innerHeight-fringeBottomMargin;
    return Math.floor(availableHeight/(2*paperMaxRadius+paperMarginBottom));
}

// Compute a node radius from the value supplied, between min and max
// If we want to display an outline instead of a fill circle, the radius must be smaller
fringeView.radius=function(value){
    return Math.max(paperMinRadius, Math.min(paperMaxRadius,
        currentYear-value));
}

// Return a random color except red or turquoise
fringeView.randomColor=function(){
    var keys=Object.keys(colors.tags);
    return colors.tags[keys[ keys.length * Math.random() << 0]];
}