$(function(){
		
	$.fn.ezogallery = function(itemWidth, options) {
		var container = $(this);
		var itemsList;
		var loadedItems;
		var currentItem;
		var viewerContainer;
		var viewer;
		var itemsContainer;
		var loader;
        var settings = {
			item: {
				className: '.eg-item',
				img: 'img.eg-image',
				title: 'span.eg-title',
				desc: 'span.eg-desc'
			},
			viewer: {
				container: 'body',
				html: '\
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
				itemHtml: '\
				<div id="{index}" class="eg-item">\
					<div class="eg-image">\
						\
					</div>\
					<div class="eg-title">\
						\
					</div>\
					<div class="eg-desc">\
						\
					</div>\
				</div>\
				',
				background: '.eg-background',
				className: '.eg-viewer',
					content: '.eg-content',
						loader: '.eg-content .eg-loader',
						close: '.eg-content .eg-close a',
						prev: '.eg-content .eg-prev a',
						next: '.eg-content .eg-next a',
						items: '.eg-content .eg-items-container .eg-items',
							itemId: 'eg-item-',
							item: '.eg-item',
								image: '.eg-image',
								title: '.eg-title',
								desc: '.eg-desc'
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
			var items = container.find(settings.item.className);
			items.each(function(index){
				var thumbnail = $(this).find(settings.item.img).attr('src');
				var fullsize = $(this).find(settings.item.img).attr('rel');
				var alt = $(this).find(settings.item.img).attr('alt');
				var title = $(this).find(settings.item.title).text();
				var desc = $(this).find(settings.item.desc).text();
				itemsList.push({
					index: index,
					thumbnail: thumbnail,
					fullsize: fullsize,
					alt: alt,
					title: title,
					desc: desc,
					obj: $(this)
				});
			});
			// trigger
			init_item_trigger();
		}
		
		function init_item_trigger() {
			$.each(itemsList, function(index){
				var item = itemsList[index];
				item.obj.click(function(){
					open_viewer(item);
					return false;
				});
			});
		}

		function init_viewer() {
			if(viewer != null) {
				viewer.remove();
				loadedItems = new Array();
			}
			viewerContainer.prepend(settings.viewer.html);
			viewer = viewerContainer.find(settings.viewer.className);
			itemsContainer = viewer.find(settings.viewer.items);
			itemsContainer.hide();
			viewer.hide();
			loader = viewer.find(settings.viewer.loader);
			loader.hide();
			// set itemsContainer width
			itemsContainer.css({width: itemsList.length*itemWidth});
			// trigger
			init_viewer_trigger();
		}

		function init_viewer_trigger() {
			var closeBtn = viewerContainer.find(settings.viewer.close);
			var background = viewerContainer.find(settings.viewer.background);
			var prevBtn = viewerContainer.find(settings.viewer.prev);
			var nextBtn = viewerContainer.find(settings.viewer.next);
			closeBtn.click(function(){
				close_viewer();
				return false;
			});
			background.click(function(){
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

		function load_item(obj, callback, prev) {
			if($.inArray(obj.index, loadedItems) == -1) {
				open_loader();
				// add an item
				var items = viewer.find(settings.viewer.items);
				var itemHtml = settings.viewer.itemHtml.replace('{index}', settings.viewer.itemId+obj.index);
				if(prev)
					items.prepend(itemHtml);
				else
					items.append(itemHtml);
				var item = items.find('#'+settings.viewer.itemId+obj.index);
				// add image in item
				var imgHtml = '<img src="'+obj.fullsize+'" alt="'+obj.alt+'" />';
				var image = item.find(settings.viewer.image);
				image.append(imgHtml);
				// add title
				var title = item.find(settings.viewer.title);
				title.append(obj.title);
				// add desc
				var desc = item.find(settings.viewer.desc);
				desc.append(obj.desc);
				// set items position
				var left = itemWidth*obj.index;
				var marginLeft = -itemWidth*currentItem;
				item.css({left: left});
				itemsContainer.css({marginLeft: marginLeft});
				// load image
				var img = image.find('img');
				img.load(function(){
					close_loader();
					loadedItems.push(obj.index);
					loadedItems.sort();
					if(typeof callback == 'function')
						callback();
				});
			} else {
				if(typeof callback == 'function')
					callback();
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
				});
			}
		}

		function open_viewer(obj) {
			viewer.fadeIn();
			if(obj == null)
				obj = itemsList[0];
			currentItem = obj.index;
			load_item(obj, function(){
				viewer.find(settings.viewer.items).fadeIn(function(){
					viewer_height(obj);
				});
			});
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
			});
		}

		function viewer_height(obj) {
			var itemHeight = viewer.find('#'+settings.viewer.itemId+obj.index).height();
			var viewerContent = viewer.find(settings.viewer.content);
			viewerContent.animate({height: itemHeight});
		}

        return $(this);
    };
		
});