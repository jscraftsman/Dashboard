PLAYERS = [];
CURRENT_PLAYER = 0;
CURRENT_ACTION = null;


$(function(){
	$(".state").not("#state-menu").hide();
	$(".btn-set").on("click", ".m-btn, .po-btn", btnHandler);
	$("#player-list").on("click", ".player-list-item", interactPlayer);
});

/* Handlers */
function changeState(state){
	$(".state").not("#state-" + state).hide();
	$(".state#state-" + state).show();
	$("#player-list").hide();
}

function startGame(){
	$("#player-names .player-name").each(function(index, player){
		var name = player.value == "" ? "Player " + (index+1) : player.value;
		var p = new Player(name);
		PLAYERS.push(p);
	});
	PLAYERS = shuffle(PLAYERS);
	CURRENT_PLAYER = 0;

	viewPlayer();
}

function setPlayerList(){
	var cls = "player-list-item btn btn-default col-lg-6 bot-space";
	var out = "<h2 class='text-center'><span id='p-action'></span> Player:</h2>";
	var disabled = '';
	for(i in PLAYERS){
		disabled = CURRENT_PLAYER == i ? "disabled" : "";
		out += "<a href='#' data-id='" + i + "' class='" + cls + "' " + disabled + ">" + PLAYERS[i].NAME + "</a>";
	}
	out += "<hr />";
	$("#player-list").html(out).hide();
}

function viewPlayer(){
	var index = $(this).data("id") || CURRENT_PLAYER;
	var player = PLAYERS[index];

	$("#cur-player").text(player.NAME);
	$("#player-info #current-player").text(player.NAME);
	$("#player-info #p-hp").width(player.getHP());
	$("#player-info #p-mp").width(player.getMP());
	setPlayerList();
}

function interactPlayer(){
	var attacker = PLAYERS[CURRENT_PLAYER];
	var index = $(this).data("id");
	var attackee = PLAYERS[index];
	switch(CURRENT_ACTION){
		case "attack":
			attacker.attack(attackee);
			console.log(attacker.NAME + "[HP: "+attacker.CUR_HP+"] attacked " + attackee.NAME + "[HP: "+attackee.CUR_HP+"]");///
			nextPlayer();
			break;
		case "heal":
		break;
	}
	CURRENT_ACTION = null;
}

function nextPlayer(){
	if(PLAYERS.length <= 1){
		$("#winner").text(PLAYERS[0].NAME);
		changeState("game-over");
	}else{
		CURRENT_PLAYER = (CURRENT_PLAYER + 1) % PLAYERS.length;
		changeState("next-player-guide");
		viewPlayer();	
	}
}

function addPlayerInput(){
	var l = $(".player-name").length + 1;
	if(l < 5){
		var input = "<input type='text' class='form-control text-center bot-space player-name' placeholder='Player "+l+"'>";
		$("#player-names").append(input);	
	}else{
		log("Too much dude..");
	}
}

function checkGameOver(){
	if(PLAYERS.length == 1){
		alert("Game Over");
	}
}

function btnHandler(){
	var value = $(this).text();
	$("#player-list #p-action").text(value || "");
	value = value.toLowerCase();
	$("#player-list").hide();

	switch(value){
		case "menu":
			changeState("menu");
			startGame();
			break;
		case "play":
			changeState("players");
			break;
		case "guide":
			changeState("guide");
			break;
		case "add player":
			addPlayerInput();
			break;
		case "start":
			changeState("in-game");
			startGame();
			break;
		case "pass":
			nextPlayer();
			break;
		case "next":
			if(typeof(PLAYERS[CURRENT_PLAYER]) == "undefined"){
				nextPlayer();
			}else{
				if(PLAYERS[CURRENT_PLAYER].CUR_HP < 1){
					changeState("info");
					PLAYERS.splice(CURRENT_PLAYER, 1);
				}else{
					changeState("in-game");
				}
			}
			break;
		case "back":
			changeState("menu");
			break;
		case "attack":
			CURRENT_ACTION = value;
			$("#player-list a[data-id='"+CURRENT_PLAYER+"']").attr("disabled", true);
			$("#player-list").show();
			break;
		case "heal":
			CURRENT_ACTION = value;
			$("#player-list a[data-id='"+CURRENT_PLAYER+"']").attr("disabled", false);
			$("#player-list").show();
			break;
		case "exit":
			log("exit");
			break;
		default:
		break;
	}
}

function log(value){
	var out = "\n";
	if(typeof(value) == "string"){
		out += value;
	}else{
		out += "<h3>Object</h3>";
		if(value.constructor == Array){
			out += value.toString();
		}
		else if(value.constructor == Object){
			out += JSON.stringify(value);
		}
	}
	$("#log").html(out);
}

function shuffle(array) {
  var currentIndex = array.length, 
  	temporaryValue,
  	randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


/* Player Class */
Player = function(name, hp, mp){
	this.NAME =  name || "Player";
	this.MAX_HP = hp || 3;
	this.MAX_MP = mp || 3;

	this.CUR_HP = this.MAX_HP; 
	this.CUR_MP = this.MAX_MP; 

	this.DAMAGE = {MIN: 1, MAX: 3};

	this.STATE = "waiting";
}

/*
	@params - attackee - the Player that is being attacked.
*/
Player.prototype.attack = function(attackee){
	if(attackee instanceof Player){
		attackee.CUR_HP = attackee.CUR_HP - this.getDamage();
		if(attackee.CUR_HP < 1){
			attackee.STATE = "dead";
		}
	}
};

Player.prototype.getHP = function(){	return ( ((this.CUR_HP/this.MAX_HP) * 100) + "%");	};
Player.prototype.getMP = function(){	return ( ((this.CUR_MP/this.MAX_MP) * 100) + "%");	};

Player.prototype.getDamage = function(){
	var min = this.DAMAGE.MIN;
	var step = this.DAMAGE.MAX - this.DAMAGE.MIN;
	return parseInt( min + (Math.random() * step) );
};

Player.prototype.is = function(state){
	return this.STATE == state;
}

/* End of Player Class */