/*
* Global variables
*/
var defaultView = 2;

var global={
  // Current x position of the fringe (distinguishes Core&ToRead from Fringe view)
  "fringeApparentWidth": parameters.fringeApparentWidthMin,
  // Current zoom level: 0=titles only, 1=metadata (authors/conf/date), 2=first line of abstract, 3=full abstract
  "zoom": 0,
  // Vertical offset used to scroll the fringe
  "scrollOffset": 0,
  // whether to update the fringe as soon as the mouse button is realeased, when selecting a paper
  "updateAutomatically": false,
  // papers dataset, accessed by global.papers[doi]
  "papers": false,
  // medians of the maximal normalized citation counts for each year
  "medians":[],
  // current maximal connectivity score, computed every time the fringe is updated
  "maxConnectivityScore":1,
  // automatically computed by view
  "visibleFringe": [],
  // flag indicating that a long animation is currently running
  "animationRunning": false,
  // flag indicating that another animation is waiting for the current one to complete
  "animationWaiting":false,
  // The y-value at which the to-read list and the core are currently separated
  "toReadHeight": window.innerHeight / 2,

  // variables intended for exploratory use: butterfly vs halfmoon
  "butterfly":true,
  // color.shadeDifferenceInternalExternal can be set to 0
  // whether the fringe should be rounded
  "circular":true,
  // The paper that's currently interactive (menu is showing)
  "activePaper": null
};

global.switchEncoding = function(){
    global.butterfly= !global.butterfly;
    d3.select("#fringe-papers").selectAll(".paper").remove()
    view.initializeVis();
}

// Compute the median maximal normalized citation count for each year
global.computeMedianMaximalNormalizedCitationCountsPerYear=function(){

  var data=[];
  for(var doi in global.papers){
    var p=global.papers[doi];
    var MNCC=Math.max(Math.min(1,p.citation_count/parameters.externalCitationCountCutoff),
            Math.min(1,p.citations.length/parameters.internalCitationCountCutoff))
    data.push({
      "x":global.papers[doi].year,
      "y": MNCC
    })
  }
  
  var temp=computeMedians(data);

  // Format the resulting array in a more useful form
  global.medians=[];
  for(var i in temp){
    global.medians[temp[i].x]=temp[i].y;
  }
}

var userData={ 
    // contains the tags and all useful (non-static) information about the papers that have been visited
    "papers":{},
    // temporary list of the papers that have just been selected; used when updating the fringe
    "newInterestingPapers":[],
    "newUninterestingPapers":[]
}; 


userData.addNewInteresting = function(p) {
  var index = userData.newUninterestingPapers.indexOf(p);
  if(index >- 1)
    userData.newUninterestingPapers.splice(index,1);
  else
    userData.newInterestingPapers.push(p);
}

userData.removeInteresting = function(p) {
  var index = userData.newInterestingPapers.indexOf(p);
  if(index >- 1)
    userData.newInterestingPapers.splice(index,1);
  else
    userData.newUninterestingPapers.push(p);
}


// debug
userData.computeTotalScore=function() {
  return P.fringe().reduce(function(a, b) {
    return a + b.getRelevanceScore();
  }, 0);
}

// debug info
function info(){
    console.log("length: "+P.getSortedFringe().length+"  total_score: "+userData.computeTotalScore());
}

///////     hard-coded set of seed papers    /////////////////

var seedPapers=[
    "10.1145/108844.108867",    // Triggers and barriers to customization
    "10.1145/97243.97271",      // User-tailorable systems: pressing the issues with buttons
    "10.1145/238386.238541"    // User customization of a word processor
]
