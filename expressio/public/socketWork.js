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
	console.log('emote received');

	if(data.activate == true){
		$('#emote').show();
		$('#emoteContainer').addClass(data.emoticon);
		$('.tickerText em').text(data.requestedBy);
	} else if(data.state == "end") {
		resetCount();
	} else if(data.state == 'start'){
		console.log(data.emoticon);
		$('#icon').addClass(data.emoticon);
		$('#marquee .js-marquee').text('Vote Started By: ' + data.requestedBy + '! Use !emote ' + data.emote + ' to push it to screen!');
		$('#count').show();
	}
});


io.on('countdown', function(data){
	$('#count').text(data.seconds);
});

io.on('countdown', function(data){
	//console.log(data.seconds);
});

$(document).ready(function(){
	//$('#emote').hide();
	$('.tickerText').marquee();
	$('#marquee').marquee();
	resetCount();
});

function resetCount(){
	$('#marquee .js-marquee').text('Use !emote <emoticon> to start a vote!');
	$('#count').text('100');
	$('#count').hide();
	$('#icon').attr('class', '');
}
