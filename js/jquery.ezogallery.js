/**
* @author    Alexandre Moatty <79301@supinfo.com>
**/
/**
*	README
*
*	----------------------------------------------------------------------------------------
*
*	Default html template :
*
*		<div class="yourClass">
*			<div class="eg-item">
*				<img src="imageSource" alt="image description" title="image title"/>
*			</div>
*		</div>
*
*	----------------------------------------------------------------------------------------
*
*	Enable ezogallery on youClass :
*
*		$('.yourClass').ezogallery();
*
*	----------------------------------------------------------------------------------------
*	If you want to change defaults settings 
*	(exemple: activate preload and change default description when no title attribute) :
*
*		var options = {
*			preload: true,
*			text: {
*				noDesc: 'no description'
*			}
*		};
*		$('.yourClass').ezogallery(options);
*
*	----------------------------------------------------------------------------------------
*
*	alt and src attributes are mandatory,
*	title attribute is note mandatory, if no title, alt will be use as title
*	you can change the default template, juste keep the same logic
**/
$(function(){

	$.fn.ezogallery = function(options) {
		var container = $(this);
		var itemsList;
		var currentItem;
		var viewerContainer;
		var viewer;
		var itemsContainer;
		var itemWidth;
		var loader;
		var prevBtn;
		var nextBtn;
		var itemTriggerActive;
		var viewerTriggerActive;
		var multiGallery;
        var settings = {
			preload: false,
			viewerTop: 'semi-fixed',     // semi-fixed | fixed | top
			effects: {     // zoom | fade
				open: 'zoom',
				close: 'fade'
			},
			text: {
				noDesc: ''
			},
			item: {
				className: '.eg-item'
			},
			viewer: {
				container: 'body',
				loader: '.eg-loader',
				className: '.eg-viewer',
				template: '\
				<div class="eg-loader">\
					loading\
				</div>\
				<div class="eg-viewer">\
					<div class="eg-background"></div>\
					<div class="eg-content">\
						<div class="eg-close">\
							<a href="#">x</a>\
						</div>\
						<div class="eg-fullscreen">\
							<a href="#">[]</a>\
						</div>\
						<div class="eg-prev">\
							<a href="#"><</a>\
						</div>\
						<div class="eg-next">\
							<a href="#">></a>\
						</div>\
						<div class="eg-items-container">\
							<div class="eg-items">\
								\
							</div>\
						</div>\
					</div>\
				</div>\
				',
				background: '.eg-background',
				content: {
					className: '.eg-content',
					close: '.eg-close a',
					prev: '.eg-prev a',
					next: '.eg-next a',
					fullscreen: '.eg-fullscreen a',
					items: {
						className: '.eg-items-container .eg-items',
						item: {
							className: '.eg-item',
							idTemplate: 'eg-item-',
							template: '\
							<div id="{index}" class="eg-item">\
								<div class="eg-image">\
									<img src="{fullsize}" alt="{alt}"/>\
								</div>\
								<div class="eg-title">\
									<span>{title}</span>\
								</div>\
								<div class="eg-desc">\
									<span>{desc}</span>\
								</div>\
							</div>\
							',
							image: '.eg-image',
							title: '.eg-title',
							desc: '.eg-desc'
						}
					}
				}
			}
		};
		
		init();
		
		function init() {
			if(options)
				$.extend(settings, options);
			viewerContainer = $(settings.viewer.container);
			itemsList = new Array();
			loadedItems = new Array();
			init_items();
			init_viewer();
		}
		
		function init_items() {
			itemTriggerActive = false;
			container.addClass('eg-item-container');
			container.find(settings.item.className).each(function(index) {
				var image = $(this).find('img');
				var alt = image.attr('alt');
				var title = image.attr('title');
				image.fadeTo(0,0);
				image.load(function(){
					image.fadeTo(1000,1);
				});
				itemsList.push({
					index: index,
					thumbnail: image.attr('src'),
					fullsize: image.attr('rel'),
					alt: alt,
					title: (title != '' && title != null) ? title : alt,
					desc: (title != '' && title != null) ? alt : false,
					loaded: false,
					elmnt: $(this)
				});
				init_item_trigger(image, index);
			});
			itemTriggerActive = true;
		}
		
		function init_item_trigger(obj, index) {
			obj.click(function(){
				if(itemTriggerActive)
					viewer_open(itemsList[index], settings.preload);
				return false;
			});
		}

		function init_viewer() {
			multiGallery = check_multiGallery();
			viewerTriggerActive = false;
			if(viewer == null) {
				if(!multiGallery)
					viewerContainer.prepend(settings.viewer.template);
				loader = viewerContainer.find(settings.viewer.loader);
				viewer = viewerContainer.find(settings.viewer.className);
				itemWidth = viewer.find(settings.viewer.content.className).width();
				itemsContainer = viewer.find(settings.viewer.content.items.className);
				itemsContainer.css({width: itemsList.length*itemWidth});
				prevBtn = viewer.find(settings.viewer.content.prev);
				nextBtn = viewer.find(settings.viewer.content.next);
				init_viewer_trigger();
			} else {
				if(multiGallery) {
					viewer_clear();
				}
			}
			viewer.hide();
			loader.hide();
		}

		function init_viewer_trigger() {
			$(document).keydown(function(e) {
				if(viewerTriggerActive) {
				    if(e.keyCode == 27) {
				        viewer_close();
				    }
				}
			});
			viewerContainer.find(settings.viewer.background).click(function(){
				if(viewerTriggerActive)
					viewer_close();
				return false;
			});
			viewer.find(settings.viewer.content.close).click(function(){
				if(viewerTriggerActive)
					viewer_close();
				return false;
			});
			viewer.find(settings.viewer.content.fullscreen).click(function(){
				if(viewerTriggerActive)
					viewer_fullscreen();
				return false;
			});
			prevBtn.click(function(){
				if(viewerTriggerActive)
					viewer_prev();
				return false;
			});
			nextBtn.click(function(){
				if(viewerTriggerActive)
					viewer_next();
				return false;
			});
		}

		function viewer_load_item(obj, callback, showLoader) {
			var id = settings.viewer.content.items.item.idTemplate+obj.index;
			if(!obj.loaded) {
				if(showLoader)
					loader_open();

				// add item
				var itemHtml = settings.viewer.content.items.item.template.replace('{index}', id);
				itemHtml = itemHtml.replace('{fullsize}', obj.fullsize);
				itemHtml = itemHtml.replace('{alt}', obj.alt);
				itemHtml = itemHtml.replace('{title}', obj.title);
				if(!obj.desc)
					itemHtml = itemHtml.replace('{desc}', settings.text.noDesc);
				else
					itemHtml = itemHtml.replace('{desc}', obj.desc);
				if(obj.index < currentItem.index)
					itemsContainer.prepend(itemHtml);
				else
					itemsContainer.append(itemHtml);

				item = item_pos();

				// load image
				item.find(settings.viewer.content.items.item.image+' img').load(function(){
					loader_close();
					itemsList[obj.index].loaded = true;
					if(typeof callback == 'function')
						callback();
				});
			} else if(obj.loaded) {
				item_pos();
				if(typeof callback == 'function')
					callback();
			}

			function item_pos() {
				var item = itemsContainer.find('#'+id);
				item.css({left: itemWidth*obj.index});
				itemsContainer.css({marginLeft: -itemWidth*currentItem.index});
				return item;
			}
		}

		function viewer_prev() {
			var prevItem = currentItem.index-1;
			if(itemsList[prevItem] != null) {
				viewer_load_item(itemsList[prevItem], function(){
					viewer_slide(itemsList[prevItem]);
				}, true);
			}
		}

		function viewer_next() {
			var nextItem = currentItem.index+1;
			if(itemsList[nextItem] != null) {
				viewer_load_item(itemsList[nextItem], function(){
					viewer_slide(itemsList[nextItem]);
				}, true);
			}
		}

		function viewer_open(obj, preload) {
			if(obj == null)
				currentItem = itemsList[0];
			else
				currentItem = obj;
			if(!currentItem.loaded)
				loader_open();
			viewer.show().fadeTo(0, 0);
			if(settings.viewerTop == 'semi-fixed')
				viewer.css({position:'absolute', top:$(window).scrollTop()});
			else if(settings.viewerTop == 'fixed')
				viewer.css({position:'fixed'});
			else if(settings.viewerTop == 'top')
				viewer.css({position:'absolute'});
			viewer_btn_state();
			if(preload) {
				var itemsLoaded = new Array();
				$.each(itemsList, function(i, value){
					viewer_load_item(value, function(){
						itemsLoaded.push(value.index);
						if(itemsLoaded.length == itemsList.length) {
							viewer_effect(settings.effects.open, 'in', function(){
								viewerTriggerActive = true;
							});
						}
					}, false);
				});
			} else {
				viewer_load_item(currentItem, function(){
					viewer_effect(settings.effects.open, 'in', function(){
						viewerTriggerActive = true;
					});
				}, false);
			}
		}

		function viewer_close() {
			viewer_effect(settings.effects.close, 'out', function(){
				init_viewer();
			});
		}
		
		function loader_open() {
			loader.fadeIn('fast');
		}

		function loader_close() {
			if(loader.is(':visible'))
				loader.fadeOut('fast');
		}

		function viewer_slide(obj) {
			viewer_height(obj);
			var marginLeft = -itemWidth*obj.index;
			itemsContainer.animate({marginLeft: marginLeft}, function(){
				currentItem = obj;
				viewer_btn_state();
			});
		}

		function viewer_height(obj, callback, noAnimate) {
			var itemHeight = itemsContainer.find('#'+settings.viewer.content.items.item.idTemplate+obj.index).height();
			var viewerContent = viewer.find(settings.viewer.content.className);
			if(!noAnimate) {
				viewerContent.animate({height: itemHeight}, function(){
					if(typeof callback == 'function')
						callback();
				});
			} else {
				viewerContent.css({height: itemHeight});
				if(typeof callback == 'function')
					callback();
			}
		}

		function viewer_btn_state() {
			if(currentItem == itemsList[0]) {
				if(prevBtn.is(':visible'))
					prevBtn.hide();
				if(!nextBtn.is(':visible'))
					nextBtn.show();
			} else if(currentItem == itemsList[itemsList.length-1]) {
				if(!prevBtn.is(':visible'))
					prevBtn.show();
				if(nextBtn.is(':visible'))
					nextBtn.hide();
			} else {
				if(!prevBtn.is(':visible'))
					prevBtn.show();
				if(!nextBtn.is(':visible'))
					nextBtn.show();
			}
		}

		function viewer_clear() {
			viewer.find(settings.viewer.content.items.className).empty();
			$.each(itemsList, function(i, value){
				value.loaded = false;
			});
		}

		function viewer_fullscreen() {
			alert('not implemented yet');
			return true;
		}

		function viewer_effect(effect, direction, fct) {
	    	var validEffects = new Array(
	    		'fade',
	    		'zoom'
	    	);
	    	var validDirections = new Array(
	    		'in',
	    		'out'
	    	);
	    	if($.inArray(effect, validEffects) == -1 || $.inArray(direction, validDirections) == -1)
	    		return false;

	    	eval('ezo'+ezoucfirst(effect)+ezoucfirst(direction))();
	    	function callback() {
	    		if(typeof fct == 'function')
					fct();
	    	}

	    	/**
	    	* Effects
	    	**/
	    	function ezoFadeIn() {
	    		viewer_height(currentItem, function(){
					viewer.fadeTo(1000, 1);
					loader_close();
					callback();
				}, true);
	    	}

	    	function ezoFadeOut() {
	    		viewer.fadeOut(function(){
					callback();
				});
	    	}

	    	function ezoZoomIn() {
	    		var item = itemsContainer.find('#'+settings.viewer.content.items.item.idTemplate+currentItem.index);
				var image = item.find(settings.viewer.content.items.item.image+' img');
				var thumbnail = currentItem.elmnt.find('img');
				var imageZoom = image.clone();
				imageZoom.addClass('eg-zoom').css({
					position:'absolute',
					zIndex:'1000',
					width:thumbnail.width(),
					height:thumbnail.height(),
					left:thumbnail.offset().left,
					top:thumbnail.offset().top, opacity:0
				});
				currentItem.elmnt.append(imageZoom);
				currentItem.elmnt.find('.eg-zoom').load(function(){
					loader_close();
					imageZoom.animate({
						width:itemWidth, 
						height:image.height(), 
						left:image.offset().left, 
						top:image.offset().top, 
						opacity:1
					}, function(){
						viewer_height(currentItem, function(){
							viewer.fadeTo(1000, 1, function(){
								imageZoom.remove();
								callback();
							});
						}, true);
					});
				});
	    	}

	    	function ezoZoomOut() {
	    		var item = itemsContainer.find('#'+settings.viewer.content.items.item.idTemplate+currentItem.index);
				var image = item.find(settings.viewer.content.items.item.image+' img');
				var thumbnail = currentItem.elmnt.find('img');
				var imageZoom = image.clone();
				imageZoom.addClass('eg-zoom').css({position:'absolute', zIndex:'1000', left:image.offset().left, top:image.offset().top});
				currentItem.elmnt.append(imageZoom);
				currentItem.elmnt.find('.eg-zoom').load(function(){
					viewer.fadeOut(function(){
						imageZoom.animate({
							width:thumbnail.width(), 
							height:thumbnail.height(), 
							left:thumbnail.offset().left, 
							top:thumbnail.offset().top, 
							opacity:0
						}, function(){
							imageZoom.remove();
							callback();
						});
					});
				});
	    	}

	    }

		function check_multiGallery() {
			if(!multiGallery) {
				if($('.eg-item-container').length > 1) {
					multiGallery = true;
					return true;
				} else
					return false;
			} else {
				return true;
			}
		}

        return $(this);
    };

    ezoucfirst = function(str) {
    	return str.charAt(0).toUpperCase()+str.substr(1);
    }
		
});