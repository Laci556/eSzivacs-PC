const kreta = require('./js/kreta');
const fs = require('fs');
const app2 = require('electron').remote.app;
const file = require('./js/file');

require('../renderer.js');

M.AutoInit();

var currentUser;
var instituteCode;
var id;
var schools;
var loginDatas;
var userDatas;
var isFooldalLoadedOnce = false;
var isJegyeimLoadedOnce = false;
var isHianyzasokLoadedOnce = false;
var isOrarendLoadedOnce = false;
var hianyzasok = [];
var jegyek = {
    "MidYear": [],
    "MidYearDate": [],
    "HalfYear": [],
    "EndYear": []
};
var timetableDatas = [];
var positionInTime = 0;
var isFirstTime = true;
var currentPage;

function getSchools(){
    return new Promise(function(resolve, reject){
        file.getGlobal("schools").then(function(result, err){
            if(err) reject(err);
            if(result != ""){
                resolve(result);
            } else {
                updateSchools().then(function(){
                    getSchools().then(function(result2){
                        resolve(result2);
                    });
                })
            }
        });
    });
}

function updateSchools(){
    return new Promise(function(resolve, reject){
        kreta.getSchools().then(function (result, err) {
            if(err) reject(err);
            file.saveGlobal("schools", result).then(function(){
                resolve("");
            });
        });
    });
}

function showPage(page, hideEveryThing) {
    if (hideEveryThing) {
        hidePage("login");
        hidePage("fooldal");
        hidePage("jegyek");
        hidePage("hianyzasok");
        hidePage("orarend");
    }
    currentPage = page;
    document.getElementById(page).style.display = "block";
    loadUserDatas().then(function(result){
        document.getElementById("username").innerHTML = result["Name"];
    })
    if (page == "login") {
        showNavbar(false);
    } else {
        showNavbar(true);
    }
    if (page == "fooldal") {
        renderFooldal();
    } else if (page == "jegyek") {
        renderGrades();
    } else if (page == "hianyzasok") {
        renderAbsences();
    } else if (page == "orarend") {
        renderTimetable(0);
    }
}

function logout() {
    file.remove(currentUser, "login");
    loginDatas = undefined;
    showNavbar(false);
    showPage("login", true);
    initAutoCompleteForLoginSchools();
}

function resetPages(){
    isFooldalLoadedOnce = false;
    isHianyzasokLoadedOnce = false;
    isJegyeimLoadedOnce = false;
    isOrarendLoadedOnce = false;
}

function updateMyDatas(){
    updateUserDatas().then(function(result){
        if(result == "done"){
            // resetPages();
            // showPage(currentPage, true);
            location.reload(); 
            M.toast({html:"Sikeresen frissítetted az adataidat!"});
        }
    }, function(err){
        showPage("login", true);
    });
}

function initAutoCompleteForLoginSchools(){
    getSchools().then(function (result) {
        var elems = document.querySelectorAll('#schools');
        var data = {};
        var i = 0;

        var data = {};
        for (var i = 0; i < result.length; i++) {
            data[result[i].Name] = null;
        }

        var instances = M.Autocomplete.init(elems, {
            "data": data,
            "limit": 5
        });
    });
}

function fooldal() {
    showPage("fooldal", true);
}

function jegyekFunc() {
    showPage("jegyek", true);
}

function hianyzasokFunc() {
    showPage("hianyzasok", true);
}

function orarendFunc() {
    showPage("orarend", true);
}

function openConsole(){
    require('electron').remote.getCurrentWindow().webContents.openDevTools();
}

