$(function() {	
	/* COVER PAGE
	==========================================================================*/

	function coverPage() {
		$('body').append('<div class="page">' +
				'<div class="halfpage-r">' +
					'<div class="content">' +
						'<div class="cover-heading">' + rootArea.title + '</div>' +
					'</div>' +
				'</div>' +
			'</div>');
	}


	/* TABLE OF CONTENTS
	==========================================================================*/

	function tableOfContents() {
		$('body').append('<div class="page">' +
				'<div class="halfpage-r">' +
					'<div class="content">' +
						'<div class="cover-heading">' + rootArea.title + '</div>' +
					'</div>' +
				'</div>' +
			'</div>');
	}


	/* TOPO IMAGES
	==========================================================================*/

	var imgContainers = [],
		images = [],
		altDown = false,
		activeElement;

	function addImage(dropImg, canvas, offset) {
		var container = $('<div class="img-container"></div>').appendTo(canvas);
		var viewport = $('<div class="img-viewport"></div>').appendTo(container);
		var img = $('<img />').data('text', 'Bug Barn Dance Wall.<br />'
			+ '1 Squid Orgy 5.11a <br />'
			+ '2 Bosko Loves Barbed Wire 5.10b <br />'
			+ '3 Lacy Doggie Panties 5.10c <br />'
			+ '4 Suicidal Yet Depraved 5.10a <br />'
			+ '5 Redneck Genocide 5.11b <br />'
			+ '6 Necrobeastiality 5.11a <br />'
			+ '7 Dreamin\' of Reamin\' 5.11a <br />'
			+ '8 Desperate Land 5.10d <br />'
			+ '9 Raid 5.11a <br />'
			+ '10 Cambrian Grey 5.10c <br />'
			+ '11 Dark at Seven 5.9 <br />'
			+ '12 Looking For A Legacy 5.9 wiht a dsfh sdlfkjh sdlkjh sldkfjh sdlkfjh sdlkfjh sdf lskh sdfkjh sdlfkjh sdlkfjh sdlkfjh ');
		var canvasOffset = canvas.offset();
		var canvasW = canvas.width();
		var canvasH = canvas.height();
		var cy = Math.floor(offset.top - canvasOffset.top + .5*dropImg.height());
		var cx = Math.floor(offset.left - canvasOffset.left + .5*dropImg.width());
		var maxW = .75*canvasW;
		var maxH = .75*canvasH;
		var border = 1;
		
		var imgTextContainer = $('<div class="img-text-container">'
			+ '<div class="background-container">'
				+ '<div class="background"></div>'
			+ '</div>'
			+ '<div class="img-text"></div></div>')
			.appendTo(container)
			.draggable({
				snap: viewport,
				containment: canvas,
				stop: function() {
					activeElement = $(this);
				}
			})
			.resizable({
				handles: 'e, w',
				resize: function() {
					$(this).css({height: 'auto'});
				},
				stop: function() {
					$(this).css({height: 'auto'});
				}
			})
			.click(function(e) {
				e.stopPropagation();
				activeElement = $(this);
			})
			.bind('mp.keydown', function(event, e) {
				if (activeElement && activeElement.get(0) == $(this).get(0)) {
					var imgText = $(this).children('.img-text');
					if (e.keyCode == 114) { // r
						e.preventDefault();
						imgText.css({textAlign: 'right'});
					}
					else if (e.keyCode == 99) { // c
						e.preventDefault();
						imgText.css({textAlign: 'center'});
					}
					else if (e.keyCode == 108) { // l
						e.preventDefault();
						imgText.css({textAlign: 'left'});
					}
					else if (e.keyCode == 8) { // delete
						e.preventDefault();
						container.remove();
					}
					else if (e.keyCode == 49) { // 1
						imgText.removeClass('column2 column3 column4 column5');
					}
					else if (e.keyCode == 50) { // 2
						imgText.removeClass('column3 column4 column5').addClass('column2');
					}
					else if (e.keyCode == 51) { // 3
						imgText.removeClass('column2 column4 column5').addClass('column3');
					}
					else if (e.keyCode == 52) { // 4
						imgText.removeClass('column2 column3 column5').addClass('column4');
					}
					else if (e.keyCode == 53) { // 5
						imgText.removeClass('column2 column3 column4').addClass('column5');
					}
				}
			});

		var imgText = imgTextContainer.children('.img-text')
			.html(img.data('text'));
		
		// after image loads
		img.load(function() {
			var w = $(this).get(0).width;
			var h = $(this).get(0).height;
			var imgRatio = w/h;
			$(this).attr({
				origWidth: w,
				origHeight: h
			});
			if (w > maxW || h > maxH) {
				var scale = Math.min(maxW/w, maxH/h);
				w *= scale;
				h *= scale;
				$(this).attr({
					width: w,
					height: h
				});
			}
			
			var maxL = canvasW - (w+2*border);
			var maxT = canvasH - (h+2*border);
			var l = Math.max(Math.min(Math.floor(cx - .5*(w+2*border)), maxL), 0);
			var t = Math.max(Math.min(Math.floor(cy - .5*(h+2*border)), maxT), 0);
			
			var imgCenterOffset = {};
			var imgOriginalSize = {};
			var imgOriginalPosition = {};
			
			container.css({
				width: w + 'px',
				height: h + 'px',
				left: l + 'px',
				top: t + 'px'
			}).draggable({
				containment: canvas,
				grid: [10, 10],
				start: function(event, ui) {
					ui.helper.siblings('.img-container').prependTo(ui.helper.parent());
				},
				stop: function() {
					activeElement = $(this);
				}
			}).resizable({
				containment: canvas,
				handles: 'ne,se,sw,nw',
				autoHide: true,
				alsoResize: imgTextContainer,
				start: function(event, ui) {
					var imgPos = img.position();
					imgCenterOffset = {
						x: Math.floor(imgPos.left - .5*ui.originalSize.width),
						y: Math.floor(imgPos.top - .5*ui.originalSize.height)
					};
					imgOriginalSize = {
						w: img.height()*imgRatio,
						h: img.height()
					};
					imgOriginalPosition = {
						l: imgPos.left,
						t: imgPos.top
					};
				},
				resize: function(event, ui) {
					var css = {};
					if (altDown) {
						if (ui.position.left != ui.originalPosition.left)
							css.left = Math.round(imgOriginalPosition.l - (ui.position.left - ui.originalPosition.left)) + 'px';
						if (ui.position.top != ui.originalPosition.top)
							css.top = Math.round(imgOriginalPosition.t - (ui.position.top - ui.originalPosition.top)) + 'px';
					}
					else {
						var scaleX = ui.size.width/ui.originalSize.width;
						var scaleY = ui.size.height/ui.originalSize.height;	
						var scale = Math.max(scaleX, scaleY);
						
						css.width = Math.ceil(scale*imgOriginalSize.w) + 'px';
						css.height = Math.ceil(scale*imgOriginalSize.h) + 'px';
						css.left = Math.round(scale*imgCenterOffset.x + .5*ui.size.width) + 'px';
						css.top = Math.round(scale*imgCenterOffset.y + .5*ui.size.height) + 'px';
					}
					img.css(css);
					imgTextContainer.css({height: 'auto'});
				},
				stop: function(event, ui) {
					var imgPos = img.position();
					var containerRatio = ui.size.width/ui.size.height;
					var minH = containerRatio > imgRatio ? Math.ceil(ui.size.width/imgRatio) : ui.size.height;
					var h = Math.max(minH, img.height());
					img.css({
						width: Math.ceil(h*imgRatio) + 'px',
						height: Math.ceil(h) + 'px',
						left: Math.min(Math.round(imgPos.left), 0) + 'px',
						top: Math.min(Math.round(imgPos.top), 0) + 'px'
					});
					imgTextContainer.css({height: 'auto'});
					activeElement = $(this);
				}
			})
			.click(function() {
				activeElement = $(this);
			})
			.bind('mp.keydown', function(event, e) {
				if (activeElement && activeElement.get(0) == $(this).get(0)) {
					if (e.keyCode == 8) {
						e.preventDefault();
						$(this).remove();
					}
				}
			});
			
			$(this).prependTo(viewport)
				.draggable({
					disabled: true
				});
			
			imgContainers.push(container);
			images.push($(this));
		}).attr('src', dropImg.attr('src'));
		
		activeElement = container;
	}
	
	function altMode() {
		altDown = true;
		map(imgContainers, function(container) {
			container.draggable('disable');
		});
		map(images, function(img) {
			img.draggable('enable');
		});
	}
	
	function unAltMode() {
		altDown = false;
		map(images, function(img) {
			img.draggable('disable');
		});
		map(imgContainers, function(container) {
			container.draggable('enable');
		});
	}
	
	$('div.imagebar img').draggable({
		helper: "clone",
		zIndex: 100,
		appendTo: 'body'
	});
	$('div.canvas').each(function() {
		var canvas = $(this);
		canvas.droppable({
			accept: function( item ) {
				//alert(canvas.siblings('div.imagebar').children('img').filter(item).size());
				return canvas.parent().siblings('div.imagebar').children('img').filter(item).size() > 0;
			},
			drop: function( event, ui ) {
				addImage(ui.draggable, canvas, ui.offset);
				//alert('dropped');
				//deleteImage( ui.draggable );
			}
		});
	});
	
	$(document).keydown(function(e) {
		if (e.keyCode == 18)
			altMode();
		if (activeElement) {
			$(activeElement).triggerHandler('mp.keydown', [e]);
		}
	});
	$(document).keyup(function(e) {
		if (e.keyCode == 18)
			unAltMode();
	});
	$(document).keypress(function(e) {
		if (activeElement) {
			$(activeElement).triggerHandler('mp.keydown', [e]);
		}
	});
});
