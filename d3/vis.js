///////////////////   Parameters   /////////////////

var paperMinRadius = 5,
    paperMaxRadius = 15,
    paperInnerWhiteCircleRatio =.4,
    paperOutlineWidth = 4,	// UNUSED - this divided by 2 must be > min radius
    paperMarginBottom = 5,
    titleBaselineOffset = 6,  // depends on font size
    titleXOffset = 5;

// horizontal sizes of the different regions based on the current view (core, toread, fringe)
var coreSize = [1000,200,120],
	toreadSize = [200,1000,300],
	fringeRadius = 2000,
	fringeXOffset = -(fringeRadius-coreSize[2]-toreadSize[2]);


var colors={
	"blue":"#00A1CB",
	"green":"#61AE24",
	"pink":"#D70060",
	"orange":"#F18D05",
	"darkblue":"#113F8C",
	"turquoise":"#01A4A4",	// not to be used for the nodes
	"red":"#E54028",	// not to be used for the nodes
	"darkgray":"#616161"	// not to be used for the nodes
}

var currentYear=2010;


////////////////	Global variables    //////////////

var view=2;	// 0=core, 1=to read, 2=fringe


////////////////	Main rendering      //////////////

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);

// Build the components of the vis
d3.tsv("data/SmallDataset.tsv", function(data){
    // fringe
    var papers = svg.selectAll(".paper")
        .data(data)
    .enter()
    .append("g")
        .attr("class","paper")

    papers.append("circle")
        .attr("class", "node")
        .attr("fill",randomColor)  // eventually this style attr should be defined in drawVis
    
    papers.append("circle")
        .attr("class", "innerNode")
    
    papers.append("text")
        .attr("class", "title")
        .text(function(d,i) {return d.title;} )

    // core
    svg.append("circle")
        .attr("class","core")

    bindListeners();
    drawVis();
});

function bindListeners(){
    d3.selectAll(".paper")
    .on("mouseover",function() {
        d3.select(this).select(".node").attr("filter","url(#drop-shadow)")
        d3.select(this).select(".title").attr("font-weight","bold")
    })
    .on("mouseleave",function() {
        d3.select(this).select(".node").attr("filter","none")
        d3.select(this).select(".title").attr("font-weight","normal")
    })  
}

function drawVis(){
    // fringe
    d3.selectAll(".node")
        .attr("cx", function(d,i) { return fringePaperX(i);} )
        .attr("cy", function(d,i) { return fringePaperY(i);} )
        .attr("r", function(d,i) {return radius(d.year);} )  

    d3.selectAll(".innerNode")
        .attr("cx", function(d,i) { return fringePaperX(i);} )
        .attr("cy", function(d,i) { return fringePaperY(i);} )
        .attr("r", function(d,i) {return radius(d.year)*paperInnerWhiteCircleRatio;} )
        .attr("fill","white")

    d3.selectAll(".title")
        .attr("x", function(d,i) { return fringePaperX(i)+paperMaxRadius+titleXOffset;} )
        .attr("y", function(d,i) {return paperMaxRadius+titleBaselineOffset+i*(2*paperMaxRadius+paperMarginBottom);} )
    
    // core
    d3.selectAll(".core")
        .attr("cx",0)
        .attr("cy","50%")
        .attr("r",coreSize[view])
        .attr("fill",colors.red)

    // sidebar
/*    svg.append("rect")
        .attr("x","")
        .attr("y","0")
        .attr("width","100")
        .attr("height","100%")
        .attr("fill",colors.darkgray);*/
}

// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    drawVis();
}


////////////////	Helper functions    //////////////

// Compute X coordinate for the i-th paper on the fringe, based on a circle
function fringePaperX(i){
	var h=window.innerHeight;
	return fringeXOffset+Math.sqrt(Math.pow(fringeRadius,2)-Math.pow(h/2-fringePaperY(i),2))+paperMaxRadius;
}

// Compute Y coordinate for the i-th paper on the fringe
function fringePaperY(i){
	return paperMaxRadius+i*(2*paperMaxRadius+paperMarginBottom);
}

// Compute a node radius from the value supplied, between min and max
// If we want to display an outline instead of a fill circle, the radius must be smaller
function radius(value){
	return Math.max(paperMinRadius, Math.min(paperMaxRadius,
		currentYear-value));
}

// Return a random color except red or turquoise
function randomColor(){
	var keys=Object.keys(colors);
	return colors[keys[ (keys.length-2) * Math.random() << 0]];
}