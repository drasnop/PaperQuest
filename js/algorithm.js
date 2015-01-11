/* 
* Compute the fringe and the relevance scores 
*/

var algorithm = (function(){

// Insert, remove or move the papers from the event queue (if any)
function updateFringe(){
  
	for(var doi in userData.queue){
    // the paper has already been moved to its destination (by changing the booleans)
    // propagate this change to its references and citations
    updateConnectivityScores(userData.queue[doi]);
	}
	userData.queue=[];

	computeMinMaxConnectivityScore();
}

/////////////////////	Private	functions	////////////////////////////

// Update the score for all connected papers when inserting/removing a paper
// takes as input an "update" = {doi, from,  to}
function updateConnectivityScores(update){

  console.log("consuming " + update.p.doi + " from " + update.from + " to " + update.to);
  var pSource=update.p;

  // update both (internal) references and citations of current paper
  pSource.internalReferences().concat(pSource.internalCitations())
    .forEach(function(pTarget) {
      // if paper has never been seen before, initialize it and add it to the fringe
      if (pTarget.isNew) {
        pTarget.isNew = false;
        // Added this check because we're hard-coding initial seed
        // papers to the core.  Eventually this check should be
        // removed.
        if (!pTarget.core) {
          pTarget.fringe = true;
        }
        userData.papers[pTarget.doi] = pTarget;
      }

      // update relevance score of this reference/citations
      updatePaper(pTarget, update.from, update.to);

      // remove the paper if it's no longer linked by interesting papers
      if (pTarget.connectivity <= 0) {
        pTarget.isNew = true;
        delete userData.papers[pTarget.doi];
      }
    });
}


///////////////		helper functions	/////////////////////////////

// update the target's score based on the source's paper from and to
// when a new paper is added (initialUpdate), no score is decreased because weight[0]=0
function updatePaper(pTarget, pSourceFrom, pSourceTo){
	pTarget.connectivity -= parameters.weights[pSourceFrom];
	pTarget.connectivity += parameters.weights[pSourceTo];
}

// Fun fact: the colors look exactly the same if we compute min and max from global.visibleFringe instead of P.fringe()...
function computeMinMaxConnectivityScore(){
	global.maxConnectivityScore=d3.max(P.fringe(), function(p) { return p.getTotalconnectivity(); })
	global.minConnectivityScore=d3.min(P.fringe(), function(p) { return p.getTotalconnectivity(); })
	// console.log("minConnectivityScore: "+global.minConnectivityScore+"  maxConnectivityScore: "+global.maxConnectivityScore)
}

///////////////     Define public static methods, and return    /////////////
	
	var algorithm={};
	algorithm.updateFringe=updateFringe;
	return algorithm;

})();