function showNavbar(toShow) {
    var showTitleBarLogo;
    var titleBarColor;
    var showNavBar;

    if (toShow) {
        M.Dropdown.init(document.querySelector(".dropdown-trigger", {alignment: "bottom", constrainWidth: false}));

        titleBarColor = "#000";
        showTitleBarLogo = "none";
        showNavBar = "block";
        var logoutButtons = document.getElementsByClassName('logout');
        var fooldalButtons = document.getElementsByClassName('fooldal');
        var jegyekButtons = document.getElementsByClassName('jegyek');
        var hianyzasokButtons = document.getElementsByClassName('hianyzasok');
        var updateMyDatasButtons = document.getElementsByClassName('updateMyDatas');
        var orarendButtons = document.getElementsByClassName('orarend');
        var timetableBackButtons = document.getElementsByClassName('timetableBack');
        var timetableFwButtons = document.getElementsByClassName('timetableFw');
        var consoleButtons = document.getElementsByClassName('console');

        loadUserDatas().then(function (result) {
            document.getElementById("name").innerHTML = result["Name"];
            document.getElementById("school").innerHTML = result["InstituteName"]
        });

        for (var i = 0; i < fooldalButtons.length; i++) {
            (function (index) {
                fooldalButtons[index].addEventListener("click", fooldal);
            })(i);
        }
        for (var i = 0; i < jegyekButtons.length; i++) {
            (function (index) {
                jegyekButtons[index].addEventListener("click", jegyekFunc);
            })(i);
        }
        for (var i = 0; i < hianyzasokButtons.length; i++) {
            (function (index) {
                hianyzasokButtons[index].addEventListener("click", hianyzasokFunc);
            })(i);
        }
        for (var i = 0; i < logoutButtons.length; i++) {
            (function (index) {
                logoutButtons[index].addEventListener("click", logout);
            })(i);
        }
        for (var i = 0; i < updateMyDatasButtons.length; i++) {
            (function (index) {
                updateMyDatasButtons[index].addEventListener("click", updateMyDatas);
            })(i);
        }
        for (var i = 0; i < orarendButtons.length; i++) {
            (function (index) {
                orarendButtons[index].addEventListener("click", orarendFunc);
            })(i);
        }
        for (var i = 0; i < timetableBackButtons.length; i++) {
            (function (index) {
                timetableBackButtons[index].addEventListener("click", timetableBack);
            })(i);
        }
        for (var i = 0; i < timetableFwButtons.length; i++) {
            (function (index) {
                timetableFwButtons[index].addEventListener("click", timetableFw);
            })(i);
        }
        for (var i = 0; i < consoleButtons.length; i++) {
            (function (index) {
                consoleButtons[index].addEventListener("click", openConsole);
            })(i);
        }
    } else {
        titleBarColor = "#2D2D30";
        showTitleBarLogo = "block";
        showNavBar = "none";
    }

    document.getElementById("title-bar").style.backgroundColor = titleBarColor;
    document.getElementById("title").style.display = showTitleBarLogo;
    document.getElementById("navbar").style.display = showNavBar;
    document.getElementById("title-bar-btns").style.backgroundColor = titleBarColor;
}

function hidePage(page) {
    document.getElementById(page).style.display = "none";
}

function loadLoginDatas(){
    return new Promise(function(resolve, reject){
        file.getGlobal("users").then(function(result){
            if(result == undefined){
                resolve(undefined);
            }
            if(result.length > 0){
                for(var i = 0; i < result.length; i++){
                    if(result[i]['Selected']){
                        id = result[i]['Id'];
                        currentUser = `${result[i]['Id']}-${result[i]['InstituteCode']}`;
                        file.get(currentUser, "login").then(function(result, err){
                            if(err) reject(err);
                            console.log(result);
                            resolve(result);
                        });
                    }
                }
            } else {
                resolve(undefined);
            }
        });

    });
}

function saveLoginDatas(user, id, instituteCode){
    user['InstituteCode'] = instituteCode;
    file.save(`${id}-${instituteCode}`, "login", user);
}

var triesToUpdateTimetable = 0;
function updateTimetable(startDate, endDate) {
    triesToUpdateTimetable++;
    if(triesToUpdateTimetable < 4){
        return new Promise(function (resolve, reject) {
            file.get(currentUser, "login").then(function(result){
                kreta.getTimetable(result["access_token"], result["InstituteCode"], startDate, endDate).then(function (result2) {
                    console.log(`${startDate} -- ${endDate} `);
                    resolve(result);
                }, function () {
                    // Hiba esetén újrapróbálkozás
                    kreta.refreshToken(result['refresh_token'], result['InstituteCode']).then(function (result2) {
                        saveLoginDatas(result2, result['InstituteCode']);
                        updateUserDatas().then(function(){
                            updateTimetable(startDate, endDate).then(function(result){
                                resolve(result);
                            });
                        });
                    });
                });
            });
        });
    } else {
        document.getElementById("timetables").innerHTML = `<div class="card col s12 m6 offset-m3"><div class="card-content"><div class="card-title center-align">Hiba lépett fel!</div><div class="row"><div class="col s12 justify">Nem sikerült betölteni az órarendet harmadjára sem. A manuális újrapróbáláshoz kattints a gombra!</div><div class="row center"><a class="btn btn-flat waves-effect waves-grey" id="retryTimetable">Újrapróbálkozás</a></div></div></div></div>`;
        document.getElementById("retryTimetable").addEventListener("click", function(startDate, endDate){
            updateTimetable(startDate, endDate).then(function(result){
                resolve(result);
            })
        });
    }

}

