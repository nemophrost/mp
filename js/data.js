var root = 'http://mountainproject.com/v/', // 'http://mountainproject.com/v/utah/wasatch_range/rock_canyon/'
	rootId = '105974993', //'105739292',
	imageURL = 'http://mountainproject.com/scripts/PrinterView.php?action=show&id=',
	rootArea;

$(function() {

	/* UTILITY FUNCTIONS
	==========================================================================*/

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

		setTimeout((function(loaded, loadTotal, loading) {
			return function() {

				var text = $('#load_text'),
					bar = $('#load_bar');

				text.html('Loading ' + (loaded+1) + ' of ' + loadTotal);
				bar.css({width: Math.round(100*loaded/loadTotal) + '%'});

				if (loading <= 0) {
					$('#loading').fadeOut('fast', function() {$(this).remove()});
					//alert('done');
				}
			}
		})(loaded, loadTotal, loading), loaded*500);
	}


	/* AREA CLASS
	==========================================================================*/

	area = function(data) {
		console.log('new area');
		var me = this;
		this.id = data[0];
		this.routeCount = data[1];
		this.rockRoutes = data[2];
		this.boulderRoutes = data[3];
		this.tradRoutes = data[4];
		this.sportRoutes = data[5];
		this.iceRoutes = data[6];
		this.aidRoutes = data[7];
		this.mixedRoutes = data[8];
		this.alpineRoutes = data[9];
		this.topropeRoutes = data[10];

		this.title = 'Untitled Area';
		this.areas = [];
		this.routes = [];
		this.comments = [];
		this.images = [];

		updateLoading(2);

		ajax(root + this.id, function(data) {
			me.pageData = data;
			me.getTitle();
			me.getDescription();
			me.getGettingThere();
			me.getCoords();
			me.getComments();
			me.getAreas();
			me.getRoutes();

			updateLoading(-1);
		});

		ajax(imageURL + this.id + '&fullsize=1&beta=1&photoquality=large', function(data) {
			me.imageData = data;
			me.getImages();
			console.log(me.images);

			updateLoading(-1);
		});
	}

	area.prototype.getTitle = function() {
		var match = this.pageData.match(/<h1[\s\S]+?<\/h1>/i);
		if (match)
			this.title = jQuery.trim($(match[0]).text());
	}

	area.prototype.getDescription = function() {
		var match = this.pageData.match(/<h3[^>]*?>Description[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.description = $('<div>' + match[1] + '</div>').html();
	}

	area.prototype.getGettingThere = function() {
		var match = this.pageData.match(/<h3[^>]*?>Getting There[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.description = $('<div>' + match[1] + '</div>').html();
	}

	area.prototype.getCoords = function() {
		var match = this.pageData.match(/maps\.google\.com\/maps\?q=([^&]+)&/i);
		if (match && match[1]) {
			var coords = match[1].split(',');
			this.lat = 1*coords[0];
			this.long = 1*coords[1];
		}
	}

	area.prototype.getComments = function() {
		var me = this;
		var matches = this.pageData.match(/<table class=['"]comvis['"][\s\S]+?<!--MPTEXTEND-->/gi);
		if (matches) {
			map(matches, function(match){
				var comment = match.match(/<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
				if (comment && comment[1])
					me.comments.push(comment[1]);
			});
		}
	}

	area.prototype.getAreas = function() {
		var me = this;
		var areas = this.pageData.match(/aAreas[^\;]+\;/);
		if (areas) {
			try {
				eval('var ' + areas[0]);
			}
			catch(e) { }
			if (aAreas) {
				map(aAreas, function(areaData){
					me.areas.push(new area(areaData));
				});
			}
		}
	}

	area.prototype.getRoutes = function() {
		var me = this;
		var routes = this.pageData.match(/aRoutes[^\;]+\;/);
		if (routes) {
			try {
				eval('var ' + routes[0]);
			}
			catch(e) { }
			if (aRoutes) {
				map(aRoutes, function(routeData){
					me.routes.push(new route(routeData));
				});
			}
		}
	}

	area.prototype.getImages = function() {
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
						imageAr[i] = {url: 'http://mountainproject.com' + src[1]};
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
					me.images.push(imageObj);
			});
		}
	}


	/* ROUTE CLASS
	==========================================================================*/

	route = function(data) {
		console.log('new route');
		var me = this;

		this.id = data[0];
		var ratingAr = jQuery.trim(data[1]).split(' ');
		this.rating = ratingAr[0];
		if (ratingAr[1])
			this.safety = ratingAr[1];
		this.stars = data[2];

		this.isRock = data[4];
		this.isBoulder = data[5];
		this.isTrad = data[6];
		this.isSport = data[7];
		this.isIce = data[8];
		this.isAid = data[9];
		this.isMixed = data[10];
		this.isAlpine = data[11];
		this.isToprope = data[12];

		this.comments = [];

		updateLoading(1);

		ajax(root + this.id, function(data) {
			me.pageData = data;
			me.getName();
			me.getType();
			me.getDescription();
			me.getLocation();
			me.getProtection();
			me.getComments();
			//console.log(data);

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

	route.prototype.getName = function() {
		var match = this.pageData.match(/<h1[\s\S]+?<\/h1>/i);
		if (match)
			this.name = jQuery.trim($(match[0]).text());
	}

	route.prototype.getType = function() {
		var me = this;
		var match = this.pageData.match(/<td>Type:[\s]*?<\/td>[\s\S]*?<td>([\s\S]+?)<\/td>/i);
		if (match && match[1]) {
			var typeAr = match[1].split(',');
			map(typeAr, function(attr){
				if (attr.match(/pitches/i))
					me.pitches = 1*attr.replace(/pitches/i, '');
				else if (attr.match(/feet/i))
					me.length = 1*attr.replace(/feet/i, '');
				else if (attr.match(/Grade/i))
					me.grade = jQuery.trim(attr.replace(/Grade/i, ''));
			});
		}
	}

	route.prototype.getDescription = function() {
		var match = this.pageData.match(/<h3[^>]*?>Description[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.description = $('<div>' + match[1] + '</div>').html();
	}

	route.prototype.getLocation = function() {
		var match = this.pageData.match(/<h3[^>]*?>Location[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.location = $('<div>' + match[1] + '</div>').html();
	}

	route.prototype.getProtection = function() {
		var match = this.pageData.match(/<h3[^>]*?>Protection[\s\S]+?<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
		if (match && match[1])
			this.protection = $('<div>' + match[1] + '</div>').html();
	}

	route.prototype.getComments = function() {
		var me = this;
		var matches = this.pageData.match(/<table class=['"]comvis['"][\s\S]+?<!--MPTEXTEND-->/gi);
		if (matches) {
			map(matches, function(match){
				var comment = match.match(/<!--MPTEXT-->([\s\S]+?)<!--MPTEXTEND-->/i);
				if (comment && comment[1])
					me.comments.push(comment[1]);
			});
		}
	}



	rootArea = new area([rootId,0,0,0,0,0,0,0,0,0,0]);

});
