$(function() {
	var routeTypes = {},
		orderedRatingSets = [],
		ratingBoxChildrenCount = 1,
		routeTypeColors = {
			boulder: '255,0,128',
			trad: '255,0,0',
			sport: '255,128,0',
			toprope: '128,128,0',
			ice: '128,255,0',
			aid: '0,255,0',
			mixed: '0,255,128',
			alpine: '0,128,255',
			rock: '0,0,255'
		},
		routeTypeLabels = {
			rock: 'ROCK',
			boulder: 'BOULDER',
			trad: 'TRAD',
			sport: 'SPORT',
			ice: 'ICE',
			aid: 'AID',
			mixed: 'MIXED',
			alpine: 'ALPINE',
			toprope: 'TR'
		};

	/* BUILD ALL PAGES
	==========================================================================*/

	function buildPages() {
		getRouteTypes();
		orderRatingSets();
		//coverPage();
		tableOfContents();
		areaPages();
	}

	function rebuildPages() {
		$('body').empty();
		//coverPage();
		tableOfContents();
		areaPages();
	}


	/* UTILITY FUNCTIONS
	==========================================================================*/

	/*
	 * Get all route types
	 */
	function getRouteTypes() {
		function addAreaTypes(area) {
			if (area.areas.length > 0) {
				map(area.areas, function (subarea) {
					addAreaTypes(subarea);
				});
			}
			else {
				var isRock = true;

				if (area.data.boulderRoutes) {
					routeTypes.boulder = true;
					isRock = false;
				}
				if (area.data.tradRoutes) {
					routeTypes.trad = true;
					isRock = false;
				}
				if (area.data.sportRoutes) {
					routeTypes.sport = true;
					isRock = false;
				}
				if (area.data.topropeRoutes) {
					routeTypes.toprope = true;
					isRock = false;
				}
				if (area.data.iceRoutes) {
					routeTypes.ice = true;
					isRock = false;
				}
				if (area.data.aidRoutes) {
					routeTypes.aid = true;
					isRock = false;
				}
				if (area.data.mixedRoutes) {
					routeTypes.mixed = true;
					isRock = false;
				}
				if (area.data.alpineRoutes) {
					routeTypes.alpine = true;
					isRock = false;
				}
				if (area.data.rockRoutes && isRock)
					routeTypes.rock = true;
			}
		}

		addAreaTypes(rootArea);
	}


	/*
	 * Order ratings sets for rating box function
	 */
	function orderRatingSets() {
		ratingBoxChildrenCount = 0;
		for (var ratingGroup in ratingSets) {
			if (ratingGroup == 'undefined')
				continue;
			
			var setObj = {group: ratingGroup, children: []};

			for (var rating in ratingSets[ratingGroup]) {
				setObj.children.push(rating);
				ratingBoxChildrenCount++;
			}
			setObj.children.sort();

			orderedRatingSets.push(setObj);
		}

		orderedRatingSets.sort(function(a,b){
			a = a.group.split('.')[1];
			b = b.group.split('.')[1];
			if (a == 'x' && b == 'x') return 0;
			else if (a == 'x') return -1;
			else if (b == 'x') return 1;
			return b > a ? -1 : (b < a ? 1 : 0);
		});
	}


	/*
	 * Fill type box html
	 */
	function fillTypeBox(box, area) {
		var html = '<table cellpadding="0" cellspacing="0" border="0">' + (area ? '<tr>' : '');

		for (var type in routeTypes) {
			var label = '',
				color = routeTypeColors[type],
				alpha = '.05';

			if (area) {
				if (area.data[type + 'Routes'])
					alpha = '1';
			}
			else { // toc
				label = '<div class="label">' + routeTypeLabels[type] + '</div>';
				alpha = '.1';
			}

			html += (area ? '' : '<tr>') +
					'<td>' +
						'<div class="cell">' +
							'<div class="background-container">' +
								'<div class="background" style="border-color: rgba(' + color + ',' + alpha + ');"></div>' +
							'</div>' +
							label +
						'</div>' +
					'</td>' +
				(area ? '' : '</tr>');
		}

		html += (area ? '</tr>' : '') + '</table>';

		box.html(html);
	}


	/*
	 * Fill rating box html
	 */
	function fillRatingBox(box, ratingsObj) {
		var w = box.width() - 1,
			cellW = Math.floor(w/ratingBoxChildrenCount - 1),
			maxRatingCount = 0,
			html = '<div class="ratings">';

		for (ratingGroup in ratingsObj) {
			for (rating in ratingsObj[ratingGroup]) {
				maxRatingCount = Math.max(ratingsObj[ratingGroup][rating], maxRatingCount);
			}
		}

		map(orderedRatingSets, function(set) {
			map(set.children, function(rating) {
				var count = ratingsObj[set.group] && ratingsObj[set.group][rating] ? ratingsObj[set.group][rating] : 0,
					colorVal = Math.floor(180*(1 - count/maxRatingCount)),
					style =  (count > 0 ? ' style="border-color: rgb(' + colorVal + ',' + colorVal + ',' + colorVal + ');"' : '');

				html += '<div class="rating' + (count > 0 ? ' active' : '') + '" style="width: ' + cellW + 'px;">' +
							'<div class="background-container">' +
								'<div class="background"' + style + '></div>' +
							'</div>' +
							'<div>' + rating + '</div>' +
						'</div>';
			});
		});

		html += '</div><div class="rating-groups">';

		map(orderedRatingSets, function(set) {
			html += '<div style="width: ' + (set.children.length*(cellW + 1) - 1) + 'px">' + set.group + '</div>';
		});

		html += '</div>';

		box.html(html);
	}


	/*
	 * Pop up text box with JSON data to be saved.
	 */
	function exportData() {
		var padding = 40;
		if ($('#export_data').length == 0) {
			$('body').append('<div id="export_data" class="noprint">' + 
				'<textarea id="export_data_outp" readonly="readonly"></textarea>' +
				'<button id="export_data_close_button">Done</button></div>');
			$('#export_data').css({
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(0,0,0,.5)',
				zIndex: '2000'
			}).find('textarea').css({
				position: 'absolute',
				top: padding + 'px',
				left: padding + 'px',
				right: padding + 'px',
				bottom: 2*padding + 'px',
				border: '#000000 solid 5px'
			}).siblings('button').css({
				position: 'absolute',
				right: padding + 'px',
				bottom: padding + 'px'
			});

			$('#export_data_close_button').click(function() {
				$('#export_data').hide();
			});
		}

		var outp = {};

		function getAreaData(area) {
			map(area.routes, function(route) {
				if (route.data.print) {
					if (!outp[route.data.id])
						outp[route.data.id] = {};

					outp[route.data.id] = {
						name: route.data.name,
						print: route.data.print
					}
				}
			});

			map(area.areas, function(area) {
				if (area.data.activeImages) {
					if (!outp[area.data.id])
						outp[area.data.id] = {};

					outp[area.data.id] = {
						title: area.data.title,
						activeImages: area.data.activeImages
					}
				}

				getAreaData(area);
			});
		}
		
		getAreaData(rootArea);

		$('#export_data_outp').val(
			'/*\n' +
			' * Print data for ' + rootArea.data.title + '.\n' +
			' * Mountain project ID: ' + rootArea.data.id + '\n' +
			' */\n' +
			'var mpPrintData = ' +
			JSON.stringify(outp, null, '\t')
		);

		$('#export_data').show();
	}

	/*
	 * Pop up text box with JSON data to be loaded.
	 */
	function importData() {
		var padding = 40;
		if ($('#import_data').length == 0) {
			$('body').append('<div id="import_data" class="noprint">' +
				'<textarea id="import_data_inp"></textarea>' +
				'<button id="import_data_cancel_button">Cancel</button>' +
				'<button id="import_data_button">Import</button></div>');
			$('#import_data').css({
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(0,0,0,.5)',
				zIndex: '2000'
			}).find('textarea').css({
				position: 'absolute',
				top: padding + 'px',
				left: padding + 'px',
				right: padding + 'px',
				bottom: 2*padding + 'px',
				border: '#000000 solid 5px'
			}).siblings('button').eq(1).css({
				position: 'absolute',
				right: padding + 'px',
				bottom: padding + 'px'
			}).siblings('button').css({
				position: 'absolute',
				right: 3*padding + 'px',
				bottom: padding + 'px'
			});

			$('#import_data_cancel_button').click(function() {
				$('#import_data').hide();
			});

			$('#import_data_button').click(function() {
				var data = $('#import_data_inp').val();

				if (data.match(/function/)) {
					alert('Invalid data, please try something else.');
					return;
				}

				try {
					eval(data);
				}
				catch (e) {
					alert('Invalid data: ' + e);
					return;
				}

				if (mpPrintData) {

					function setAreaData(area) {
						map(area.routes, function(route) {
							var save = false;

							if (mpPrintData[route.data.id] && mpPrintData[route.data.id].print) {
								route.data.print = mpPrintData[route.data.id].print;
								save = true;
							}

							if (save)
								mp.db.saveRoute(route.data.id, route.data);
						});

						map(area.areas, function(area) {
							var save = false;

							if (mpPrintData[area.data.id] && mpPrintData[area.data.id].activeImages) {
								area.data.activeImages = mpPrintData[area.data.id].activeImages;
								save = true;
							}

							if (save)
								mp.db.saveArea(area.data.id, area.data);

							setAreaData(area);
						});
					}

					setAreaData(rootArea);

					$('#import_data').hide();

					rebuildPages();
				}
			});
		}


		$('#import_data').show();
	}
	
	function wrapEachLine(html) {
		html = html.replace(/[\r\n\t]/gi, ' ');
		html = html.replace(/^\s*/g, '');
		html = html.replace(/\s*$/g, '');
		var div = $('<div>' + html + '</div>');
		div.find('a').each(function() {
			$(this).replaceWith($(this).text());
		});
		div.find('ul, ol').each(function() {
			$(this).find('li').each(function() {
				$(this).replaceWith('* ' + $(this).text() + '<br />');
			});
			$(this).replaceWith($(this).html());
		});
		var ret = div.html();
		ret = ret.replace(/<br[^>]*?>/gi, '&nbsp;</div><div>');
		return '<div>' + ret + '</div>';
	}


	/* COVER PAGE
	==========================================================================*/

	function coverPage() {
		$('body').append('<div class="page">' +
				'<div class="halfpage-r">' +
					'<div class="content">' +
						'<div class="cover-heading">' + rootArea.data.title + '</div>' +
					'</div>' +
				'</div>' +
			'</div>');
	}


	/* TABLE OF CONTENTS
	==========================================================================*/

	function tableOfContents() {
		var pageNumber = 0,
			maxLines = 43;

		function tocAreas(parentArea, depth) {
			var ret = '',
				indent = '';

			for (var i = 0; i < 6*depth; i++) {
				indent += '&nbsp;';
			}

			map(parentArea.areas, function(area) {
				if (area.routes.length == 0 && area.areas.length == 0)
					return;

				var title = area.data.title;

				if (title.match(/^the /i))
					title = title.replace(/^the /i, '') + ', The';

				pageNumber++;

				ret += '<div class="toc-entry">' +
							'<div class="toc-page">' + pageNumber + '</div>' +
							indent + title +
							' . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .' +
						'</div>';

				// PAGE BREAK
				if (pageNumber%maxLines == 0) {
					ret += 			'</div>' +
									'<div class="footer">' +
										rootArea.data.title +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="page">' +
							'<div class="halfpage-r">' +
								'<div class="content">' +
									'<h1>Table of Contents</h1>' +
									'<div class="toc">';
				}

				ret += tocAreas(area, depth+1);
			});

			return ret;
		}

		var toc = 
			'<div class="page">' +
				'<div class="halfpage-r">' +
					'<div id="type_box_toc" class="toc-type-box"></div>' +
					'<div id="rating_box_toc" class="rating-box toc-rating-box"></div>' +
					'<div class="content">' +
						'<h1>Table of Contents</h1>' +
						'<div class="toc">' +
							tocAreas(rootArea, 0) +
						'</div>' +
						'<div class="footer">' +
							rootArea.data.title +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';

		$('body').append(toc);
		fillTypeBox($('#type_box_toc'));
		fillRatingBox($('#rating_box_toc'), {});
	}


	/* AREA PAGES
	==========================================================================*/

	function areaPages() {
		var pageNumber = 0;

		function areaAreas(parentArea) {
			var ret = '';

			map(parentArea.areas, function(area, i) {
//				if (i > 6)
//					return;
				
				if (area.routes.length == 0 && area.areas.length == 0)
					return;

				pageNumber++;

				writeAreaPage(area, pageNumber);
				areaAreas(area);
			});
		}

		areaAreas(rootArea);

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
					imageDrop(ui.draggable, canvas, ui.offset);
					//alert('dropped');
					//deleteImage( ui.draggable );
				}
			});
		});
	}

	function writeAreaPage(area, pageNumber) {

		function cleanHtml(str) {
			if (!str)
				return '';
			
			str = str.replace(/<br[^>]*?>/gi, '{{NEWLINE}}');
			var ret = $('<div></div>').html(str).text();
			ret = ret.replace(/\{\{NEWLINE\}\}/g, ' // ');
			ret = ret.replace(/([\s\n\r\t]+?\/\/[\s\n\r\t]+?)+/g, ' // ');
			return ret;
		}

		function routeType(rd) {
			var ret = [];
			
			if (rd.isBoulder)
				ret.push('Boulder');
			if (rd.isTrad)
				ret.push('Trad');
			if (rd.isSport)
				ret.push('Sport');
			if (rd.isIce)
				ret.push('Ice');
			if (rd.isAid)
				ret.push('Aid');
			if (rd.isMixed)
				ret.push('Mixed');
			if (rd.isAlpine)
				ret.push('Alpine');
			if (rd.isToprope)
				ret.push('TR');
			if (rd.isRock && ret.length == 0)
				ret.push('Rock');

			//mp.log(rd.name + ', ' + rd.pitches + ', ' + rd.length + ', ' + rd.grade);

			if (rd.pitches)
				ret.push(rd.pitches + ' pitch' + (rd.pitches > 1 ? 'es' : ''));
			if (rd.length)
				ret.push(rd.length + ' feet');
			if (rd.grade)
				ret.push('Grade ' + rd.grade);

			return ret.join(', ');
		}

		function subAreaHtml() {
			var ret = '<div class="toc">';

			map(area.areas, function(subArea) {
				if (subArea.routes.length == 0 && subArea.areas.length == 0)
					return;

				var title = subArea.data.title;

				if (title.match(/^the /i))
					title = title.replace(/^the /i, '') + ', The';

				ret += '<div class="toc-entry">' + title + '</div>';
			});

			return ret + '</div>';
		}

		function routeHtml() {
			var ret = '';
			
			map(area.routes, function(route) {
				var stars = '',
					starData = Math.round(route.data.stars*4)/4,
					starDecimal = starData%1,
					protection = 1,
					description = 1,
					location = 1;

				// partial stars are more visible this way
				starData += starDecimal >= .74 && starDecimal < .76 ? -.15 : (starDecimal > .24 && starDecimal < .26 ? .15 : 0);

				for (var i = 2; i < 6; i++) {
					if (starData >= i)
						stars += '&#9733;';
					else if (starData <= i-1)
						stars += '&#9734;';
					else
						stars += '<span>&#9734;<div style="width: ' + Math.floor(100*(1-(i-starData))) + '%;">&#9733;</div></span>';
				}

				// LOAD ROUTE PRINT DATA FROM INDEXEDDB
				if (route.data.print && route.data.print.protection != null)
					protection = route.data.print.protection;

				if (route.data.print && route.data.print.description != null)
					description = route.data.print.description;

				if (route.data.print && route.data.print.location != null)
					location = route.data.print.location;

				var protectionCtrlClass = protection == 0 ? ' disabled' : (protection == 1 ? '' : ' extended'),
					descriptionCtrlClass = description == 0 ? ' disabled' : (description == 1 ? '' : ' extended'),
					locationCtrlClass = location == 0 ? ' disabled' : (location == 1 ? '' : ' extended'),
					protectionCtrlTitle = (protection == 0 ? 'Show' : (protection == 1 ? 'Extend' : 'Hide')) + ' Protection',
					descriptionCtrlTitle = (description == 0 ? 'Show' : (description == 1 ? 'Extend' : 'Hide')) + ' Description',
					locationCtrlTitle = (location == 0 ? 'Show' : (location == 1 ? 'Extend' : 'Hide')) + ' Location',
					protectionClass = protection == 0 ? ' hidden' : (protection == 1 ? ' ellipsis' : ''),
					descriptionClass = description == 0 ? ' hidden' : (description == 1 ? ' ellipsis' : ''),
					locationClass = location == 0 ? ' hidden' : (location == 1 ? ' ellipsis' : '');

				ret +=
				'<div class="route">' +
					'<div>' +
						'<div class="checkbox"></div>' +
						'<div class="route-controls noprint">' +
							'<div id="protection_ctrl_' + route.data.id + '" class="route-control' + protectionCtrlClass + '" title="' + protectionCtrlTitle + '" title-base="Protection">' +
								'<div class="background-container">' +
									'<div class="background"></div>' +
								'</div>' +
								'<div>P</div>' +
							'</div>' +
							(route.data.description ?
							'<div id="description_ctrl_' + route.data.id + '" class="route-control' + descriptionCtrlClass + '" title="' + descriptionCtrlTitle + '" title-base="Description">' +
								'<div class="background-container">' +
									'<div class="background"></div>' +
								'</div>' +
								'<div>D</div>' +
							'</div>' : '') +
							(route.data.location ?
							'<div id="location_ctrl_' + route.data.id + '" class="route-control' + locationCtrlClass + '" title="' + locationCtrlTitle + '" title-base="Location">' +
								'<div class="background-container">' +
									'<div class="background"></div>' +
								'</div>' +
								'<div>L</div>' +
							'</div>' : '') +
						'</div>' +
						'<span class="name">' + route.data.name + '</span> ' +
						'<span class="rating">' + route.data.rating + '</span> ' +
						'<span class="stars">' + stars + '</span>' +
					'</div>' +
					'<div class="secondary">' +
						'<div id="protection_' + route.data.id + '" class="line' + protectionClass + '">' + routeType(route.data) +
							(route.data.protection ? ' // ' + cleanHtml(route.data.protection) : '') +
						'</div>' +
						(route.data.description ?
						'<div id="description_' + route.data.id + '" class="line' + descriptionClass + '">' +
							'<span class="label">Desc:</span> ' + cleanHtml(route.data.description) +
						'</div>' : '') +
						(route.data.location ?
						'<div id="location_' + route.data.id + '" class="line' + locationClass + '">' +
							'<span class="label">Loc:</span> ' + cleanHtml(route.data.location) +
						'</div>' : '') +
					'</div>' +
				'</div>';
			});

			return ret;
		}

		function enableControls() {
			var ret = '';

			map(area.routes, function(route) {

				$('#protection_ctrl_' + route.data.id + ', #description_ctrl_' + route.data.id + ', #location_ctrl_' + route.data.id).click(function() {
					var targetId = $(this).attr('id').split('_'),
						target = $('#' + targetId[0] + '_' + targetId[2]),
						ctrl = $(this);

					if(ctrl.hasClass('extended')) {
						ctrl.removeClass('extended')
							.addClass('disabled')
							.attr('title', 'Show ' + ctrl.attr('title-base'));

						target.addClass('hidden');

						if (!route.data.print)
							route.data.print = {};

						route.data.print[targetId[0]] = 0;
						mp.db.saveRoute(route.data.id, route.data);
					}
					else if(ctrl.hasClass('disabled')) {
						ctrl.removeClass('disabled')
							.attr('title', 'Extend ' + ctrl.attr('title-base'));

						target.addClass('ellipsis').removeClass('hidden');

						if (!route.data.print)
							route.data.print = {};

						route.data.print[targetId[0]] = 1;
						mp.db.saveRoute(route.data.id, route.data);
					}
					else {
						ctrl.addClass('extended')
							.attr('title', 'Hide ' + ctrl.attr('title-base'));

						target.removeClass('ellipsis');

						if (!route.data.print)
							route.data.print = {};

						route.data.print[targetId[0]] = 2;
						mp.db.saveRoute(route.data.id, route.data);
					}
				});
			});

			return ret;
		}

		function addImages() {
			var imagebar = $('#imagebar_' + area.data.id);
			map(area.data.images, function(imageObj, i) {
				var img = $('<img class="tn" src="' + imageObj.url + '" />');

				img.data({
					'note': imageObj.note,
					'areaId': area.data.id
				});

				imagebar.append(img);

				/*if (area.data.activeImages) {
					map(area.data.activeImages, function (activeImage) {
						if (imageObj.url == activeImage.img.src)
							addImage(area.data.id, activeImage, imageObj.note);
					});
				}*/
			});
			
			if (area.data.activeImages) {
				map(area.data.activeImages, function (activeImage) {
					map(area.data.images, function(imageObj, i) {
						if (imageObj.url == activeImage.img.src)
							addImage(area.data.id, activeImage, imageObj.note);
					});
				});
			}
		}

		var areaHtml =
			'<div class="page">' +
				'<div class="halfpage-l">' +
					'<div class="title-box"><div id="type_box_' + area.data.id + '" class="type-colors"></div>' +
						'<div class="title-block">' +
							'<div class="title">' + area.data.title + '&nbsp;</div>' +
							'<div class="count">(' + (area.routes.length == 0 ? area.areas.length : area.routes.length) + ')</div>' +
						'</div>' +
					'</div>' +
					'<div id="rating_box_' + area.data.id + '" class="rating-box"></div>' +
					'<div class="content">' +
						'<h1>' + area.data.title + ' <span>(' + (area.routes.length == 0 ? area.areas.length : area.routes.length) + ')</span></h1>' +
						(area.routes.length == 0 ? subAreaHtml() : routeHtml()) +
						'<div class="footer">' +
							pageNumber +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="halfpage-r">' +
					'<div class="content">' +
						'<h2>Description</h2>' +
						'<p>' + area.data.description + '</p>' +
						'<h2>Getting There</h2>' +
						'<p>' + area.data.gettingThere + '</p>' +
						'<div class="footer">' + area.data.title + '</div>' +
						(area.data.lat && area.data.lng ?
						'<div class="qr-code-loc">' +
							'<div id="qr_code_loc_' + area.data.id + '" class="code"></div>' +
							'<div class="label">Google Maps</div>' +
						'</div>' : '') +
						'<div class="qr-code-mp">' +
							'<div id="qr_code_mp_' + area.data.id + '" class="code"></div>' +
							'<div class="label">Mtn Project</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="page">' +
				'<div class="content">' +
					'<div id="canvas_' + area.data.id + '" class="canvas"></div>' +
				'</div>' +
				'<div id="imagebar_' + area.data.id + '" class="imagebar noprint"></div>' +
			'</div>';

		$('body').append(areaHtml);
		fillTypeBox($('#type_box_' + area.data.id), area);
		fillRatingBox($('#rating_box_' + area.data.id), area.getAllRatings());
		enableControls();
		addImages();

		// ADD QR CODES
		if (area.data.lat && area.data.lng) {
			//mp.log('map qrcode url: ' + 'http://maps.google.com/maps?q=' + area.data.lat + '+' + area.data.lng);
			$('#qr_code_loc_' + area.data.id).qrcode({
				text: 'http://maps.google.com/maps?q=' + area.data.lat + ',' + area.data.lng + '(.)',
				correctLevel: 1,
				typeNumber: 3,
				height: 87,
				width: 87
			});
		}

		//mp.log('mp qrcode url: ' + root + area.data.id);
		$('#qr_code_mp_' + area.data.id).qrcode({
			text: root + area.data.id,
			correctLevel: 0,
			typeNumber: 3,
			height: 87,
			width: 87
		});
	}



	/* TOPO IMAGES
	==========================================================================*/

	// SAVE IMAGE DATA TO DB

	function saveAreaImages(areaId) {
		var area = mp.getArea(areaId),
			canvas = $('#canvas_' + areaId),
			activeImages = [];

		if (area && area.data) {
			canvas.children('.img-container').each(function() {
				var container = $(this),
					viewport = container.children('.img-viewport'),
					img = viewport.children('img'),
					imgTextContainer = container.children('.img-text-container'),
					imgText = imgTextContainer.children('.img-text'),
					activeImage = {};

				activeImage.container = {
					position: container.position(),
					width: container.width(),
					height: container.height()
				};
				activeImage.img = {
					position: img.position(),
					width: img.width(),
					height: img.height(),
					origWidth: img.attr('origWidth'),
					origHeight: img.attr('origHeight'),
					src: img.attr('src')
				};
				activeImage.imgText = {
					position: imgTextContainer.position(),
					width: imgTextContainer.width(),
					align: imgText.css('textAlign'),
					classes: imgText.attr('class')
				};

				activeImages.push(activeImage);
			});

			area.data.activeImages = activeImages;
			mp.db.saveArea(areaId, area.data);
		}
	}

	// ADD AND MANIPULATE IMAGES

	var imgContainers = [],
		images = [],
		altDown = false,
		prePrintComplete = false,
		activeElement;

	function imageDrop(dropImg, canvas, offset) {
		var img = $('<img />'),
			imgNote = dropImg.data('note'),
			areaId = dropImg.data('areaId'),
			canvasOffset = canvas.offset(),
			canvasW = canvas.width(),
			canvasH = canvas.height(),
			cy = Math.floor(offset.top - canvasOffset.top + .5*dropImg.height()),
			cx = Math.floor(offset.left - canvasOffset.left + .5*dropImg.width()),
			maxW = .75*canvasW,
			maxH = .75*canvasH,
			border = 1;

		var activeImage = {};

		activeImage.img = {
			src: dropImg.attr('src'),
			position: {top: 0, left: 0}
		};

		activeImage.imgText = {};

		// after image loads
		img.load(function() {
			var w = img.get(0).width,
				h = img.get(0).height;

			activeImage.img.origWidth = w;
			activeImage.img.origHeight = h;

			// scale down image if bigger than max
			if (w > maxW || h > maxH) {
				var scale = Math.min(maxW/w, maxH/h);
				w *= scale;
				h *= scale;

				img.attr({
					width: w,
					height: h
				});
			}

			activeImage.img.width = w;
			activeImage.img.height = h;

			var maxL = canvasW - (w+2*border),
				maxT = canvasH - (h+2*border),
				l = Math.max(Math.min(Math.floor(cx - .5*(w+2*border)), maxL), 0),
				t = Math.max(Math.min(Math.floor(cy - .5*(h+2*border)), maxT), 0);

			activeImage.container = {
				width: w,
				height: h,
				position: {top: t, left: l}
			};

			addImage(areaId, activeImage, imgNote, img);
			saveAreaImages(areaId);
		}).attr('src', dropImg.attr('src'));
	}

	function addImage(areaId, activeImage, imgNote, img) {
		//mp.log(activeImage);

		img = img || $('<img src="' + activeImage.img.src + '" />');

		var canvas = $('#canvas_' + areaId),
			container = $('<div class="img-container"></div>').appendTo(canvas),
			viewport = $('<div class="img-viewport"></div>').appendTo(container),
			imgRatio = activeImage.img.origWidth/activeImage.img.origHeight;

		img.attr({
			'width': activeImage.img.width,
			'height': activeImage.img.height,
			'origWidth': activeImage.img.origWidth,
			'origHeight': activeImage.img.origHeight
		});

		img.css({
			top: activeImage.img.position.top + 'px',
			left: activeImage.img.position.left + 'px'
		});

		if (imgNote) {
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
						saveAreaImages(areaId);
					}
				})
				.resizable({
					handles: 'e, w',
					resize: function() {
						$(this).css({height: 'auto'});
					},
					stop: function() {
						$(this).css({height: 'auto'});
						saveAreaImages(areaId);
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
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 99) { // c
							e.preventDefault();
							imgText.css({textAlign: 'center'});
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 108) { // l
							e.preventDefault();
							imgText.css({textAlign: 'left'});
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 8) { // delete
							e.preventDefault();
							container.remove();
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 49) { // 1
							imgText.removeClass('column2 column3 column4 column5');
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 50) { // 2
							imgText.removeClass('column3 column4 column5').addClass('column2');
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 51) { // 3
							imgText.removeClass('column2 column4 column5').addClass('column3');
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 52) { // 4
							imgText.removeClass('column2 column3 column5').addClass('column4');
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 53) { // 5
							imgText.removeClass('column2 column3 column4').addClass('column5');
							saveAreaImages(areaId);
						}
						else if (e.keyCode == 119) { // w
							imgTextContainer.width(viewport.width());
							saveAreaImages(areaId);
						}
					}
				});

			if (activeImage.imgText.position)
				imgTextContainer.css({
					top: activeImage.imgText.position.top,
					left: activeImage.imgText.position.left
				});

			if (activeImage.imgText.width)
				imgTextContainer.width(activeImage.imgText.width);


			var imgText = imgTextContainer.children('.img-text').html(wrapEachLine(imgNote));

			if (activeImage.imgText.align)
				imgText.css({textAlign: activeImage.imgText.align});

			if (activeImage.imgText.classes)
				imgText.attr('class', activeImage.imgText.classes).addClass('img-text');
		}
		
			
		var imgCenterOffset = {},
			imgOriginalSize = {},
			imgOriginalPosition = {};

		container.css({
			width: activeImage.container.width + 'px',
			height: activeImage.container.height + 'px',
			left: activeImage.container.position.left + 'px',
			top: activeImage.container.position.top + 'px'
		}).draggable({
			containment: canvas,
			grid: [10, 10],
			start: function(event, ui) {
				ui.helper.siblings('.img-container').prependTo(ui.helper.parent());
			},
			stop: function() {
				activeElement = $(this);
				saveAreaImages(areaId);
			}
		}).resizable({
			containment: canvas,
			handles: 'ne,se,sw,nw',
			autoHide: true,
			alsoResize: imgTextContainer ? imgTextContainer : false,
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
					var scaleX = ui.size.width/ui.originalSize.width,
						scaleY = ui.size.height/ui.originalSize.height,
						scale = Math.max(scaleX, scaleY);

					css.width = Math.ceil(scale*imgOriginalSize.w) + 'px';
					css.height = Math.ceil(scale*imgOriginalSize.h) + 'px';
					css.left = Math.round(scale*imgCenterOffset.x + .5*ui.size.width) + 'px';
					css.top = Math.round(scale*imgCenterOffset.y + .5*ui.size.height) + 'px';
				}

				img.css(css);

				if (imgTextContainer)
					imgTextContainer.css({height: 'auto'});
			},
			stop: function(event, ui) {
				var imgPos = img.position(),
					containerRatio = ui.size.width/ui.size.height,
					minH = containerRatio > imgRatio ? Math.ceil(ui.size.width/imgRatio) : ui.size.height,
					h = Math.max(minH, img.height());

				img.css({
					width: Math.ceil(h*imgRatio) + 'px',
					height: Math.ceil(h) + 'px',
					left: Math.min(Math.round(imgPos.left), 0) + 'px',
					top: Math.min(Math.round(imgPos.top), 0) + 'px'
				});

				if (imgTextContainer)
					imgTextContainer.css({height: 'auto'});

				activeElement = $(this);
				saveAreaImages(areaId);
			}
		})
		.click(function() {
			activeElement = $(this);
		})
		.bind('mp.keydown', function(event, e) {
			if (activeElement && activeElement.get(0) == $(this).get(0)) {
				if (e.keyCode == 8) { // delete
					e.preventDefault();
					$(this).remove();
					saveAreaImages(areaId);
				}
			}
		});

		img.prependTo(viewport)
			.draggable({
				disabled: true,
				stop: function() {
					saveAreaImages(areaId);
				}
			});

		imgContainers.push(container);
		images.push(img);
		
		//activeElement = container;
	}

	function prePrint() {
		// manually create columsn for text (webkit won't print css columns)
		$('div.img-text').each(function() {
			var columns = 1;
			
			if ($(this).hasClass('column5'))
				columns = 5;
			else if ($(this).hasClass('column4'))
				columns = 4;
			else if ($(this).hasClass('column3'))
				columns = 3;
			else if ($(this).hasClass('column2'))
				columns = 2;
			
			$(this).removeClass('column2 column3 column4 column5');
			
			if (columns > 1) {
				var temp = $('<div></div>').append($(this).children()),
					elementsPerColumn = Math.ceil(temp.children().length/columns);
				
				for (var i = 0; i < columns; i++) {
					var col = $('<div class="column"></div>').appendTo($(this));
					col.append(temp.children().splice(0, elementsPerColumn));
				}
				
				$(this).children().css({
					'width': Math.floor(100/columns) + '%',
					'float': 'left'
				});
			}	
		});
		
		// remove qrcodes from parents (weird print bug)
		$('div.code canvas').each(function() {
			//$(this).css({'top':'15px','position':'absolute'});
			
//			var img = $('<img />');
//			img.attr('src',$(this).get(0).toDataURL('img/png'));
//			$(this).replaceWith(img.css({'top':'15px','position':'absolute'}));
			$(this).parent().replaceWith($(this).addClass('code'));
			//$(this).parent().css({'top':'15px','position':'absolute'});
		});
		
		alert('Ready to print!');
		prePrintComplete = true;
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
	
	$(document).keydown(function(e) {
		mp.log(e);
		if (e.ctrlKey || e.metaKey) {
			var preventDefault = true;

			if (e.keyCode == 83) // ctrl + S
				exportData();
			else if (e.keyCode == 80 && !prePrintComplete) // ctrl + P
				prePrint();
			else if (e.keyCode == 79) // ctrl + O
				importData();
			else
				preventDefault = false;

			if (preventDefault) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
		else {
			if (e.keyCode == 18)
				altMode();
			if (activeElement) {
				$(activeElement).triggerHandler('mp.keydown', [e]);
			}
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

	$(document).bind('data.loaded', buildPages);
});
