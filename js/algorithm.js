/* 
* Compute the fringe and the relevance scores 
*/

var algorithm = (function(){

// Initialize the relevance scores, then insert papers from Core, toRead and Selected
function generateFringe(){
	P.all(initializeRelevanceScore);
  P.interesting(updateRelevanceScoresWhenInserting);
}

// Insert the papers that have just been selected, and removes the ones that have been deselected (if any)
function updateFringe(){
	userData.newSelectedPapers.forEach(updateRelevanceScoresWhenInserting);
	userData.newDeselectedPapers.forEach(updateRelevanceScoresWhenRemoving);
	userData.newSelectedPapers=[];
	userData.newDeselectedPapers=[];
}


function updateRelevanceScoresWhenInserting(pSource){
	// pSource is provided to the callback in forEach
	updateRelevanceScores(pSource, true);
}

function updateRelevanceScoresWhenRemoving(pSource){
	updateRelevanceScores(pSource, false);
}


/////////////////////	Private	functions 	////////////////////////////

function initializeRelevanceScore(p) {
	p.score = adjustedCitationCount(p);
	p.upvoters = 0;
}

// Update the score for all papers (not only the ones on the Fringe)
// TODO: refactor
function updateRelevanceScores(pSource, inserting){
	console.log( (inserting?"inserting ":"removing ") + pSource.doi)

  // update both (internal) references and citations of this paper
  pSource.internalReferences().concat(pSource.internalCitations())
    .forEach(function(pTarget) {
      // if paper has never been seen before, initialize it and add it to the fringe
      if (pTarget.isNew) {
        pTarget.isNew = false;
        pTarget.fringe = true;
        initializeRelevanceScore(pTarget);
      }
      // update relevance score of this paper
      updatePaper(pSource, pTarget, inserting);

      // remove the paper if it's no longer linked by interesting papers
      if (pTarget.upvoters <= 0)
        delete userData.papers[pTarget.doi];
    });
}


///////////////		helper functions	/////////////////////////////

function updatePaper(pSource, pTarget, inserting){
	if(inserting){
		pTarget.score+=1;
		pTarget.upvoters+=1;
	}
	else{
		pTarget.score-=1;
		pTarget.upvoters-=1;
	}
}
	
function adjustedCitationCount(p) {
	return Math.log(1 + p.getTotalCitationCount() / (parameters.currentYear - p.year));
}


///////////////     Define public static methods, and return    /////////////
	
	var algorithm={};
	algorithm.generateFringe=generateFringe;
	algorithm.updateFringe=updateFringe;
	algorithm.updateRelevanceScoresWhenInserting=updateRelevanceScoresWhenInserting;
	algorithm.updateRelevanceScoresWhenRemoving=updateRelevanceScoresWhenRemoving;
	return algorithm;

})();
