 /*
* Creates, draw and specify interaction for the Fringe
*/

// To create a class with static methods (basically, a namespace)
var view = (function () {

var leftViewClipPath;
var menuTimeout = null;

// Except for the (static) background elements, everything is computed on-the-fly
function initializeView(createStatic){
  if(createStatic)
    createStaticElements();
  updateView(0);   //don't animate at creation
}

// Update the vis, with different animation speeds. If animate=0, no animation.
function updateView(animate){
  global.computeVisibleFringe();
  global.computeFrequentAuthors();

  drawStaticElements(animate);
  manageDynamicElements(animate);
  manageSideViews(animate);
  bindListeners();
}

// Update fringe and animate the change
function updateFringe() {
  // Manage the menu
  if (menuTimeout) {
    window.clearTimeout(menuTimeout);
  }
  hideMenu();

  algorithm.updateFringe();
  updateView(1);
  // the updateFringe button becomes useless until new papers are (de)selected
  d3.select("#updateFringe").attr("disabled","disabled");
}

//////////////////  Drawing functions   ///////////////////////

function manageDynamicElements(animate){
    return view.manageDynamicElements(animate);
}

function manageSideViews(animate){
    return view.manageSideViews(animate);
}

// Create some svg elements, once and for all
function createStaticElements(){
  
/*  // white pannel at the bottom of the fringe  -- probably useless
  svg.append("rect")
  .attr("id","bottomPane")*/

  // Note: ordering here matters.  Things rendered first will be in
  // the back of those rendered later.

  // toread
  svg.append("circle")
    .attr("id","toread")

  // core
  svg.append("rect")
    .attr("id","core");

  svg.append("rect")
    .attr("id", "core-separator");

  // fringe-separator
  var arc = d3.svg.arc()
    .innerRadius(parameters.fringeRadius - 2)
    .outerRadius(parameters.fringeRadius + 2)
    .startAngle(0)
    .endAngle(3);

  svg.append("g")
    .attr("id", "fringe-separator")
    .append("path")
    .attr("d", arc);

  // controls
  d3.select("body").append("span")
    .attr("id", "fringe-slider-toggle")
    .attr("title", "switch between views")
    .attr("onclick", "view.toggleFringeSlider()")
    .classed("icon-tab", true)

  // links first, so they're always on the back of papers and some controls
  svg.append("g").attr("id", "links");

  d3.select("body").append("button")
    .attr("id","updateFringe")
    .attr("class","visControl")
    .text("Update fringe")
    .attr("onclick","view.updateFringe()")
    .attr("disabled","disabled");   // there's nothing to update when the fringe has just been created

  d3.select("body").append("label")
    .attr("id","updateFringeAutomatically")
    .attr("class","visControl")
    .append("input")
    .attr("type","checkbox")
    .attr("onclick","view.updateAutomaticallyToggle()")

  d3.select("#updateFringeAutomatically")
    .append("span")
    .text(" automatically")

  // clipping path for the left side views
  leftViewClipPath = svg.append("clipPath")
    .attr("id", "left-views")
    .append("circle");

  svg.append("g")
    .attr("id", "core-papers");

  svg.append("g")
    .attr("id", "toread-papers");

  svg.append("g")
    .attr("id","fringe-papers");

  // sideview - histogram
  d3.select("svg#publication-years")
      .append("g")
        .attr("id","histogram")
      .append("g")
        .attr("class", "axis")
        .attr("id","x-axis")
}

// draw the static elements at their appropriate positions
function drawStaticElements(animate){

    // Create one transition and apply to all the elements
    t0=function(elem){
      return elem.transition().duration(parameters.fringePapersPositionTransitionDuration[animate])
        .ease(parameters.fringePapersTransitionEasing)
    }

/*    d3.select("#bottomPane")
    .style("fill","white")
    .attr("x", circleX(updateFringeButtonY())+parameters.paperMaxRadius)
    .attr("y", updateFringeButtonY())
    .attr("width", window.innerWidth)
    .attr("height", parameters.fringeBottomMargin)*/

    t0(d3.select("#updateFringe"))
    .style("top",updateFringeButtonY()+"px")
    .style("left",updateFringeButtonX()+"px")

    t0(d3.select("#updateFringeAutomatically"))
    .style("top",updateFringeButtonY()+0+"px")
    .style("left",updateFringeButtonX()+140+"px")

    // toread
    t0(d3.select("#toread"))
    .attr("cx", -parameters.fringeRadius + global.fringeApparentWidth)
    .attr("cy","50%")
    .attr("r",parameters.fringeRadius)
    .style("fill",colors.toread)
    //.style("stroke",colors.toreadBorder)
    //.style("stroke-width",2)

  t0(leftViewClipPath)
    .attr("cx",-parameters.fringeRadius + global.fringeApparentWidth-1)
    .attr("cy","50%")
    .attr("r",parameters.fringeRadius);

  // core
  var core = t0(d3.select("#core"))
    .attr("x", 0)
    .attr("y", global.toReadHeight)
    .attr("width", global.fringeApparentWidth)
    .attr("height", window.innerHeight - global.toReadHeight)
    .attr("clip-path", "url(#left-views)")
    .style("fill",colors.core);

  // coreSeparator (no transition)
  var dragCore = d3.behavior.drag()
    .on("drag", function(d, i) {
      global.toReadHeight = d3.event.y;
      d3.select(this).attr("y", d3.event.y);
      d3.select("#core").attr("y", global.toReadHeight);
      d3.select("#core").attr("height", window.innerHeight - global.toReadHeight);
      updateView(0);
    });

  d3.select("#core-separator")
    .attr("x", 0)
    .attr("y", global.toReadHeight)
    .attr("width", window.innerWidth)
    .attr("height", 5)
    .attr("clip-path", "url(#left-views)")
    .style("fill", colors.coreDivisor)
    //.style("stroke", colors.coreDivisor)
    .style("fill-opacity", 0.5)
    .call(dragCore);

  // button for switching views
/*  t0(d3.select("#fringe-slider-toggle"))
    .style("left", global.fringeApparentWidth-28+"px")*/
  d3.select("#fringe-slider-toggle")
    .style("left", 0+"px")
    .style("top", global.toReadHeight-12+"px") 

  // fringeSeparator
  t0(d3.select("#fringe-separator"))
    .attr("transform", "translate(" + (-parameters.fringeRadius + global.fringeApparentWidth) + "," + (window.innerHeight / 2) + ")")
    .style("fill", "gray")
    .style("opacity", "0")

  var dragFringe = d3.behavior.drag()
    .on("drag", function(d, i) {
      var x = d3.event.x;
      // Clamp new apparent width;
      x = (x < parameters.fringeApparentWidthMin) ? parameters.fringeApparentWidthMin : x;
      x = (x > (window.innerWidth - d3.select("#sidebar")[0][0].offsetWidth - parameters.fringeRightPadding)) ? (window.innerWidth - d3.select("#sidebar")[0][0].offsetWidth - parameters.fringeRightPadding) : x;
      global.fringeApparentWidth = x;
      updateView(0);
    });

    d3.select("#fringe-separator")
    .call(dragFringe);
}


// Specify interaction
function bindListeners(){

/*  ---- Kinda deprecated - the glyph shadow highlighting is done below... 
    d3.selectAll(".shadowOnHover")
    .on("mouseover",function() {
        d3.select(this).attr("filter","url(#drop-shadow)")
    })
    .on("mouseleave",function() {
        d3.select(this).attr("filter","none")
    })*/


  ////////////////////////////////////////////////////////////////////////////////
  // Listeners for the papers contextual menu
  d3.select("#paper-menu")
    .on("mouseenter", function() {
      if (menuTimeout) {
        window.clearTimeout(menuTimeout);  // Don't hide the menu if it's being used
      }

      // Keep the node highlighted while using the menu.  Have to use
      // document.getElementById because the id (the DOI) contains
      // dots and d3 chokes
      var selection = d3.select(document.getElementById(global.activePaper.doi)).select(".zoom0");
      selection.select(".internalCitationsCircle").attr("filter","url(#drop-shadow)")
      selection.select(".externalCitationsCircle").attr("filter","url(#drop-shadow)")
      selection.select(".title").classed("highlighted",true)    // add class
      selection.select(".card")
        .classed("highlighted",true)
        .attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    })

    .on("mouseleave", function() {
      menuTimeout = window.setTimeout(function() {
        hideMenu();
      }, 150);  // Set a smaller timeout to hide the menu

      // Remove highlighting from the node.  We use
      // document.getElementById because the id (the DOI) has dots and
      // d3 chokes.
      if (global.activePaper) {
        removeHighlighting(global.activePaper);
      }
    });

  d3.selectAll("#paper-menu .click")
    .on("mousedown", function() {
      d3.select(this).classed("active", true);
    })
    .on("mouseup", function() {
      d3.select(this).classed("active", false);
    });

  d3.selectAll("#paper-menu .toggle")
    .on("mousedown", function() {
      // TODO: Temporary toggle mockup.  Eventually these should be
      // mapped to paper state, particularly the starred icon.
      var selection = d3.select(this);
      if (this.className.indexOf("active") > -1) {
        selection.classed("active", false);
      } else {
        selection.classed("active", true);
      }
    });

  // Move a paper to the to-read list
  d3.select("#menu-toread")
    .on("mousedown", function() {
      d3.select(this).classed("active", true);
    })
    .on("mouseup", function() { movePaperTo(this,"toread") });

  // Move a paper to the core
  d3.select("#menu-tocore")
    .on("mousedown", function() {
      d3.select(this).classed("active", true);
    })
    .on("mouseup", function() { movePaperTo(this,"core") });

  // Move a paper to the fringe
  d3.select("#menu-tofringe")
    .on("mousedown", function() {
      d3.select(this).classed("active", true);
    })
    .on("mouseup", function() { movePaperTo(this,"fringe") });

function movePaperTo(menuItem, destination){

  var from=global.activePaper.weightIndex();
  global.activePaper.moveTo(destination);
  userData.addToQueue(global.activePaper,from,global.activePaper.weightIndex());
  
  // New (or updated) interesting paper, fringe should recompute.
  userData.addNewInteresting(global.activePaper);
  // Enable or disable the updateFringe button.
  updateUpdateFringeButton();

  d3.select(menuItem).classed("active", false);
  global.activePaper.selected = false;
  removeHighlighting(global.activePaper);
  hideMenu();
  doAutomaticFringeUpdate();  // if necessary
  updateView(2);
}



  // Show a paper's links
  d3.select("#menu-links")
    .on("mousedown", function() {
      d3.select(this).classed("active", true);
    })
    .on("mouseup", function() {
      // Record which paper we should show links for now.  Only one
      // paper at a time can show links.
      if (global.connectedPaper) {
        if (global.connectedPaper == global.activePaper) {
          d3.select(this).classed("active", false);
          global.connectedPaper = null;
        } else {
          global.connectedPaper = global.activePaper;
        }
        // Clear the links
        var links = svg.selectAll(".link");
        var numLinks = links[0].length;
        links.transition()
          .duration(parameters.linkTransitionDuration)
          .style("opacity", 0)
          .each("end", function(d, i) {
            this.parentNode.removeChild(this);
            if (i == numLinks-1) {  // Trigger update on when all have been removed
              updateView(0);
            }
          });
      } else {
        global.connectedPaper = global.activePaper;
        updateView(0);
      }
    });

  // Show/hide paper menus
  d3.selectAll("g.paper")
    .on("mouseover", function() {
      var p = P(this.id);

      if (menuTimeout) {
        window.clearTimeout(menuTimeout);
        menuTimeout = null;
        hideMenu();
      }

      // Record interactive paper
      global.activePaper = p;
      showMenu(p);
    })

    .on("mouseleave", function() {
      // We don't remove the menu right away, so the user has time to get to it.
      menuTimeout = window.setTimeout(function() {
        hideMenu();
      }, 1000);
    });



  ////////////////////////////////////////////////////////////////////////////////
  // Listeners for papers in the fringe

  // highlight nodes and titles
  d3.selectAll(".zoom0")
    .on("mouseover",function() {
      var selection = d3.select(this);
      selection.select(".internalCitationsCircle").attr("filter","url(#drop-shadow)")
      selection.select(".externalCitationsCircle").attr("filter","url(#drop-shadow)")
      selection.select(".title").classed("highlighted",true)    // add class
      selection.select(".card")
        .classed("highlighted",true)
        .attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    })

    .on("mouseleave",function() {
      // remove shadow
      d3.select(this).select(".internalCitationsCircle").attr("filter","none")
      d3.select(this).select(".externalCitationsCircle").attr("filter","none")

      // keep the selected elements highlighted
      var nonSelectedOnly=d3.select(this)
        .filter(function(){ 
          // this is ugly as hell, but I don't know how to access d cleanly...
          var res;
          d3.select(this).each(function(p) {
            res=!p.selected;
          })
            return res;
        })
      nonSelectedOnly.select(".title").classed("highlighted",false)     // remove class
      nonSelectedOnly.select(".card").classed("highlighted",false)     // remove class
    })

    // clicking papers on the fringe translates them to the left
    .on("mousedown",function() {
      var paper=d3.select(this);
      var ctrl=d3.event.ctrlKey;

      paper.each(function(p) {
        if(!ctrl){
          // Clicking on papers when not in the fringe does not select it.
          if (!p.fringe)
            return;

          var from=p.weightIndex();
          p.selected = !p.selected;

          userData.addToQueue(p,from,p.weightIndex());

          // Add or remove the paper to the list that will update the fringe
          if(p.selected)
            userData.addNewInteresting(p);
          else
            userData.removeInteresting(p);


          // Enable or disable the updateFringe button, if new papers have been (de)selected
          updateUpdateFringeButton();

          // Update the vis to move the selected papers left or right
          // (using different animation speeds depending on the zoom level, just because it's pretty)
          switch(global.zoom){
          case 0:
            updateView(4);
            break;
          case 1:
            updateView(3);
            break;
          case 2:
            updateView(2);
            break;
          }
        }
        else{
          if(global.expandedPaper == p)
            global.expandedPaper=null;
          else
            global.expandedPaper=p;
        }
      });

      // Reposition the menu
      showMenu(global.activePaper);
    })

    // After (de)selecting a paper, update the fringe if updateAutomatically is true
    .on("mouseup",function(){
      var paper=d3.select(this);
      paper.each(function(p) {
        if (p.fringe) {   // Only do automatic updating when click fringe papers.
          doAutomaticFringeUpdate();
        }
      });
    })

    // detect zoom in and out
    svg.on("wheel",function(){

        // Do nothing if it is a browser zoom (ctrl+wheel)
        if(d3.event.ctrlKey)
            return;

        // compute the new zoom level
        if(d3.event.deltaY>0){
            if(global.zoom<2)
                global.zoom++;
            else
                global.scrollOffset-=parameters.amountOfVerticalScrolling;
            // if the user keeps scrolling down, this will be interpreted as a scrolling down
        }
        else{
            if(global.scrollOffset<0)
                global.scrollOffset+=parameters.amountOfVerticalScrolling;
            else{
                if(global.zoom>0)
                    global.zoom--;
            }
        }

        // Update the view (quickly), to take into account the new heights of the selected papers
        view.updateView(2);
    })

}


function showMenu(p) {
  buildMenu(p);
  
  d3.select("#paper-menu")
    .style("left", (p.x - parameters.menuOffset + (global.butterfly? 0: parameters.paperMaxRadius)) + "px")
    .style("top", (p.y - parameters.paperMaxRadius) + "px")
    .style("display", "block")
    .transition()
    .duration(200)
    .style("opacity", 1)
}

function hideMenu() {
  // Clear interactive paper
  global.activePaper = null;
  d3.select("#paper-menu")
    .transition()
    .duration(150)
    .style("opacity", 0)
    .each("end", function() { d3.select(this).style("display", "none"); });
  // TODO: This eventually won't be necessary, the buttons should be
  // mapped to the paper's state.
  // Clear all active buttons
  d3.selectAll("#paper-menu .toggle").each(function() {
    d3.select(this).classed("active", false);
  });
}

function buildMenu(p) {
  var menu = d3.select("#paper-menu");
  function hideOption(id) { menu.select("#" + id).style("display", "none"); }
  function showOption(id) { menu.select("#" + id).style("display", "block"); }

  ["menu-remove", "menu-star", "menu-tocore", "menu-tofringe", "menu-toread", "menu-links", "menu-expand"].forEach(hideOption);

  if (p.core) {
    ["menu-links"].forEach(showOption);
  } else if(p.toread) {
    ["menu-tofringe", "menu-tocore", "menu-links"].forEach(showOption);
  } else if (p.fringe) {
    ["menu-toread", "menu-tocore", "menu-links"].forEach(showOption);
  }

  d3.select("#menu-links").classed("active", (global.connectedPaper == p));
}

function removeHighlighting(p) {
  // Only remove highlighting of non-selected papers.
  if (!p.selected) {
    var selection = d3.select(document.getElementById(p.doi)).select(".zoom0");
    selection.select(".internalCitationsCircle").attr("filter","none")
    selection.select(".externalCitationsCircle").attr("filter","none")
    selection.select(".title").classed("highlighted", false);
    selection.select(".card").classed("highlighted", false);
  }
}

function updateUpdateFringeButton() {
  if((userData.newInterestingPapers.length>0 || userData.newUninterestingPapers.length>0) && !global.updateAutomatically)
    d3.select("#updateFringe").attr("disabled",null);
  else
    d3.select("#updateFringe").attr("disabled","disabled");
}

function updateAutomaticallyToggle() {
  global.updateAutomatically=!global.updateAutomatically;

  if(global.updateAutomatically){
    d3.select("#updateFringe").classed("off",true);
    d3.select("#updateFringeAutomatically").classed("on",true);
  }
  else{
    d3.select("#updateFringe").classed("off",false);
    d3.select("#updateFringeAutomatically").classed("on",false);
  }

  updateFringe();
}

function doAutomaticFringeUpdate() {
  if(!global.updateAutomatically)
    return;

  // We have to make sure that the animation for "selected" is finished   
  if(!global.animationRunning)
    updateFringe();
  else    
    global.animationWaiting = true; // otherwise we wait for it to end
}


function toggleFringeSlider() {
  var largestReasonnableFringe = window.innerWidth - d3.select("#sidebar")[0][0].offsetWidth - parameters.fringeRightPadding;
  var midpoint = (parameters.fringeApparentWidthMin + largestReasonnableFringe)/2;

  if(global.fringeApparentWidth <= midpoint)
    global.fringeApparentWidth = largestReasonnableFringe;
  else
    global.fringeApparentWidth = parameters.fringeApparentWidthMin;
    
  updateView(1);
}


///////////////     Define public static methods, and return    /////////////

var view = {};

view.initializeView=initializeView;
view.updateView=updateView;
view.updateFringe=updateFringe;
view.updateAutomaticallyToggle=updateAutomaticallyToggle;
view.toggleFringeSlider = toggleFringeSlider;
return view;

})();
