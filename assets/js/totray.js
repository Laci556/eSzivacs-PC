module.exports = {
    totray: function() {
        return new Promise(function(resolve, reject){
            const file = require('./file');

            file.getGlobal("settings", {}).then(function(result, err){
                if(err) reject(err);
                if(result["totray"] == true){
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
};