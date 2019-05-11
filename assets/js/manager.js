"use strict"

const kreta = require('./js/kreta')
const file = require('./js/file')
const os = require('os')
const LoggerUtil = require('./js/loggerutil')
const {ipcRenderer} = require('electron')

const loggerUICore = LoggerUtil('%c[UICore]', 'color: #000668; font-weight: bold')
const loggerAutoUpdater = LoggerUtil('%c[AutoUpdater]', 'color: #000668; font-weight: bold')
const loggerNotification = LoggerUtil('%c[Értesítések]', 'color: #ffaaff; font-weight: bold')
const loggerAutoUpdaterSuccess = LoggerUtil('%c[AutoUpdater]', 'color: #209b07; font-weight: bold')

require('../renderer.js')

const isDev = require('./js/isdev')

M.AutoInit()

var currentUser
var instituteCode
var id
var loginDatas
var isFooldalLoadedOnce = false
var isJegyeimLoadedOnce = false
var isHianyzasokLoadedOnce = false
var isOrarendLoadedOnce = false
var hianyzasok = []
var jegyek = {
	MidYear: [],
	MidYearDate: [],
	HalfYear: [],
	EndYear: []
}
var timetableDatas = []
var positionInTime = 0

function getSchools() {
	return new Promise(function (resolve, reject) {
		file.getGlobal('schools').then(function (result, err) {
			if (err) reject(err)
			//M.toast({html: "Iskolák betöltése folyamatban..."})
			if (result != undefined) {
				//M.toast({html: "Sikeres betöltés: fájlból"})
				resolve(result)
			} else {
				updateSchools().then(function () {
					getSchools().then(function (result2) {
						//M.toast({html: "Sikeres betöltés: letöltve az internetről"})
						resolve(result2)
					})
				})
			}
		})
	})
}

function updateSchools() {
	return new Promise(function (resolve, reject) {
		kreta.getSchools().then(function (result, err) {
			if (err) reject(err)
			file.saveGlobal('schools', result).then(function () {
				resolve('')
			})
		})
	})
}

function showPage(page, hideEveryThing) {
	if (hideEveryThing) {
		hidePage('login')
		hidePage('fooldal')
		hidePage('jegyek')
		hidePage('hianyzasok')
		hidePage('orarend')
		hidePage('beallitasok')
	}
	document.getElementById(page).style.display = 'block'
	loadUserDatas().then(function (result) {
		document.getElementById('username').innerHTML = result['Name']
	})
	if (page == 'login') {
		showNavbar(false)
	} else {
		showNavbar(true)
	}
	if (page == 'fooldal') {
		renderFooldal()
	} else if (page == 'jegyek') {
		renderGrades()
	} else if (page == 'hianyzasok') {
		renderAbsences()
	} else if (page == 'orarend') {
		renderTimetable(0)
	} else if (page == 'beallitasok') {
		renderBeallitasok()
	}
}

function logout() {
	file.remove(currentUser, 'login')
	loginDatas = undefined
	showNavbar(false)
	showPage('login', true)
	initAutoCompleteForLoginSchools()
}

function resetPages() {
	isFooldalLoadedOnce = false
	isHianyzasokLoadedOnce = false
	isJegyeimLoadedOnce = false
	isOrarendLoadedOnce = false
}

function updateMyDatas() {
	updateUserDatas().then(
		function (result) {
			if (result == 'done') {
				// resetPages()
				// showPage(currentPage, true)
				location.reload()
				M.toast({ html: 'Sikeresen frissítetted az adataidat!' })
			}
		},
		function (err) {
			showPage('login', true)
		}
	)
}

require('electron').remote.app.on('window-all-closed', function () { })

function initAutoCompleteForLoginSchools() {
	getSchools().then(function (result) {
		var elems = document.querySelectorAll('#schools')
		var data = {}
		var i = 0

		var data = {}
		for (var i = 0; i < result.length; i++) {
			data[result[i].Name] = null
		}

		var instances = M.Autocomplete.init(elems, {
			data: data,
			limit: 5
		})
	})
}

function fooldal() {
	showPage('fooldal', true)
}

function jegyekFunc() {
	showPage('jegyek', true)
}

function hianyzasokFunc() {
	showPage('hianyzasok', true)
}

function orarendFunc() {
	showPage('orarend', true)
}

function openConsole() {
	require('electron')
		.remote.getCurrentWindow()
		.webContents.openDevTools()
}

function settingsFunc() {
	showPage('beallitasok', true)
}

