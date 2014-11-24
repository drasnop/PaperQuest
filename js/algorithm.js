/* 
* Compute the fringe and the relevance scores 
*/

function generateFringe(){
	userData.getAll().forEach(initializeRelevanceScore);
	userData.getAllButNonSelected().forEach(updateRelevanceScoresWhenInserting);
}

function updateFringe(){
	fringeView.updateVis();
}

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

/*
pseudo-code

// call this function everytime a paper is added to the interest set
function updateRelevanceScoresWhenInserting(P)
	for each reference R in P
		if visitedPapers doesn't contain R
			add R to fringe
			set R.relevance=ACC
		R.relevance+=w[P.type]
	for each citation C in P
		idem

// call this function everytime a paper moves inside the interest set
function updateRelevanceScoresWhenMoving(P)
	for each reference R in P
		// in theory all its references and citations are already known
		// Maybe there is no performance gain in separating these two update functions,
		// if checking for existance of R in visitedPapers has the same cost as doing knowPapers.R.relevance
		R.relevance+=w[P.type]
	for each citation C in P
		idem

// generate first fringe
for each paper P in core, toRead, fringe
	updateRelevanceScoresWhenInserting(P)
*/

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