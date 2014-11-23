/* 
* Compute the fringe and the relevance scores 
*/

function computeFringe(){
	userData.fringe=global.papers.slice(0,100);
}

function updateFringe(){
	console.log("updateFringe()");
}

/*
pseudo-code

// all the papers that matter to the user
visitedPapers = core + toRead + fringe (which contains selected)

// all the papers that impact the computation of the relevance score
interestSet = core + toRead + selected

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


///////////////		helper functions	/////////////////////////////

function hasPaperBeenVisited(doi)
	core, toRead, fringe

function adjustedCitationScore(doi)

function updateWeight(doiTarget, doiSource)



*/	