$(function(){
		
	$('.ezogallery').ezogallery({
		viewerTop: 'top',
		transitionEffect: 'slide',
		viewerEffects: {
			open: 'zoom',
			close: 'fade'
		}
	});
	$('.ezogallery2').ezogallery({
		viewerEffects: {
			open: 'fade',
			close: 'zoom'
		}
	});

});