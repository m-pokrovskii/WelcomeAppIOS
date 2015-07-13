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