function showNavbar(toShow) {
	var showTitleBarLogo
	var titleBarColor
	var showNavBar

	if (toShow) {
		M.Dropdown.init(
			document.querySelector('.dropdown-trigger', {
				alignment: 'bottom',
				constrainWidth: false
			})
		)

		titleBarColor = '#000'
		//'-webkit-linear-gradient(top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
		showTitleBarLogo = 'none'
		showNavBar = 'block'

		var logoutButtons = document.getElementsByClassName('logout')
		var fooldalButtons = document.getElementsByClassName('fooldal')
		var jegyekButtons = document.getElementsByClassName('jegyek')
		var hianyzasokButtons = document.getElementsByClassName('hianyzasok')
		var updateMyDatasButtons = document.getElementsByClassName('updateMyDatas')
		var orarendButtons = document.getElementsByClassName('orarend')
		var timetableBackButtons = document.getElementsByClassName('timetableBack')
		var timetableFwButtons = document.getElementsByClassName('timetableFw')
		var consoleButtons = document.getElementsByClassName('console')
		var settingsButtons = document.getElementsByClassName('settings')

		loadUserDatas().then(function (result) {
			document.getElementById('name').innerHTML = result['Name']
			document.getElementById('school').innerHTML = result['InstituteName']
		})

		for (var i = 0; i < fooldalButtons.length; i++) {
			(function (index) {
				fooldalButtons[index].addEventListener('click', fooldal)
			})(i)
		}
		for (var i = 0; i < jegyekButtons.length; i++) {
			(function (index) {
				jegyekButtons[index].addEventListener('click', jegyekFunc)
			})(i)
		}
		for (var i = 0; i < hianyzasokButtons.length; i++) {
			(function (index) {
				hianyzasokButtons[index].addEventListener('click', hianyzasokFunc)
			})(i)
		}
		for (var i = 0; i < logoutButtons.length; i++) {
			(function (index) {
				logoutButtons[index].addEventListener('click', logout)
			})(i)
		}
		for (var i = 0; i < updateMyDatasButtons.length; i++) {
			(function (index) {
				updateMyDatasButtons[index].addEventListener('click', updateMyDatas)
			})(i)
		}
		for (var i = 0; i < orarendButtons.length; i++) {
			(function (index) {
				orarendButtons[index].addEventListener('click', orarendFunc)
			})(i)
		}
		for (var i = 0; i < timetableBackButtons.length; i++) {
			(function (index) {
				timetableBackButtons[index].addEventListener('click', timetableBack)
			})(i)
		}
		for (var i = 0; i < timetableFwButtons.length; i++) {
			(function (index) {
				timetableFwButtons[index].addEventListener('click', timetableFw)
			})(i)
		}
		for (var i = 0; i < consoleButtons.length; i++) {
			(function (index) {
				consoleButtons[index].addEventListener('click', openConsole)
			})(i)
		}
		for (var i = 0; i < settingsButtons.length; i++) {
			(function (index) {
				settingsButtons[index].addEventListener('click', settingsFunc)
			})(i)
		}
	} else {
		titleBarColor = '#000'
		//'-webkit-linear-gradient(top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
		showTitleBarLogo = 'block'
		showNavBar = 'none'
	}

	document.getElementById('title-bar').style.background = titleBarColor
	document.getElementById('title').style.display = showTitleBarLogo
	document.getElementById('navbar').style.display = showNavBar
	document.getElementById('title-bar-btns').style.background = 'rgba(0,0,0,0)'
}

function hidePage(page) {
	document.getElementById(page).style.display = 'none'
}

function loadLoginDatas() {
	return new Promise(function (resolve, reject) {
		file.getGlobal('users').then(function (result) {
			if (result == undefined) {
				resolve(undefined)
			}
			if (result.length > 0) {
				for (var i = 0; i < result.length; i++) {
					if (result[i]['Selected']) {
						id = result[i]['Id']
						currentUser = `${result[i]['Id']}-${result[i]['InstituteCode']}`
						file.get(currentUser, 'login').then(function (result, err) {
							if (err) reject(err)
							// console.log(result)
							resolve(result)
						})
					}
				}
			} else {
				resolve(undefined)
			}
		})
	})
}

function saveLoginDatas(user, id, instituteCode) {
	return new Promise(function (resolve, reject) {
		user['InstituteCode'] = instituteCode
		file
			.save(`${id}-${instituteCode}`, 'login', user)
			.then(function (result, err) {
				if (err) reject(err)
				resolve(result)
			})
	})
}

var triesToUpdateTimetable = 0
function updateTimetable(startDate, endDate) {
	triesToUpdateTimetable++
	// if (triesToUpdateTimetable < 4) {
	return new Promise(function (resolve, reject) {
		file.get(currentUser, 'login').then(function (result) {
			kreta
				.getTimetable(
					result['access_token'],
					result['InstituteCode'],
					startDate,
					endDate
				)
				.then(
					function () {
						// console.log(`${startDate} -- ${endDate} `)
						resolve(result)
					},
					function () {
						// Hiba esetén újrapróbálkozás
						kreta
							.refreshToken(result['refresh_token'], result['InstituteCode'])
							.then(function (result2) {
								saveLoginDatas(result2, result['InstituteCode']).then(
									function () {
										updateUserDatas().then(function () {
											updateTimetable(startDate, endDate).then(function (
												result
											) {
												resolve(result)
											})
										})
									}
								)
							})
					}
				)
		})
	})
	// } else {
	//	 document.getElementById(
	//		 'timetables'
	//	 ).innerHTML = `<div class="card col s12 m6 offset-m3"><div class="card-content"><div class="card-title center-align">Hiba lépett fel!</div><div class="row"><div class="col s12 justify">Nem sikerült betölteni az órarendet harmadjára sem. A manuális újrapróbáláshoz kattints a gombra!</div><div class="row center"><a class="btn btn-flat waves-effect waves-grey" id="retryTimetable">Újrapróbálkozás</a></div></div></div></div>`
	//	 document
	//		 .getElementById('retryTimetable')
	//		 .addEventListener('click', function(startDate, endDate) {
	//			 updateTimetable(startDate, endDate).then(function(result) {
	//				 resolve(result)
	//			 })
	//		 })
	// }
}

// NEM MŰKÖDIK!!!
function refreshToken() {
	// Bejelentkezési tokenek frissítése automatikusan
	file.get(currentUser, 'login').then(function (result) {
		setTimeout(function () {
			kreta
				.refreshToken(result['refresh_token'], instituteCode)
				.then(function (result) {
					file.save(currentUser, 'login', result)
				})
			refreshToken()
		}, 3599)
	})
}

function updateUserDatas() {
	return new Promise(function (resolve, reject) {
		// console.log(currentUser)
		file.get(currentUser, 'login').then(function (result) {
			var instituteCode
			file.getGlobal('users').then(function (result2) {
				result2.forEach(function (element) {
					if (element['Id'] == id) {
						instituteCode = element['InstituteCode']
					}
				})
				kreta
					.getUserDatas(result['access_token'], instituteCode, null, null)
					.then(
						function (result2) {
							file.save(currentUser, 'user', result2)
							resolve('done')
						},
						function () {
							kreta.refreshToken(result['refresh_token'], instituteCode).then(
								function (result2) {
									file.save(currentUser, 'login', result2)
									updateUserDatas().then(function (result3, err) {
										if (err) reject(err)
										resolve(result3)
									})
								},
								function () {
									showPage('login', true)
								}
							)
						}
					)
			})
		})
	})
}

