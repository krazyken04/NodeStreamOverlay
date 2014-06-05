$(document).ready(function(){
	$('#search input').click(function(){
		$('#search').addClass('active');
	});
	
	var currentMatching = 0;
	
	// Detect Typing
	$('#search input').keypress(function(e){
		if($('.pressEnter').size() < 1){
			$('#search').append('<span class="pressEnter"></span>');
		}
		
		$('#searchWrapper li').css('opacity', '0.3');
		$('#searchWrapper li').eq(currentMatching).css('opacity', '1').addClass('ellipse');
		
		if(currentMatching == 4){
			//$('#searchWrapper li').eq(4).removeClass('ellipse').addClass('close');
		}
		
		var code = e.keyCode || e.which;
		if(code == 13 && $('#search input').val() != '') {
			// TODO: ENTER KEY STORES STRING TO SEND TO AJAX REQUEST!!!
			$('#search input').val('');
			
			$('#searchWrapper li').removeClass('ellipse');
			$('#searchWrapper li').removeClass('close');
			$('#searchWrapper li').css('opacity', '0.3');
			
			$('#searchWrapper li').eq(currentMatching).css('opacity', '1').addClass('check');
			$('#searchWrapper li').eq(currentMatching+1).css('opacity', '.8').addClass('ellipse');
			//$('#searchWrapper li').eq(currentMatching+2).css('opacity', '.8').addClass('close');
			
			if(currentMatching < 4){
				currentMatching++;
			} else if(currentMatching == 4){
				currentMatching = 0;
				
				// TODO: REMOVE THIS OPACITY SHIT
				// TRANSITION TO SEARCHING / SEARCH RESULTS!
				// RESET SEARCH BOX
				
				$('#searchWrapper').css('opacity', '0.5');
			} 
		}
	});
});