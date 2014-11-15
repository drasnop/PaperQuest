/* 
* Compute the fringe and the relevance scores 
*/

function computeFringe(){
	userData.fringe=global.papers.slice(0,100);


/*
pseudo-code

// generate first fringe

for each paper P in core, toRead, fringe
	for each reference R in P
		 if R is not in core or toRead 
		 	if fringe doesn't contain R
				add R to fringe
				set R.relevance=ACC
			R.relevance+=w
	for each citation C in P
		idem

// when changing the state of one paper P either in core, toRead or fringe

for each reference R in P
	 if R is not in core or toRead 
	 	// R has to be in the fringe, if the fringe has been initialized.
	 	// but maybe we shouldn't initiliaze the fringe, and instead call update on each of the seed papers
		R.relevance+= w' - w (add new weight, remove previous one)
for each citation C in P
	idem



*/	
}