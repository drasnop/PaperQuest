/*
* Parameters required for building the visualization in d3.
* All the other appearance parameters are defined in CSS.
*/

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