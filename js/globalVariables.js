/*
* Global variables
*/

var global={
    // Current view: 0=core, 1=to read, 2=fringe
    "view":2,
    // papers dataset, accessed by global.papers[doi]
    "papers":false,
    // automatically computed by fringeView
    "visibleFringe":[]
};


var userData={ 
    // contains the tags and all useful information about the papers that have been visited
    "papers":{},
}; 

userData.getCore=function(){
    return Object.keys(userData.papers).filter(function(doi){
        return userData.papers[doi].core;
    });
}

userData.getFringe=function(){
    return Object.keys(userData.papers).filter(function(doi){
        return userData.papers[doi].fringe;
    });
}

// Return fringe sorted by relevance score
userData.getSortedFringe=function(){
    return userData.getFringe()
        .sort(function(a,b){
            return userData.papers[a].score-userData.papers[b].score;
        });
}

// Return fringe sorted and without the "external" papers
userData.getSortedAndPrunedFringe=function(){
    return userData.getSortedFringe().filter(function(doi){
        return global.papers.hasOwnProperty(doi);
    });
}

userData.getSelected=function(){
    return Object.keys(userData.papers).filter(function(doi){
        return userData.papers[doi].selected;
    });
}

// All the papers of interest to the user
userData.getAllButNonSelected=function(){
    return Object.keys(userData.papers).filter(function(doi){
        return (userData.papers[doi].core || userData.papers[doi].toRead || userData.papers[doi].selected);
    });
}


///////     hard-coded implementation of seed papers    /////////////////

var seedPapers=[
    "10.1145/108844.108867",    // Triggers and barriers to customization
    "10.1145/97243.97271",      // User-tailorable systems: pressing the issues with buttons
    "10.1145/238386.238541"    // User customization of a word processor
]

userData.uploadSeedPapers=function(){
    for(var i in seedPapers){
        console.log("seed paper: "+seedPapers[i])
        if (global.papers.hasOwnProperty(""+seedPapers[i]))      ///////// why is this not working???
            userData.papers[seedPapers[i]]={"core":true};
    }
}