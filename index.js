'use strict';
// - const urlRegex = require('url-regex');
const createHtmlElement = require('create-html-element');

// Capture the whole URL in group 1 to keep string.split() support
const urlRegex = () => (/((?:https?(?::\/\/))(?:www\.)?[a-zA-Z0-9-_.]+(?:\.[a-zA-Z0-9]{2,})(?:[-a-zA-Z0-9:%_+.~#?&//=@]*))/g);

// Get <a> element as string
const linkify = (href, options) => createHtmlElement({
	name: 'a',
	attributes: Object.assign({href: ''}, options.attributes, {href}),
	value: typeof options.value === 'undefined' ? href : options.value
});

// Get DOM node from HTML
const domify = (html, document) => {
	if (document.createRange) {
		return document.createRange().createContextualFragment(html);
	}
	// Polyfill for JSDOM
	const el = document.createElement('template');
	el.innerHTML = html;
	return el.content;
};

const getAsString = (input, options) => {
	return input.replace(urlRegex(), match => linkify(match, options));
};

const getAsDocumentFragment = (input, options) => {
	return input.split(urlRegex()).reduce((frag, text, index) => {
		if (index % 2) { // URLs are always in odd positions
			frag.appendChild(domify(linkify(text, options), options.document));
		} else if (text.length > 0) {
			frag.appendChild(options.document.createTextNode(text));
		}

		return frag;
	}, options.document.createDocumentFragment());
};

module.exports = (input, options) => {
	options = Object.assign({
		attributes: {},
		type: 'string',
		document: typeof document === 'undefined' ? undefined : document
	}, options);

	if (options.type === 'string') {
		return getAsString(input, options);
	}

	if (options.type === 'dom') {
		if (!options.document) {
			throw new Error('Cannot return a document fragment unless you provide options.document');
		}
		return getAsDocumentFragment(input, options);
	}

	throw new Error('The type option must be either dom or string');
};