function loadUserDatas() {
	return new Promise(function (resolve, reject) {
		file.get(currentUser, 'user').then(function (result, err) {
			if (err) reject(err)
			// console.log(result)
			if (result != undefined) {
				// console.log('From file')
				resolve(result)
			} else {
				updateUserDatas().then(function (result, err) {
					// console.log('Updating...')
					if (err) reject(err)
					loadUserDatas().then(function (result2, err) {
						// console.log('Updated and value returned!')
						if (err) reject(err)
						// Valamiért nem olvassa ki első alkalommal, amikor még a fájlba is írunk, ezért csinálunk egy ilyen csúfságot
						resolve(result2)
					})
				})
			}
		})
	})
}

loadLoginDatas().then(
	function (result) {
		loginDatas = result
		if (loginDatas != undefined) {
			// console.log('Megvan az adat!')
			showPage('fooldal')
		} else {
			// console.log('Létezik a login.json, de üres')
			showPage('login')
		}
	},
	function (err) {
		// console.log('Nincsen login.json, most fogunk csinálni!')
		showPage('login')
	}
)

function renderBeallitasok() {
	if (os.platform() == 'win32') {
		file.getGlobal('settings').then(function (result) {
			if (result['startup'] == true) {
				document.getElementById('startup').checked = true
			} else {
				document.getElementById('startup').checked = false
			}

			if (result['notifications'] == true) {
				document.getElementById('notifications').checked = true
			} else {
				document.getElementById('notifications').checked = false
			}

			if (result['totray'] == true) {
				document.getElementById('totray').checked = true
			} else {
				document.getElementById('totray').checked = false
			}
		})
	} else {
		// Windowson kívül minden platformon legyenek kikapcsolva a beállítások
		document.getElementById('startup').disabled = true
		document.getElementById('notifications').disabled = true
		document.getElementById('totray').disabled = true
	}
}

initAutoCompleteForLoginSchools()

function renderFooldal() {
	file.get(currentUser, 'settings', {}).then(function (result) {
		if (result['notifications']) {
			startNotificationListener()
		}
	})

	loadUserDatas().then(function (result) {
		if (!isFooldalLoadedOnce) {
			var gradesNumber = 0
			var strázsa = 0
			while (gradesNumber < 6) {
				if (result['Evaluations'][strázsa]['Type'] == 'MidYear') {
					document.getElementById('fooldalGrades').innerHTML += `
										<li class="collection-item">
												<div>${
						result['Evaluations'][strázsa]['Subject']
						}<a href="#!" class="secondary-content">${
						result['Evaluations'][strázsa]['NumberValue'] > 0
							? result['Evaluations'][strázsa]['NumberValue']
							: result['Evaluations'][strázsa]['Value']
						}</a></div>
										</li>
										`
					gradesNumber++
				}
				strázsa++
			}
			var isFirstNote = true
			result['Notes'].forEach(function (element) {
				document.getElementById('fooldalNotes').innerHTML += `
								<li>
										<ul class="collapsible">
												<li ${isFirstNote ? `class="active"` : ''}>
														<div class="collapsible-header">${
					element['Title']
					}</div>
														<div class="collapsible-body"><span>${
					element['Content']
					}</span></div>
												</li>
										</ul>
								</li>
								`
				isFirstNote = false
			})

			loadLoginDatas().then(function (result, err) {
				var todayClasses = `<div class="col s12 m4">
				<ul class="collection with-header" id="fooldalGrades">
					<li class="collection-header">
						<h4>Mai óráid</h4>
					</li>`
				if (err) throw new Error('Hiba: ' + err)

				file.getGlobal('users').then(function (users) {
					var instituteCode
					users.forEach(function (user) {
						if (user['Id'] == currentUser.split('-')[0]) {
							instituteCode = user['InstituteCode']
						}
					})

					let current_datetime = new Date()
					let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate()
					var van = false;
					kreta
						.getTimetable(
							result['access_token'],
							instituteCode,
							formatted_date,
							formatted_date
						).then(function (result, err) {
							console.log(result)
							result.forEach(function (element) {
								van = true
								todayClasses += `<li class="collection-item"><div class="truncate">${element["Subject"]} <a href="#" class="secondary-content">${new Date(element["StartTime"]).getHours()}:${new Date(element["StartTime"]).getMinutes()} - ${new Date(element["EndTime"]).getHours()}:${new Date(element["EndTime"]).getMinutes()}</a></div></li>`

							})

							todayClasses += `</ul>`

							if (van) {
								document.getElementById('fooldal').innerHTML += todayClasses
							}

							M.Collapsible.init(document.querySelectorAll('.collapsible'), {})
						})
				})
			})
			
			isFooldalLoadedOnce = true;
		}
	})
}

