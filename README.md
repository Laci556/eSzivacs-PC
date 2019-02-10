<p align="center"><img src="assets/img/banner.png" width="60%"></p>

[<p align="center"><img src="https://img.shields.io/travis/pepyta/eSzivacs-PC.svg?style=for-the-badge" alt="travis">](https://travis-ci.org/pepyta/eSzivacs-PC) [<img src="https://img.shields.io/github/downloads/pepyta/eSzivacs-PC/total.svg?style=for-the-badge" alt="downloads">](https://github.com/pepyta/eSzivacs-PC/releases) [![](https://img.shields.io/github/release/pepyta/eSzivacs-PC.svg?style=for-the-badge)](https://github.com/pepyta/eSzivacs-PC/releases/latest)</p>

## Table of Contents
- [Features](#features)
- [Releases](#releases)
- [Usage](#usage)
- [TODO](#todo)
- [Third-party licenses](#third-party-licenses)
- [Contributors](#contributors)
- [License](#license)

## Releases

| Platform (version) | Executable name |
| -------- | --------------- |
| Windows x64 (v1.0.0) | [`eSzivacs.exe`](https://github.com/pepyta/eSzivacs-PC/releases/download/v1.0.0/eSzivacs.exe) |

## Features
- 🤖 Electron based GUI
- 🗒️ Check your grades
- 🌡️ Get absences
- 📅 Query your timetable

## Usage
<b>Clone and install modules</b>
```
> git clone https://github.com/pepyta/eSzivacs-PC.git
> cd eSzivacs-PC
> npm install
```

<b>Start electron client</b>
```
> npm start
```

<b>Create installer</b>
```
> npm run dist
```

<b>Building for a specific platform</b>

| Platform    | Command              |
| ----------- | -------------------- |
| Windows x64 | `npm run dist:win`   |
| macOS       | `npm run dist:mac`   |
| Linux x64   | `npm run dist:linux` |

## TODO
- Background service for notifications
- Multi-user mode
- Improved main page

## Third-party licenses
- [boapps/e-kreta-hidden-api-docs](https://raw.githubusercontent.com/boapps/e-kreta-api-docs/master/LICENSE)
- [boapps/e-szivacs-2](https://raw.githubusercontent.com/boapps/e-Szivacs-2/master/LICENSE)
- [electron/electron](https://github.com/electron/electron/blob/master/LICENSE)
- [Dogfalo/materialize](https://raw.githubusercontent.com/Dogfalo/materialize/v1-dev/LICENSE)
- [mde/ejs](https://github.com/mde/ejs/blob/master/LICENSE)
- [bowheart/ejs-electron](https://raw.githubusercontent.com/bowheart/ejs-electron/master/LICENSE)
- [jinder/path](https://raw.githubusercontent.com/jinder/path/master/LICENSE)
- [request/request](https://raw.githubusercontent.com/request/request/master/LICENSE)

## Contributors
Special thanks to [boapps](https://github.com/boapps/), who created [e-kreta-hidden-api-docs](https://github.com/boapps/e-kreta-api-docs)!
## License
```
BSD 2-Clause License

Copyright (c) 2019, Gál Péter
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
