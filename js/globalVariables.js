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
  // automatically computed by fringeView
  "visibleFringe": [],
  // flag indicating that a long animation is currently running
  "animationRunning": false,
  // flag indicating that another animation is waiting for the current one to complete
  "animationWaiting":false,
  // The y-value at which the to-read list and the core are currently separated
  "toReadHeight": window.innerHeight / 2
};


var userData={ 
    // contains the tags and all useful (non-static) information about the papers that have been visited
    "papers":{},
    // temporary list of the papers that have just been selected; used when updating the fringe
    "newSelectedPapers":[],
    "newDeselectedPapers":[]
}; 


userData.addNewSelected = function(p) {
  var index = userData.newDeselectedPapers.indexOf(p);
  if(index >- 1)
    userData.newDeselectedPapers.splice(index,1);
  else
    userData.newSelectedPapers.push(p);
}

userData.removeSelected = function(p) {
  var index = userData.newSelectedPapers.indexOf(p);
  if(index >- 1)
    userData.newSelectedPapers.splice(index,1);
  else
    userData.newDeselectedPapers.push(p);
}


// debug
userData.computeTotalScore=function() {
  return P.fringe().reduce(function(a, b) {
    return a + b.score;
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
