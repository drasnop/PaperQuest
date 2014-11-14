/*
* Creates, draw and specify interaction for the Fringe global.view
*/

// To creat a class with public methods
var fringeView={

// Build the components of the vis, in the appropriate z-index order
createVis:function(){
    // toread
    svg.append("circle")
    .attr("id","toread")
        //.attr("class","shadowOnHover")    // for some reason the circle changes size when adding the shadow...

    // core
    svg.append("circle")
    .attr("id","core")
    .attr("class","shadowOnHover")

    // fringe
    var papers = svg.selectAll(".paper")
    .data(global.papers)
    .enter()
    .append("g")
    .attr("class","paper")
    .attr("selected",0)

    papers.append("circle")
    .attr("class", "node")
        .style("fill",randomColor)  // eventually this style attr should be defined in drawVis

        papers.append("circle")
        .attr("class", "innerNode")

        papers.append("text")
        .attr("class", "title")
        .text(function(d,i) {return d.title;} )
    }


// Specify positions and styles
drawVis:function(){
    // fringe
    d3.selectAll(".node")
    .attr("cx", function(d,i) { return fringePaperX(i);} )
    .attr("cy", function(d,i) { return fringePaperY(i);} )
    .attr("r", function(d,i) {return radius(d.year);} )  

    d3.selectAll(".innerNode")
    .attr("cx", function(d,i) { return fringePaperX(i);} )
    .attr("cy", function(d,i) { return fringePaperY(i);} )
    .attr("r", function(d,i) {return radius(d.year)*paperInnerWhiteCircleRatio;} )
    .style("fill","white")

    d3.selectAll(".title")
    .attr("x", function(d,i) { return fringePaperX(i)+paperMaxRadius+titleXOffset;} )
    .attr("y", function(d,i) {return fringePaperY(i)+titleBaselineOffset;} )

    // toread
    d3.selectAll("#toread")
    .attr("cx",-toreadRadius[global.view]+toreadApparentWidth[global.view])
    .attr("cy","50%")
    .attr("r",toreadRadius[global.view])
    .style("fill",colors.toread[global.view])
    .style("stroke",colors.toreadBorder[global.view])
    .style("stroke-width",2)
    
    // core
    d3.selectAll("#core")
    .attr("cx",-coreRadius[global.view]+coreApparentWidth[global.view])
    .attr("cy","50%")
    .attr("r",coreRadius[global.view])
    .style("fill",colors.core[global.view])
}


// Specify interaction
bindListeners:function(){

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
        d3.select(this).select(".title").attr("font-weight","bold").style("fill","#444").style("letter-spacing","normal")
    })
    .on("mouseleave",function() {
        d3.select(this).select(".node").attr("filter","none")
        d3.select(this)
            // to keep the selected elements bold
            .filter(function(){ return d3.select(this).attr("selected")==0;})
            .select(".title").attr("font-weight","normal").style("fill","#222").style("letter-spacing",".54px")
        })

    // clicking papers on the fringe translates them to the left
    .on("click",function() {
        var paper=d3.select(this)
        console.log(paper.attr("selected"))
        if(paper.attr("selected")==0){
            paper.attr("transform", "translate(" + paperXOffsetWhenSelected + ", 0)")
            paper.attr("selected",1)
        }
        else{
            paper.attr("transform","matrix(1 0 0 1 0 0)")
            paper.attr("selected",0)
        }
    })
}


////////////////    (private) helper functions    //////////////

// Compute X coordinate for the i-th paper on the fringe, based on a circle
var fringePaperX=function(i){
    var h=window.innerHeight;
    var xoffset=-fringeRadius[global.view]+fringeApparentWidth[global.view];
    return xoffset+Math.sqrt(Math.pow(fringeRadius[global.view],2)-Math.pow(h/2-fringePaperY(i),2))+paperMaxRadius;
}

// Compute Y coordinate for the i-th paper on the fringe
var fringePaperY=function(i){
    return paperMaxRadius+i*(2*paperMaxRadius+paperMarginBottom);
}

// Compute a node radius from the value supplied, between min and max
// If we want to display an outline instead of a fill circle, the radius must be smaller
var radius=function(value){
    return Math.max(paperMinRadius, Math.min(paperMaxRadius,
        currentYear-value));
}

// Return a random color except red or turquoise
var randomColor=function(){
    var keys=Object.keys(colors.tags);
    return colors.tags[keys[ keys.length * Math.random() << 0]];
}

};