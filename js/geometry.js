////////////////    helper functions    //////////////

// Compute the height of a paper on the fringe, depending on the zoom level and whether it is selected
function fringePaperHeight(p) {
    // If the paper is not selected, its height decreases with the zoom level
    if(!p.selected)
        return 2*parameters.paperMaxRadius*parameters.compressionRatio[global.zoom];

    // If the paper is selected, its height increases with the zoom level
    var height=2*parameters.paperMaxRadius;

    if(global.zoom>=1)
        height += parameters.metadataYoffset-parameters.paperMaxRadius;

    // The height of the abstract must be computed for each paper individually
    if(global.zoom>=2)
        height += p.abstractHeight;

    // add some whitespace at the bottom to distinguish one paper from the next
    if(global.zoom>0)
        height += parameters.paperMarginBottom;

    return height;
}

// Compute X coordinate for a paper on the fringe, based on a circle
function fringePaperX(p) {
  var regularOffsetFromFringe = parameters.paperMaxRadius + 2*parameters.titleLeftMargin + global.butterfly*parameters.paperMaxRadius;
  var selectedOffset = p.selected ? (global.butterfly? regularOffsetFromFringe-radius(p,true): regularOffsetFromFringe) : 0;
  return circleX(p.y) + regularOffsetFromFringe - selectedOffset;
}

// Return the x coordinate corresponding to a y position on the circle
function circleX(y) {
  if(!global.circular)
    return global.fringeApparentWidth;

  var h = window.innerHeight;
  var centerXoffset = -parameters.fringeRadius + global.fringeApparentWidth;
  return centerXoffset + Math.sqrt(Math.pow(parameters.fringeRadius, 2) - Math.pow(h/2 - y, 2));
}

// Compute Y coordinate for a paper on the fringe
function fringePaperY(p) {
  var index = global.visibleFringe.indexOf(p);
    
  // compute the sum of the height of the papers that are above the current one in the fringe
  var offset = global.scrollOffset;
  for(var i=0; i<index; i++){
    offset += global.visibleFringe[i].h;
  }

  return offset + parameters.paperMaxRadius;
}

// Compute X coordinate for the "card" (the rectangle label) of a paper on the fringe
function fringePaperLabelX(p){
    var butterflyOffset = global.butterfly ? parameters.paperMaxRadius : 0;
    return p.x+butterflyOffset+parameters.paperMaxRadius+parameters.titleLeftMargin;
}

/* Compute how many papers can be displayed on the fringe at the zoom level 1 (when they are smallest)
* Takes into account some space at the bottom of the fringe to show an update button.
* It will oveflow at the bottom at zoom 0, but it's not a problem (the buttons are standing on top of the papers)
* When zooming in, some of these papers will get pushed outside the view, but it's fine (nice animation). */
function maxNumberOfVisiblePapers(){
    var availableHeight=window.innerHeight-parameters.fringeBottomMargin;
    return Math.floor(availableHeight/(2*parameters.paperMaxRadius*parameters.compressionRatio[1]));
}

function updateFringeButtonY(){
    return window.innerHeight-parameters.fringeBottomMargin;
}

// Compute the horizontal position of the updateFringe button
function updateFringeButtonX(){
    var h=window.innerHeight;
    var centerXoffset=-parameters.fringeRadius+global.fringeApparentWidth;
    return centerXoffset+Math.sqrt(Math.pow(parameters.fringeRadius,2)-Math.pow(h/2-updateFringeButtonY(),2))+parameters.paperMaxRadius+100;
}

// Compute a node radius for the appropriate citation count supplied, up to a certain max radius
// So far I'm interpolating with a sqrt, to emphasize the differences between 0 citations and a few
function radius(p, external){

    var count=external? p.citation_count/parameters.externalCitationCountCutoff
     : p.citations.length/parameters.internalCitationCountCutoff;

    var scale = !p.selected ? parameters.compressionRatio[global.zoom] : 1  

    return Math.min(parameters.paperMaxRadius, parameters.paperMaxRadius*count) * scale;
}

function maxRadius(p){
    return Math.max(radius(p,true), radius(p,false));
}

// Return a random color from the set of tag colors  -- not used
function randomColor(){
    var keys=Object.keys(colors.tags);
    return colors.tags[keys[ keys.length * Math.random() << 0]];
}

function fringePaperInternalColor(p) {
    return colorFromConnectivity(p.connectivity);
}

function fringePaperExternalColor(p) {
    return shadeHexColor(colorFromConnectivity(p.connectivity),colors.shadingDifferenceInternalExternal);
}

// Maps the connectivity score to 5 color bins (connectivty is always >=1 in the fringe)
function colorFromConnectivity(connectivity){
    var bins=d3.scale.linear()
    .domain([1, global.maxConnectivityScore])
    .rangeRound([0, colors.monotone.length-1])
    .clamp(true)
    return colors.monotone[bins(connectivity)];
}


////////////////////////////////////////////////////////////////////////////////
// To-read list geometry helpers

function toreadPaperX(p) {
  return parameters.toreadPaperMargin + 2*parameters.paperMaxRadius;
}

function toreadPaperY(p) {
  var baseline = parameters.toreadMarginTop + parameters.paperMaxRadius;
  var index = P.toread().indexOf(p)
  var offset = 0;

  for (var i=0; i < index; i++) {
    offset += P.toread()[i].h
  }
  return baseline + offset;
}

function toreadPaperHeight(p) {
  return 2 * parameters.paperMaxRadius;// + parameters.paperMarginBottom;
}



////////////////////////////////////////////////////////////////////////////////
// Core list geometry helpers

function corePaperX(p) {
  return parameters.toreadPaperMargin + 2*parameters.paperMaxRadius;
}

function corePaperY(p) {
  var baseline = global.toReadHeight + parameters.paperMaxRadius + parameters.coreMarginTop;
  var index = P.core().indexOf(p)
  var offset = 0;

  for (var i=0; i < index; i++) {
    offset += P.core()[i].h
  }
  return baseline + offset;
}

function corePaperHeight(p) {
  return 2 * parameters.paperMaxRadius;// + parameters.paperMarginBottom;
}