function renderGrades() {
	if (!isJegyeimLoadedOnce) {
		loadUserDatas().then(function (result) {
			result['Evaluations'].forEach(function (element) {
				var isThisContains = false
				for (var i = 0; i < jegyek[element['Type']].length; i++) {
					if (jegyek[element['Type']][i]['name'] == element['Subject']) {
						isThisContains = true
					}
				}
				if (!isThisContains) {
					var subjectName = element['Subject']
					if (element['Subject'] == null) {
						if (element['Form'] == 'Deportment') {
							subjectName = 'Magatartás'
						} else {
							subjectName = 'Szorgalom'
						}
					}
					var subj = {
						name: subjectName,
						grades: [],
						avg: 0,
						classAvg: 0
					}
					jegyek[element['Type']].push(subj)
				}
			})

			result['Evaluations'].forEach(function (element) {
				var isThisContains = false
				for (var i = 0; i < jegyek['MidYearDate'].length; i++) {
					if (
						jegyek['MidYearDate'][i]['date'] == element['Date'] ||
						element['Type'] != 'MidYear'
					) {
						isThisContains = true
					}
				}
				if (!isThisContains) {
					var subj = {
						date: element['Date'],
						grades: []
					}
					jegyek['MidYearDate'].push(subj)
				}
			})

			result['Evaluations'].forEach(function (element) {
				for (var i = 0; i < jegyek['MidYearDate'].length; i++) {
					if (
						jegyek['MidYearDate'][i]['date'] == element['Date'] &&
						element['Type'] == 'MidYear'
					) {
						var jegy = {
							Id: element['EvaluationId'],
							Subject: element['Subject'],
							CreatingTime: element['CreatingTime'],
							Date: element['Date'],
							FormName: element['FormName'],
							Mode: element['Mode'],
							NumberValue: element['NumberValue'],
							Teacher: element['Teacher'],
							Theme: element['Theme'],
							TypeName: element['TypeName'],
							Value: element['Value'],
							Weight: element['Weight']
						}
						jegyek['MidYearDate'][i]['grades'].push(jegy)
					}
				}
			})

			jegyek['MidYear'].forEach(function (element) {
				result['SubjectAverages'].forEach(function (element2) {
					if (element2['Subject'] == element['name']) {
						element['avg'] = element2['Value']
						element['classAvg'] = element2['ClassValue']
					}
				})
			})

			var numValueQuantitiy = 0
			result['Evaluations'].forEach(function (element) {
				for (var i = 0; i < jegyek[element['Type']].length; i++) {
					var subjectName = element['Subject']
					if (element['Subject'] == null) {
						if (element['Form'] == 'Deportment') {
							subjectName = 'Magatartás'
						} else {
							subjectName = 'Szorgalom'
						}
					}
					if (jegyek[element['Type']][i]['name'] == subjectName) {
						var jegy = {
							Id: element['EvaluationId'],
							CreatingTime: element['CreatingTime'],
							Date: element['Date'],
							FormName: element['FormName'],
							Mode: element['Mode'],
							NumberValue: element['NumberValue'],
							Teacher: element['Teacher'],
							Theme: element['Theme'],
							TypeName: element['TypeName'],
							Value: element['Value'],
							Weight: element['Weight']
						}
						jegyek[element['Type']][i]['grades'].push(jegy)
					}
				}
			})

			jegyek['MidYear'].sort(function (a, b) {
				if (a.name < b.name) {
					return -1
				}
				if (a.name > b.name) {
					return 1
				}
				return 0
			})

			jegyek['MidYearDate'].sort(function (a, b) {
				if (a.date < b.date) {
					return 1
				}
				if (a.date > b.date) {
					return -1
				}
				return 0
			})

			jegyek['HalfYear'].sort(function (a, b) {
				if (a.name < b.name) {
					return -1
				}
				if (a.name > b.name) {
					return 1
				}
				return 0
			})

			jegyek['EndYear'].sort(function (a, b) {
				if (a.name < b.name) {
					return -1
				}
				if (a.name > b.name) {
					return 1
				}
				return 0
			})

			var row = document.createElement('div')
			row.classList.add('row')
			var tabsContainer = document.createElement('div')
			tabsContainer.classList.add('black')
			var tabs = document.createElement('div')
			tabs.classList.add('container')
			tabs.classList.add('no-autoinit')
			var ul = document.createElement('ul')
			ul.classList.add('tabs')
			ul.id = 'gradesTabs'
			for (var i = 0; i < 3; i++) {
				var nameOfType
				switch (i) {
					case 0:
						nameOfType = 'MidYear'
						break
					case 1:
						nameOfType = 'HalfYear'
						break
					case 2:
						nameOfType = 'EndYear'
						break
				}

				var link = document.createElement('a')
				link.classList.add('active')
				link.href = `#${nameOfType}`
				var displayName
				switch (nameOfType) {
					case 'MidYear':
						displayName = 'Évközi jegyek'
						break
					case 'HalfYear':
						displayName = 'Félévi jegyek'
						break
					case 'EndYear':
						displayName = 'Évvégi jegyek'
						break
				}
				link.innerHTML = displayName
				var li = document.createElement('li')
				li.classList.add('tab')
				li.classList.add('col')
				li.classList.add('s4')
				if (jegyek[nameOfType].length == 0) {
					li.classList.add('disabled')
				}
				li.appendChild(link)
				ul.appendChild(li)
			}
			tabs.appendChild(ul)
			tabsContainer.appendChild(tabs)
			row.appendChild(tabsContainer)
			document.getElementById('jegyek').appendChild(row)
			for (var i = 0; i < 3; i++) {
				var nameOfType
				switch (i) {
					case 0:
						nameOfType = 'MidYear'
						break
					case 1:
						nameOfType = 'HalfYear'
						break
					case 2:
						nameOfType = 'EndYear'
						break
				}

				var displayName
				switch (nameOfType) {
					case 'MidYear':
						displayName = 'Évközi jegyek'
						break
					case 'HalfYear':
						displayName = 'Félévi jegyek'
						break
					case 'EndYear':
						displayName = 'Évvégi jegyek'
						break
				}

				switch (nameOfType) {
					case 'MidYear':
						renderMidYearGrades(row)
						break
					default:
						renderSpecialGrades(nameOfType, displayName, row)
						break
				}
			}

			M.Tabs.init(document.querySelectorAll('.tabs'), {})

			M.Collapsible.init(document.querySelectorAll('.collapsible'), {})
			isJegyeimLoadedOnce = true
		})
	}
}

