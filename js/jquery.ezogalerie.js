$(function(){
		
	$.fn.ezogalerie = function(options) {
		var container = $(this);
		var itemsList;
		var currentItem;
		var viewerContainer;
		var viewer;
		var loader;
        var settings = {
			item: {
				className: '.item',
				img: 'img.image',
				title: 'span.title',
				desc: 'span.desc'
			},
			viewer: {
				container: 'body',
				html: '\
				<div class="viewer">\
					<div class="background">back</div>\
					<div class="content">\
						<div class="close">\
							<a href="#">x</a>\
						</div>\
						<div class="prev">\
							<a href="#"><</a>\
						</div>\
						<div class="next">\
							<a href="#">></a>\
						</div>\
						<div class="loader">\
							loading\
						</div>\
						<div class="items">\
							\
						</div>\
					</div>\
				</div>\
				',
				itemHtml: '\
				<div id="{index}" class="item">\
					<div class="image">\
						\
					</div>\
					<div class="title">\
						\
					</div>\
					<div class="desc">\
						\
					</div>\
				</div>\
				',
				background: '.background',
				className: '.viewer',
					loader: '.content .loader',
					close: '.content .close a',
					prev: '.content .prev a',
					next: '.content .next a',
					items: '.content .items',
						item: '.item',
							image: '.image',
							title: '.title',
							desc: '.desc'
			}
		};
		
		init();
		
		function init() {
			if(options)
				$.extend(settings, options);
			viewerContainer = $(settings.viewer.container);
			itemsList = new Array();
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
					obj: $(this),
					loaded: false
				});
			});
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
				for(i=0; i<itemsList.length; i++) {
					itemsList[i].loaded = false;
				}
			}
			viewerContainer.prepend(settings.viewer.html);
			viewer = viewerContainer.find(settings.viewer.className);
			var items = viewerContainer.find(settings.viewer.items);
			items.hide();
			viewer.hide();
			loader = viewer.find(settings.viewer.loader);
			loader.hide();
			init_viewer_trigger();
		}

		function init_viewer_trigger() {
			var closeBtn = viewerContainer.find(settings.viewer.close);
			var viewerBackground = viewerContainer.find(settings.viewer.background);
			var prevBtn = viewerContainer.find(settings.viewer.prev);
			var nextBtn = viewerContainer.find(settings.viewer.next);
			closeBtn.click(function(){
				close_viewer();
				return false;
			});
			viewerBackground.click(function(){
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
			if(!obj.loaded) {
				open_loader();
				// add an item
				var items = viewer.find(settings.viewer.items);
				var itemHtml = settings.viewer.itemHtml.replace('{index}', 'item-'+obj.index);
				if(prev)
					items.prepend(itemHtml);
				else
					items.append(itemHtml);
				var item = items.find('#item-'+obj.index);
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
				// load image
				var img = image.find('img');
				img.load(function(){
					close_loader();
					itemsList[obj.index].loaded = true;
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
					currentItem = itemsList[prevItem].index;
					viewer_slide(currentItem);
				}, true);
			}
		}

		function next_item() {
			var nextItem = currentItem+1;
			if(itemsList[nextItem] != null) {
				load_item(itemsList[nextItem], function(){
					currentItem = itemsList[nextItem].index;
					viewer_slide(currentItem);
				});
			}
		}

		function open_viewer(obj) {
			viewer.fadeIn();
			if(obj != null) {
				load_item(obj, function(){
					viewer.find(settings.viewer.items).fadeIn();
					currentItem = obj.index;
				});
			} else {
				load_item(itemsList[0], function(){
					viewer.find(settings.viewer.items).fadeIn();
					currentItem = itemsList[0].index;
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
			return true;
		}

        return $(this);
    };
		
});