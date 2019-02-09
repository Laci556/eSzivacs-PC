const kreta = require('./js/kreta');
const main = require('./js/main');
const fs = require('fs');

M.AutoInit();

var schools;
var apiLinks;
var loginDatas;
var userDatas;
var isFooldalLoadedOnce = false;
var isJegyeimLoadedOnce = false;
var isHianyzasokLoadedOnce = false;
var hianyzasok = [];
var jegyek = {
    "MidYear": [],
    "HalfYear": [],
    "EndYear": []
};
var currentPage;

function updateSchools(){
    return new Promise(function(resolve, reject) {
        if(fs.existsSync("./schools.json")){
            fs.readFile('./schools.json', 'utf8', function (err, data) {
                if (err) reject(err);
                schools = JSON.parse(data);
                resolve(schools);
            });
        } else {
            kreta.getSchools().then(function(result){
                schools = result;
                var json = JSON.stringify(schools);
                function callback(){
                    console.log("Successfully updated schools.json!");
                }
                fs.writeFile('./schools.json', json, 'utf8', callback);    
                
                resolve(schools);
            });
        }
    });
}

function showPage(page, hideEveryThing){
    if(hideEveryThing){
        hidePage("login");
        hidePage("fooldal");
        hidePage("jegyek");
        hidePage("hianyzasok");
    }
    currentPage = page;
    document.getElementById(page).style.display = "block";
    if(page == "login"){
        showNavbar(false);
    } else {
        showNavbar(true);
    }
    if(page == "fooldal"){
        renderFooldal();
    } else if(page == "jegyek"){
        renderGrades();
    } else if(page == "hianyzasok"){
        renderAbsences();
    }
}

function logout(){
    fs.unlinkSync("./login.json");
    loginDatas = undefined;
    showNavbar(false);
    showPage("login", true);
    updateSchools().then(function(){
        var elems = document.querySelectorAll('.autocomplete');
        var data = {};
        var i = 0;
    
        var data = {};
        for (var i = 0; i < schools.length; i++) {
          data[schools[i].InstituteCode] = null; 
        }
        
        var instances = M.Autocomplete.init(elems, {
            "data": data,
            "limit": 5
        });
    });
}

function updateMyDatas(){
    kreta.getUserDatas(loginDatas["access_token"], loginDatas["InstituteCode"], null, null).then(function(result){
        saveUserDatas(result, fooldal);
        M.toast({html: 'Sikeresen frissítetted az adataidat!'});

    }, function(){
        kreta.refreshToken(loginDatas['refresh_token'], loginDatas['InstituteCode']).then(function(result){
            saveLoginDatas(result);
            updateUserDatas();
        }, function(){
            showPage("login", true);
        });
    });
}

function fooldal(){
    showPage("fooldal", true);
}

function jegyekFunc(){
    showPage("jegyek", true);
}

function hianyzasokFunc(){
    showPage("hianyzasok", true);
}

