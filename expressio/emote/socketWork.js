io = io.connect()

// Emit ready event.
io.emit('ready') 

// Listen for the talk event.
io.on('talk', function(data) {
    //alert(data.message)
});

io.on('join', function(data){
	console.log('join: ' + data.name)
});

// Emoticons
/*
	emoticon : emote.emoticon, score.emoteScore, requestedBy.name
	emoticon : emote.counterStopped
	countdown: seconds.timeLeft
*/ 

io.on('emote', function(data){
	console.log(data);
});

io.on('countdown', function(data){
	//console.log(data.seconds);
});