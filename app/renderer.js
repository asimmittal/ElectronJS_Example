const electron = require("electron");
const ipc = electron.ipcRenderer;

//global data structure
var results = {};
var total = 0;

//get the button
var btnSelectFolder = document.getElementById("btnPickFolder");

//attach a click handler to it
//when the user clicks this button, we'll notify the main process
btnSelectFolder.addEventListener('click', function(e){
    results = {};
    total = 0;
    ipc.send("ipcEvent_requestFileDialog");
});

//get the loader icon
var progLoader = document.getElementById("loader");

//prog loader visibility functions
progLoader.show = function(){ progLoader.style.display = "block"; }
progLoader.hide = function(){ progLoader.style.display = "none"; }

//row template for results table
var rowTemplate = `<tr>
                    <td width="10%">{ext}</td>
                    <td width="30%">{count}</td>
                    <td width="60%"><div class="bar" style='width: {pct}%'></div></td>
                  </tr>`;

function getRowTemplateFor(ext,count,pct){
    return rowTemplate.replace("{ext}",ext).replace("{count}", count).replace("{pct}",pct);
}

function draw(){
    var table = document.getElementById("results");
    if(table){

        table.innerHTML = '';

        for(var ext in results){
            var count = results[ext];
            var pct = count / total * 100;
            var row = getRowTemplateFor(ext, count, pct);
            table.innerHTML += row;
        }

        var lblTotal = document.getElementById("lblTotal");
        if(total && lblTotal){
            lblTotal.innerHTML = "Total: " +total+ " files found";
        }
    }
}

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


ipc.on("ipcEvent_startScan", progLoader.show);
ipc.on("ipcEvent_endScan", progLoader.hide);
ipc.on("ipcEvent_files", update);
