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


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.tsv("data/SmallDataset.tsv", function(data){
    createVis(data);
    drawVis();
    bindListeners();
});


// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    drawVis();
}