function updateUserDatas(){
    return new Promise(function(resolve, reject){
        file.get(currentUser, "login").then(function(result){
            var instituteCode;
            file.getGlobal("users").then(function(result2){
                result2.forEach(function(element){
                    if(element['Id'] == id){
                        instituteCode = element['InstituteCode'];
                    }
                });
                kreta.getUserDatas(result["access_token"], instituteCode, null, null).then(function(result2){
                    file.save(currentUser, "user", result2);
                    resolve("done");
                }, function(){
                    kreta.refreshToken(result["access_token"], instituteCode).then(function(result2){
                        file.save(currentUser, "user", result2);
                        updateUserDatas().then(function(result3, err){
                            if(err) reject(err);
                            resolve(result3);
                        })
                    }, function(){
                        showPage("login", true);
                    });
                });
            });
        });
    });
}

function loadUserDatas(){
    return new Promise(function(resolve, reject){
        file.get(currentUser, "user").then(function(result, err){
            if(err) reject(err);
            console.log(result);
            if(result != undefined){
                console.log("From file");
                resolve(result);
            } else {
                updateUserDatas().then(function(err){
                    console.log("Updating...");
                    if(err) reject(err);
                    loadUserDatas().then(function(result2, err){
                        console.log("Updated and value returned!");
                        if(err) reject(err);
                        // Valamiért nem olvassa ki első alkalommal, amikor még a fájlba is írunk, ezért csinálunk egy ilyen csúfságot
                        resolve(result2);

                        location.reload();
                    });
                });
            }
        });
    });
}

loadLoginDatas().then(function (result) {
    loginDatas = result;
    if (loginDatas != undefined) {
        console.log("Megvan az adat!");
        showPage("fooldal");
    } else {
        console.log("Létezik a login.json, de üres");
        showPage("login");
    }
}, function (err) {
    console.log("Nincsen login.json, most fogunk csinálni!");
    showPage("login");
});


function renderFooldal() {
        loadUserDatas().then(function (result) {
            if (!isFooldalLoadedOnce) {
                var gradesNumber = 0;
                var strázsa = 0;
                while (gradesNumber < 6) {
                    if (result['Evaluations'][strázsa]['Type'] == "MidYear") {
                        document.getElementById("fooldalGrades").innerHTML += `
                    <li class="collection-item">
                        <div>${result['Evaluations'][strázsa]['Subject']}<a href="#!" class="secondary-content">${result['Evaluations'][strázsa]['NumberValue'] > 0 ? result['Evaluations'][strázsa]['NumberValue'] : result['Evaluations'][strázsa]['Value']}</a></div>
                    </li>
                    `;
                        gradesNumber++;
                    }
                    strázsa++;
                }
                isFirstNote = true;
                result['Notes'].forEach(function (element) {
                    document.getElementById("fooldalNotes").innerHTML += `
                <li>
                    <ul class="collapsible">
                        <li ${isFirstNote ? `class="active"` : ""}>
                            <div class="collapsible-header">${element['Title']}</div>
                            <div class="collapsible-body"><span>${element['Content']}</span></div>
                        </li>
                    </ul>
                </li>
                `;
                    isFirstNote = false;
                });
                M.Collapsible.init(document.querySelectorAll(".collapsible"), {});
                isFooldalLoadedOnce = true;
            }
        });
}

