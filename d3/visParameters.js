/*
* Parameters required for building the visualization in d3.
* All the other appearance parameters are defined in CSS.
*/

var paperMinRadius = 0,
    paperMaxRadius = 15,
    paperInnerWhiteCircleRatio =.4,     // deprecated
    paperOuterBorderWidth = 4,
    negativeInternalMargin = -3,        // between the title and the metadata (to create visual grouping)
    paperMarginBottom = 1,              // between on paper and the next (again, to create visual grouping)
    titleLeftMargin = 5,
    paperXOffsetWhenSelected = - (2*paperMaxRadius - titleLeftMargin),
    papersEnteringDistance = 60,        // how far to the right are paper that come in and out of the fringe (not used yet)
    charactersPerLine = 120,            // [deprecated]
    abstractLineWidth = 800,            // so far used only for wrapping the text of the abstract
    fringeBottomMargin = 30;    // to leave room for the "update" button

// Defines 3 types of animation: none, slow, fast, very fast
var fringePapersTransitionEasing="quad-in-out",
    fringePapersPositionTransitionDuration=[0,1000,450,250,120],
    fringePapersColorTransitionDuration=[0,500,0,0,0];

// heights of a paper title, authors, first line of the abstract, rest of the abstract (the latter will be made dynamic in the future)
var paperHeights = [2*paperMaxRadius, 1.5*paperMaxRadius, 1.5*paperMaxRadius, 1.2*paperMaxRadius];

// Defines the dimension of each region, index by the current view (core, toread, fringe)
// The apparent width is the horizontal space that we want the region to occupy on the screen
// An appropriate offset for the x-position of the center will be computed as -radius+apparentWidth
var coreRadius = [120,120,120],
    toreadRadius = [2000,2000,2000],
    fringeRadius = [2000,2000,2000],
    coreApparentWidth = [120,120,120],
    fringeApparentWidth = [420,420,420],
    toreadApparentWidth = [420,420,fringeApparentWidth[2]-paperMaxRadius+titleLeftMargin];

var colors={
    // orange, green, blue, pink, darkblue
    "tags":["#F18D05","#61AE24","#00A1CB","#D70060","#113F8C"],
	// thése two colors are pretty, but probably shouldn't be used for tags (too similar)
    "turquoise":"#01A4A4",	    
	"red":"#E54028",		
    // background color of each region based on the current view
    "core":["rgb(223, 111, 95)","rgb(223, 111, 95)","rgb(223, 111, 95)"],
    "toread":["rgb(242, 222, 195)","rgb(242, 222, 195)","rgb(242, 222, 195)"], 
    "toreadBorder":["rgb(242, 210, 166)","rgb(242, 210, 166)","rgb(242, 210, 166)"]
}

var currentYear=2010; // 2010 for the citeology dataset...
var citationCountCutoff=150;