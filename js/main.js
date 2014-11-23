/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);

sessionManager.loadSession();

userData.fringe.getSelected=function(){
   return this.filter(function(element){
        return element.selected;   
    });
}

userData.getCore=function(){
/*    return userData.papers.filter(function(paper){
        return paper.core;
    });*/
    return userData.papers
}

console.log(userData.fringe.getSelected());
console.log(userData.getCore());

// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.json("data/citeology.json", function(data){
    global.papers=data.papers;

    generateFringe();
    fringeView.initializeVis();
});


// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    fringeView.updateVis();
}