function renderGrades() {
    if (!isJegyeimLoadedOnce) {
        loadUserDatas().then(function (result) {
            result['Evaluations'].forEach(function (element) {
                var isThisContains = false;
                for (var i = 0; i < jegyek[element['Type']].length; i++) {
                    if (jegyek[element['Type']][i]['name'] == element['Subject']) {
                        isThisContains = true;
                    }
                }
                if (!isThisContains) {
                    var subjectName = element['Subject'];
                    if (element['Subject'] == null) {
                        if (element['Form'] == "Deportment") {
                            subjectName = "Magatartás";
                        } else {
                            subjectName = "Szorgalom";
                        }
                    }
                    var subj = {
                        "name": subjectName,
                        "grades": [],
                        "avg": 0,
                        "classAvg": 0
                    };
                    jegyek[element['Type']].push(subj);
                }
            });

            result['Evaluations'].forEach(function (element) {
                var isThisContains = false;
                for (var i = 0; i < jegyek["MidYearDate"].length; i++) {
                    if (jegyek["MidYearDate"][i]['date'] == element['Date'] || element['Type'] != "MidYear") {
                        isThisContains = true;
                    }
                }
                if (!isThisContains) {
                    var subj = {
                        "date": element['Date'],
                        "grades": []
                    };
                    jegyek["MidYearDate"].push(subj);
                }
            });

            result['Evaluations'].forEach(function (element) {
                for (var i = 0; i < jegyek["MidYearDate"].length; i++) {
                    if (jegyek["MidYearDate"][i]['date'] == element['Date'] && element['Type'] == "MidYear") {
                        var jegy = {
                            "Id": element['EvaluationId'],
                            "Subject": element['Subject'],
                            "CreatingTime": element['CreatingTime'],
                            "Date": element['Date'],
                            "FormName": element['FormName'],
                            "Mode": element['Mode'],
                            "NumberValue": element['NumberValue'],
                            "Teacher": element['Teacher'],
                            "Theme": element['Theme'],
                            "TypeName": element['TypeName'],
                            "Value": element['Value'],
                            "Weight": element['Weight']
                        }
                        jegyek["MidYearDate"][i]['grades'].push(jegy);
                    }
                }
            });
            
            jegyek["MidYear"].forEach(function (element) {
                result['SubjectAverages'].forEach(function (element2) {
                    if (element2['Subject'] == element['name']) {
                        element['avg'] = element2['Value'];
                        element['classAvg'] = element2['ClassValue'];
                    }
                });
            });

            result['Evaluations'].forEach(function (element) {
                for (var i = 0; i < jegyek[element['Type']].length; i++) {
                    var subjectName = element['Subject'];
                    if (element['Subject'] == null) {
                        if (element['Form'] == "Deportment") {
                            subjectName = "Magatartás";
                        } else {
                            subjectName = "Szorgalom";
                        }
                    }
                    if (jegyek[element['Type']][i]['name'] == subjectName) {
                        var jegy = {
                            "Id": element['EvaluationId'],
                            "CreatingTime": element['CreatingTime'],
                            "Date": element['Date'],
                            "FormName": element['FormName'],
                            "Mode": element['Mode'],
                            "NumberValue": element['NumberValue'],
                            "Teacher": element['Teacher'],
                            "Theme": element['Theme'],
                            "TypeName": element['TypeName'],
                            "Value": element['Value'],
                            "Weight": element['Weight']
                        }
                        jegyek[element['Type']][i]['grades'].push(jegy);
                    }
                }
            });

            jegyek['MidYear'].sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            });

            jegyek['MidYearDate'].sort(function (a, b) {
                if (a.date < b.date) { return 1; }
                if (a.date > b.date) { return -1; }
                return 0;
            });

            jegyek['HalfYear'].sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            });

            jegyek['EndYear'].sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            });

            var row = document.createElement("div");
            row.classList.add("row");
            var tabsContainer = document.createElement("div");
            tabsContainer.classList.add("black");
            var tabs = document.createElement("div");
            tabs.classList.add("container");
            tabs.classList.add("no-autoinit");
            var ul = document.createElement("ul");
            ul.classList.add("tabs");
            ul.id = "gradesTabs";
            for (var i = 0; i < 3; i++) {
                var nameOfType;
                switch (i) {
                    case 0:
                        nameOfType = "MidYear";
                        break;
                    case 1:
                        nameOfType = "HalfYear";
                        break;
                    case 2:
                        nameOfType = "EndYear";
                        break;
                }

                var link = document.createElement("a");
                link.classList.add("active");
                link.href = `#${nameOfType}`;
                var displayName;
                switch (nameOfType) {
                    case "MidYear":
                        displayName = "Évközi jegyek";
                        break;
                    case "HalfYear":
                        displayName = "Félévi jegyek";
                        break;
                    case "EndYear":
                        displayName = "Évvégi jegyek";
                        break;
                }
                link.innerHTML = displayName;
                var li = document.createElement("li");
                li.classList.add("tab");
                li.classList.add("col");
                li.classList.add("s4");
                if (jegyek[nameOfType].length == 0) {
                    li.classList.add("disabled");
                }
                li.appendChild(link);
                ul.appendChild(li);
            }
            tabs.appendChild(ul);
            tabsContainer.appendChild(tabs);
            row.appendChild(tabsContainer);
            document.getElementById("jegyek").appendChild(row);
            for (var i = 0; i < 3; i++) {
                var nameOfType;
                switch (i) {
                    case 0:
                        nameOfType = "MidYear";
                        break;
                    case 1:
                        nameOfType = "HalfYear";
                        break;
                    case 2:
                        nameOfType = "EndYear";
                        break;
                }

                var displayName;
                switch (nameOfType) {
                    case "MidYear":
                        displayName = "Évközi jegyek";
                        break;
                    case "HalfYear":
                        displayName = "Félévi jegyek";
                        break;
                    case "EndYear":
                        displayName = "Évvégi jegyek";
                        break;
                }

                switch (nameOfType) {
                    case "MidYear":
                        renderMidYearGrades(row);
                        break;
                    default:
                        renderSpecialGrades(nameOfType, displayName, row);
                        break;
                }
            }

            gradesTabs = M.Tabs.init(document.querySelectorAll(".tabs"), {});

            M.Collapsible.init(document.querySelectorAll(".collapsible"), {});
            isJegyeimLoadedOnce = true;
        });
    }
}

