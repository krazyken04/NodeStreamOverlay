var TeamSpeakClient = require("node-teamspeak"),
    util = require("util"),
    _ = require("underscore"),
	express = require("express.io"),
	fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio');

// >>>>>>>>>>> TEAMSPEAK <<<<<<<<<<<<<<<<

var sampleChanList = [ 
  { cid: 174,
    pid: 172,
    channel_order: 0,
    channel_name: 'AFK Channel',
    total_clients: 20,
    channel_needed_subscribe_power: 0 
  }
];

var cl = new TeamSpeakClient("ts.victoriousgaming.com");

function connectAndWork(teamName){	
	
	var chanList = sampleChanList;
	var huntForCID = "";
	
	cl.send("login", {client_login_name: "warpspiderx", client_login_password: ""}, function(err, response, rawResponse){	    
	    if(err && err.msg == 'connection failed, you are banned'){
			console.log('>>>> BANNED <<<<<');
			var time = err.extra_msg;
			time = time.replace('you may retry in ', '');
			time = time.replace(' seconds', '');
									
			var myCounter = new Countdown({  
			    seconds: time,  // number of seconds to count down
			    onUpdateStatus: function(sec){console.log(sec);}, // callback for each second
			    onCounterEnd: function(){
			    	console.log('firing connect&work again')
				    // connectAndWork();
			    } // final action
			});
			
			myCounter.start();
			return false;
			
	    } else if(err){
		    
		    console.log(response);
		    return false;
		    
	    }
	    
	    // no errors
	    
	    cl.send("use", {sid: 1}, function(err, response, rawResponse){
	        /*cl.send("channellist", function(err, response, rawResponse){
		        console.log(response);
	        });*/
	        
	        /* TODO: 
	        	get channellist
	        	Use the "opponentChannel" work below	        
	        	Retrieve lolking names from channel object
	        	return lolking params like "name,name,name,name,name"
	        */
	        
	        // This occurs inside of channellist
	        	// set chanList;
	        	
	        	var opponentChannel = _.findWhere(chanList, {channel_name: teamName});
	        	return opponentChannel;
	        	
	        	console.log(opponentChannel);
	        
	        /*cl.send("channelgroupclientlist", function(err, response, rawResponse){
		        console.log('channel clients');
		        console.log(err,response,rawResponse);
	        })*/
	        
	        /*cl.send("clientlist", function(err, response, rawResponse){
				console.log(response);
	        });*/
	    });
	});
}

function Countdown(options) {
  var timer,
  instance = this,
  seconds = options.seconds || 10,
  updateStatus = options.onUpdateStatus || function () {},
  counterEnd = options.onCounterEnd || function () {};

  function decrementCounter() {
    updateStatus(seconds);
    if (seconds === 0) {
      counterEnd();
      instance.stop();
    }
    seconds--;
  }

  this.start = function () {
    clearInterval(timer);
    timer = 0;
    seconds = options.seconds;
    timer = setInterval(decrementCounter, 1000);
  };

  this.stop = function () {
    clearInterval(timer);
  };
}


function underscoreTest(){
	console.log(_.max(sampleChanList, function(chan){ return chan.total_clients; }));
}


// >>>>>>>>>>> ROUTING <<<<<<<<<<<<<<<<
app = express().http().io();
app.use(express.static('public'));
app.use(express.static('images'));