function showNavbar(toShow){
    var showTitleBarLogo;
    var titleBarColor;
    var showNavBar;

    if(toShow){
        titleBarColor = "#000";
        showTitleBarLogo = "none";
        showNavBar = "block";
        var logoutButtons = document.getElementsByClassName('logout');
        var fooldalButtons = document.getElementsByClassName('fooldal');
        var jegyekButtons = document.getElementsByClassName('jegyek');
        var hianyzasokButtons = document.getElementsByClassName('hianyzasok');
        var updateMyDatasButtons = document.getElementsByClassName('updateMyDatas');

        loadUserDatas().then(function(result){
            document.getElementById("name").innerHTML = result["Name"];
            document.getElementById("school").innerHTML = result["InstituteName"]
        });

        for(var i = 0; i < fooldalButtons.length; i++) {
            (function(index) {
                fooldalButtons[index].addEventListener("click", fooldal);
            })(i);
        }
        for(var i = 0; i < jegyekButtons.length; i++) {
            (function(index) {
                jegyekButtons[index].addEventListener("click", jegyekFunc);
            })(i);
        }
        for(var i = 0; i < hianyzasokButtons.length; i++) {
            (function(index) {
                hianyzasokButtons[index].addEventListener("click", hianyzasokFunc);
            })(i);
        }
        for(var i = 0; i < logoutButtons.length; i++) {
            (function(index) {
                logoutButtons[index].addEventListener("click", logout);
            })(i);
        }
        for(var i = 0; i < updateMyDatasButtons.length; i++) {
            (function(index) {
                updateMyDatasButtons[index].addEventListener("click", updateMyDatas);
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

function hidePage(page){
    document.getElementById(page).style.display = "none";
}

function loadLoginDatas(){
    return new Promise(function(resolve, reject) {
        if(fs.existsSync("./login.json")){
            fs.readFile('./login.json', 'utf8', function (err, data) {
                if (err) reject(err);
                user = JSON.parse(data);
                resolve(user);
            });
        } else {
            resolve("");
        }
    });
}

function saveLoginDatas(user){
    loginDatas = user;
    var json = JSON.stringify(user);
    function callback(){
        console.log("Successfully updated login.json!");
    }
    fs.writeFile('./login.json', json, 'utf8', callback);  
}

function updateUserDatas(){
    return new Promise(function(resolve, reject) {
        kreta.getUserDatas(loginDatas["access_token"], loginDatas["InstituteCode"], null, null).then(function(result){
            saveUserDatas(result);
            showPage(currentPage, true);
        }, function(){
            kreta.refreshToken(loginDatas['refresh_token'], loginDatas['InstituteCode']).then(function(result){
                saveLoginDatas(result);
                updateUserDatas();
            }, function(){
                showPage("login", true);
                M.toast({html: 'Hiba lépett fel az adataid frissítése közben.'});
                M.toast({html: 'Kérlek jelentkezz be újra!'});
            });
        });
    });

}

function saveUserDatas(data, callback){
    userDatas = data;
    var json = JSON.stringify(data);
    function callback(){
        console.log("Successfully updated user.json!");
    }
    fs.writeFile('./user.json', json, 'utf8', callback);  
}

function loadUserDatas(){
    return new Promise(function(resolve, reject) {
        if(fs.existsSync("./user.json")){
            console.log("Load from user.json!");
            fs.readFile('./user.json', 'utf8', function (err, data) {
                if (err) reject(err);
                user = JSON.parse(data);
                userDatas = user;
                resolve(user);
            });
        } else {
            updateUserDatas().then(function(){
                loadUserDatas();
            });
        }
    });
}

loadLoginDatas().then(function(result){
    loginDatas = result;
    if(loginDatas){
        console.log("Megvan az adat!");
        showPage("fooldal");
    } else {
        console.log("Létezik a login.json, de üres");
        showPage("login");
    }
}, function(err){
    console.log("Nincsen login.json, most fogunk csinálni!");
    showPage("login");
});


function renderFooldal(){
    loadUserDatas(loginDatas['access_token'], loginDatas['InstituteCode']).then(function(result){
        if(!isFooldalLoadedOnce){
            var cardContainer = document.createElement("div");
            cardContainer.classList.add("col");
            cardContainer.classList.add("s12");
            cardContainer.classList.add("m4");
            var cardJegyek = document.createElement("div");
            cardJegyek.classList.add("card");
            var ul = document.createElement("ul");
            ul.classList.add("collection");
            ul.classList.add("with-header");
            var ulHeader = document.createElement("li");
            ulHeader.classList.add("collection-header");
            ulHeader.innerHTML = '<li class="collection-header"><h4>Jegyek</h4></li>';
            ul.appendChild(ulHeader);
            var i = 0;
            while(i < 5){
                if(result['Evaluations'][i]['Form'] == "Mark" && result['Evaluations'][i]['Type'] == "MidYear"){
                    var li = document.createElement("li");
                    li.classList.add("collection-item");
                    var liDiv = document.createElement("div");
                    liDiv.classList.add("row");
                    liDiv.innerHTML = `<p class="col s9 truncate">${result['Evaluations'][i]['Subject']}</p><p class="col s3">${result['Evaluations'][i]['NumberValue']}</p>`;
                    li.appendChild(liDiv);
                    ul.appendChild(li);
                }
                i++;
            }
            console.log(result);
            cardJegyek.appendChild(ul);
            cardContainer.appendChild(cardJegyek);
            document.getElementById("fooldal").appendChild(cardContainer);
            isFooldalLoadedOnce = true;
        }
    }, function(){
        kreta.refreshToken(loginDatas['refresh_token'], loginDatas['InstituteCode']).then(function(result){
            saveLoginDatas(result);
            renderFooldal();
        }, function(){
            showPage("login");
            hidePage("fooldal");
        });
    });
}

function renderGrades(){
    if(!isJegyeimLoadedOnce){
        loadUserDatas().then(function(result){
            /* document.getElementById("nav4real").innerHTML += `
            <div class="nav-content">
              <ul class="tabs tabs-transparent">
                <li class="tab"><a href="#test1">Évközi jegyek</a></li>
                <li class="tab"><a href="#test2">Félévi jegyek</a></li>
              </ul>
            </div>`;*/
            result['Evaluations'].forEach(function(element){
                var isThisContains = false;
                for(var i = 0; i < jegyek[element['Type']].length; i++){
                    if(jegyek[element['Type']][i]['name'] == element['Subject']){
                        isThisContains = true;
                    }
                }
                if(!isThisContains){
                    var subjectName = element['Subject'];
                    if(element['Subject'] == null){
                        if(element['Form'] == "Deportment"){
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
            
            jegyek["MidYear"].forEach(function(element){
                result['SubjectAverages'].forEach(function(element2){
                    if(element2['Subject'] == element['name']){
                        element['avg'] = element2['Value'];
                        element['classAvg'] = element2['ClassValue'];
                    }
                });
            });

            result['Evaluations'].forEach(function(element){
                for(var i = 0; i < jegyek[element['Type']].length; i++){
                    var subjectName = element['Subject'];
                    if(element['Subject'] == null){
                        if(element['Form'] == "Deportment"){
                            subjectName = "Magatartás";
                        } else {
                            subjectName = "Szorgalom";
                        }
                    }
                    if(jegyek[element['Type']][i]['name'] == subjectName){
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

            var row = document.createElement("div");
            row.classList.add("row");
            var tabs = document.createElement("div");
            var ul = document.createElement("ul");
            ul.classList.add("tabs");
            for(var i = 0; i < 3; i++){
                var nameOfType;
                switch(i){
                    case 0:
                        nameOfType = "MidYear";
                        break;
                    case 1:
                        nameOfType = "HalfYear";
                        break;
                    default:
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
                    default:
                        displayName = "Évvégi jegyek";
                        break;
                }
                link.innerHTML = displayName;
                var li = document.createElement("li");
                li.classList.add("tab");
                li.classList.add("col");
                li.classList.add("s4");
                if(jegyek[nameOfType].length == 0){
                    li.classList.add("disabled");
                }
                li.appendChild(link);
                ul.appendChild(li);
            }
            tabs.appendChild(ul);

            row.appendChild(tabs);
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
                    default:
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
                    default:
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

            M.AutoInit();
            /*
            result['Evaluations'].forEach(function(element){
                if(element['Form'] == "Mark" && element['Type'] == "MidYear"){
                    var cardContainer = document.createElement("div");
                    cardContainer.classList.add("col");
                    cardContainer.classList.add("s12");
                    cardContainer.classList.add("m4");

                    var card = document.createElement("div");
                    card.classList.add("card");

                    var cardContent = document.createElement("div");
                    cardContent.classList.add("card-content");
                    cardContent.innerHTML = element['Subject'];

                    var cardTitle = document.createElement("div");
                    cardTitle.classList.add("card-title");
                    cardTitle.innerHTML = element['NumberValue'];

                    cardContent.appendChild(cardTitle);
                    card.appendChild(cardContent);
                    cardContainer.appendChild(card);
                    document.getElementById("jegyek").appendChild(cardContainer);
                }
            });*/
            isJegyeimLoadedOnce = true;
        });
    }
}

function renderMidYearGrades(row){
    var nameOfType = "MidYear";
    var typeContainer = document.createElement("div");
    typeContainer.classList.add("col");
    typeContainer.classList.add("s12");
    typeContainer.id = nameOfType;

    var spacing = document.createElement("div");
    spacing.classList.add("col");
    spacing.classList.add("hide-on-small");
    spacing.classList.add("m3");
    typeContainer.appendChild(spacing);

    var container = document.createElement("div");
    container.classList.add("col");
    container.classList.add("m6");
    container.classList.add("s12");

    for(var j = 0; j < jegyek[nameOfType].length; j++){
        //console.log(jegyek[nameOfType][j]["name"]);
        var subject = document.createElement("div");
        subject.classList.add("flow-text");
        subject.classList.add("col");
        subject.classList.add("s12");
        subject.classList.add("white-text");
        subject.innerHTML = `${jegyek["MidYear"][j]["name"]} – ${jegyek["MidYear"][j]["avg"]}`;
        //typeContainer.innerHTML += `<b><div class="flow-text col s12 white-text">${jegyek[nameOfType][j]["name"]}</div></b>`;
        container.appendChild(subject);
        typeContainer.appendChild(container);
            for(var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++){
                var currentGrade = jegyek[nameOfType][j]['grades'][k];
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

                var cardContainer = document.createElement("div");
                cardContainer.classList.add("col");
                cardContainer.classList.add("s12");
                cardContainer.classList.add("m4");

                var cardLink = document.createElement("a");
                cardLink.classList.add("modal-trigger");
                cardLink.href = `#Grade-${currentGrade['Id']}`;

                var card = document.createElement("div");
                card.classList.add("card");

                var cardContent = document.createElement("div");
                cardContent.classList.add("card-content");

                var cardTitle = document.createElement("div");
                cardTitle.classList.add("card-title");
                cardTitle.classList.add("truncate");

                cardTitle.innerHTML = `${currentGrade['Value']}`;

                cardContent.appendChild(cardTitle);
                card.appendChild(cardContent);
                cardLink.appendChild(card);
                cardContainer.appendChild(cardLink);
                container.appendChild(cardContainer);
                typeContainer.appendChild(container);

                var elems = document.querySelectorAll(`#Grade-${jegyek[nameOfType][j]['grades'][k]['Id']}`);
                var instances = M.Modal.init(elems, {});
            }
    }
    row.appendChild(typeContainer);
    document.getElementById("jegyek").appendChild(row);
}

function renderSpecialGrades(nameOfType, displayName, row){
    /*
    <ul class="collection with-header">
        <li class="collection-header"><h4>Félévi jegyek</h4></li>
        <li class="collection-item"><div class="col s9 truncate">Tantárgy</div><div class="col s3 truncate">5</div></li>
    </ul>
    */
    var typeContainer = document.createElement("div");
    typeContainer.classList.add("col");
    typeContainer.classList.add("s12");
    typeContainer.id = nameOfType;

    var spacing = document.createElement("div");
    spacing.classList.add("col");
    spacing.classList.add("hide-on-small");
    spacing.classList.add("m3");
    typeContainer.appendChild(spacing);

    var ulContainer = document.createElement("div");
    ulContainer.classList.add("col");
    ulContainer.classList.add("m6");
    ulContainer.classList.add("s12");

    var ul = document.createElement("ul");
    ul.classList.add("collection");
    ul.classList.add("with-header");

    var header = document.createElement("li");
    header.classList.add("collection-header");
    header.innerHTML = `<h4>${displayName}</h4>`;
    ul.appendChild(header);
    for(var j = 0; j < jegyek[nameOfType].length; j++){
        for(var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++){
            var li = document.createElement("li");
            li.classList.add("collection-item");
            li.innerHTML = `<div>${jegyek[nameOfType][j]['name']}<a href="#" class="secondary-content">${jegyek[nameOfType][j]['grades'][k]["Value"]}</p></div>`;
            ul.appendChild(li);
            //cardTitle.innerHTML = jegyek[nameOfType][j]['grades'][k]["Value"];
        }
    }
    ulContainer.appendChild(ul);
    typeContainer.appendChild(ulContainer);
    row.appendChild(typeContainer);
    document.getElementById("jegyek").appendChild(row);
}

function renderAbsences(){
    if (!isHianyzasokLoadedOnce) {
        loadUserDatas().then(function(result){
            result['Absences'].forEach(function(element){
                var isHianyzasokContainsDay = false;
                hianyzasok.forEach(function(element2){
                    if(element['LessonStartTime'] == element2['Date']){
                        isHianyzasokContainsDay = true;
                    }
                });
                if(!isHianyzasokContainsDay){
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
            result['Absences'].forEach(function(element){
                hianyzasok.forEach(function(element2){
                    if(element['LessonStartTime'] == element2['Date']){
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
            var ul = document.createElement("ul");
            ul.classList.add("collapsible");
            hianyzasok.forEach(function(element){
                var li = document.createElement("li");
                var header = document.createElement("div");
                header.classList.add("collapsible-header");

                header.innerHTML = `${element['Date'].split("T")[0].split("-")[0]}. ${element['Date'].split("T")[0].split("-")[1]}. ${element['Date'].split("T")[0].split("-")[2]} -&nbsp${element['Justification'] == "Justified" ? `<span class='green-text'>Igazolt mulasztás (${element['JustificationType']})</span>` : element['Justification'] == "BeJustified" ? "<span class='yellow-text'>Igazolandó mulasztás</span>" : "<span class='red-text'>Igazolatlan mulasztás</span>"}`;

                var body = document.createElement("div");
                body.classList.add("collapsible-body");

                var collection = document.createElement("ul");
                collection.classList.add("collection");

                element['Lessons'].forEach(function(element2){
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
            
            /*
            hianyzasok.forEach(function (element) {
                var cardContainer = document.createElement("div");
                cardContainer.classList.add("col");
                cardContainer.classList.add("s12");
                cardContainer.classList.add("m4");

                var divLink = document.createElement("a");
                divLink.classList.add("modal-trigger");
                divLink.href = `#Absences-${element['AbsenceId']}`;

                var modal = document.createElement("div");
                modal.classList.add("modal");
                modal.id = `Absences-${element['AbsenceId']}`;

                var modalContent = document.createElement("div");
                modalContent.classList.add("modal-content");
                modalContent.innerHTML = `<h4>${element['Date'].split("T")[0].split("-")[0]}. ${element['Date'].split("T")[0].split("-")[1]}. ${element['Date'].split("T")[0].split("-")[2]}</h4><br>${element['Justification'] == "Justified" ? "Igazolt mulasztás" : element['Justification'] == "BeJustified" ? "Igazolandó mulasztás" : "Igazolatlan mulasztás"}<br>${element['JustificationType']}`;

                modal.appendChild(modalContent);
                document.getElementById("hianyzasok").appendChild(modal);

                var elems = document.querySelectorAll(`#Absences-${element['AbsenceId']}`);
                var instances = M.Modal.init(elems, {});

                var card = document.createElement("div");
                card.classList.add("card");
                card.classList.add("white-text");
                if (element['Justification'] == "Justified") {
                    card.classList.add("green");
                } else if (element['Justification'] == "BeJustified") {
                    card.classList.add("yellow");
                } else {
                    card.classList.add("red");
                }
                card.classList.add("darken-2");

                var cardContent = document.createElement("div");
                cardContent.classList.add("card-content");

                var cardTitle = document.createElement("div");
                cardTitle.classList.add("card-title");
                cardTitle.innerHTML = `${element['Date'].split("T")[0].split("-")[0]}. ${element['Date'].split("T")[0].split("-")[1]}. ${element['Date'].split("T")[0].split("-")[2]}`

                cardContent.appendChild(cardTitle);
                card.appendChild(cardContent);
                divLink.appendChild(card);
                cardContainer.appendChild(divLink);
                document.getElementById("hianyzasok").appendChild(cardContainer);
            });
            */
            isHianyzasokLoadedOnce = true;
            
        });
    }
}

updateSchools().then(function(){
    var elems = document.querySelectorAll('.autocomplete');
    var data = {};
    var i = 0;

    var data = {};
    for (var i = 0; i < schools.length; i++) {
      data[schools[i].InstituteCode] = null; 
    }
    
    var instances = M.Autocomplete.init(elems, {
        "data": data,
        "limit": 5
    });
});

// Handle logging in
document.querySelector("#login").addEventListener("submit", function(e){
    kreta.loginUser(document.getElementById("schools").value, document.getElementById("username").value, document.getElementById("password").value).then(function(result){
        // Handling successful login
        // Storing school inside user.json
        result["InstituteCode"] = document.getElementById("schools").value;
        // Some toast to make login look cool
        M.toast({html: 'Sikeres bejelentkezés!'});
        // Save login datas
        saveLoginDatas(result);
        // Show the main page
        showPage("fooldal");
        // Hide logging in
        hidePage("login");
    }, function(){
        // Handling bad login datas (pretty fast tho)
        M.toast({html: 'Rossz felhasználónév vagy jelszó!'})
    });
    // Preventing from reloading page
    e.preventDefault();
});

/*
// Get API links
kreta.getApiLinks().then(function(result){
    apiLinks = result;
});
*/

/*
// Get schools
kreta.getSchools().then(function(result){
    schools = result;
});
*/
