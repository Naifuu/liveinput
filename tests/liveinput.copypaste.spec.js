
var page = require('webpage').create(),
  system = require('system'),
  t, url = system.args[1];

if (system.args.length === 1) {
	console.log('Usage: loadspeed.js <some URL>');
	phantom.exit();
}

t = Date.now();
url = system.args[1];
page.open(url, function (status) {
	if (status !== 'success') {
		console.log('FAIL to load the address');
	} else {
		console.log('Loading ' + system.args[1]);
		console.log('Loading time ' + t + ' msec');
		var passed = page.evaluate(function () {
			return window.passed;
			//return document.querySelector('#livearea');
		});
		if (passed) {
			console.log('SUCCES');
		} else {
			console.log('FAILED');
		}
		console.log('Time ' + (Date.now() - t) + ' msec');
		
	}
	phantom.exit();
});

var liveinput = require('../src/liveinput');