// JEGYEK BEÍRÁS SORRENDJÉBEN
function renderMidYearDateGrades(row) {
	// Rendezés beírás ideje alapján
	var nameOfType = 'MidYearDate'
	var typeContainer = document.createElement('div')
	typeContainer.classList.add('col')
	typeContainer.classList.add('s12')
	typeContainer.id = nameOfType

	var container = document.createElement('div')
	container.classList.add('container')

	var collapsible = document.createElement('ul')
	collapsible.classList.add('collapsible')
	collapsible.id = 'MidYearDate'

	collapsible.style.display = 'none'

	for (var j = 0; j < jegyek[nameOfType].length; j++) {
		var collLi = document.createElement('li')

		var header = document.createElement('div')
		header.classList.add('collapsible-header')
		header.innerHTML = `${
			jegyek[nameOfType][j]['date'].split('T')[0].split('-')[0]
			}. ${jegyek[nameOfType][j]['date'].split('T')[0].split('-')[1]}. ${
			jegyek[nameOfType][j]['date'].split('T')[0].split('-')[2]
			}. - ${jegyek[nameOfType][j]['grades'].length} db értékelés`

		var body = document.createElement('div')
		body.classList.add('collapsible-body')

		var ul = document.createElement('ul')
		ul.classList.add('collection')

		for (var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++) {
			var currentGrade = jegyek[nameOfType][j]['grades'][k]

			var cardLink = document.createElement('a')
			cardLink.classList.add('modal-trigger')
			cardLink.href = `#Grade-${currentGrade['Id']}`

			var li = document.createElement('li')
			li.classList.add('collection-item')
			li.innerHTML = `${currentGrade['Subject']} - ${currentGrade['Value']}`

			cardLink.appendChild(li)
			ul.appendChild(cardLink)

			M.Modal.init(
				document.querySelector(
					`#Grade-${jegyek[nameOfType][j]['grades'][k]['Id']}`
				),
				{}
			)
		}
		body.appendChild(ul)
		collLi.appendChild(header)
		collLi.appendChild(body)
		collapsible.appendChild(collLi)
	}
	container.appendChild(collapsible)
	document.getElementById('MidYear').appendChild(container)
	M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {})
}

function showMidYear() {
	document.getElementById('MidYearABC').style.display = 'block'
	document.getElementById('MidYearDate').style.display = 'none'
}

function showMidYearDate() {
	document.getElementById('MidYearABC').style.display = 'none'
	document.getElementById('MidYearDate').style.display = 'block'
}

// ÉVKÖZI JEGYEK ABC SORRENDBEN
function renderMidYearGrades(row) {
	var nameOfType = 'MidYear'
	var typeContainer = document.createElement('div')
	typeContainer.classList.add('col')
	typeContainer.classList.add('s12')
	typeContainer.id = nameOfType

	var container = document.createElement('div')
	container.classList.add('container')

	container.innerHTML += `
		<div class="row" style="margin-top:20px">
				<span class="flow-text white-text" style="margin-left:10px">Évközi értékelések</span>
				<a class='dropdown-trigger btn-flat waves-effect waves-grey white-text right' href='#' data-target='dropdown1'><i class="material-icons">sort</i>Rendezés</a>
		</div>
		<ul id='dropdown1' class='dropdown-content'>
				<li><a href="#" id="MidYearBtn">Tantárgy</a></li>
				<li><a href="#" id="MidYearDateBtn">Értékelés ideje</a></li>
		</ul>
		`

	var collapsible = document.createElement('ul')
	collapsible.classList.add('collapsible')
	collapsible.id = 'MidYearABC'

	for (var j = 0; j < jegyek[nameOfType].length; j++) {
		var collLi = document.createElement('li')

		var header = document.createElement('div')
		header.classList.add('collapsible-header')
		header.innerHTML = `${jegyek[nameOfType][j]['name']} - &nbsp${
			jegyek[nameOfType][j]['avg']
			}`

		var body = document.createElement('div')
		body.classList.add('collapsible-body')

		var ul = document.createElement('ul')
		ul.classList.add('collection')

		for (var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++) {
			var currentGrade = jegyek[nameOfType][j]['grades'][k]

			var cardLink = document.createElement('a')
			cardLink.classList.add('modal-trigger')
			cardLink.href = `#Grade-${currentGrade['Id']}`

			var li = document.createElement('li')
			li.classList.add('collection-item')
			li.innerHTML = currentGrade['Value']

			cardLink.appendChild(li)
			ul.appendChild(cardLink)

			// // console.log(`${jegyek[nameOfType][j]['name']} - ${jegyek[nameOfType][j]['grades'][k]['NumberValue']}`)
			var modal = document.createElement('div')
			modal.classList.add('modal')
			modal.id = `Grade-${currentGrade['Id']}`

			var modalContent = document.createElement('div')
			modalContent.classList.add('modal-content')
			modalContent.innerHTML = `
				<h4>${jegyek['MidYear'][j]['name']} - ${currentGrade['NumberValue']}</h4>
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
														<td>${
				currentGrade['Date'].split('T')[0].split('-')[0]
				}. ${
				currentGrade['Date'].split('T')[0].split('-')[1]
				}. ${currentGrade['Date'].split('T')[0].split('-')[2]}</td>
												</tr>
												<tr>
														<td><b>Rögzítés ideje</b></td>
														<td>${
				currentGrade['CreatingTime']
					.split('T')[0]
					.split('-')[0]
				}. ${
				currentGrade['CreatingTime'].split('T')[0].split('-')[1]
				}. ${currentGrade['CreatingTime'].split('T')[0].split('-')[2]}</td>
												</tr>
												<tr>
														<td><b>Értékelés formája</b></td>
														<td>${currentGrade['FormName']}</td>
												</tr>
										</tbody>
								</table>`

			modal.appendChild(modalContent)
			document.getElementById('jegyek').appendChild(modal)

			M.Modal.init(
				document.querySelector(
					`#Grade-${jegyek[nameOfType][j]['grades'][k]['Id']}`
				),
				{}
			)
		}
		body.appendChild(ul)
		collLi.appendChild(header)
		collLi.appendChild(body)
		collapsible.appendChild(collLi)
	}
	container.appendChild(collapsible)
	typeContainer.appendChild(container)
	row.appendChild(typeContainer)
	M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {})
	renderMidYearDateGrades(row)
	document.getElementById('MidYearBtn').addEventListener('click', showMidYear)
	document
		.getElementById('MidYearDateBtn')
		.addEventListener('click', showMidYearDate)
}

