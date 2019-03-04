module.exports = {
    currentUser: function(){
        return currentUser;
    },
    login: function(instituteCode, username, password){
        login(instituteCode, username, password).then(function(result, err){
            if(err) reject(err)
            resolve(result)
        })
    },
    refreshToken: function(user){
        refreshToken(user).then(function(result, err){
            if(err) reject(err)
            resolve(result)
        })
    },
    getLoginDatas: function(user){
        getLoginDatas(user).then(function(result, err){
            if(err) reject(err)
            resolve(result)
        })
    },
    updateUserDatas: function(user){
        updateUserDatas(user).then(function(result, err){
            if(err) reject(err)
            resolve(result)
        })
    },
    getUserDatas: function(user){
        getUserDatas(user).then(function(result, err){
            if(err) reject(err)
            resolve(result)
        })
    }
}

var currentUser

function login(instituteCode, username, password){
    return new Promise(function(resolve, reject){
        kreta.loginUser(instituteCode, username, password).then(function(result, err){
            if(err) reject(err)
            file.getGlobal('users', []).then(function(users){               
                var user = {
                    "Id": username,
                    "InstituteCode": instituteCode,
                    "Selected": true
                }
                users.push(user);
                file.saveGlobal('users', users).then(function(users2, err){
                    if(err) reject(err)
                    currentUser = {
                        "Id": username,
                        "InstituteCode": instituteCode
                    }
                    file.save(currentUser, 'login', result).then(function(result, err){
                        if(err) reject(err)
                        resolve('done')
                    })
                })
            })
        })
    })
}

function refreshToken(user){
    return new Promise(function(resolve, reject){
        file.get(`${user['Id']}-${user['InstituteCode']}`, 'login').then(function(result, err){
            if(err) reject(err)
            file.save(`${user['Id']}-${user['InstituteCode']}`, 'login', result).then(function(result, err){
                if(err) reject(err)
                resolve('done')
            })
        })
    })
}

function getLoginDatas(user){
    return new Promise(function(resolve, reject){
        file.get(`${user['Id']}-${user['InstituteCode']}`, 'login').then(function(result, err){
            if(undefined) reject(new Error('No such user logged in yet'))
            resolve(result);
        })
    })
}

function updateUserDatas(user){
    return new Promise(function(resolve, reject){
        file.get(`${user['Id']}-${user['InstituteCode']}`, 'login').then(function(result, err){
            if(err) reject(err)
            kreta.getUserDatas(result['access_token'], user['InstituteCode']).then(function(result, err){
                if(err) reject(err)
                file.save(`${user['Id']}-${user['InstituteCode']}`, 'user', result).then(function(result, err){
                    if(err) reject(err)
                    resolve('done');
                })
            })
        })
    })
}

function getUserDatas(user){
    return new Promise(function(resolve, reject){
        file.get(`${user['Id']}-${user['InstituteCode']}`, 'user').then(function(result, err){
            if(err) reject(err)
            resolve(result)
        })
    })
}

function getSchools(){
    return new Promise(function(resolve, reject){
        file.getGlobal('schools').then(function(result, err){
            if(err) reject(err)
            if(result == undefined) reject(new Error('Not yet queried schools'))
            resolve(result)
        })
    })
}

function updateSchools(){
    return new Promise(function(resolve, reject){
        kreta.getSchools().then(function(result, err){
            if(err) reject(err)
            file.saveGlobal('schools', result).then(function(result, err){
                if(err) reject(err)
                resolve('done')
            })
        })
    })
}