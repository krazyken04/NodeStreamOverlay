var TeamSpeakClient = require("node-teamspeak"),
    util = require("util"),
    _ = require("underscore"),
    Moniker = require('moniker');


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

function connectAndWork(/*teamName*/){	
	
	var chanList = sampleChanList;
	var huntForCID = "";
	
	var username = Moniker.choose();
	console.log(username);
	
	cl.send("login", {client_login_name: "Kresterz", client_login_password: ""}, function(err, response, rawResponse){	    
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
		    
		    console.log(err,response,rawResponse);
		    return false;
		    
	    }
	    
	    // no errors
	    
	    cl.send("use", {sid: 1}, function(err, response, rawResponse){
	        cl.send("channellist", function(err, response, rawResponse){
		        console.log(response);
	        });
	        
	        /* TODO: 
	        	get channellist
	        	Use the "opponentChannel" work below	        
	        	Retrieve lolking names from channel object
	        	return lolking params like "name,name,name,name,name"
	        */
	        
	        // This occurs inside of channellist
	        	// set chanList;
	        	
	        	//var opponentChannel = _.findWhere(chanList, {channel_name: teamName});
	        	//return opponentChannel;
	        	
	        	//console.log(opponentChannel);
	        
	        /*cl.send("channelgroupclientlist cid=2", function(err, response, rawResponse){
		        console.log('channel clients');
		        console.log(err,response,rawResponse);
	        })*/
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

connectAndWork();