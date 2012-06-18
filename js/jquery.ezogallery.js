/**
* @author    Alexandre Moatty <79301@supinfo.com>
**/
$(function(){
		
	$.fn.ezogallery = function(itemWidth, options) {
		var container = $(this);
		var itemsList;
		var currentItem;
		var viewerContainer;
		var viewer;
		var itemsContainer;
		var loader;
		var prevBtn;
		var nextBtn;
        var settings = {
			preload: false,
			text: {
				noDesc: ''
			},
			item: {
				className: '.eg-item'
			},
			viewer: {
				container: 'body',
				className: '.eg-viewer',
				template: '\
				<div class="eg-viewer">\
					<div class="eg-background"></div>\
					<div class="eg-content">\
						<div class="eg-close">\
							<a href="#">x</a>\
						</div>\
						<div class="eg-prev">\
							<a href="#"><</a>\
						</div>\
						<div class="eg-next">\
							<a href="#">></a>\
						</div>\
						<div class="eg-loader">\
							loading\
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
					loader: '.eg-loader',
					close: '.eg-close a',
					prev: '.eg-prev a',
					next: '.eg-next a',
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
					loaded: false
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
				viewer = viewerContainer.find(settings.viewer.className);
				itemsContainer = viewer.find(settings.viewer.content.items.className);
				itemsContainer.css({width: itemsList.length*itemWidth});
				loader = viewer.find(settings.viewer.content.loader);
				prevBtn = viewer.find(settings.viewer.content.prev);
				nextBtn = viewer.find(settings.viewer.content.next);
				init_viewer_trigger();
			}
			viewer.hide();
			itemsContainer.hide();
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
			prevBtn.click(function(){
				prev_item();
				return false;
			});
			nextBtn.click(function(){
				next_item();
				return false;
			});
		}

		function load_item(obj, callback) {
			var id = settings.viewer.content.items.item.idTemplate+obj.index;
			if(!obj.loaded) {
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
				item.find(settings.viewer.content.items.item.image).find('img').load(function(){
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
				});
			}
		}

		function next_item() {
			var nextItem = currentItem+1;
			if(itemsList[nextItem] != null) {
				load_item(itemsList[nextItem], function(){
					viewer_slide(itemsList[nextItem]);
				});
			}
		}

		function open_viewer(obj, preload) {
			viewer.fadeIn();
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
							itemsContainer.fadeIn(function(){
								viewer_height(obj);
							});
						}
					});
				});
			} else {
				load_item(obj, function(){
					itemsContainer.fadeIn(function(){
						viewer_height(obj);
					});
				});
			}
		}

		function close_viewer() {
			viewer.fadeOut(function(){
				init_viewer();
			});
		}
		
		function open_loader() {
			loader.fadeIn('fast');
		}

		function close_loader() {
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

		function viewer_height(obj) {
			var itemHeight = viewer.find('#'+settings.viewer.content.items.item.idTemplate+obj.index).height();
			var viewerContent = viewer.find(settings.viewer.content.className);
			viewerContent.animate({height: itemHeight});
		}

		function btn_state() {
			if(currentItem == itemsList[0].index) {
				if(prevBtn.is(':visible'))
					prevBtn.hide();
			} else if(currentItem == itemsList[itemsList.length-1].index) {
				if(nextBtn.is(':visible'))
					nextBtn.hide();
			} else {
				if(!prevBtn.is(':visible'))
					prevBtn.show();
				if(!nextBtn.is(':visible'))
					nextBtn.show();
			}
		}

        return $(this);
    };
		
});