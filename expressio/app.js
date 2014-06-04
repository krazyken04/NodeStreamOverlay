var irc = require("irc");
express = require("express.io");
var _ = require('underscore');

app = express().http().io();

// Create the configuration
var config = {
  channels: ["#warpspiderx"],
  server: "irc.twitch.tv",
  username: "warpspiderbot",
  nick: "warpspiderbot",
  password: "oauth:ocih5b5xha8royup4wnv5navzrx65zl",
  sasl: true
};

// bot commands
var commands = [
  "!help",
  "!referredby",
  "!emote",
  "!roomSize"
];

var emotes = [
  "surprise"
]

var userlist = [];
var roomSize = 0;

// Setup the ready route, and emit talk event.
app.io.route('ready', function(req) {
  // Create the bot name
  var bot = new irc.Client(config.server, config.nick, config);

  bot.addListener('error', function(message) {
      console.log('error: ', message);
  });

  // Listen for joins
  bot.addListener("join", function(channel, nick, reason, message) {
    console.log(nick + ' joined the room');
    userlist.push(nick);
    _.uniq(userlist);
    roomSize = _.size(userlist);
    console.log('roomSize' + _.size(userlist));
    // Welcome them in!
    // bot.say(channel, who + "...dude...welcome back! I'm just a bot, and WarpSpiderX is running tests on me right now, please ignore me!");

    //bot.say(config.channels[0], "Emote Majority has now been normalized to " + ((roomSize / 2) - 1) + " by the BOT");

    req.io.emit('join', {
      "name": nick
    });
  });

  bot.addListener("part", function(channel, who){
    _.without(userlist, who);
    _.uniq(userlist);
    roomSize = _.size(userlist);
    console.log('roomSize' + _.size(userlist));

    //bot.say(config.channels[0], "Emote Majority has now been normalized to " + ((roomSize / 2) - 1) + " by the BOT");
  });

  // EMOTE CONFIGS -------------------------------------------------------------------
  var emoteTime = 100; // seconds for someone to call for an emote
  var emoteTimeLeft = emoteTime;
  var emoteScore = 0;
  var emoteRequested = "none";
  // ---------------------------------------------------------------------------------

  var myCounter = new Countdown({  
      seconds:emoteTime,  // number of seconds to count down
      
      // callback for each second
      onUpdateStatus: function(sec){
        emoteTimeLeft = sec;
        
        req.io.emit('countdown', {
          seconds: sec
        });
        
        console.log(emoteTimeLeft);
      }, 

      // final action
      onCounterEnd: function(){
        req.io.emit('countdown', {
          seconds: emoteTimeLeft,
          state: "end"
        });
      } 
  });

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
      req.io.emit('countdown', {
          seconds: sec,
          state: 'start'
        });
    };

    this.stop = function () {
      emoteTimeLeft = emoteTime;
      emoteScore = 0;
      emoteRequested = "none";
      
      req.io.emit('countdown', {
        seconds: emoteTime
      });

      clearInterval(timer);
    };
  }

  //MESSAGES FROM BOT START HERE
  bot.addListener('message', function(from, to, text, message){
    var textArray = text.split(" ");
    var matchedCommands = _.intersection(textArray, commands); 
    
    req.io.emit('ircMessage', {
      text: textArray
    });

    if(text.indexOf("!") == 0 && _.size(matchedCommands) > 0){
      req.io.emit('ircCommand', {
        command: matchedCommands
      });

      if(_.size(matchedCommands) > 1){
        bot.say(config.channels[0], "Woah woah " + from + ", that's way too many commands for me! One at a time please :D");
      }

      // Admin Command: !roomSize
      if(_.indexOf(matchedCommands, '!roomSize') > -1 && from == 'rinroses' || _.indexOf(matchedCommands, '!roomSize') > -1 && from == 'warpspiderx') {
        var manualRoomSize = text.replace('!roomSize ', "");
        manualRoomSize = manualRoomSize.split(" ");
        manualRoomSize = manualRoomSize[0];

        console.log('manualRoomSize was captured as ' + manualRoomSize)

        roomSize = manualRoomSize;
        console.log('roomSize set to ' + roomSize);
        
        // bot.say(config.channels[0], "/me Emote Majority has now been set to " + ((roomSize / 2) - 1) + " by MOD - " + from);
      }


      if(_.indexOf(matchedCommands, '!help') > -1){
        bot.say(config.channels[0], "Help is coming, " + from);
      }

      if(_.indexOf(matchedCommands, '!referredby') > -1){
        bot.say(config.channels[0], "Referral tracking is almost here, "+from+"! Soon(TM)");
      }

      // EMOTES ----------------------------------------------------------------------------
      if(_.indexOf(matchedCommands, '!emote') > -1){
        // what emote (matchedEmote)
        var emote = text.replace("!emote ", ""); // remove command
        emote = emote.split(" ");
        emoteRequested = emote[0]; 

        if(_.indexOf(emotes, emoteRequested) == -1){
          bot.say(config.channels[0], "Sorry, we don't have the emote "+emote[0]+", "+from+"!");
          return;
        } else if(emoteTimeLeft == emoteTime){
          bot.say(config.channels[0], from + " has requested a stream emote! Say '!emote " + emote[0] + "' in the next " + emoteTime + " seconds to make an emote pop up on stream!");
        } else {
          console.log('if didnt work sec = ' + emoteTimeLeft);
        }

        console.log('emote command received = ' + emote);
        console.log('emoteRequested = ' + emoteRequested);
        // is there a timer running? && does our emote match the timer's emote?
        if(emoteTimeLeft < emoteTime && emote == emoteRequested){
          // increase emote counter
          emoteScore++;
          console.log('majority = ' + parseFloat((roomSize / 2) - 1));

          req.io.emit('emote', {
            emoticon: emoteRequested,
            score: emoteScore,
            requestedBy: from,
            functionCalled: "emoteTimeLeft < emoteTime && emote == emoteRequested"
          });

          if(emoteScore >= parseFloat((roomSize / 2) - 1) ){
            console.log('MAJORITY REACHED!!');
            // our emotescore is just short of a majority, which is ok by me
            // activate emote
            req.io.emit('emote', {
              emoticon: emoteRequested,
              score: emoteScore,
              requestedBy: from,
              functionCalled: "emoteTimeLeft >> majority reached",
              activate: true
            });

            // stop the counter
            myCounter.stop(); // Also clears out the variables and sends a counter stop event
          }
        } else if(emoteTimeLeft < emoteTime && emote != emoteRequested) {
          bot.say(config.channels[0], "/me Sorry " + from + ", only one emote command can be run at a time! Wait " + emoteTimeLeft + " seconds and try again!");
        } else {
          //start timer
          myCounter.start();
          
          // store emote
          emoteRequested = emote;
          emoteScore++;

          req.io.emit('emote', {
            emoticon: emoteRequested,
            score: emoteScore,
            requestedBy: from,
            functionCalled: "super else"
          });
        }
      }

    } else if(text.indexOf("!") == 0 && _.size(matchedCommands) <= 0){
        bot.say(config.channels[0], "/me hmmmmm " + from + ", I didn't catch that =/");
    }
  })
  
  // Example of emitting events to the browser
  req.io.emit('talk', {
      message: 'io event from an io route on the server'
  });

})

app.use(express.static('public'));
app.use(express.static('images'));

// Send the client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
});

app.get('/timer', function(req, res) {
    res.sendfile(__dirname + '/emoteCount.html');
});

app.get('/emote', function(req, res) {
    res.sendfile(__dirname + '/emoteBig.html')
});

app.listen(7076)