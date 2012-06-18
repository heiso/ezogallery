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
        var settings = {
			preload: false,
			effects: {
				open: 'zoom',
				close: 'zoom'
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
							desc: '.eg-desc',
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
			container.find(settings.item.className).each(function(index) {
				var image = $(this).find('img');
				var alt = image.attr('alt');
				var title = image.attr('title');
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
		}
		
		function init_item_trigger(obj, index) {
			obj.click(function(){
				open_viewer(itemsList[index], settings.preload);
				return false;
			});
		}

		function init_viewer() {
			if(viewer == null) {
				viewerContainer.prepend(settings.viewer.template);
				loader = viewerContainer.find(settings.viewer.loader);
				viewer = viewerContainer.find(settings.viewer.className);
				itemsContainer = viewer.find(settings.viewer.content.items.className);
				itemsContainer.css({width: itemsList.length*itemWidth});
				itemWidth = itemsContainer.width();
				prevBtn = viewer.find(settings.viewer.content.prev);
				nextBtn = viewer.find(settings.viewer.content.next);
				init_viewer_trigger();
			}
			viewer.hide();
			loader.hide();
		}

		function init_viewer_trigger() {
			viewerContainer.find(settings.viewer.background).click(function(){
				close_viewer();
				return false;
			});
			viewer.find(settings.viewer.content.close).click(function(){
				close_viewer();
				return false;
			});
			viewer.find(settings.viewer.content.fullscreen).click(function(){
				fullscreen();
				return false;
			});
			prevBtn.click(function(){
				prev_item();
				return false;
			});
			nextBtn.click(function(){
				next_item();
				return false;
			});
		}

		function load_item(obj, callback, showLoader) {
			var id = settings.viewer.content.items.item.idTemplate+obj.index;
			if(!obj.loaded) {
				if(showLoader)
					open_loader();

				// add item
				var itemHtml = settings.viewer.content.items.item.template.replace('{index}', id);
				itemHtml = itemHtml.replace('{fullsize}', obj.fullsize);
				itemHtml = itemHtml.replace('{alt}', obj.alt);
				itemHtml = itemHtml.replace('{title}', obj.title);
				if(!obj.desc)
					itemHtml = itemHtml.replace('{desc}', settings.text.noDesc);
				else
					itemHtml = itemHtml.replace('{desc}', obj.desc);
				if(obj.index < currentItem)
					itemsContainer.prepend(itemHtml);
				else
					itemsContainer.append(itemHtml);

				item = item_pos();

				// load image
				item.find(settings.viewer.content.items.item.image+' img').load(function(){
					close_loader();
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
				itemsContainer.css({marginLeft: -itemWidth*currentItem});
				return item;
			}
		}

		function prev_item() {
			var prevItem = currentItem-1;
			if(itemsList[prevItem] != null) {
				load_item(itemsList[prevItem], function(){
					viewer_slide(itemsList[prevItem]);
				}, true);
			}
		}

		function next_item() {
			var nextItem = currentItem+1;
			if(itemsList[nextItem] != null) {
				load_item(itemsList[nextItem], function(){
					viewer_slide(itemsList[nextItem]);
				}, true);
			}
		}

		function open_viewer(obj, preload) {
			if(!obj.loaded)
				open_loader();
			viewer.show().fadeTo(0, 0);
			if(obj == null)
				obj = itemsList[0];
			currentItem = obj.index;
			btn_state();
			if(preload) {
				var itemsLoaded = new Array();
				$.each(itemsList, function(i, value){
					load_item(value, function(){
						itemsLoaded.push(value.index);
						if(itemsLoaded.length == itemsList.length) {
							effect(settings.effects.open);
						}
					}, false);
				});
			} else {
				load_item(obj, function(){
					effect(settings.effects.open);
				}, false);
			}

			function effect(name) {
				if(name == 'zoom') {
					close_loader();
					var item = itemsContainer.find('#'+settings.viewer.content.items.item.idTemplate+obj.index);
					var image = item.find(settings.viewer.content.items.item.image+' img');
					var thumbnail = obj.elmnt.find('img');
					var imageZoom = image.clone();
					imageZoom.css({position:'absolute', zIndex:'1000', width:thumbnail.width(), height:thumbnail.height(), left:thumbnail.offset().left, top:thumbnail.offset().top, opacity:0});
					obj.elmnt.append(imageZoom);
					imageZoom.animate({width:itemWidth, height:image.height(), left:image.offset().left, top:image.offset().top, opacity:1}, function(){
						viewer_height(obj, function(){
							viewer.fadeTo(1000, 1, function(){
								imageZoom.remove();
							});
						}, true);
					});
				} else if(name == 'fade') {
					viewer_height(obj, function(){
						viewer.fadeTo(1000, 1);
						close_loader();
					}, true);
				}
			}
		}

		function close_viewer() {
			effect(settings.effects.close, function(){
				init_viewer();
			});
			
			function effect(name, callback) {
				if(name == 'zoom') {
					var item = itemsContainer.find('#'+settings.viewer.content.items.item.idTemplate+currentItem);
					var image = item.find(settings.viewer.content.items.item.image+' img');
					var thumbnail = itemsList[currentItem].elmnt.find('img');
					var imageZoom = image.clone();
					imageZoom.css({position:'absolute', zIndex:'1000'});
					imageZoom.css(image.offset());
					itemsList[currentItem].elmnt.append(imageZoom);
					viewer.fadeOut(function(){
						imageZoom.animate({width:thumbnail.width(), height:thumbnail.height(), left:thumbnail.offset().left, top:thumbnail.offset().top, opacity:0}, function(){
							imageZoom.remove();
							if(typeof callback == 'function')
								callback();
						});
					});
				} else if(name == 'fade') {
					viewer.fadeOut(function(){
						if(typeof callback == 'function')
							callback();
					});
				}
			}
		}
		
		function open_loader() {
			loader.fadeIn('fast');
		}

		function close_loader() {
			if(loader.is(':visible'))
				loader.fadeOut('fast');
		}

		function viewer_slide(obj) {
			viewer_height(obj);
			var marginLeft = -itemWidth*obj.index;
			itemsContainer.animate({marginLeft: marginLeft}, function(){
				currentItem = obj.index;
				btn_state();
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

		function btn_state() {
			if(currentItem == itemsList[0].index) {
				if(prevBtn.is(':visible'))
					prevBtn.hide();
				if(!nextBtn.is(':visible'))
					nextBtn.show();
			} else if(currentItem == itemsList[itemsList.length-1].index) {
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

		function fullscreen() {
			alert('not implemented yet');
			return true;
		}

        return $(this);
    };
		
});