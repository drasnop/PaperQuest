/*
* Parameters required for building the visualization in d3.
* All the other appearance parameters are defined in CSS.
*/

var parameters= {

  /*    papers parameters       */

  "paperMaxRadius": 15,
  "paperOuterBorderWidth": 4,
  // between on paper and the next (again, to create visual grouping)
  "paperMarginBottom": 10,
  // margin between node and title              
  "titleLeftMargin": 5,
  // how far to the right are paper that come in and out of the fringe (not used yet)
  "papersEnteringDistance": 60,   
  // so far used only for wrapping the text of the abstract     
  "abstractLineWidth": 800,

  // vertical offset of the different components of the paper (1.8*parameters.paperMaxRadius)
  "metadataYoffset": 26,
  // in addition to metadaYoffset, the abstract has an offset of:
  "abstractYoffset": 7,   

  // Indicates how much the non-selected papers are shrunk when "zoo":0,1,2
  "compressionRatio": [1,.8,0],
  "opacityOfNonSelectedPapers": [.75,.45,0],


  /*     views parameters       */

  "fringeRadius": 2000,
  // The apparent width is the horizontal space that we want the region to occupy on the screen
  // An appropriate offset for the x-position of the center will be computed as -radius+apparentWidth
  "fringeApparentWidthMin": 420,
  "fringeApparentWidthMax": 1200,
  // the current value of fringeApparentWidth varies, hence is define in global

  // to leave room for the "update" button     
  "fringeBottomMargin": 30,  


  /*     dynamic parameters       */

  // Defines 3 types of animation: none, slow, fast, very fast
  "fringePapersTransitionEasing": "quad-in-out",
  "fringePapersPositionTransitionDuration": [0,1000,450,250,120],
  "fringePapersColorTransitionDuration": [0,500,0,0,0],

  // How much does one scroll changes the position of the papers
  "amountOfVerticalScrolling": 100,


  /*     data parameters       */

  // Current year must always be one year after the latest year in the dataset (2010 for citeology)
  "currentYear": 2011,
  "externalCitationCountCutoff": 200,
  "internalCitationCountCutoff": 25
}


var colors={
  // orange, green, blue, pink, darkblue
  "tags":["#F18D05","#61AE24","#00A1CB","#D70060","#113F8C"],
  // how much lighter are the external citations
  "shadingDifferenceInternalExternal":10,
  // thése two colors are pretty, but probably shouldn't be used for tags (too similar)
  "turquoise":"#01A4A4",      
  "red":"#E54028",        
  // background color of each region based on the current view
  "core":"rgb(255, 191, 175)",
  "coreDivisor":"rgb(223, 111, 95)",
  "toread":"rgb(242, 222, 195)",
  "toreadBorder":"rgb(202, 170, 126)"
}