function renderSpecialGrades(nameOfType, displayName, row) {
	var typeContainer = document.createElement('div')
	typeContainer.classList.add('col')
	typeContainer.classList.add('s12')
	typeContainer.id = nameOfType

	var ulContainer = document.createElement('div')
	ulContainer.classList.add('container')

	var ul = document.createElement('ul')
	ul.classList.add('collection')
	ul.classList.add('with-header')

	var header = document.createElement('li')
	header.classList.add('collection-header')
	header.innerHTML = `<h4>${displayName}</h4>`
	ul.appendChild(header)
	if (nameOfType == 'HalfYear') {
		var li = document.createElement('li')
		li.classList.add('collection-item')
		var sum = 0
		var quantity = 0
		jegyek[nameOfType].forEach(function (element) {
			// console.log(element)
			// console.log(element['grades'][0]['NumberValue'])
			if (
				element['grades'][0]['NumberValue'] != undefined &&
				element['grades'][0]['NumberValue'] != 0
			) {
				quantity++
				sum += element['grades'][0]['NumberValue']
			}
		})
		li.innerHTML = `<div>Összes jegy átlaga: <a href="#" class="secondary-content">${parseFloat(
			Math.round((sum / quantity) * 100) / 100
		).toFixed(2)}</p></div>`
		ul.appendChild(li)
	}
	for (var j = 0; j < jegyek[nameOfType].length; j++) {
		for (var k = 0; k < jegyek[nameOfType][j]['grades'].length; k++) {
			var li = document.createElement('li')
			li.classList.add('collection-item')
			li.innerHTML = `<div>${
				jegyek[nameOfType][j]['name']
				}<a href="#" class="secondary-content">${
				jegyek[nameOfType][j]['grades'][k]['Value']
				}</p></div>`
			ul.appendChild(li)
		}
	}
	ulContainer.appendChild(ul)
	typeContainer.appendChild(ulContainer)
	row.appendChild(typeContainer)
	document.getElementById('jegyek').appendChild(row)
}

function timetableBack() {
	function getMonday(date) {
		var day = date.getDay() || 7
		if (day !== 1) {
			date.setHours(-24 * (day - 1))
		}
		return date
	}
	var today = new Date()
	positionInTime--
	today.setDate(today.getDate() + 7 * positionInTime)
	Date.prototype.addDays = function (days) {
		var date = new Date(this.valueOf())
		date.setDate(date.getDate() + days)
		return date
	}
	var startDay = getMonday(today)
	var endDay = new Date(startDay.addDays(4))
	for (var i = 1; i <= 5; i++) {
		document.getElementById('classes-' + i).innerHTML = ''
	}
	isOrarendLoadedOnce = false
	updateTimetable(
		`${startDay.getFullYear()}-${startDay.getMonth() +
		1}-${startDay.getDate()}`,
		`${endDay.getFullYear()}-${endDay.getMonth() + 1}-${endDay.getDate()}`
	).then(function (result) {
		renderTimetable(positionInTime)
	})
}

function timetableFw() {
	function getMonday(date) {
		var day = date.getDay() || 7
		if (day !== 1) {
			date.setHours(-24 * (day - 1))
		}
		return date
	}
	var today = new Date()
	positionInTime++
	today.setDate(today.getDate() + 7 * positionInTime)
	Date.prototype.addDays = function (days) {
		var date = new Date(this.valueOf())
		date.setDate(date.getDate() + days)
		return date
	}
	var startDay = getMonday(today)
	var endDay = new Date(startDay.addDays(4))
	for (var i = 1; i <= 5; i++) {
		document.getElementById('classes-' + i).innerHTML = ''
	}
	isOrarendLoadedOnce = false
	updateTimetable(
		`${startDay.getFullYear()}-${startDay.getMonth() +
		1}-${startDay.getDate()}`,
		`${endDay.getFullYear()}-${endDay.getMonth() + 1}-${endDay.getDate()}`
	).then(function (result) {
		renderTimetable(positionInTime)
	})
}

function renderTimetable(positionInTime) {
	if (!isOrarendLoadedOnce) {
		loadLoginDatas().then(function (result) {
			Date.prototype.addDays = function (days) {
				var date = new Date(this.valueOf())
				date.setDate(date.getDate() + days)
				return date
			}

			function getMonday(date) {
				var day = date.getDay() || 7
				if (day !== 1) {
					date.setHours(-24 * (day - 1))
				}
				return date
			}
			var today = new Date()
			today.setDate(today.getDate() + 7 * positionInTime)

			var startDay = getMonday(today)
			var endDay = new Date(startDay.addDays(4))
			document.getElementById(
				'timetableDate'
			).innerHTML = `${startDay.getFullYear()}. ${startDay.getMonth() +
			1}. ${startDay.getDate()}. - ${endDay.getFullYear()}. ${endDay.getMonth() +
			1}. ${endDay.getDate()}.`

			file.getGlobal('users').then(function (users) {
				var instituteCode
				users.forEach(function (user) {
					if (user['Id'] == currentUser.split('-')[0]) {
						instituteCode = user['InstituteCode']
					}
				})
				// console.log(instituteCode)
				// console.log(`${result['access_token']}, ${result['InstituteCode']}, ${startDay.getFullYear()}-${startDay.getMonth() + 1}-${startDay.getDate()}, ${endDay.getFullYear()}-${endDay.getMonth() + 1}-${endDay.getDate()}`)
				kreta
					.getTimetable(
						result['access_token'],
						instituteCode,
						`${startDay.getFullYear()}-${startDay.getMonth() +
						1}-${startDay.getDate()}`,
						`${endDay.getFullYear()}-${endDay.getMonth() +
						1}-${endDay.getDate()}`
					)
					.then(function (result) {
						timetableDatas = []
						result.forEach(function (element) {
							var isThisContains = false
							for (var i = 0; i < timetableDatas.length; i++) {
								if (timetableDatas[i]['Date'] == element['Date']) {
									isThisContains = true
								}
							}
							if (!isThisContains) {
								var day = {
									Date: element['Date'],
									Classes: []
								}
								timetableDatas.push(day)
							}
						})

						result.forEach(function (element) {
							for (var i = 0; i < timetableDatas.length; i++) {
								if (timetableDatas[i]['Date'] == element['Date']) {
									timetableDatas[i]['Classes'].push(element)
								}
							}
						})

						timetableDatas.forEach(function (element) {
							var toAppend = new Date(element['Date']).getDay()

							element['Classes'].forEach(function (ora) {
								var li = document.createElement('li')
								li.innerHTML = `
														<div class="collapsible-header"><span class="col s12">${
									ora['Subject']
									} <span
																				class="right">${
									ora['CalendarOraType'] == 'UresOra'
										? `<span class="red-text">${
										ora['StateName']
										}</span>`
										: ora['DeputyTeacher'] == ''
											? ora['ClassRoom']
											: `<span class="red-text">${
											ora['Teacher']
											}</span>`
									}</span></span></div>
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
																				<td>${
									ora['StartTime']
										.split('T')[1]
										.split(':')[0]
									}:${
									ora['StartTime'].split('T')[1].split(':')[1]
									}-${ora['EndTime'].split('T')[1].split(':')[0]}:${
									ora['EndTime'].split('T')[1].split(':')[1]
									}</td>
																		</tr>
																</table>
				
														</div>`
								document.getElementById(`classes-${toAppend}`).appendChild(li)
							})
						})
					})

				M.Tabs.init(document.querySelectorAll('.tabs'), {})
				/* updateTimetable(`${startDay.getFullYear()}-${startDay.getMonth()+1}-${startDay.getDate()}`, `${endDay.getFullYear()}-${endDay.getMonth()+1}-${endDay.getDate()}`).then(function(result){
									timetableDatas = result
							}) */

				isOrarendLoadedOnce = true
			})
		})
	}
}

