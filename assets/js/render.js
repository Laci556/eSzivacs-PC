module.exports = {
    toggleNav: function(toShow){
        showNavbar(toShow);
    }
};


function showNavbar(toShow) {
    var showTitleBarLogo;
    var titleBarColor;
    var showNavBar;

    if (toShow) {
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