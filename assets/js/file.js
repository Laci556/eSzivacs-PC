const fs = require('fs');
const app = require('electron').remote.app;

module.exports = {
    get: function(user, file){
        return new Promise(function (resolve, reject) {
            const path = `${app.getPath('userData')}/${file}.json`;
            if(fs.existsSync(path)){
                fs.readFile(path, 'utf8', function (err, data) {
                    if (err) reject(err);
                    resolve(JSON.parse(data));
                });
            } else {
                resolve("");
            }
        });
    },
    save: function(user, file, data){
        save(user, file, data);
    },
    remove(user, file){
        remove(user, file);
    }
};

function save(user, file, data){
    return new Promise(function (resolve, reject) {
        if(fs.existsSync(`${app.getPath('userData')}/${file}.json`)){
            remove(user, file);
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
    fs.unlinkSync(`${app.getPath('userData')}/${file}.json`);
}

function saveTimetable(user, startDate, endDate, data){
    var file = `${startDate.getYear()}-${startDate.getMonth()+1}-${startDate.getDate()}-${endDate.getYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`;


}

function getTimetableList(user){

}