app.get('/teamspeakJSON', function(req, res) {
	
	/* SampleQuery: http://localhost:7078/teamspeak/?opponents=warpspiderx,iciolus,sir%20silentseraph,tootubular,noisydemon&team=D27 */
		
	//TODO: make this work with team identifier, replace "opponents" with "chanOpponents"
	//var chanOpponents = connectAndWork(req.query.team);
	//console.log(chanOpponents);

	var json = [];
	
	var opponents = req.query.opponents.split(',');
		
	var finished = _.after(opponents.length, doRender);
	
	for (index = 0; index < opponents.length; index++) {
		
		console.log(index);
    	
    	opponent = opponents[index];
    	
		url = 'http://www.lolskill.net/summoner-NA-' + opponent;
		
		console.log(url);
		
		request(url, function(error, response, html){
			
			if(!error){
				var $ = cheerio.load(html);
				
				var champs = [];
				
				var opponent_json = { name: "", rankImage: "", rankString: "", icon : "", champs: ""};
				
				var name = $('.name').text();
				opponent_json.name = name;
				
				var rankImage = $('#rank .body img').attr('src');
				opponent_json.rankImage = rankImage;
				
				var rankString = $('.tier').text();
				opponent_json.rankString = rankString;
								
				var icon = $('.summonericon').attr("src");
				opponent_json.icon = icon;
				
				var champsTable = $('#championsTable');
				var champ1 = champsTable.find('tr').eq(1);
				var champ2 = champsTable.find('tr').eq(2);
				var champ3 = champsTable.find('tr').eq(3);
				
				champs[0] = {
					icon: champ1.find('.icononly img').attr('src'),
					perf: champ1.find('td').eq(5).text().replace(/(\r\n|\n|\r)/gm,""),
					games: parseFloat(champ1.find('td').eq(6).text().replace(/(\r\n|\n|\r)/gm,"")),
					kda: champ1.find('td').eq(7).text().replace(/(\r\n|\n|\r)/gm,"") + " / " + champ1.find('td').eq(8).text().replace(/(\r\n|\n|\r)/gm,"") + " / " + champ1.find('td').eq(9).text().replace(/(\r\n|\n|\r)/gm,"")			
				}
				
				champs[1] = {
					icon: champ2.find('.icononly img').attr('src'),
					perf: champ2.find('td').eq(5).text().replace(/(\r\n|\n|\r)/gm,""),
					games: parseFloat(champ2.find('td').eq(6).text().replace(/(\r\n|\n|\r)/gm,"")),
					kda: champ2.find('td').eq(7).text().replace(/(\r\n|\n|\r)/gm,"") + " / " + champ2.find('td').eq(8).text().replace(/(\r\n|\n|\r)/gm,"") + " / " + champ2.find('td').eq(9).text().replace(/(\r\n|\n|\r)/gm,"")			
				}
				
				champs[2] = {
					icon: champ3.find('.icononly img').attr('src'),
					perf: champ3.find('td').eq(5).text().replace(/(\r\n|\n|\r)/gm,""),
					games: parseFloat(champ3.find('td').eq(6).text().replace(/(\r\n|\n|\r)/gm,"")),
					kda: champ3.find('td').eq(7).text().replace(/(\r\n|\n|\r)/gm,"") + " / " + champ3.find('td').eq(8).text().replace(/(\r\n|\n|\r)/gm,"") + " / " + champ3.find('td').eq(9).text().replace(/(\r\n|\n|\r)/gm,"")			
				}
				
				opponent_json.champs = champs;					
			}
			
			if(rankString != "Unranked "){
				json.push(opponent_json);	
			}
			
			finished();
		});
	}

	function doRender(){
		console.log(json);
				
		// Which champions have hte most games
		var mostPlayedChamps = [];
		
		json.forEach(function(opponent){
			mostPlayedChamps.push(_.max(opponent.champs, function(champ){ return champ.games; }));
		});
		
		mostPlayedChamps = _.sortBy(mostPlayedChamps, function(champ){ return champ.games; });
		mostPlayedChamps = mostPlayedChamps.reverse();
		
		console.log(mostPlayedChamps);
		
		json.push({"mostPlayedChamps" : mostPlayedChamps});
		
		res.json(json);
	}		
});

app.get('/teamspeak', function(req, res){
	
	var opponentTeam = req.query.team;
	

	res.sendfile(__dirname + '/teamspeak.html')
});


app.listen(7078);

// >>>>>>>>>>> WERK <<<<<<<<<<<<<<<<
// connectAndWork();
// underscoreTest();