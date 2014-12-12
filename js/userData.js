var userData={ 
    // contains the tags and all useful (non-static) information about the papers that have been visited
    "papers":{},
    // temporary list of the papers that have just been selected; used when updating the fringe
    "newInterestingPapers":[],
    "newUninterestingPapers":[],
    // [paper]={doi, from, to}  -- doi is for debug only
    // 0=unknown, 1=fringe, 2=toread, 3=core
    "queue":[]
}; 


userData.addToQueue = function(p,from,to){
/*  for(var i in userData.queue){
    // if a symetrical operation exists in the queue, remove it
    // not actually required for the algorithm update, but nice to know when the queue is empty
    if(userData.queue[i].p === p
         && userData.queue[i].from == to
         && userData.queue[i].to == from){
      userData.queue.splice(i,1);
    }
  }*/

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
  else{
    if(userData.newUninterestingPapers.indexOf(p)==-1)
      userData.newUninterestingPapers.push(p);
    // otherwise there is no need to add it again   
  }
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