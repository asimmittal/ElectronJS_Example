const walk = require("walk");
var walker = null;

//get 'electron'
const electron = require("electron");

//get these objects from electron
const {
    app,
    BrowserWindow,
    dialog
} = electron;

//get the ipc for the Main process
const ipc = electron.ipcMain;

//ref to UI window
var uiWindow = null;

/************************************************************************
 * ready function
 * When the application is ready, this callback is invoked
 ************************************************************************/
app.on("ready", function () {

    //create a UI Window
    uiWindow = new BrowserWindow({
        minWidth: 200,
        minHeight: 600,
        width:300,
        title: 'Simple Folder Scanner'
    });

    //make sure it shows "index.html"
    uiWindow.loadURL(`file://${__dirname}/index.html`);
});

/*************************************************************************
 * ipc event : requestFileDialog
 * this callback is invoked when the "Select Directory" button in the
 * UI is clicked. The UI notifies the main process that it needs to
 * open a file dialog
 ************************************************************************/
ipc.on("ipcEvent_requestFileDialog", function(event){

    //handler for when a path is selected from the file dialog
    var handleSelection = function(paths){
        if(paths){
            uiWindow.handle = event.sender;
            walker = walk.walk(paths[0]);
            walker.on("files", handleWalkItem);
            walker.on("end", notifyEnd);

            //notify of start
            notifyStart();
        }
    }

    //open the file dialog, specify callback
    dialog.showOpenDialog({properties: ['openDirectory']}, handleSelection);

});

/***********************************************************************
 * notifyStart()
 * notify the renderer process that the directory scan has begun
 ***********************************************************************/ 
function notifyStart(){
    if(uiWindow.handle) uiWindow.handle.send("ipcEvent_startScan");
}

/***********************************************************************
 * notifyEnd()
 * notify the renderer process that the directory scan has ended
 ***********************************************************************/ 
function notifyEnd(){
    if(uiWindow.handle) uiWindow.handle.send("ipcEvent_endScan");
}

/***********************************************************************
 * handleWalkItem()
 * for every file that we "walk" over, post the stats to the renderer
 * process and then walk to the next item
 ***********************************************************************/ 
function handleWalkItem(root,stats,next){
    if(uiWindow.handle) uiWindow.handle.send("ipcEvent_files", stats);
    next();
}
