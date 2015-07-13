'use strict';

(function (window) {
	'use strict';

	// Get element(s) by CSS selector:
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	// addEventListener wrapper:
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Register events on elements that may or may not exist yet:
	// $live('div a', 'click', function (event) {});
	window.$live = (function () {
		var eventRegistry = {};

		function dispatchEvent(event) {
			var targetElement = event.target;

			eventRegistry[event.type].forEach(function (entry) {
				var potentialElements = window.qsa(entry.selector);
				var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

				if (hasMatch) {
					entry.handler.call(targetElement, event);
				}
			});
		}

		return function (selector, event, handler) {
			if (!eventRegistry[event]) {
				eventRegistry[event] = [];
				window.$on(document.documentElement, event, dispatchEvent, true);
			}

			eventRegistry[event].push({
				selector: selector,
				handler: handler
			});
		};
	}());

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	window.ready = function (fn) {
		if (document.readyState != 'loading'){
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	};

	window.each = function (item, fn) {
		if(Object.prototype.toString.call(item) === '[object Object]') {
			for(var key in item) {
				if (item.hasOwnProperty(key)) {
					fn(key, item[key]);
				}
			}
		} else if (Array.isArray(item)) {
				item.forEach(function(val, key){
					fn(key, val);
				});
		}
	};


	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;

	Element.prototype.setAttributes = function (attrs) {
			for (var idx in attrs) {
					if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
							for (var prop in attrs[idx]){this.style[prop] = attrs[idx][prop];}
					} else if (idx === 'html') {
							this.innerHTML = attrs[idx];
					} else {
							this.setAttribute(idx, attrs[idx]);
					}
			}
	};

	Element.prototype.addClass = function (className) {
		if (this.classList) {
			this.classList.add(className);
		}
		else {
			this.className += ' ' + className;
		}
	};

})(window);
var appnextAPP = (function(){	

	var parsedURL = parseURL(), q = parsedURL.query;
	q = {
		id:      q.id || "",
		cnt:     q.cnt || "1",
		cat:     q.cat || "",
		pbk:     q.pbk || "",
		bcolor:  q.bcolor || "",
		btext:   q.btext || "Download",
		apnname: q.apnname || "Discover this Free App!",
		dType:   q.dType || "",
		dIdfa:   q.dIdfa || "",
		vId:     q.vId || "",
		mac:     q.mac || "",
	};

	function loadJSONP (url, callback, context) {
		var unique = 0;
		var name = "_jsonp_" + unique++;

		if (url.match(/\?/)) url += "&callback="+name;
		else url += "?callback="+name;

		// Create script
		var script  = document.createElement('script');
		script.type = 'text/javascript';
		script.src  = url;

		// Setup handler
		window[name] = function(data){
			callback.call((context || window), data);
			document.getElementsByTagName('head')[0].removeChild(script);
			script = null;
			delete window[name];
		};

		// Load JSON
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	function success_jsonp (data) {
			render(data.apps);
	}

	function parseURL (url) {
		var queryParams = {},
				url         = url || window.location.href,
				parser      = document.createElement('a');
		parser.href = url;
		
		var splitURL = url.split("?");

		var query = parser.search.substr(1).split("&");
		query.forEach(function(el, i, arr) {
			var values = arr[i].split("=");
			queryParams[values[0]] = values[1];
		});
		return {
			parser:       parser,
			beforeSearch: splitURL[0],
			query:        queryParams,
		}
	};

	function render (apps) {
		apps.forEach(function (val, key) {
			if (val){
				document.querySelector('.js-modal_title').setAttributes({
					html: q.apnname
				});

				document.querySelector('.js-modal_itm_info_title').setAttributes({
					html: val.title
				});

				document.querySelector('.js-modal_itm_info_text').setAttributes({
					html: val.desc
				});

				document.querySelector('.js-modal_itm_info_btn').setAttributes({
					html: q.btext,
					styles: {
						background: '#'+q.bcolor
					}
				});
				
				var jsAppUrl = qsa('.js_app_url');
				for (var i = 0, l = jsAppUrl.length; i < l; i++) {
						jsAppUrl[i].addEventListener('click', function(e) {
								e.preventDefault();
								window.location = val.urlApp;
					});
				};

				var skipButton = qs('.js-modal_itm_info_foot_btn');
				skipButton.addEventListener('click', function(e) {
					e.preventDefault();
					window.location = 'appnext://close_appwall';
				});

				document.querySelector('.js-modal_main_img_itm').setAttributes({
					src:    val.urlImg,
					onload: document.querySelector('.js-modal_inner_cust').style.display = "",
					alt:    val.title
				});


			}
		});		
		window.location = 'appnext://ready';
	};



	function init() {
		if (!q.id) {
			return
		};

		loadJSONP("https://admin.appnext.com/offerWallApi.aspx?&ext=t&id="+q.id+"&cnt="+q.cnt+"&cat="+q.cat+"pbk="+q.pbk+"&dType="+q.dType+"&dIdfa="+q.dIdfa+"&vId="+q.vId+"&mac="+q.mac, success_jsonp);
	}

	return {
		init: init
	}

}());

ready(function() {
	appnextAPP.init();
});