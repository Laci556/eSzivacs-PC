module.exports = {}

const main = require('../main')

function render(){
    initSchoolsAutoComplete(getSchools())
}

function getSchools(){
    return new Promise(function(resolve, reject){
        main.getSchools().then(function(result, err){
            if(err) {
                main.updateSchools().then(function(result, err){
                    if(err) reject(err)
                    main.getSchools().then(function(result, err){
                        if(err) reject(err)
                        resolve(result)
                    })
                })
            } else {
                resolve(result)
            }
        })
    })
}

function initSchoolsAutoComplete(schoolsData){
    var schools = document.querySelector('#schools')
    var data = {}

    for(var i = 0; i < schoolsData.length; i++){
        data[institutes[i].name] = null
    }
    
    M.Autocomplete.init(schools, {
        data: data,
        limit: 5
    })
}