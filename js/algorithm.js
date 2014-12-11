/* 
* Compute the fringe and the relevance scores 
*/

var algorithm = (function(){

// Initialize the relevance scores, then insert papers from Core, toRead and Selected
function generateFringe(){
	P.all(initializeConnectivityScore);
  	P.interesting(updateRelevanceScoresWhenInserting);
  	computeMinMaxConnectivityScore();
}

// Insert the papers that have just been selected, and removes the ones that have been deselected (if any)
function updateFringe(){
	userData.newInterestingPapers.forEach(updateRelevanceScoresWhenInserting);
	userData.newUninterestingPapers.forEach(updateRelevanceScoresWhenRemoving);
	userData.newInterestingPapers=[];
	userData.newUninterestingPapers=[];
	computeMinMaxConnectivityScore();
}


function updateRelevanceScoresWhenInserting(pSource){
	// pSource is provided to the callback in forEach
	updateRelevanceScores(pSource, true);
}

function updateRelevanceScoresWhenRemoving(pSource){
	updateRelevanceScores(pSource, false);
}


/////////////////////	Private	functions 	////////////////////////////

function initializeConnectivityScore(p) {
	p.connectivity = 0;
}

// Update the score for all connected papers when inserting/removing a paper
// TODO: refactor
function updateRelevanceScores(pSource, inserting){
	console.log( (inserting?"inserting ":"removing ") + pSource.doi + " into "
	 + (pSource.selected? "selected": (pSource.toread? "toread": (pSource.core? "core":"fringe"))) )

  // update both (internal) references and citations of this paper
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
        initializeConnectivityScore(pTarget);
      }

      // update relevance score of this paper
      updatePaper(pSource, pTarget, inserting);

      // remove the paper if it's no longer linked by interesting papers
      if (pTarget.connectivity <= 0) {
        pTarget.isNew = true;
        delete userData.papers[pTarget.doi];
      }
    });
}


///////////////		helper functions	/////////////////////////////

function updatePaper(pSource, pTarget, inserting){
	if(inserting)
		pTarget.connectivity+=connectionWeight(pSource);
	else
		pTarget.connectivity-=connectionWeight(pSource);
}

function connectionWeight(paper){
	if(paper.core)
		return parameters.coreWeight;
	if(paper.toRead)
		return parameters.toReadWeight;
	return parameters.selectedWeight;
}

function computeMinMaxConnectivityScore(){
	global.maxConnectivityScore=d3.max(P.fringe(), function(p) { return p.getTotalconnectivity(); })
	global.minConnectivityScore=d3.min(P.fringe(), function(p) { return p.getTotalconnectivity(); })
	//console.log("minConnectivityScore: "+global.minConnectivityScore+"  maxConnectivityScore: "+global.maxConnectivityScore)
}

///////////////     Define public static methods, and return    /////////////
	
	var algorithm={};
	algorithm.generateFringe=generateFringe;
	algorithm.updateFringe=updateFringe;
	algorithm.updateRelevanceScoresWhenInserting=updateRelevanceScoresWhenInserting;
	algorithm.updateRelevanceScoresWhenRemoving=updateRelevanceScoresWhenRemoving;
	return algorithm;

})();
