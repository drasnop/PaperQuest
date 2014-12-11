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
  else{
    if(userData.newInterestingPapers.indexOf(p)==-1)
      userData.newInterestingPapers.push(p);
    // otherwise there is no need to add it again   
  }
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