$(function(){
		
	$.fn.ezogalerie = function(options) {
		var container = $(this);
		var itemsList;
		var items;
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
						<div class="loader">\
							loading\
						</div>\
						<div class="item">\
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
					</div>\
				</div>\
				',
				className: '.viewer',
				image: '.content .item .image',
				title: '.content .item .title',
				desc: '.content .item .desc',
				loader: '.content .loader',
				close: '.content .close a',
				background: '.background'
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
			items = container.find(settings.item.className);
			items.each(function(index){
				var thumbnail = $(this).find(settings.item.img).attr('src');
				var fullsize = $(this).find(settings.item.img).attr('rel');
				var alt = $(this).find(settings.item.img).attr('alt');
				itemsList.push({
					index: index,
					thumbnail: thumbnail,
					fullsize: fullsize,
					alt: alt,
					obj: $(this)
				});
			});
			init_item_trigger();
			/**
			* dev
			**/
			// console.log(itemsList);
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
			if(viewer != null)
				viewer.remove();
			viewerContainer.prepend(settings.viewer.html);
			viewer = viewerContainer.find(settings.viewer.className);
			viewer.hide();
			loader = viewerContainer.find(settings.viewer.className+' '+settings.viewer.loader);
			loader.hide();
			init_viewer_trigger();
		}

		function init_viewer_trigger() {
			var closeBtn = viewerContainer.find(settings.viewer.close);
			var viewerBackground = viewerContainer.find(settings.viewer.background);
			closeBtn.click(function(){
				close_viewer();
				return false;
			});
			viewerBackground.click(function(){
				close_viewer();
				return false;
			});
		}

		function load_item(item) {
			open_loader();
			var imgHtml = '<img src="'+item.fullsize+'" alt="'+item.alt+'" />';
			var imgContainer = viewer.find(settings.viewer.image);
			imgContainer.append(imgHtml);
			var img = imgContainer.find('img');
			img.hide();
			img.load(function(){
				close_loader();
				img.fadeIn();
			});
		}

		function open_viewer(item) {
			viewer.fadeIn();
			if(item != null)
				load_item(item);
			else
				load_item(itemsList[0]);
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

        return $(this);
    };
		
});