function renderAbsences() {
	if (!isHianyzasokLoadedOnce) {
		loadUserDatas().then(function (result) {
			result['Absences'].forEach(function (element) {
				var isHianyzasokContainsDay = false
				hianyzasok.forEach(function (element2) {
					if (element['LessonStartTime'] == element2['Date']) {
						isHianyzasokContainsDay = true
					}
				})
				if (!isHianyzasokContainsDay) {
					var day = {
						AbsenceId: element['AbsenceId'],
						Date: element['LessonStartTime'],
						Justification: element['JustificationState'],
						JustificationType: element['JustificationTypeName'],
						Lessons: []
					}
					hianyzasok.push(day)
				}
			})
			result['Absences'].forEach(function (element) {
				hianyzasok.forEach(function (element2) {
					if (element['LessonStartTime'] == element2['Date']) {
						element2['Lessons'].push(element['Subject'])
					}
				})
			})

			hianyzasok.sort(function (a, b) {
				if (a.Date < b.Date) {
					return 1
				}
				if (a.Date > b.Date) {
					return -1
				}
				return 0
			})

			var ul = document.createElement('ul')
			ul.classList.add('collapsible')
			hianyzasok.forEach(function (element) {
				var li = document.createElement('li')
				var header = document.createElement('div')
				header.classList.add('collapsible-header')

				header.innerHTML = `${element['Date'].split('T')[0].split('-')[0]}. ${
					element['Date'].split('T')[0].split('-')[1]
					}. ${element['Date'].split('T')[0].split('-')[2]} -&nbsp${
					element['Justification'] == 'Justified'
						? `<span class='green-text'>Igazolt mulasztás (${
						element['JustificationType']
						})</span>`
						: element['Justification'] == 'BeJustified'
							? "<span class='yellow-text'>Igazolandó mulasztás</span>"
							: "<span class='red-text'>Igazolatlan mulasztás</span>"
					}`

				var body = document.createElement('div')
				body.classList.add('collapsible-body')

				var collection = document.createElement('ul')
				collection.classList.add('collection')

				element['Lessons'].forEach(function (element2) {
					var collLi = document.createElement('li')
					collLi.classList.add('collection-item')
					collLi.innerHTML = element2

					collection.appendChild(collLi)
				})

				body.appendChild(collection)
				li.appendChild(header)
				li.appendChild(body)
				ul.appendChild(li)
				document.getElementById('hianyzasok').appendChild(ul)
			})

			var elems = document.querySelectorAll('.collapsible')
			var instances = M.Collapsible.init(elems, {})

			isHianyzasokLoadedOnce = true
		})
	}
}

// Handle logging in
document.querySelector('#login').addEventListener('submit', function (e) {
	getSchools().then(function (result) {
		result.forEach(function (element) {
			if (element.Name == document.getElementById('schools').value) {
				instituteCode = element.InstituteCode
			}
		})

		kreta
			.loginUser(
				instituteCode,
				document.getElementById('usernameInput').value,
				document.getElementById('password').value
			)
			.then(
				function (result) {
					// Handling successful login
					// Storing school inside user.json
					// result["InstituteCode"] = document.getElementById("schools").value
					// Some toast to make login look cool
					M.toast({ html: 'Sikeres bejelentkezés!' })
					// Save login datas
					id = document.getElementById('usernameInput').value

					currentUser = `${id}-${instituteCode}`
					file.getGlobal('users', []).then(function (result2, err) {
						var data = []
						var user = {
							InstituteCode: instituteCode,
							Id: id,
							Selected: true
						}
						data.push(user)
						file.saveGlobal('users', data).then(function () {
							// console.log(result)
							saveLoginDatas(result, id, instituteCode).then(function (result,err) {
								// Show the main page
								showPage('fooldal')
								// Hide logging in
								hidePage('login')
							})
						})
					})
				},
				function () {
					// Handling bad login datas (pretty fast tho)
					M.toast({ html: 'Rossz felhasználónév vagy jelszó!' })
				}
			)
	})
	// Preventing from reloading page
	e.preventDefault()
})

