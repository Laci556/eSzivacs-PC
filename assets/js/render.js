module.exports = {
    startGame: function(area, h, v, gameState){
        createGameState(gameState, h, v);
        renderPlayground(area, h, v, gameState);
    },
    getGridPx: function(h, v){
        return getGridPx(h, v);
    },
    consoleGameState: function(gameState){
        console.table(gameState);
    },
    onResize: function(h, v, gameState){
        //console.log("történt valami");
        /*
        var px = getGridPx(h, v, document);
        for(var i = 0; i < v; i++){
            document.getElementById(`row-${i}`).height = px;
            for(var j = 0; j < h; j++){
                document.getElementById(`column-${i}-${j}`).width = px;
                document.getElementById(`column-${i}-${j}`).height = px;

            }
        }*/
        document.getElementById("game").innerHTML = "";
        renderPlayground(area, h, v, gameState);
    }, 
    setArea: function(topLeft, bottomRight, type){
        setArea(topLeft, bottomRight, type);
    }
};

function getGridPx(h, v){
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;

    var min = width/h;
    if(height/v < min){
        min = height/v;
    }
    
    return min;
}

function setArea(topLeft, bottomRight, type){
    for(var i = topLeft[1]; i <= bottomRight[1]; i++){
        for(var j = topLeft[0]; j <= bottomRight[0]; j++){
            document.getElementById(`column-${i}-${j}`).innerHTML = `<img src="./img/${typeToImg(type)}.png">`;
        }
    }
}

function renderPlayground(area, h, v, gameState){
    var px = getGridPx(h, v);
    for(var i = 0; i < v; i++){
        var rowElement = document.createElement("div");
        rowElement.className= "row";
        rowElement.style.height = `${px}px`;
        rowElement.id = `row-${i}`;
        for(var j = 0; j < h; j++){
            var column = document.createElement("div");
            column.className = "column";
            column.innerHTML = `<img src="./img/${typeToImg(gameState[i][j])}.png">`;
            column.id = `column-${i}-${j}`;
            column.style.width = `${px}px`;
            column.style.height = `${px}px`;
            rowElement.appendChild(column);
        }
        area.appendChild(rowElement);
    }
}

function createGameState(gameState, h, v){
    for(var i = 0; i < v; i++){
        var row = [];
        for(var j = 0; j < h; j++){
            row.push(0);
        }
        gameState.push(row);
    }
}

function typeToImg(type){
    switch(type){
        case 1:
            type = "wheat";
            break;
        default:
            type = "grass";
            break;
    }
    return type;
}