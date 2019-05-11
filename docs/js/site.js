// https://api.github.com/repos/pepyta/eSzivacs-PC/tags

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

getJSON('https://api.github.com/repos/pepyta/eSzivacs-PC/tags',
function(err, data){
    if(err != null) {
        console.log(`Something went wrong: ${err}`);
    } else {
        document.getElementById("links").innerHTML += `<a href="https://github.com/pepyta/eSzivacs-PC/releases/download/${data[0]["name"]}/eSzivacs.exe" id="downloadLink" class="btn btn-large waves-effect waves-light black">Letöltés (${data[0]["name"]})</a>`;

        console.log(data[0]["name"]);
    }
});
