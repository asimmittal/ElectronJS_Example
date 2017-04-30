const electron = require("electron");
const ipc = electron.ipcRenderer;

//global data structure
var results = {};
var total = 0;

//get the button + prog loader
var btnSelectFolder = document.getElementById("btnPickFolder");
var progLoader = document.getElementById("loader");

/**********************************************************************************
 * event handler: click on "Select Directory" button
 * when clicked, request the main process for a file open dialog
 **********************************************************************************/
btnSelectFolder.addEventListener('click', function(e){
    init();
    ipc.send("ipcEvent_requestFileDialog");
});

/**********************************************************************************
 * handleScanStart()
 * handle UI changes for when the main process begins scanning the root dir
 **********************************************************************************/
function handleScanStart(){
    progLoader.style.display = "block";
    btnSelectFolder.disabled = true;
}

/**********************************************************************************
 * handleScanEnd()
 * handle UI changes for when the main process ends the scan
 **********************************************************************************/
function handleScanEnd(){
    progLoader.style.display = "none";
    btnSelectFolder.disabled = false;
}

/**********************************************************************************
 * getTitleRowTemplate(ex,cnt,pct)
 * return the row template for the first row
 **********************************************************************************/
function getTitleRowTemplate(){
    //row template for results table
    var rowTemplate = `<tr>
                        <td width="10%"><b>Extensions</b></td>
                        <td width="30%"><b>File Count</b></td>
                        <td width="60%"><b>Percentage</b></td>
                    </tr>`;

    return rowTemplate;
}


/**********************************************************************************
 * getRowTemplate(ex,cnt,pct)
 * return the row template for a specified extension, filecount and 
 * percentage value
 **********************************************************************************/
function getRowTemplateFor(ext,count,pct){
    //row template for results table
    var rowTemplate = `<tr>
                        <td width="10%">{ext}</td>
                        <td width="30%">{count}</td>
                        <td width="60%"><div class="bar" style='width: {pct}%'></div></td>
                    </tr>`;

    return rowTemplate.replace("{ext}",ext).replace("{count}", count).replace("{pct}",pct);
}

/**********************************************************************************
 * draw()
 * redraw the table of results in the UI
 **********************************************************************************/
function draw(){
    var table = document.getElementById("results");
    if(table){

        //add the title row
        table.innerHTML = getTitleRowTemplate();

        //for each extension in results, add a row
        for(var ext in results){
            var count = results[ext];
            var pct = count / total * 100;
            var row = getRowTemplateFor(ext, count, pct);
            table.innerHTML += row;
        }

        //update total
        var lblTotal = document.getElementById("lblTotal");
        if(total && lblTotal){
            lblTotal.innerHTML = "Total: " +total+ " files found";
        }
    }
}

/**********************************************************************************
 * update(e,stats)
 * update the results object with current data
 **********************************************************************************/
function update(e,stats){
    for(var i in stats){
        var name = stats[i].name;
        var ext = null;
        var lastDot = name.lastIndexOf('.');
        if(lastDot >= 0) ext = name.substr(lastDot);

        if(ext){
            total++;
            if(!results[ext]) results[ext] = 0;
            results[ext]++;
        }
    }

    draw();
}

/**********************************************************************************
 * init()
 * reset the state of the UI
 **********************************************************************************/
function init(){
    results = {};
    total = 0;
    update();
}

/**********************************************************************************
 * IPC events sent by the main process
 **********************************************************************************/
ipc.on("ipcEvent_startScan", handleScanStart);
ipc.on("ipcEvent_endScan", handleScanEnd);
ipc.on("ipcEvent_files", update);
