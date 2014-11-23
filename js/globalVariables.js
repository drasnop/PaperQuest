/*
* Global variables
*/

var global={
    // Current view: 0=core, 1=to read, 2=fringe
    "view":2,
    // papers dataset, accessed by global.papers[doi]
    "papers":false
};

var userData={
    "core":[
    {
        // Triggers and barriers to customization
        "doi":"10.1145/108844.108867" },
    {
        // Buttons
        "doi":"10.1145/97243.97271" },
    {
        // Medium vs Mechanism
        "doi":"10.1007/978-94-011-0349-7_9" }
    ],
    // pairs doi-selected
    "fringe":[],
    // automatically computed by fringeView
    "visibleFringe":[]
}; 