document.getElementById('startup').addEventListener('input', function (evt) {
	file.get(currentUser, 'settings', {}).then(function (result) {
		result['startup'] = document.getElementById('startup').checked
		file.saveGlobal('settings', result).then(function () {
			const electron = require('electron')
			var AutoLaunch = require('auto-launch')

			var eSzivacsAutoLaunch = new AutoLaunch({
				name: 'eSzivacs',
				path: electron.remote.app.getPath('exe')
			})

			if (document.getElementById('startup').checked) {
				eSzivacsAutoLaunch.enable()
			} else {
				eSzivacsAutoLaunch.disable()
			}
		})
	})
})

function notificationListener() {
	updateUserDatas().then(
		function () {
			loadUserDatas().then(function (result) {
				file.get(currentUser, 'viewedGrades', []).then(function (result2) {
					if (result2.length > 0) {
						// console.log(result2.length)
						loggerNotification.log('Újonnan érkezett jegyek ellenőrzése...')
						result['Evaluations'].forEach(function (element) {
							file.get(currentUser, 'viewedGrades').then(function (result3) {
								var viewed = false
								result3.forEach(function (element2) {
									if (element2['id'] == element['EvaluationId']) {
										viewed = true
									}
								})
								if (!viewed) {
									let myNotification = new Notification(element['Subject'], {
										body: element['Value']
									})
									loggerNotification.log(`Új értékelés: ${element['Value']}`)
									var jegy = {
										id: element['EvaluationId'],
										subject: element['Subject'],
										value: element['Value']
									}
									result3.push(jegy)
									file.save(currentUser, 'viewedGrades', result3)
								}
							})
						})
					} else {
						loggerNotification.log('Még nem kaptál értesítést a jegyeidről. A mostantól kapott jegyeidről már fogsz!')
						var grades = []
						result['Evaluations'].forEach(function (element) {
							var jegy = {
								id: element['EvaluationId'],
								subject: element['Subject'],
								value: element['Value']
							}
							grades.push(jegy)
						})
						file.save(currentUser, 'viewedGrades', grades)
					}
				})
			})
		},
		function () {
			M.toast({ html: 'Nem sikerült frissíteni az adataidat!' })
			M.toast({ html: 'Próbáld meg manuálisan frissítani az adataidat!' })
		}
	)
}

function startNotificationListener() {
	// console.log('A lekérdezés megtörtént!')
	notificationListener()
	setTimeout(function () {
		startNotificationListener()
	}, 1000 * 60 * 15)
}

document
	.getElementById('notifications')
	.addEventListener('input', function (evt) {
		file.get(currentUser, 'settings', {}).then(function (result) {
			result['notifications'] = document.getElementById(
				'notifications'
			).checked
			file.saveGlobal('settings', result).then(function () {
				if (notifications) {
					startNotificationListener()
				}
			})
		})
	})

document.getElementById('totray').addEventListener('input', function (evt) {
	file.get(currentUser, 'settings', {}).then(function (result) {
		result['totray'] = document.getElementById('totray').checked
		file.saveGlobal('settings', result)
	})
})

if(!isDev){
	loggerAutoUpdater.log('Inicializálás...')
	ipcRenderer.send('autoUpdateAction', 'initAutoUpdater', true)
} else {
	loggerAutoUpdater.log('Fejlesztési környezetben az Automatikus frissítési szolgáltatás le van tiltva.')
}

function changeUpdateState(state, text){
	document.getElementById("updateState").innerHTML = state
	document.getElementById("updateText").innerHTML = text
}

if(!isDev){
	// Initialize auto updates in production environments.
	let updateCheckListener
	ipcRenderer.on('autoUpdateNotification', (event, arg, info) => {
		switch (arg) {
			case 'checking-for-update':
				loggerAutoUpdater.log('Frissítések keresése...')
				changeUpdateState('cached', 'Frissítések keresése...')
				break
			case 'update-available':
				loggerAutoUpdaterSuccess.log('Új verzió érhető el!', info.version)

				changeUpdateState('arrow_downward', 'Új verzió érhető el!')
				if (process.platform === 'darwin') {
					info.darwindownload = `https://github.com/pepyta/eSzivacs-PC/releases/download/v${info.version}/eSzivacs.dmg`
					showUpdateUI(info)
				}

				populateSettingsUpdateInformation(info)
				break
			case 'update-downloaded':
				loggerAutoUpdaterSuccess.log('A v' + info.version + ' frissítés készen áll a telepítésre.')
				changeUpdateState('build', 'Az új frissítés készen áll a telepítésre!')
				var toastHTML = '<span>Új frissítés érhető el!</span><button id="quitAndInstall" class="btn-flat toast-action">Újraindítás</button>';
				
				M.toast({html: toastHTML});
				document.getElementById('quitAndInstall').addEventListener('click', function(){
					ipcRenderer.send('autoUpdateAction', 'installUpdateNow')
				})
				break
			case 'update-not-available':
				loggerAutoUpdater.log('Nincs elérhető frissítés.')
				changeUpdateState('done', 'Az eSzivacs legfrisseb verzióját használod!')
				break
			case 'ready':
				updateCheckListener = setInterval(() => {
					ipcRenderer.send('autoUpdateAction', 'checkForUpdate')
				}, 1800000)
				ipcRenderer.send('autoUpdateAction', 'checkForUpdate')
				break
			case 'realerror':
				if (info != null && info.code != null) {
					if (info.code === 'ERR_UPDATER_INVALID_RELEASE_FEED') {
						loggerAutoUpdater.log('No suitable releases found.')
					} else if (info.code === 'ERR_XML_MISSED_ELEMENT') {
						loggerAutoUpdater.log('No releases found.')
					} else {
						loggerAutoUpdater.error('Error during update check..', info)
						loggerAutoUpdater.debug('Error Code:', info.code)
					}
				}
				break
			default:
				loggerAutoUpdater.log('Unknown argument', arg)
				break
		}
	})
}

document.getElementById("version").innerHTML = require('./../package.json').version
const { shell } = require('electron')
document.getElementById("linkGithub").addEventListener('click', function(){
	shell.openExternal("https://github.com/pepyta/eSzivacs-PC")
})