///////////////////   Parameters   /////////////////

var paperMinRadius = 5,
    paperMaxRadius = 15,
    paperInnerWhiteCircleRatio =.4,
    paperOutlineWidth = 4,	// UNUSED - this divided by 2 must be > min radius
    paperMarginBottom = 5,
    titleBaselineOffset = 6,  // depends on font size
    titleXOffset = 5,
    paperXOffsetWhenSelected = - (2*paperMaxRadius - titleXOffset);

// Defines the dimension of each region, index by the current view (core, toread, fringe)
// The apparent width is the horizontal space that we want the region to occupy on the screen
// An appropriate offset for the x-position of the center will be computed as -radius+apparentWidth
var coreRadius = [120,120,120],
    toreadRadius = [2000,2000,2000],
    fringeRadius = [2000,2000,2000],
    coreApparentWidth = [120,120,120],
    fringeApparentWidth = [420,420,420],
    toreadApparentWidth = [420,420,fringeApparentWidth[2]-paperMaxRadius+titleXOffset];

var colors={
	"blue":"#00A1CB",
	"green":"#61AE24",
	"pink":"#D70060",
	"orange":"#F18D05",
	"darkblue":"#113F8C",
	"turquoise":"#01A4A4",	    // This color and all the following are not to be used for the nodes
	"red":"#E54028",	
	"darkgray":"#616161",	
    "toread":"rgb(242, 222, 195)", 
    "toreadBorder":"rgb(242, 210, 166)",
    "core":"rgb(223, 111, 95)"
}

var currentYear=2010;


////////////////    Global variables    //////////////

var view=2; // 0=core, 1=to read, 2=fringe

var userData={
    "core":[
    {
        // Triggers and barriers to customization
        "doi":"10.1145/108844.108867" },
    {
        // Buttons
        "doi":"10.1145/97243.97271" },
    {
        // Medium vs Mechanism
        "doi":"10.1007/978-94-011-0349-7_9" }
    ]}; 

////////////////    Load previous session    //////////////

// Handle local storage of objects
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function saveSession(){
    localStorage.setObject("userData", userData);
    console.log("session saved in localStorage('userData')");
}

var retrievedData=localStorage.getObject("userData");
console.log(retrievedData);

////////////////	   Main rendering       //////////////

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);

// Build the components of the vis, in the appropriate z-index order
d3.tsv("data/SmallDataset.tsv", function(data){
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
        .data(data)
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

    // Initialize interaction & visual appearance
    //createVis();
    drawVis();
    bindListeners();
});


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
        .style("fill","white")

    d3.selectAll(".title")
        .attr("x", function(d,i) { return fringePaperX(i)+paperMaxRadius+titleXOffset;} )
        .attr("y", function(d,i) {return fringePaperY(i)+titleBaselineOffset;} )

    // toread
    d3.selectAll("#toread")
        .attr("cx",-toreadRadius[view]+toreadApparentWidth[view])
        .attr("cy","50%")
        .attr("r",toreadRadius[view])
        .style("fill",colors.toread)
        .style("stroke",colors.toreadBorder)
        .style("stroke-width",2)
    
    // core
    d3.selectAll("#core")
        .attr("cx",-coreRadius[view]+coreApparentWidth[view])
        .attr("cy","50%")
        .attr("r",coreRadius[view])
        .style("fill",colors.core)

    // sidebar
/*    svg.append("rect")
        .attr("x","")
        .attr("y","0")
        .attr("width","100")
        .attr("height","100%")
        .attr("fill",colors.darkgray);*/
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
    var xoffset=-fringeRadius[view]+fringeApparentWidth[view];
	return xoffset+Math.sqrt(Math.pow(fringeRadius[view],2)-Math.pow(h/2-fringePaperY(i),2))+paperMaxRadius;
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
	return colors[keys[ (keys.length-6) * Math.random() << 0]];
}