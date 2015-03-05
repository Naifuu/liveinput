var appendHtml = function (el, str) {
	var div = document.createElement('div');
	div.innerHTML = str;
	while (div.children.length > 0) {
		el.appendChild(div.children[0]);
	}
}
var drawHtml = function (name, els, validators, config) {//<br/>
	var html = '<fieldset><legend>' + name;
	if (config) html += ' (configured)';
	html+='</legend>';
	if (config) html += '<code>var config = ' + JSON.stringify(config, null, 2) + ';</code>';
	for (var i = 0, l = els.length; i < l; i++) {
		if (name != els[i]) {
			html += '<label for="' + els[i] + 'Input">' + els[i] + ': </label>';
		}
		if (validators[i]) html += '<code>' + validators[i] + '</code>';
		html += '<input type="text" id="' + els[i] + 'Input"/>';
	}
	html += '</fieldset>';
	appendHtml(document.body, html);
}
var isArray = function (arg) {
	return Object.prototype.toString.call(arg) === '[object Array]';
};
var bind = function (instance, el, validator) {
	el.value = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\'\,./:"|<>?{}[]';//{}[] не поддерживаются
	instance.bind(el);
	instance.on('change', el, function (current, last, lang) {
		el.value = validator ? validator(current, last, lang) : current;
	});
};
var init = function (name, els, validators, config) {
	els = els || [name];
	els = isArray(els) ? els : [els];
	if (typeof validators == 'object') {
		var handlers = config;
		config = validators;
		validators = handlers;
	}
	validators = isArray(validators) ? validators : [validators];

	drawHtml(name, els, validators, config);

	var instance = liveinput.init(name, config);
	for (var i = 0, l = els.length; i < l; i++) {
		bind(instance, document.getElementById(els[i] + 'Input'), validators[i]);
	}
}

window.onload = function() {
	document.body.querySelector('input').focus();
}