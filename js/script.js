$(function(){
		
	$('.ezogallery').ezogallery({
		viewerTop: 'semi-fixed',
		transitionEffect: 'wave',
		viewerEffects: {
			open: 'back',
			close: 'back'
		}
	});
	$('.ezogallery2').ezogallery({
		transitionEffect: 'wave',
		viewerEffects: {
			open: 'zoom',
			close: 'zoom'
		}
	});

	// $('.ezogallery').ezogallery();
	// $('.ezogallery2').ezogallery();

});