// JEGYEK BEÍRÁS SORRENDJÉBEN
function renderMidYearDateGrades(row){
    // Rendezés beírás ideje alapján
    var nameOfType = "MidYearDate";
    var typeContainer = document.createElement("div");
    typeContainer.classList.add("col");
    typeContainer.classList.add("s12");
    typeContainer.id = nameOfType;

    var container = document.createElement("div");
    container.classList.add("container");

    var collapsible = document.createElement("ul");
    collapsible.classList.add("collapsible");
    collapsible.id = "MidYearDate";

    collapsible.style.display = "none";

    for (var j = 0; j < jegyek[nameOfType].length; j++) {
        var collLi = document.createElement("li");

        var header = document.createElement("div");
        header.classList.add("collapsible-header");
        header.innerHTML = `${jegyek[nameOfType][j]['date'].split("T")[0].split("-")[0]}. ${jegyek[nameOfType][j]['date'].split("T")[0].split("-")[1]}. ${jegyek[nameOfType][j]['date'].split("T")[0].split("-")[2]}. - ${jegyek[nameOfType][j]['grades'].length} db értékelés`;

        var body = document.createElement("div");
        body.classList.add("collapsible-body");

        var ul = document.createElement("ul");
        ul.classList.add("collection");

        for (var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++) {
            var currentGrade = jegyek[nameOfType][j]['grades'][k];

            var cardLink = document.createElement("a");
            cardLink.classList.add("modal-trigger");
            cardLink.href = `#Grade-${currentGrade['Id']}`;

            var li = document.createElement("li");
            li.classList.add("collection-item");
            li.innerHTML = `${currentGrade['Subject']} - ${currentGrade['Value']}`;

            cardLink.appendChild(li);
            ul.appendChild(cardLink);

            M.Modal.init(document.querySelectorAll(`#Grade-${jegyek[nameOfType][j]['grades'][k]['Id']}`), {});
        }
        body.appendChild(ul);
        collLi.appendChild(header);
        collLi.appendChild(body);
        collapsible.appendChild(collLi);
    }
    container.appendChild(collapsible);
    document.getElementById("MidYear").appendChild(container);
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});
}

function showMidYear(){
    document.getElementById("MidYearABC").style.display = "block";
    document.getElementById("MidYearDate").style.display = "none";
}

function showMidYearDate(){
    document.getElementById("MidYearABC").style.display = "none";
    document.getElementById("MidYearDate").style.display = "block";
}

