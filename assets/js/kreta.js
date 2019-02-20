const apiKey = "7856d350-1fda-45f5-822d-e1a2f3f1acf0";
var request = require('request');


module.exports = {
    getApiLinks: function(){
        return getApiLinks();
    },
    getSchools: function(){
        return getSchools();
    },
    loginUser: function(institute_code, userName, password){
        return loginUser(institute_code, userName, password);
    },
    getUserDatas: function(bearer, institute_code, startData, endDate){
        return getUserDatas(bearer, institute_code, startData, endDate);
    },
    getTimetable: function(bearer, institute_code, startDate, endDate){
        return getTimetable(bearer, institute_code, startDate, endDate);
    },
    refreshToken: function(refresh_token, institute_code){
        return refreshToken(refresh_token, institute_code);
    }
};

function refreshToken(refresh_token, institute_code){
    var dataString = `refresh_token=${refresh_token}&grant_type=refresh_token&client_id=919e0c1c-76a2-4646-a2fb-7085bbbf3c56`;

    var options = {
        url: `https://${institute_code}.e-kreta.hu/idp/api/v1/Token`,
        method: 'POST',
        body: dataString
    };

    return new Promise(function(resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            reject(error);
        });
    });
}

function getApiLinks(){
    var options = {
        url: 'http://kretamobile.blob.core.windows.net/configuration/ConfigurationDescriptor.json'
    };

    // Return new promise 
    return new Promise(function(resolve, reject) {
        // Do async job
        request(options, function(error, response, body){
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(error);
            }
        });
    });
}

function getSchools(){
    var headers = {
        'apiKey': apiKey
    };

    var options = {
        url: 'https://kretaglobalmobileapi.ekreta.hu/api/v1/Institute',
        headers: headers
    };
    return new Promise(function(resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            reject(error);
        });
    });
}

function loginUser(institute_code, userName, password){
    var request = require('request');

    var dataString = `institute_code=${institute_code}&userName=${userName}&password=${password}&grant_type=password&client_id=919e0c1c-76a2-4646-a2fb-7085bbbf3c56`;

    var options = {
        url: `https://${institute_code}.e-kreta.hu/idp/api/v1/Token`,
        method: 'POST',
        body: dataString
    };

    return new Promise(function(resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            reject(error);
        });
    });
}

function getUserDatas(bearer, institute_code, startDate, endDate){
    var headers = {
        'Authorization': `Bearer ${bearer}`
    };

    var date = "";
    if(startDate != null && endDate != null){
        date = `?fromDate=${startDate}&toDate=${endDate}`;
    }

    var options = {
        url: `https://${institute_code}.e-kreta.hu/mapi/api/v1/Student${date}`,
        headers: headers
    };

    return new Promise(function(resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            reject(error);
        });
    });
}

function getTimetable(bearer, institute_code, startData, endDate){
    var headers = {
        'Authorization': `Bearer ${bearer}`
    };

    var date = "";
    if(startData != null && endDate != null){
        date = `?fromDate=${startData}&toDate=${endDate}`;
    }

    var options = {
        url: `https://${institute_code}.e-kreta.hu/mapi/api/v1/Lesson${date}`,
        headers: headers
    };

    return new Promise(function(resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            reject(error);
        });
    });
}


function getHomeWork(tanari = true){
    return "TODO";
}