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
        }, function(){
            kreta.refreshToken(loginDatas['refresh_token'], loginDatas['InstituteCode']).then(function(result){
                saveLoginDatas(result);
                updateUserDatas();
            }, function(){
                showPage("login", true);
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
                        "grades": []
                    };
                    jegyek[element['Type']].push(subj);
                }
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
            });/*
            <div class="col s12">
                <ul class="tabs">
                <li class="tab col s3"><a href="#test1">Test 1</a></li>
                <li class="tab col s3"><a class="active" href="#test2">Test 2</a></li>
                <li class="tab col s3 disabled"><a href="#test3">Disabled Tab</a></li>
                <li class="tab col s3"><a href="#test4">Test 4</a></li>
                </ul>
            </div>
            <div id="test1" class="col s12">Test 1</div>
            <div id="test2" class="col s12">Test 2</div>
            <div id="test3" class="col s12">Test 3</div>
            <div id="test4" class="col s12">Test 4</div>*/
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
            /*
            <div id="MidYear" class="col s12">Test 1</div>
            <div id="HalfYear" class="col s12">Test 2</div>
            <div id="EndYear" class="col s12">Test 3</div>
            */
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
                var typeContainer = document.createElement("div");
                typeContainer.classList.add("col");
                typeContainer.classList.add("s12");
                typeContainer.id = nameOfType;
                for(var j = 0; j < jegyek[nameOfType].length; j++){
                    //console.log(jegyek[nameOfType][j]["name"]);
                    var subject = document.createElement("div");
                    subject.classList.add("flow-text");
                    subject.classList.add("col");
                    subject.classList.add("s12");
                    subject.classList.add("white-text");
                    subject.innerHTML = jegyek[nameOfType][j]["name"];
                    //typeContainer.innerHTML += `<b><div class="flow-text col s12 white-text">${jegyek[nameOfType][j]["name"]}</div></b>`;
                    typeContainer.appendChild(subject);
                        for(var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++){
                            //console.log(`${jegyek[nameOfType][j]['name']} - ${jegyek[nameOfType][j]['grades'][k]['NumberValue']}`)
                            var cardContainer = document.createElement("div");
                            cardContainer.classList.add("col");
                            cardContainer.classList.add("s12");
                            cardContainer.classList.add("m4");

                            var card = document.createElement("div");
                            card.classList.add("card");

                            var cardContent = document.createElement("div");
                            cardContent.classList.add("card-content");

                            var cardTitle = document.createElement("div");
                            cardTitle.classList.add("card-title");
                            cardTitle.classList.add("truncate");
                            cardTitle.innerHTML = jegyek[nameOfType][j]['grades'][k]["Value"];

                            cardContent.appendChild(cardTitle);
                            card.appendChild(cardContent);
                            cardContainer.appendChild(card);
                            typeContainer.appendChild(cardContainer);
                        }
                }
                row.appendChild(typeContainer);
                document.getElementById("jegyek").appendChild(row);
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
                        "JustificationType": element['JustificationTypeName']
                    };
                    hianyzasok.push(day);
                }
            });
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