// FÉLÉVI JEGYEK ABC SORRENDBEN
function renderMidYearGrades(row) {
    var nameOfType = "MidYear";
    var typeContainer = document.createElement("div");
    typeContainer.classList.add("col");
    typeContainer.classList.add("s12");
    typeContainer.id = nameOfType;

    var container = document.createElement("div");
    container.classList.add("container");

    container.innerHTML += `
    <div class="row" style="margin-top:20px;">
        <span class="flow-text white-text" style="margin-left:10px;">Évközi értékelések</span>
        <a class='dropdown-trigger btn-flat waves-effect waves-grey white-text right' href='#' data-target='dropdown1'><i class="material-icons">sort</i>Rendezés</a>
    </div>
    <ul id='dropdown1' class='dropdown-content'>
        <li><a href="#" id="MidYearBtn">Tantárgy</a></li>
        <li><a href="#" id="MidYearDateBtn">Értékelés ideje</a></li>
    </ul>
    `;

    var collapsible = document.createElement("ul");
    collapsible.classList.add("collapsible");
    collapsible.id = "MidYearABC";

    for (var j = 0; j < jegyek[nameOfType].length; j++) {
        var collLi = document.createElement("li");

        var header = document.createElement("div");
        header.classList.add("collapsible-header");
        header.innerHTML = `${jegyek[nameOfType][j]['name']} - &nbsp${jegyek[nameOfType][j]['avg']}`;

        var body = document.createElement("div");
        body.classList.add("collapsible-body");

        var ul = document.createElement("ul");
        ul.classList.add("collection");

        for (var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++) {
            var currentGrade = jegyek[nameOfType][j]['grades'][k];

            var cardLink = document.createElement("a");
            cardLink.classList.add("modal-trigger");
            cardLink.href = `#Grade-${currentGrade['Id']}`;

            var li = document.createElement("li");
            li.classList.add("collection-item");
            li.innerHTML = currentGrade['Value'];

            cardLink.appendChild(li);
            ul.appendChild(cardLink);

            //console.log(`${jegyek[nameOfType][j]['name']} - ${jegyek[nameOfType][j]['grades'][k]['NumberValue']}`)
            var modal = document.createElement("div");
            modal.classList.add("modal");
            modal.id = `Grade-${currentGrade['Id']}`;

            var modalContent = document.createElement("div");
            modalContent.classList.add("modal-content");
            modalContent.innerHTML = `
                <h4>${jegyek["MidYear"][j]["name"]} - ${currentGrade['NumberValue']}</h4>
                <table>
                    <tbody>
                        <tr>
                            <td><b>Értékelés módja</b></td>
                            <td>${currentGrade['TypeName']}</td>
                        </tr>
                        <tr>
                            <td><b>Értékelés témája</b></td>
                            <td>${currentGrade['Theme']}</td>
                        </tr>
                        <tr>
                            <td><b>Értékelés súlya</b></td>
                            <td>${currentGrade['Weight']}</td>
                        </tr>
                        <tr>
                            <td><b>Tanár</b></td>
                            <td>${currentGrade['Teacher']}</td>
                        </tr>
                        <tr>
                            <td><b>Értékelés</b></td>
                            <td>${currentGrade['Value']}</td>
                        </tr>
                        <tr>
                            <td><b>Dátum</b></td>
                            <td>${currentGrade['Date'].split("T")[0].split("-")[0]}. ${currentGrade['Date'].split("T")[0].split("-")[1]}. ${currentGrade['Date'].split("T")[0].split("-")[2]}</td>
                        </tr>
                        <tr>
                            <td><b>Rögzítés ideje</b></td>
                            <td>${currentGrade['CreatingTime'].split("T")[0].split("-")[0]}. ${currentGrade['CreatingTime'].split("T")[0].split("-")[1]}. ${currentGrade['CreatingTime'].split("T")[0].split("-")[2]}</td>
                        </tr>
                        <tr>
                            <td><b>Értékelés formája</b></td>
                            <td>${currentGrade['FormName']}</td>
                        </tr>
                    </tbody>
                </table>`;

            modal.appendChild(modalContent);
            document.getElementById("jegyek").appendChild(modal);

            var elems = document.querySelectorAll(`#Grade-${jegyek[nameOfType][j]['grades'][k]['Id']}`);
            var instances = M.Modal.init(elems, {});
        }
        body.appendChild(ul);
        collLi.appendChild(header);
        collLi.appendChild(body);
        collapsible.appendChild(collLi);
    }
    container.appendChild(collapsible);
    typeContainer.appendChild(container);
    row.appendChild(typeContainer);
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});
    renderMidYearDateGrades(row);
    document.getElementById("MidYearBtn").addEventListener("click", showMidYear);
    document.getElementById("MidYearDateBtn").addEventListener("click", showMidYearDate);
}

function renderSpecialGrades(nameOfType, displayName, row) {
    var typeContainer = document.createElement("div");
    typeContainer.classList.add("col");
    typeContainer.classList.add("s12");
    typeContainer.id = nameOfType;

    var ulContainer = document.createElement("div");
    ulContainer.classList.add("container");

    var ul = document.createElement("ul");
    ul.classList.add("collection");
    ul.classList.add("with-header");


    var header = document.createElement("li");
    header.classList.add("collection-header");
    header.innerHTML = `<h4>${displayName}</h4>`;
    ul.appendChild(header);
    for (var j = 0; j < jegyek[nameOfType].length; j++) {
        for (var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++) {
            var li = document.createElement("li");
            li.classList.add("collection-item");
            li.innerHTML = `<div>${jegyek[nameOfType][j]['name']}<a href="#" class="secondary-content">${jegyek[nameOfType][j]['grades'][k]["Value"]}</p></div>`;
            ul.appendChild(li);
        }
    }
    ulContainer.appendChild(ul);
    typeContainer.appendChild(ulContainer);
    row.appendChild(typeContainer);
    document.getElementById("jegyek").appendChild(row);
}

function timetableBack() {
    function getMonday(date) {
        var day = date.getDay() || 7;
        if (day !== 1)
            date.setHours(-24 * (day - 1));
        return date;
    }
    var today = new Date();
    positionInTime--;
    today.setDate(today.getDate() + (7 * positionInTime));
    Date.prototype.addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    var startDay = getMonday(today);
    var endDay = new Date(startDay.addDays(4));
    for (var i = 1; i <= 5; i++) { document.getElementById("classes-" + i).innerHTML = ""; }
    isOrarendLoadedOnce = false;
    updateTimetable(`${startDay.getFullYear()}-${startDay.getMonth() + 1}-${startDay.getDate()}`, `${endDay.getFullYear()}-${endDay.getMonth()+1}-${endDay.getDate()}`).then(function(result){
        renderTimetable(positionInTime);
    });
}

