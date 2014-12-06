/* 
* Compute the fringe and the relevance scores 
*/

var algorithm = (function(){

// Initialize the relevance scores, then insert papers from Core, toRead and Selected
function generateFringe(){
	userData.getAll().forEach(initializeRelevanceScore);
	userData.getAllButNonSelected().forEach(updateRelevanceScoresWhenInserting);
}

// Insert the papers that have just been selected, and removes the ones that have been deselected (if any)
function updateFringe(){
	userData.newSelectedPapers.forEach(updateRelevanceScoresWhenInserting);
	userData.newDeselectedPapers.forEach(updateRelevanceScoresWhenRemoving);
	userData.newSelectedPapers=[];
	userData.newDeselectedPapers=[];
}


function updateRelevanceScoresWhenInserting(doiSource){
	// doiSource is provided to the callback in forEach
	updateRelevanceScores(doiSource, true);
}

function updateRelevanceScoresWhenRemoving(doiSource){
	updateRelevanceScores(doiSource, false);
}


/////////////////////	Private	functions 	////////////////////////////

function initializeRelevanceScore(doi){
	userData.papers[doi].score=adjustedCitationCount(doi);
	userData.papers[doi].upvoters=0;
}

// Update the score for all papers (not only the ones on the Fringe)
function updateRelevanceScores(doiSource, inserting){
	console.log( (inserting?"inserting ":"removing ") + doiSource)

	// update both (internal) references and citations of this paper
	global.papers[doiSource].references
		.concat(global.papers[doiSource].citations)
		.filter(function(doi){
			return global.papers.hasOwnProperty(doi);
		})
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
	console.log(Math.log(userData.getTotalCitationCount(doi) * (1-.5*(currentYear-global.papers[doi].year)) ))
	return Math.log(userData.getTotalCitationCount(doi) * (1-.5*(currentYear-global.papers[doi].year)) );
}


///////////////     Define public static methods, and return    /////////////
	
	var algorithm={};
	algorithm.generateFringe=generateFringe;
	algorithm.updateFringe=updateFringe;
	algorithm.updateRelevanceScoresWhenInserting=updateRelevanceScoresWhenInserting;
	algorithm.updateRelevanceScoresWhenRemoving=updateRelevanceScoresWhenRemoving;
	return algorithm;

})();
