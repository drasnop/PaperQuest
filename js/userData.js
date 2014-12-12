var userData={ 
    // contains the tags and all useful (non-static) information about the papers that have been visited
    "papers":{},
    // waiting queue for the papers that will influence the algorithm: [doi]={doi, from, to}
    // 0=unknown, 1=fringe, 2=toread, 3=core
    "queue":[]
}; 


userData.addToQueue = function(p,from,to){

  if(userData.queue[p.doi] === undefined){
    userData.queue[p.doi]={"doi":p.doi, "from":from, "to":to};
  }
  else{
    // update the path of this paper to a new destination
    if(userData.queue[p.doi].to == from){
      userData.queue[p.doi].to = to;

      // if back to original position, remove from queue
      if(userData.queue[p.doi].to == userData.queue[p.doi].from)
        delete userData.queue[p.doi];
    }
    else
      console.log("this should never happen")
  }
}

userData.isQueueEmpty = function(){
  return Object.keys(userData.queue).length == 0;
}

// debug
userData.showQueue = function(){
  for( var i in userData.queue)
    console.log(userData.queue[i]);
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