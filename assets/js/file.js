const fs = require('fs');
const app = require('electron').remote.app;

module.exports = {
    get: function(user, file, onNullReturn){
        return new Promise(function (resolve, reject) {
            const path = `${app.getPath('userData')}/${user}/${file}.json`;
            if(fs.existsSync(path)){
                fs.readFile(path, 'utf8', function (err, data) {
                    if (err) reject(err);
                    resolve(JSON.parse(data));
                });
            } else {
                resolve(onNullReturn);
            }
        });
    },
    getGlobal: function(file, onNullReturn){
        return new Promise(function (resolve, reject) {
            const path = `${app.getPath('userData')}/${file}.json`;
            if(fs.existsSync(path)){
                fs.readFile(path, 'utf8', function (err, data) {
                    if (err) reject(err);
                    resolve(JSON.parse(data));
                });
            } else {
                resolve(onNullReturn);
            }
        });
    },
    save: function(user, file, data){
        return new Promise(function(resolve, reject){
            save(user, file, data).then(function(result, err){
                if(err) reject(err);
                resolve(result);
            });
        });
        
    },
    saveGlobal: function(file, data){
        return new Promise(function(resolve, reject){
            saveGlobal(file, data).then(function(result, err){
                if(err) reject(err);
                resolve(result);
            });
        });
    },
    remove(user, file){
        remove(user, file);
    }
};

function save(user, file, data){
    return new Promise(function (resolve, reject) {
        if(fs.existsSync(`${app.getPath('userData')}/${user}/${file}.json`)){
            remove(user, file);
        }
        fs.writeFile(`${app.getPath('userData')}/${user}/${file}.json`,  JSON.stringify(data), {encoding: 'utf8', flag: 'a+'}, function(err){
            if(err){
                if (!fs.existsSync(`${app.getPath('userData')}/${user}`)){
                    fs.mkdirSync(`${app.getPath('userData')}/${user}`);
                    save(user, file, data);
                } else {
                    reject(err);
                }
            }
            resolve("done");
        });
    });
}

function saveGlobal(file, data){
    return new Promise(function (resolve, reject) {
        if(fs.existsSync(`${app.getPath('userData')}/${file}.json`)){
            removeGlobal(file);
        }
        fs.writeFile(`${app.getPath('userData')}/${file}.json`,  JSON.stringify(data), {encoding: 'utf8', flag: 'a+'}, function(err){
            if(err){
                if (!fs.existsSync(`${app.getPath('userData')}`)){
                    fs.mkdirSync(`${app.getPath('userData')}`);
                    save(user, file, data);
                } else {
                    reject(err);
                }
            }
            resolve("done");
        });
    });
}

function remove(user, file){
    fs.unlinkSync(`${app.getPath('userData')}/${user}/${file}.json`);
}

function removeGlobal(file){
    fs.unlinkSync(`${app.getPath('userData')}/${file}.json`);
}

function saveTimetable(user, startDate, endDate, data){
    var file = `${startDate.getYear()}-${startDate.getMonth()+1}-${startDate.getDate()}-${endDate.getYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`;


}

function getTimetableList(user){

}