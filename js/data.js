var root = 'http://mountainproject.com/v/', // 'http://mountainproject.com/v/utah/wasatch_range/rock_canyon/'
	rootId = '105739274', //'105739292', // '106202660' gallaxy area
	imageURL = 'http://mountainproject.com/scripts/PrinterView.php?action=show&id=',
	DEBUG = true,
	areaKeys = {},
	routeKeys = {},
	ratingSets = {},
	mp = {},
	rootArea;

$(function() {

	/* INIT AFTER INDEXEDDB IS OPENED
	==========================================================================*/
	
	$(document).bind('init', function() {
		rootArea = new mp.area(rootId);
	});


	/* UTILITY FUNCTIONS
	==========================================================================*/

	mp.log = function(outp) {
		if (DEBUG && console && console.log) {
			console.log(outp);
		}
	}

	function ajax(url, func) {
		$.ajax({
			url: 'ajax/?url=' + encodeURIComponent(url),
			success: func
		});
	}

	var loading = 0,
		loaded = 0,
		loadTotal = 0;

	function updateLoading(delta) {
		if (delta > 0)
			loadTotal += delta;
		else
			loaded -= delta;

		loading += delta;

		if ($('#loading').length == 0) {
			$('body').append('<div id="loading">'
					+ '<div id="load_text"></div>'
					+ '<div id="load_container">'
						+ '<div id="load_bar"></div>'
					+ '</div>'
				+ '</div>');

			$('#loading').css({
					position: 'absolute',
					width: '400px',
					height: '40px',
					top: '50%',
					left: '50%',
					margin: '-20px 0 0 -200px'
				});

			$('#load_text').css({
					fontSize: '12px',
					lineHeight: '16px',
					float: 'left'
				});

			$('#load_container').css({
					position: 'absolute',
					top: '16px',
					left: 0,
					bottom: 0,
					right: 0,
					border: '#000 solid 1px',
					padding: '2px'
				});

			$('#load_bar').css({
					width: 0,
					height: '100%',
					background: '#000'
				});
		}

		//setTimeout((function(loaded, loadTotal, loading) {
		//	return function() {

				var text = $('#load_text'),
					bar = $('#load_bar');

				text.html('Loading ' + (loaded+1) + ' of ' + loadTotal);
				bar.css({width: Math.round(100*loaded/loadTotal) + '%'});

				if (loading <= 0) {
					$('#loading').fadeOut('fast', function() {$(this).remove()});
					done();
				}
		//	}
		//})(loaded, loadTotal, loading), loaded*10);
	}

	function updateRatingSets(route) {
		var ratingGroup = route.getRatingGroup();

		if (!ratingSets[ratingGroup.group])
			ratingSets[ratingGroup.group] = {};

		map(ratingGroup.children, function(child) {
			if (!ratingSets[ratingGroup.group][child.rating])
				ratingSets[ratingGroup.group][child.rating] = 0;

			ratingSets[ratingGroup.group][child.rating] += child.count;
		});
	}


	/* DONE, CALLED AFTER ALL AREAS AND ROUTES ARE LOADED
	==========================================================================*/
	function done() {
		rootArea.sort();

		$(document).triggerHandler('data.loaded');
	}


	/* AREA CLASS
	==========================================================================*/

	mp.getArea = function(id) {
		return areaKeys[id];
	}

	mp.area = function(id, data) {
		if (areaKeys[id]) {
			mp.log('duplicate area: ' + id);
			return;
		}
		else
			areaKeys[id] = this;

		//mp.log('new area: ' + id);
		var me = this;

		updateLoading(2);

		mp.db.getArea(id, function(areaObj) {
			// If area data was stored in local storage, set it
			if (areaObj) {
				//mp.log('loaded area: ' + id);
				me.data = areaObj.data;
				me.areas = [];
				me.routes = [];

				if (me.data.areas) {
					map(me.data.areas, function(areaId){
						me.areas.push(new mp.area(areaId));
					});
				}

				if (me.data.routes) {
					map(me.data.routes, function(routeId){
						me.routes.push(new mp.route(routeId));
					});
				}
				
				updateLoading(-2);
			}
			// otherwise, get it from mountain project
			else {
				//mp.log('got area: ' + id);
				me.data = {};

				if (data) {
					me.data.id = id;
					me.data.routeCount = data[1];
					me.data.rockRoutes = data[2];
					me.data.boulderRoutes = data[3];
					me.data.tradRoutes = data[4];
					me.data.sportRoutes = data[5];
					me.data.iceRoutes = data[6];
					me.data.aidRoutes = data[7];
					me.data.mixedRoutes = data[8];
					me.data.alpineRoutes = data[9];
					me.data.topropeRoutes = data[10];
				}
				else {
					me.data.id = id;
				}

				me.data.title = 'Untitled Area';
				me.data.comments = [];
				me.data.images = [];
				me.data.areas = [];
				me.data.routes = [];

				me.areas = [];
				me.routes = [];

				ajax(root + id, function(data) {
					me.pageData = data;
					me.getTitle();
					me.getDescription();
					me.getGettingThere();
					me.getCoords();
					me.getComments();
					me.getAreas();
					me.getRoutes();

					mp.db.saveArea(id, me.data);

					updateLoading(-1);
				});

				ajax(imageURL + id + '&fullsize=1&beta=1&photoquality=large', function(data) {
					me.imageData = data;
					me.getImages();
					//console.log(me.images);

					mp.db.saveArea(id, me.data);

					updateLoading(-1);
				});
			}
		});
	}

	mp.area.prototype.getTitle = function() {
		var match = this.pageData.match(/<h1[\s\S]+?<\/h1>/i);
		if (match)
			this.data.title = jQuery.trim($(match[0]).text());
	}

	mp.area.prototype.getDescription = function() {
		var match = this.pageData.match(/<h3[^>]*?>Description[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.data.description = $('<div>' + match[1] + '</div>').html();
	}

	mp.area.prototype.getGettingThere = function() {
		var match = this.pageData.match(/<h3[^>]*?>Getting There[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.data.gettingThere = $('<div>' + match[1] + '</div>').html();
	}

	mp.area.prototype.getCoords = function() {
		var match = this.pageData.match(/maps\.google\.com\/maps\?q=([^&]+)&/i);
		if (match && match[1]) {
			var coords = match[1].split(',');
			this.data.lat = 1*coords[0];
			this.data.lng = 1*coords[1];
		}
	}

	mp.area.prototype.getComments = function() {
		var me = this;
		var matches = this.pageData.match(/<table class=['"]comvis['"][\s\S]+?<!--MPTEXTEND-->/gi);
		if (matches) {
			map(matches, function(match){
				var comment = match.match(/<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
				if (comment && comment[1])
					me.data.comments.push(comment[1]);
			});
		}
	}

	mp.area.prototype.getAreas = function() {
		var me = this;
		var areas = this.pageData.match(/aAreas[^\;]+\;/);
		if (areas) {
			try {
				eval('var ' + areas[0]);
			}
			catch(e) { }
			if (aAreas) {
				map(aAreas, function(areaData){
					me.data.areas.push(areaData[0]);
					me.areas.push(new mp.area(areaData[0], areaData));
				});
			}
		}
	}

	mp.area.prototype.getRoutes = function() {
		var me = this;
		var routes = this.pageData.match(/aRoutes[^\;]+\;/);
		if (routes) {
			try {
				eval('var ' + routes[0]);
			}
			catch(e) { }
			if (aRoutes) {
				map(aRoutes, function(routeData){
					me.data.routes.push(routeData[0]);
					me.routes.push(new mp.route(routeData[0], routeData));
				});
			}
		}
	}

	mp.area.prototype.getImages = function() {
		var me = this;
		var matches = this.imageData.match(/<table align=['"]center['"][\s\S]+?<\/table>/gi);
		if (matches) {
			var images = matches[0].match(/<img[\s\S]+?src=['"]([\s\S]+?)['"]/gi);
			var notes = matches[0].match(/<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/gi);
			var imageAr = [];
			if (images) {
				map(images, function(image, i) {
					var src = image.match(/src=['"]([\s\S]+?)['"]/i);
					if (src && src[1]) {
						imageAr[i] = {url: 'http://mountainproject.com' + src[1].replace(/http\:\/\/(www\.)?mountainproject\.com/i, '')};
					}
				});
			}
			if (notes) {
				map(notes, function(noteWrap, i) {
					var note = noteWrap.match(/<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
					if (note && note[1] && imageAr[i]) {
						imageAr[i].note = note[1];
					}
				});
			}
			// add non-empty ones to this.images
			map(imageAr, function(imageObj) {
				if (imageObj)
					me.data.images.push(imageObj);
			});
		}
	}

	mp.area.prototype.sort = function() {
		function areaSort(a,b) {
			a = jQuery.trim(a.data.title.toLowerCase());
			b = jQuery.trim(b.data.title.toLowerCase());
			a = a.replace(/^the /, '');
			b = b.replace(/^the /, '');

			return a < b ? -1 : (a > b ? 1 : 0);
		}

		function routeSort(a,b) {
			a = jQuery.trim(a.data.name.toLowerCase());
			b = jQuery.trim(b.data.name.toLowerCase());
			a = a.replace(/^the /, '');
			b = b.replace(/^the /, '');

			return a < b ? -1 : (a > b ? 1 : 0);
		}

		this.areas.sort(areaSort);
		this.routes.sort(routeSort);
		
		map(this.areas, function(area) {
			area.sort();
		});
	}

	mp.area.prototype.getAllRatings = function() {
		var ret = {};

		map(this.routes, function(route){
			var ratingGroup = route.getRatingGroup();

			if (!ret[ratingGroup.group])
				ret[ratingGroup.group] = {};

			map(ratingGroup.children, function(child) {
				if (!ret[ratingGroup.group][child.rating])
					ret[ratingGroup.group][child.rating] = 0;

				ret[ratingGroup.group][child.rating] += child.count;
			});
		});

		return ret;
	}


	/* ROUTE CLASS
	==========================================================================*/

	mp.getRoute = function(id) {
		return routeKeys[id];
	}

	mp.route = function(id, data) {
		if (routeKeys[id]) {
			mp.log('duplicate route: ' + id);
			return;
		}
		else
			routeKeys[id] = this;

		//mp.log('new route: ' + id);
		var me = this;

		updateLoading(1);

		mp.db.getRoute(id, function(routeObj) {
			// If route data was stored in local storage, set it
			if (routeObj) {
				//mp.log('loaded route: ' + id);
				me.data = routeObj.data;

				updateRatingSets(me);
				updateLoading(-1);
			}
			// otherwise, get it from mountain project
			else {
				//mp.log('got route: ' + id);
				me.data = {};
				me.data.id = id;
				var ratingAr = jQuery.trim(data[1]).split(' ');
				me.data.rating = jQuery.trim(ratingAr[0]);
				if (ratingAr[1])
					me.data.safety = ratingAr[1];
				me.data.stars = data[2];

				me.data.isRock = data[4];
				me.data.isBoulder = data[5];
				me.data.isTrad = data[6];
				me.data.isSport = data[7];
				me.data.isIce = data[8];
				me.data.isAid = data[9];
				me.data.isMixed = data[10];
				me.data.isAlpine = data[11];
				me.data.isToprope = data[12];

				me.data.name = 'Untitled Route';
				me.data.comments = [];

				ajax(root + id, function(data) {
					me.pageData = data;
					me.getName();
					me.getType();
					me.getDescription();
					me.getLocation();
					me.getProtection();
					me.getComments();

					mp.db.saveRoute(id, me.data);

					updateRatingSets(me);
					updateLoading(-1);
				});

				/*
				//name
				//length
				//pitches
				//grade (I, II, III, IV, V, VI)
				season
				//rating
				//safety (pg13, R, X)
				//type (trad, sport, toprope, chipped)
				//stars
				//description
				//location
				//protection
				//comments
				photo?
				*/
			}
		});
	}

	mp.route.prototype.getName = function() {
		var match = this.pageData.match(/<h1[\s\S]+?<\/h1>/i);
		if (match)
			this.data.name = jQuery.trim($(match[0]).text());
	}

	mp.route.prototype.getType = function() {
		var me = this;
		var match = this.pageData.match(/<td>Type:[\s\S]*?<\/td>[\s\S]*?<td>([\s\S]+?)<\/td>/i);
		if (match && match[1]) {
			var typeAr = match[1].split(',');
			map(typeAr, function(attr){
				if (attr.match(/pitch(es)?/i))
					me.data.pitches = 1*attr.replace(/pitch(es)?/i, '');
				else if (attr.match(/feet/i))
					me.data.length = 1*attr.replace(/feet/i, '');
				else if (attr.match(/Grade/i))
					me.data.grade = jQuery.trim(attr.replace(/Grade/i, ''));
			});
		}
	}

	mp.route.prototype.getDescription = function() {
		var match = this.pageData.match(/<h3[^>]*?>Description[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.data.description = $('<div>' + match[1] + '</div>').html();
	}

	mp.route.prototype.getLocation = function() {
		var match = this.pageData.match(/<h3[^>]*?>Location[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.data.location = $('<div>' + match[1] + '</div>').html();
	}

	mp.route.prototype.getProtection = function() {
		var match = this.pageData.match(/<h3[^>]*?>Protection[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.data.protection = $('<div>' + match[1] + '</div>').html();
	}

	mp.route.prototype.getComments = function() {
		var me = this;
		var matches = this.pageData.match(/<table class=['"]comvis['"][\s\S]+?<!--MPTEXTEND-->/gi);
		if (matches) {
			map(matches, function(match){
				var comment = match.match(/<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
				if (comment && comment[1])
					me.data.comments.push(comment[1]);
			});
		}
	}

	mp.route.prototype.getNormalizedRating = function() {
		var ret = this.data.rating;

		if (ret.substr(0,2) == '5.') {
			if (ret.match(/5\.\d{2}/)) { // 5.10 or above
				ret = ret.replace(/\-$/, 'a'); // 5.11- => 5.11a
				ret = ret.replace(/a\/b$/, 'b'); // 5.11a/b => 5.11b
				ret = ret.replace(/b\/c$/, 'c'); // 5.11b/c => 5.11c
				ret = ret.replace(/\+$/, 'c'); // 5.11+ => 5.11c
				ret = ret.replace(/c\/d$/, 'd'); // 5.11c/d => 5.11d

				if (ret.match(/\d$/))
					ret += 'b'; // 5.11 => 5.11b
			}
			else { // 5.9 and below
				ret = ret.replace(/[\-\+]$/, ''); // 5.9- => 5.9, 5.9+ => 5.9
			}
		}

		return ret;
	}

	mp.route.prototype.getRatingGroup = function(rating) {
		rating = rating || this.getNormalizedRating();

		if (rating.match(/5\.\d{2}/)) { // 5.10 or above
			return {group: rating.match(/5\.\d{2}/)[0], children: [
				{rating: 'a', count: (rating.match(/5\.\d{2}a/i) ? 1 : 0)},
				{rating: 'b', count: (rating.match(/5\.\d{2}b/i) ? 1 : 0)},
				{rating: 'c', count: (rating.match(/5\.\d{2}c/i) ? 1 : 0)},
				{rating: 'd', count: (rating.match(/5\.\d{2}d/i) ? 1 : 0)}]};
		}
		else if (rating.match(/5\.\d{1}/)) { // 5.9 or below
			return {group: '5.x', children: [{rating: rating.match(/5\.(\d{1})/)[1], count: 1}]};
		}

		return rating;
	}
});
