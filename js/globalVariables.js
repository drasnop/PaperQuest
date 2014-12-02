/*
* Global variables
*/

var global={
    // Current view: 0=core, 1=to read, 2=fringe
    "view":2,
    // Current zoom level: 0=titles only, 1=metadata (authors/conf/date), 2=first line of abstract, 3=full abstract
    "zoom":0,
    // papers dataset, accessed by global.papers[doi]
    "papers":false,
    // automatically computed by fringeView
    "visibleFringe":[]
};


var userData={ 
    // contains the tags and all useful (non-static) information about the papers that have been visited
    "papers":{},
    // temporary list of the papers that have just been selected; used when updating the fringe
    "newSelectedPapers":[],
    "newDeselectedPapers":[]
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
            // decreasing order!
            return userData.papers[b].score-userData.papers[a].score;
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

userData.addNewSelected=function(doi){
    var index=userData.newDeselectedPapers.indexOf(doi);
    if(index>-1)
        userData.newDeselectedPapers.splice(index,1);
    else
        userData.newSelectedPapers.push(doi);
}   

userData.removeSelected=function(doi){
    var index=userData.newSelectedPapers.indexOf(doi);
    if(index>-1)
        userData.newSelectedPapers.splice(index,1);
    else
        userData.newDeselectedPapers.push(doi);
}

userData.getAll=function(){
    return Object.keys(userData.papers);
}

// this should be a method of P
userData.getInternalCitationCount=function(doi){
    return global.papers[doi].citations.length;
}

// this should be a method of P
userData.getTotalCitationCount=function(doi){
    return Math.max(global.papers[doi].citation_count,
        userData.getInternalCitationCount(doi));
}
   
// Return Author1, Author2, Author3 – CHI '96
userData.metadataToString=function(doi){
    var paper=global.papers[doi];
    var string=paper.authors[0];
    for(var i=1; i<paper.authors.length; i++)
        string+= ", " + paper.authors[i];
    string+= " – " + paper.conference + " '" + paper.year.slice(2);
    return string;
}

// Return the i-th line of the abstract (counting from 0 as any good programmer should count)
userData.getLineOfAbstract=function(doi,i){
    return global.papers[doi].abstract.slice(i*charactersPerLine,(i+1)*charactersPerLine);
}

// Counts the number of lines of the abstract, depending on the line width
userData.getNumberOfLineOfAbstract=function(doi){
    return global.papers[doi].abstract.length/charactersPerLine;
}

// debug
userData.computeTotalScore=function(){
    var sum=0;
    userData.getFringe().forEach(function(doi){
        sum+=userData.papers[doi].score;
    });   
    return sum;
}

// debug info
function info(){
    console.log("length: "+userData.getSortedAndPrunedFringe().length+"  total_score: "+userData.computeTotalScore());
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