function timetableFw() {
    function getMonday(date) {
        var day = date.getDay() || 7;
        if (day !== 1)
            date.setHours(-24 * (day - 1));
        return date;
    }
    var today = new Date();
    positionInTime++;
    today.setDate(today.getDate() + (7 * positionInTime));
    Date.prototype.addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    var startDay = getMonday(today);
    var endDay = new Date(startDay.addDays(4));
    for (var i = 1; i <= 5; i++) { document.getElementById("classes-" + i).innerHTML = ""; }
    isOrarendLoadedOnce = false;
    updateTimetable(`${startDay.getFullYear()}-${startDay.getMonth() + 1}-${startDay.getDate()}`, `${endDay.getFullYear()}-${endDay.getMonth()+1}-${endDay.getDate()}`).then(function(result){
        renderTimetable(positionInTime);
    });
}

function renderTimetable(positionInTime) {
    if (!isOrarendLoadedOnce) {
        loadLoginDatas().then(function(result){
            Date.prototype.addDays = function (days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            }

            function getMonday(date) {
                var day = date.getDay() || 7;
                if (day !== 1)
                    date.setHours(-24 * (day - 1));
                return date;
            }
            var today = new Date();
            today.setDate(today.getDate() + (7 * positionInTime));

            var startDay = getMonday(today);
            var endDay = new Date(startDay.addDays(4));
            document.getElementById("timetableDate").innerHTML = `${startDay.getFullYear()}. ${startDay.getMonth() + 1}. ${startDay.getDate()}. - ${endDay.getFullYear()}. ${endDay.getMonth() + 1}. ${endDay.getDate()}.`;
            console.log(`${result['access_token']}, ${result['InstituteCode']}, ${startDay.getFullYear()}-${startDay.getMonth() + 1}-${startDay.getDate()}, ${endDay.getFullYear()}-${endDay.getMonth()+1}-${endDay.getDate()}`);
            kreta.getTimetable(result['access_token'], result['InstituteCode'], `${startDay.getFullYear()}-${startDay.getMonth() + 1}-${startDay.getDate()}`, `${endDay.getFullYear()}-${endDay.getMonth()+1}-${endDay.getDate()}`).then(function (result) {
                timetableDatas = [];
                result.forEach(function (element) {
                    var isThisContains = false;
                    for (var i = 0; i < timetableDatas.length; i++) {
                        if (timetableDatas[i]['Date'] == element['Date']) {
                            isThisContains = true;
                        }
                    }
                    if (!isThisContains) {
                        var day = {
                            "Date": element['Date'],
                            "Classes": []
                        };
                        timetableDatas.push(day);
                    }
                });

                result.forEach(function (element) {
                    for (var i = 0; i < timetableDatas.length; i++) {
                        if (timetableDatas[i]['Date'] == element['Date']) {
                            timetableDatas[i]['Classes'].push(element);
                        }
                    }
                });

                timetableDatas.forEach(function (element) {
                    var toAppend = new Date(element['Date']).getDay();

                    element['Classes'].forEach(function (ora) {
                        var li = document.createElement("li");
                        li.innerHTML = `
                            <div class="collapsible-header"><span class="col s12">${ora['Subject']} <span
                                        class="right">${ora['CalendarOraType'] == "UresOra" ? `<span class="red-text">${ora['StateName']}</span>` : ora['DeputyTeacher'] == "" ? ora['ClassRoom'] : `<span class="red-text">${ora['Teacher']}</span>`}</span></span></div>
                            <div class="collapsible-body">
                                <table>
                                    <tr>
                                        <td><b>Tanár neve</b></td>
                                        <td>${ora['Teacher']}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Tanterem</b></td>
                                        <td>${ora['ClassRoom']}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Tanóra óraszáma</b></td>
                                        <td>${ora['Count']}.</td>
                                    </tr>
                                    <tr>
                                        <td><b>Témája</b></td>
                                        <td>${ora['Theme']}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Időtartam</b></td>
                                        <td>${ora['StartTime'].split("T")[1].split(":")[0]}:${ora['StartTime'].split("T")[1].split(":")[1]}-${ora['EndTime'].split("T")[1].split(":")[0]}:${ora['EndTime'].split("T")[1].split(":")[1]}</td>
                                    </tr>
                                </table>
        
                            </div>`;
                        document.getElementById(`classes-${toAppend}`).appendChild(li);
                    });
                });
            });

            M.Tabs.init(document.querySelectorAll(".tabs"), {});
            /*updateTimetable(`${startDay.getFullYear()}-${startDay.getMonth()+1}-${startDay.getDate()}`, `${endDay.getFullYear()}-${endDay.getMonth()+1}-${endDay.getDate()}`).then(function(result){
                timetableDatas = result;
            });*/

            isOrarendLoadedOnce = true;
            
        });
    }
}

