/* 
* Compute the fringe and the relevance scores 
*/

var algorithm = (function(){

function generateFringe(){
	userData.getAll().forEach(initializeRelevanceScore);
	userData.getAllButNonSelected().forEach(updateRelevanceScoresWhenInserting);
}

// this is probably useless
function updateFringe(){
	fringeView.updateVis();
}


/////////////////////	Private	functions 	////////////////////////////

function initializeRelevanceScore(doi){
	userData.papers[doi].score=adjustedCitationCount(doi);
	userData.papers[doi].upvoters=0;
}

// doiSource is provided by the callback in forEach
function updateRelevanceScoresWhenInserting(doiSource){
	updateRelevanceScores(doiSource, true);
}

function updateRelevanceScoresWhenRemoving(doiSource){
	updateRelevanceScores(doiSource, false);
}

// Update the score for all papers (not only the ones on the Fringe)
function updateRelevanceScores(doiSource, inserting){
	console.log( (inserting?"inserting ":"removing ") + doiSource)

	// update both references and citations of this paper
	global.papers[doiSource].references
		.concat(global.papers[doiSource].citations)
		.forEach(function(doiTarget){
			// if paper has never been seen before, add it to the fringe
			if (!userData.papers.hasOwnProperty(doiTarget)) {
				userData.papers[doiTarget]={"fringe":true};
				initializeRelevanceScore(doiTarget);
			}
			// update relevance score of this paper
			updatePaper(doiSource,doiTarget,inserting);

			if(userData.papers[doiTarget].upvoters<=0)
				delete userData.papers[doiTarget];
		})
}


///////////////		helper functions	/////////////////////////////

function updatePaper(doiSource, doiTarget,inserting){
	if(inserting){
		userData.papers[doiTarget].score+=1;
		userData.papers[doiTarget].upvoters+=1;
	}
	else{
		userData.papers[doiTarget].score-=1;
		userData.papers[doiTarget].upvoters-=1;
	}
}
	
function adjustedCitationCount(doi){
	return 0;
}


///////////////     Define public static methods, and return    /////////////
	
	var algorithm={};
	algorithm.generateFringe=generateFringe;
	algorithm.updateRelevanceScoresWhenInserting=updateRelevanceScoresWhenInserting;
	algorithm.updateRelevanceScoresWhenRemoving=updateRelevanceScoresWhenRemoving;
	return algorithm;

})();