function renderAbsences() {
    if (!isHianyzasokLoadedOnce) {
        loadUserDatas().then(function (result) {
            result['Absences'].forEach(function (element) {
                var isHianyzasokContainsDay = false;
                hianyzasok.forEach(function (element2) {
                    if (element['LessonStartTime'] == element2['Date']) {
                        isHianyzasokContainsDay = true;
                    }
                });
                if (!isHianyzasokContainsDay) {
                    var day = {
                        "AbsenceId": element['AbsenceId'],
                        "Date": element['LessonStartTime'],
                        "Justification": element['JustificationState'],
                        "JustificationType": element['JustificationTypeName'],
                        "Lessons": []
                    };
                    hianyzasok.push(day);
                }
            });
            result['Absences'].forEach(function (element) {
                hianyzasok.forEach(function (element2) {
                    if (element['LessonStartTime'] == element2['Date']) {
                        element2['Lessons'].push(element['Subject']);
                    }
                });
            });
            /*
            <ul class="collapsible">
                <li>
                    <div class="collapsible-header">1111. 11. 11.</div>
                    <div class="collapsible-body">
                        <ul class="collection">
                            <li class="collection-item">Tanóra</li>
                        </ul>
                    </div>
                </li>
            </ul>
            */

           hianyzasok.sort(function (a, b) {
                if (a.Date < b.Date) { return 1; }
                if (a.Date > b.Date) { return -1; }
                return 0;
            });

            var ul = document.createElement("ul");
            ul.classList.add("collapsible");
            hianyzasok.forEach(function (element) {
                var li = document.createElement("li");
                var header = document.createElement("div");
                header.classList.add("collapsible-header");

                header.innerHTML = `${element['Date'].split("T")[0].split("-")[0]}. ${element['Date'].split("T")[0].split("-")[1]}. ${element['Date'].split("T")[0].split("-")[2]} -&nbsp${element['Justification'] == "Justified" ? `<span class='green-text'>Igazolt mulasztás (${element['JustificationType']})</span>` : element['Justification'] == "BeJustified" ? "<span class='yellow-text'>Igazolandó mulasztás</span>" : "<span class='red-text'>Igazolatlan mulasztás</span>"}`;

                var body = document.createElement("div");
                body.classList.add("collapsible-body");

                var collection = document.createElement("ul");
                collection.classList.add("collection");

                element['Lessons'].forEach(function (element2) {
                    var collLi = document.createElement("li");
                    collLi.classList.add("collection-item");
                    collLi.innerHTML = element2;

                    collection.appendChild(collLi);
                });

                body.appendChild(collection);
                li.appendChild(header);
                li.appendChild(body);
                ul.appendChild(li);
                document.getElementById("hianyzasok").appendChild(ul);
            });

            var elems = document.querySelectorAll('.collapsible');
            var instances = M.Collapsible.init(elems, {});

            isHianyzasokLoadedOnce = true;

        });
    }
}

initAutoCompleteForLoginSchools();

// Handle logging in
document.querySelector("#login").addEventListener("submit", function (e) {
    getSchools().then(function(result){
        result.forEach(function(element){
            if(element.Name == document.getElementById("schools").value){
                instituteCode = element.InstituteCode;
            }
        });
    

        kreta.loginUser(instituteCode, document.getElementById("usernameInput").value, document.getElementById("password").value).then(function (result) {
            // Handling successful login
            // Storing school inside user.json
            //result["InstituteCode"] = document.getElementById("schools").value;
            // Some toast to make login look cool
            M.toast({ html: 'Sikeres bejelentkezés!' });
            // Save login datas
            id = document.getElementById("usernameInput").value;
            
            file.getGlobal("users", []).then(function(result, err){
                var data = result;
                var user = {
                    "InstituteCode": instituteCode,
                    "Id": id,
                    "Selected": true
                };
                data.push(user);
                file.saveGlobal("users", data);
            });

            saveLoginDatas(result, id, instituteCode);
            // Show the main page
            showPage("fooldal");
            // Hide logging in
            hidePage("login");
        }, function () {
            // Handling bad login datas (pretty fast tho)
            M.toast({ html: 'Rossz felhasználónév vagy jelszó!' })
        });
        console.log(`${instituteCode}, ${document.getElementById("usernameInput").value}, ${document.getElementById("password").value}`);
    });
    // Preventing from reloading page
    e.preventDefault();
});