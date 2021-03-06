﻿
var liveinput = new function() {
	var helper = (function() {
		return new function() {
			var rnd = Math.random;
			var bind = Function.prototype.bind ? function(func, thisArg) {
				return func.bind(thisArg);
			} : function(func, thisArg) {
				var slice = Array.prototype.slice, args = slice.call(arguments, 2);
				return function() {
					return func.apply(thisArg, args.concat(slice.call(arguments)));
				}
			};
			var extrude = function(thisArg) {
				return bind(Function.prototype.call, thisArg);
			}
			var filter = Array.prototype.filter ? extrude(Array.prototype.filter) : function(arr, cb) {
				var res = [], i, l;
				for (i = 0, l = arr.length; i < l; i++) {
					if (cb(arr[i], i, arr)) res.push(arr[i]);
				}
				return res;
			};
			var map = Array.prototype.map ? extrude(Array.prototype.map) : function(arr, cb) {
				var res = [], i, l;
				for (i = 0, l = arr.length; i < l; i++) {
					res.push(cb(arr[i], i, arr));
				}
				return res;
			}
			var forEach = Array.prototype.forEach ? extrude(Array.prototype.forEach) : function(arr, cb) {
				for (var i = 0, l = arr.length; i < l; i++) {
					cb(arr[i], i, arr);
				}
			};
			var indexOf = Array.prototype.indexOf ? extrude(Array.prototype.indexOf) : function(arr, v) {
				var i, l;
				for (i = 0, l = arr.length; i < l; i++) {
					if (arr[i] == v) return i;
				}
				return -1;
			};
			var except = function(target, remove) {
				return filter(target, function(i) {
					return indexOf(remove, i) == -1;
				});
			};
			var charToCode = function(c) {
				return c.charCodeAt();
			};
			var textToCodes = function(text) {
				return map(text.split(''), charToCode);
			};
			//var codeToChar =  function(code) {
			//	return String.fromCharCode(code);
			//};
			var codesToText = function(codes) {
				return String.fromCharCode.apply(undefined, codes); //map(codes, codeToChar).join('');
			};
			var addEvent = function(el, event, cb) {
				if (el.addEventListener) {
					return el.addEventListener(event, cb, true);
				}
				return el.attachEvent('on' + event, cb);
			}
			var removeEvent = function(el, event, cb) {
				if (el.removeEventListener) {
					return el.removeEventListener(event, cb, true);
				}
				return el.detachEvent('on' + event, cb);
			}
			var guidchar = function() {
				return (rnd() * 16 | 0).toString(16);
			};
			var guid = function() {
				return '00000000-0000-0000-0000-000000000000'.replace(/0/g, guidchar);
			};
			var format = function(text, arg) {
				for (var i = 0, l = arg.length; i < l; i++) {
					text = text.replace(new RegExp('\\{' + i + '\\}', 'g'), arg[i]);
				}
				return text;
			};
			var fill = function(l, cb) {
				var res = [];
				for (var i = 0; i < l; i++) {
					res.push(cb(i, l, res));
				}
				return res;
			}

			var getSelectionStart = function(el) {
				if (el.selectionEnd != undefined) return el.selectionStart;

				//var r = document.selection.createRange().duplicate();
				//r.moveEnd('character', el.value.length);
				//if (r.text == '') return el.value.length;
				//return el.value.lastIndexOf(r.text);

				//bug в старых браузерах положение каретки пока не работает

				var range = document.selection.createRange();
				var startRange = el.createTextRange();
				startRange.moveToBookmark(range.getBookmark());
				var endRange = el.createTextRange();
				endRange.collapse(false);
				var len = el.value.length;
				if (startRange.compareEndPoints('StartToEnd', endRange) > -1) return len;
				var start = -startRange.moveStart('character', -len);
				var value = el.value.replace(/\r\n/g, '\n');
				start += value.slice(0, start).split('\n').length - 1;
				return start;
			};
			var getSelectionEnd = function(el) {
				if (el.selectionEnd != undefined) return el.selectionEnd;

				//var r = document.selection.createRange().duplicate();
				//r.moveStart('character', -el.value.length);
				//console.log('getSelectionEnd character r.text.length', r.text.length);
				//return r.text.length;

				//bug в старых браузерах положение каретки пока не работает

				var range = document.selection.createRange();
				var startRange = el.createTextRange();
				startRange.moveToBookmark(range.getBookmark());
				var endRange = el.createTextRange();
				endRange.collapse(false);
				var len = el.value.length;
				if (startRange.compareEndPoints('StartToEnd', endRange) > -1) return len;
				var value = el.value.replace(/\r\n/g, '\n');
				var end = -startRange.moveEnd('character', -len);
				end += value.slice(0, end).split('\n').length - 1;
				return end;
			};
			var setCaretPosition = function(el, pos) {
				//el.focus();
				if (el.setSelectionRange) return el.setSelectionRange(pos.start, pos.end);
				//if (!el.createTextRange) return;
				var range = el.createTextRange();
				range.collapse(true);
				range.moveStart('character', pos.start);
				range.moveEnd('character', pos.end - pos.start);
				//range.move('character', pos.start);
				range.select();
			}
			var getOwnPropertyNames = function(obj) {
				var props = [];
				for (var p in obj)
					if (obj.hasOwnProperty(p)) {
						props.push(p);
					}
				return props;
			}
			var isArray = Array.isArray || function(arg) {
				return Object.prototype.toString.call(arg) === '[object Array]';
			};
			var extend = function(a, b) {
				if (!b) return;
				// ReSharper disable once MissingHasOwnPropertyInForeach
				for (var p in b) {
					a[p] = b[p];
				}
			}
			var callEvent = function(el, event, obj) {
				var e;
				if (document.createEvent) {
					e = document.createEvent('HTMLEvents');
					extend(e, obj);
					e.initEvent(event, false, false); // event type,bubbling,cancelable
					return el.dispatchEvent(e);
				} // else if (!document.createEventObject) return;
				e = document.createEventObject(); //window.event
				extend(e, obj);
				setTimeout(function() {
					try {
						el.fireEvent('on' + event, e);
					} catch (ex) {

					}
				}, 0);
			};
			var preventDefault = function(e) {
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
			};
			var copy = function(obj) {
				return JSON.parse(JSON.stringify(obj));
			}
			return {
				charToCode: charToCode,
				textToCodes: textToCodes,
				//codeToChar: codeToChar,
				codesToText: codesToText,
				GUID: guid,
				format: format,
				fill: fill,
				getSelectionStart: getSelectionStart,
				getSelectionEnd: getSelectionEnd,
				setCaretPosition: setCaretPosition,
				getOwnPropertyNames: getOwnPropertyNames,
				bind: bind,
				filter: filter,
				map: map,
				forEach: forEach,
				except: except,
				indexOf: indexOf,
				isArray: isArray,
				event: {
					add: addEvent,
					remove: removeEvent,
					call: callEvent
				},
				preventDefault: preventDefault,
				copy: copy
			};
		}
	})();

	// ReSharper disable once InconsistentNaming
	var Cursor = function(el) {
		var self = this;
	
		var max = Math.max;
		var min = Math.min;

		//var data = {};

		self.start = 0;
		self.end = 0;
		self.range = false;
		self.moveBack = false;

		//var marker = {};

		self.press = function () {
			if (self.range) return;
			self.end = self.start = helper.getSelectionStart(el);
			//console.log('press', self.start);
			//data.start = helper.getSelectionStart(el);
			//self.end = data.end = helper.getSelectionEnd(el);
			//self.text = data.text = el.value;
			//self.end = max(data.start, data.end);
		};
		self.release = function() {
			self.end = helper.getSelectionEnd(el);
			//console.log('release', self.end);
			//self.start = data.oldStart = data.start;
			//data.oldEnd = data.end;
			//data.oldText = data.text;
			//self.end = min(data.start, data.end);
		};
		self.change = function() {
			self.start = helper.getSelectionStart(el);
			self.end = helper.getSelectionEnd(el);
			//console.log('change', self.start, self.end);
		};
		//self.save = function () {
		//	marker.start = helper.getSelectionStart(el);
		//	marker.end = helper.getSelectionEnd(el);
		//	//console.log('change', self.start, self.end);
		//};
		//self.load = function() {
		//	helper.setCaretPosition(el, marker);
		//};
		var movepos;
		self.move = function(offset) {
			if (self.range) {
				self.restore();
				self.range = false;
				return;
			}
			//self.start = data.start - offset;
			//self.end = self.start;
			//if (self.start != self.end) return helper.setCaretPosition(el, {
			//	start: self.start,
			//	end: self.end
			//});

			movepos = (self.moveBack ? min : max)(self.start - offset, self.end - offset);
			
			
			//console.log('move', movepos);
			helper.setCaretPosition(el, {
				start: movepos,
				end: movepos
			});
			
			self.press();

			self.moveBack = false;
			
			// ReSharper disable once NotAllPathsReturnValue
		};
		self.selectAll = function() {
			helper.setCaretPosition(el, {
				start: 0,
				end: el.value.length
			});
			self.change();
		};
		self.restore = function() {
			helper.setCaretPosition(el, {
				start: self.start,
				end: self.end
			});
		};
		
		//self.get = function() {
		//	return data;
		//};

		return self;
		//http://javascript.nwbox.com/cursor_position/cursor.js
		// function getCaretPosition (el) {
		// el.focus ();
		// if (typeof el.selectionStart == 'number')
		// return { start: el.selectionStart, end: el.selectionEnd }

		// //http://stackoverflow.com/questions/4928586/get-caret-position-in-html-input
		// if (!document.selection) return;
		//var range = document.selection.createRange();

		////var len = el.value.length
		////range.moveStart ('character', -len);
		////var start = range.text.length;

		//// Create a working TextRange that lives only in the input
		//var startRange = el.createTextRange();
		//startRange.moveToBookmark(range.getBookmark());
		//// Check if the start and end of the selection are at the very end
		//// of the input, since moveStart/moveEnd doesn't return what we want
		//// in those cases
		//var endRange = el.createTextRange();
		//endRange.collapse(false);
		//var start = 0;
		//var end = 0;
		//var len = el.value.length;
		//if (startRange.compareEndPoints("StartToEnd", endRange) > -1) {
		//start = end = len;
		//}	
		//start = -startRange.moveStart("character", -len);
		//var value = el.value.replace(/\r\n/g, '\n');
		//start += value.slice(0, start).split("\n").length - 1;
		//end = -startRange.moveEnd("character", -len);
		//end += value.slice(0, end).split("\n").length - 1;
		//return { start: start, end: end };
		// }
	};

	//var log = console.log.bind(console); //var forEach = Function.prototype.call.bind(Array.prototype.forEach); forEach([1, 2, 3], log);

	//TODO добавил язык - добавь во все комманды кейкоды языка
	var langs = ['ru', 'en'];
	var whitelist = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 220, 226, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 111, 106, 109, 107, 12]; //, 8, 45, 36, 33, 35, 34, 37, 38, 39, 40
	//var blacklist = [27, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 104, 145, 19, 144, 9, 20, 16, 17, 91, 18, 92, 93, 45, 36, 33, 46, 35, 34, 37, 38, 39, 40];//, 8
	var additional = {
		//space(32,32)/enter(13,10)/backspace(8)
		keyCodes: [32, 13], //, 8
		charCodes: [32, 10, 8]
	}
	//char 10, 13 keyCode
	whitelist.push.apply(whitelist, additional.keyCodes);

	var hotkeymap = {
		control: {
			50: '@',
			51: '#',
			52: '$',
			53: '%',
			54: '^',
			55: '&',
			//56: '*',
			// ReSharper disable once StringLiteralWrongQuotes
			222: "'"
		},
		//ё	"	№	;	:	?	х	ъ	ж	э	/	б	ю	,	/
		//~	@	#	$	^	&	{	}	:	"	|	<	>	?	|
		shift: {
			ru: {
				192: 'ё',
				50: '"',
				51: '№',
				52: ';',
				54: ':',
				55: '?',
				219: 'х',
				221: 'ъ',
				186: 'ж',
				222: 'э',
				220: '/',
				188: 'б',
				190: 'ю',
				191: ',',
				226: '/'
			},
			en: {
				192: '~',
				50: '@',
				51: '#',
				52: '$',
				54: '^',
				55: '&',
				//TODO не поддерживаются
				//219: '{',
				//221: '}',
				186: ':',
				222: '"',
				220: '|',
				188: '<',
				190: '>',
				191: '?',
				226: '|'
			}
		}
	};
	var parseCode = function(code) {
		return Number(code); //parseInt(code, 10);
	}
	var keymapper = function(map) {
		//console.log('keymapper', map);
		var props = helper.getOwnPropertyNames(map);
		//console.log('keymapper', props);
		return helper.map(props, parseCode);
	}
	//TODO может искать без этого, сразу в hotkeymap
	var hotkey = {
		control: keymapper(hotkeymap.control),
		shift: {
			ru: keymapper(hotkeymap.shift.ru),
			en: keymapper(hotkeymap.shift.en)
		}
	};

	//TODO разделить на комманды препроцессора и постпроцессорв
	var command = {}
	command.layout = function(config, type) {
		var self = this;
		self.type = type;
		var lang = config.lang;

		var map = {
			ru: [1105, 1081, 1094, 1091, 1082, 1077, 1085, 1075, 1096, 1097, 1079, 1092, 1099, 1074, 1072, 1087, 1088, 1086, 1083, 1076, 1103, 1095, 1089, 1084, 1080, 1090, 1100, 1025, 1049, 1062, 1059, 1050, 1045, 1053, 1043, 1064, 1065, 1047, 1060, 1067, 1042, 1040, 1055, 1056, 1054, 1051, 1044, 1071, 1063, 1057, 1052, 1048, 1058, 1068, 1093, 1098, 92, 49, 51, 53, 56, 57, 48, 45, 61, 1061, 1066, 47, 33, 8470, 37, 42, 40, 41, 95, 43], //[]{} 192,91,221,123
			en: [96, 113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 97, 115, 100, 102, 103, 104, 106, 107, 108, 122, 120, 99, 118, 98, 110, 109, 126, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 71, 72, 74, 75, 76, 90, 88, 67, 86, 66, 78, 77, 91, 93, 92, 49, 51, 53, 56, 57, 48, 45, 61, 123, 125, 124, 33, 35, 37, 42, 40, 41, 95, 43]
		};
		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (var p in map) {
			map[p].push.apply(map[p], additional.charCodes);
		}
		//[];',.
		//[1093, 1098, 59, 39, 44, 46]
		//[219, 221, 186, 222, 188, 190]
		var relation = {
			//2
			50: [
				[50, 34], //ru
				[50, 64] //en
			],
			//51: [
			//	[51, 8470], //ru
			//	[51, 35] //en
			//],
			//4
			52: [
				[52, 59],
				[52, 36]
			],
			//6
			54: [
				[54, 58],
				[54, 94]
			],
			//7
			55: [
				[55, 63],
				[55, 38]
			],
			//ж
			186: [
				[1078, 1046],
				[59, 58]
			],
			//э
			222: [
				[1101, 1069],
				[39, 34]
			],
			//б
			188: [
				[1073, 1041],
				[44, 60]
			],
			//ю
			190: [
				[1102, 1070],
				[46, 62]
			],
			//.
			191: [
				[46, 44],
				[47, 63]
			]
		};
		var special = {
			50: 64, //@
			51: 35, //#
			52: 36, //$
			53: 37, //%
			54: 94, //^
			222: 39 //'
		}

		var convert = {};
		var keyCode, i, l;
		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (keyCode in relation) {
			convert[keyCode] = {};
		}
		for (i = 0, l = langs.length; i < l; i++) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (keyCode in relation) {
				convert[keyCode][langs[i]] = relation[keyCode][i];
			}
		}
		//console.log(convert);

		var others = lang ? helper.except(langs, [lang]) : langs;
		var j, k = others.length, diff, code, index, added, length;

		self.exec = function(compute, data) { //debugger
			//copypast
			if (!data.keydown.length) return compute;
			diff = compute.diff;
			length = diff.length;
			var converted = [];
			for (i = 0, l = diff.length; i < l; i++) {
				code = diff[i];
				added = false;
				//map
				index = helper.indexOf(map[lang], code);
				if (index != -1) {
					converted.push(code);
					continue;
				}
				for (j = 0; j < k; j++) {
					index = helper.indexOf(map[others[j]], code);
					if (index == -1) continue;
					converted.push(map[lang][index]);
					added = true;
					break;
				}
				if (added) continue;
				//special
				if (data.keydown[i].ctrlKey && special[data.keydown[i].keyCode] == code) {
					converted.push(code);
					continue;
				}
				//convert
				if (!convert[data.keydown[i].keyCode]) break;
				index = helper.indexOf(convert[data.keydown[i].keyCode][lang], code);
				if (index != -1) {
					converted.push(code);
					continue;
				}
				for (j = 0; j < k; j++) {
					index = helper.indexOf(convert[data.keydown[i].keyCode][others[j]], code);
					if (index == -1) continue;
					converted.push(convert[data.keydown[i].keyCode][lang][index]);
					added = true;
					break;
				}
				if (added) continue;
				data.keydown.splice(i, 1);
			}
			compute.diff = converted;
			compute.offset += length - compute.diff.length;
			return compute;
		};
		self.get = function() {
			return {
				type: type,
				enabled: config.lang ? true : false,
				config: config
			};
		};
		return self;
	};
	command.include = function(config, type) {
		var self = this;
		self.type = type;
		var lang = config.lang || '';
		var presets = [];

		helper.forEach(['numbers', 'symbols'], function(preset) {
			if (!config[preset]) return;
			presets.push(preset);
		});

		var special = config.special || '';
		var i, l, index;
		var sources = lang ? [lang] : langs;

		for (i = 0, l = sources.length; i < l; i++) {
			index = helper.indexOf(presets, sources[i]);
			if (index != -1) continue;
			presets.push(sources[i]);
		}

		special = helper.textToCodes(special);
		if (special.length && helper.indexOf(presets, 'special') == -1) presets.push('special');

		if (!config.chars) {
			helper.forEach(langs, function(l) {
				index = helper.indexOf(presets, l);
				if (index == -1) return;
				presets.splice(index, 1);
			});
		}

		var map = {
			ru: [
				1092, 1099, 1074, 1072, 1087, 1088, 1086, 1083, 1076, 1081, 1094, 1091, 1082, 1077, 1085, 1075, 1096, 1097, 1079, 1103, 1095, 1089, 1084, 1080, 1090, 1100, 1093, 1098, 1078, 1101, 1073, 1102, 1105, //low
				1060, 1067, 1042, 1040, 1055, 1056, 1054, 1051, 1044, 1049, 1062, 1059, 1050, 1045, 1053, 1043, 1064, 1065, 1047, 1071, 1063, 1057, 1052, 1048, 1058, 1068, 1061, 1066, 1046, 1069, 1041, 1070, 1025 // up
			],
			en: [
				97, 115, 100, 102, 103, 104, 106, 107, 108, 113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 122, 120, 99, 118, 98, 110, 109,
				65, 83, 68, 70, 71, 72, 74, 75, 76, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 90, 88, 67, 86, 66, 78, 77
			],
			numbers: [
				48, 49, 50, 51, 52, 53, 54, 55, 56, 57
			],
			symbols: [
				32, 10, 96, 45, 61, 126, 33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 95, 43, 91, 93, 59, 39, 92, 44, 46, 47, 123, 125, 58, 34, 124, 60, 62, 63, 8470
			],
			special: special
		};

		//for (i = 0, l = langs.length; i < l; i++) {
		//	map[langs[i]].push.apply(map[langs[i]], additional.charCodes);
		//}

		var j, k = presets.length, diff, length, added;

		self.exec = function(compute, data) {
			//if (data.hotkey) return compute;
			diff = compute.diff;
			length = diff.length;
			var allowed = [];
			for (i = 0, l = diff.length; i < l; i++) {
				added = false;
				for (j = 0; j < k; j++) {
					index = helper.indexOf(map[presets[j]], diff[i]);
					if (index == -1) continue;
					allowed.push(diff[i]);
					added = true;
					break;
				}
				if (added) continue;
				data.keydown.splice(i, 1);
			}
			compute.diff = allowed;
			compute.offset += length - compute.diff.length;
			return compute;
		};
		self.get = function() {
			return {
				type: type,
				enabled: (presets.length || special.length) ? true : false,
				config: config
			};
		};

		return self;
	};
	command.exclude = function(config, type) {
		delete config.lang;
		var self = this;
		self.type = type;
		var special = config.special || '';
		special = helper.textToCodes(special);
		var i, l, index, diff, length;
		self.exec = function(compute, data) {
			diff = compute.diff;
			length = diff.length;
			var allowed = [];
			for (i = 0, l = diff.length; i < l; i++) {
				index = helper.indexOf(special, diff[i]);
				if (index == -1) allowed.push(diff[i]);
			}
			compute.diff = allowed;
			compute.offset += length - compute.diff.length;
			return compute;
		};
		self.get = function() {
			return {
				type: type,
				enabled: special.length ? true : false,
				config: config
			};
		};

		return self;
	};
	command.input = function(config, type) {
		var self = this;
		self.type = type;
		var lang = config.lang;
		var register = config.register;
		var capslock = config.capslock;
		var map = {
			ru: {
				lower: [1092, 1099, 1074, 1072, 1087, 1088, 1086, 1083, 1076, 1078, 1101, 1081, 1094, 1091, 1082, 1077, 1085, 1075, 1096, 1097, 1079, 1093, 1098, 1103, 1095, 1089, 1084, 1080, 1090, 1100, 1073, 1102, 1105],
				upper: [1060, 1067, 1042, 1040, 1055, 1056, 1054, 1051, 1044, 1046, 1069, 1049, 1062, 1059, 1050, 1045, 1053, 1043, 1064, 1065, 1047, 1061, 1066, 1071, 1063, 1057, 1052, 1048, 1058, 1068, 1041, 1070, 1025]
			},
			en: {
				lower: [97, 115, 100, 102, 103, 104, 106, 107, 108, 113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 122, 120, 99, 118, 98, 110, 109],
				upper: [65, 83, 68, 70, 71, 72, 74, 75, 76, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 90, 88, 67, 86, 66, 78, 77]
			}
		};
		var sources = lang ? [lang] : langs;
		var findhere = helper.except(helper.getOwnPropertyNames(map[sources[0]]), [register])[0];
		var sequence = ['register', 'capslock'];
		var i, l, j, k = sources.length, index, diff, added, right, wrong, length, m, n = sequence.length;

		var handler = {};
		handler.register = function(compute, data) {
			//if (data.hotkey) return compute;//  || data.copypast?
			diff = compute.diff;
			length = diff.length;
			var result = [];
			for (i = 0, l = diff.length; i < l; i++) {
				added = false;
				for (j = 0; j < k; j++) {
					index = helper.indexOf(map[sources[j]][findhere], diff[i]);
					if (index == -1) continue;
					result.push(map[sources[j]][register][index]);
					added = true;
					break;
				}
				if (added) continue;
				result.push(diff[i]);
			}
			compute.diff = result;
			compute.offset += length - compute.diff.length;
			return compute;
		}
		handler.capslock = function(compute, data) {
			if (!data.keydown.length) return compute; //?//data.copypast || 
			diff = compute.diff;
			length = diff.length;
			var result = [];
			for (i = 0, l = diff.length; i < l; i++) {
				added = false;
				right = register || (data.keydown[i].shiftKey ? 'upper' : 'lower');
				if (register && data.keydown[i].shiftKey) {
					right = right == 'upper' ? 'lower' : 'upper';
				}
				wrong = right == 'upper' ? 'lower' : 'upper';
				for (j = 0; j < k; j++) {
					index = helper.indexOf(map[sources[j]][right], diff[i]);
					if (index != -1) continue;;
					index = helper.indexOf(map[sources[j]][wrong], diff[i]);
					if (index == -1) continue;
					result.push(map[sources[j]][right][index]);
					added = true;
					break;
				}
				if (added) continue;
				result.push(diff[i]);
			}
			compute.diff = result;
			compute.offset += length - compute.diff.length;
			return compute;
		}

		self.exec = function(compute, data) {
			var result = compute;
			for (m = 0; m < n; m++) {
				if (!config[sequence[m]]) continue;
				result = handler[sequence[m]](result, data);
			}
			return result;
		}

		self.get = function() {
			return {
				type: type,
				enabled: (register || capslock) ? true : false,
				config: config
			};
		};

		return self;
	};
	command.regexulator = function(config, type) {
		var self = this;
		self.type = type;
		delete config.lang;
		var templates = {
			//TODO после term может быть ., ещё что то?
			'after-chars-remove-chars': '((?:{0})+)(?:{1})+',
			'after-term-remove-chars': '((?:^|\\s)+{0}\\s+)(?:{1})+',
			'after-chars-remove-term': '((?:{0})+)\\s+{1}\\s+',
			'after-term-remove-term': '((?:^|\\s)+{0}\\s+){1}\\s+', //поидее на конце должно быть (?:$|\\s)+

			'before-chars-remove-chars': '(?:{1})+((?:{0})+)',
			'before-term-remove-chars': '(?:{1})+(\\s+{0}\\s+)', //поидее на конце должно быть (?:$|\\s)+
			'before-chars-remove-term': '(?:^|\\s)+{1}\\s+((?:{0})+)',
			'before-term-remove-term': '(?:^|\\s)+{1}\\s+({0}\\s+)', //поидее на конце должно быть (?:$|\\s)+

			'after-char-remove-repeat': '({0}){1}+',
			'after-char-replace-expr': '({0}{1})',
			'after-term-replace-expr': '(?:^|\\s)+({0}\\s+{1})',
			'after-char-upper-char': '({0}[a-zа-яё])'
		}

		var map = {
			'[': '\\\[',
			']': '\\\]',
			'\\': '\\\\',
			'/': '\\\/',
			'^': '\\\^',
			'$': '\\\$',
			'.': '\\\.',
			'|': '\\\|',
			'?': '\\\?',
			'*': '\\\*',
			'+': '\\\+',
			'(': '\\\(',
			')': '\\\)',
			'{': '\\\{',
			'}': '\\\}',
			'\'': '\\\'',
			'': '^'
		}
		var removes = {}, interceptions = {}, regexeRemoves = [], regexeInterceptions = [], i, l, m, n;

		var mapping = function(c) { return map[c] || c; };
		var char = function(text) {
			var chars = text.split('');
			if (!chars.length) {
				chars.push('');
			}
			return helper.map(chars, mapping);
		}
		var chars = function(val) {
			return [char(val).join('|')];
		}
		var term = function(val) {
			return [char(val).join('')];
		}
		var template = function(name, arr) {
			return helper.format(templates[name], arr);
		}

		var handler = {};
		handler['after-chars-remove-chars'] = function(config, name, flag) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var text in config) {
				helper.forEach(chars(text), function(param) {
					helper.forEach(chars(config[text]), function(secondparam) {
						removes[flag].push(template(name, [param, secondparam]));
					});
				});
			}
		};
		handler['after-chars-remove-term'] = function(config, name, flag) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var text in config) {
				helper.forEach(chars(text), function(param) {
					helper.forEach(term(config[text]), function(secondparam) {
						removes[flag].push(template(name, [param, secondparam]));
					});
				});
			}
		};
		handler['after-term-remove-chars'] = function(config, name, flag) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var text in config) {
				helper.forEach(term(text), function(param) {
					helper.forEach(chars(config[text]), function(secondparam) {
						removes[flag].push(template(name, [param, secondparam]));
					});
				});
			}
		};
		handler['after-term-remove-term'] = function(config, name, flag) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var text in config) {
				helper.forEach(term(text), function(param) {
					helper.forEach(term(config[text]), function(secondparam) {
						removes[flag].push(template(name, [param, secondparam]));
					});
				});
			}
		};
		handler['after-char-remove-repeat'] = function(config, name, flag) {
			helper.forEach(char(config), function(param) {
				removes[flag].push(template(name, [param, param]));
			});
		};
		handler['before-chars-remove-chars'] = handler['after-chars-remove-chars'];
		handler['before-chars-remove-term'] = handler['after-chars-remove-term'];
		handler['before-term-remove-chars'] = handler['after-term-remove-chars'];
		handler['before-term-remove-term'] = handler['after-term-remove-term'];
		handler['after-char-replace-expr'] = function(config, name, flag) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var text in config) {
				helper.forEach(char(text), function(param) {
					interceptions[flag].push({
						expr: template(name, [param, config[text].expr]),
						replacer: config[text].replacer
					});
				});
			}
		};
		handler['after-char-upper-char'] = function(config, name, flag) {
			var obj = {};
			var arr = helper.isArray(config) ? config : [config];
			for (var j = 0, k = arr.length; j < k; j++) {
				obj[arr[j]] = {
					expr: '[a-zа-яё]',
					replacer: function(find, c, offset, str, data, noffset) {

						if (find.length == 1) {
							str = '';
						} else {
							str = find.charAt(0);
						}
						if (!data.keydown.length) return str + find.charAt(find.length - 1).toLocaleUpperCase();
						if (data.keydown[noffset].shiftKey) return str + find.charAt(find.length - 1).toLowerCase();
						return str + find.charAt(find.length - 1).toLocaleUpperCase();
					}
				}
			}
			handler['after-char-replace-expr'](obj, 'after-char-replace-expr', flag);
		};
		handler['after-term-replace-expr'] = function(config, name, flag) {
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var text in config) {
				helper.forEach(term(text), function(param) {
					interceptions[flag].push({
						expr: template(name, [param, config[text].expr]),
						replacer: config[text].replacer
					});
				});
			}
		};
		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (var flag in config) {
			if (/[^igm]/g.test(flag)) {
				throw new Error('Command regexulator can not support flag ' + flag);
			}
			flag = flag.split('').sort().join('');
			removes[flag] = removes[flag] || [];
			interceptions[flag] = interceptions[flag] || [];

			helper.forEach(
				//TODO сортируем очередь выполнения
				[
					'after-chars-remove-chars',
					'after-term-remove-chars',
					'after-chars-remove-term',
					'after-term-remove-term',
					'before-chars-remove-chars',
					'before-term-remove-chars',
					'before-chars-remove-term',
					'before-term-remove-term',
					'after-char-replace-expr',
					'after-term-replace-expr',
					'after-char-remove-repeat',
					'after-char-upper-char'
				], function(name) {
					if (config[flag][name] == undefined) return;
					handler[name](config[flag][name], name, flag);
				});
		}

		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (flag in removes) {
			if (!removes[flag].length) continue;;
			regexeRemoves.push({
				expr: new RegExp(removes[flag].join('|'), flag),
				replacer: helper.fill(removes[flag].length, function(i) { return '$' + (i + 1) }).join('')
			});
		}

		var selector = function(i) {
			return i.expr;
		};

		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (flag in interceptions) {
			if (!interceptions[flag].length) continue;;
			regexeInterceptions.push({
				expr: new RegExp(helper.map(interceptions[flag], selector).join('|'), flag),
				replacer: interceptions[flag][0].replacer
			});
		}

		//console.log(regexeRemoves, regexeInterceptions);
		var find, c, offset, str;
		var parseArgs = function(args) {
			find = args[0];
			offset = args[args.length - 2];
			str = args[args.length - 1];
			for (m = 1, n = args.length - 2; m < n; m++) {
				if (args[m] != undefined) {
					c = args[m];
					break;
				}
			}
		}
		self.exec = function(text, data) {
			for (i = 0, l = regexeRemoves.length; i < l; i++) {
				//bug необходимо реплейсить функцией и вырезать из data.keydown вхождения, шанс возникновения такой ситуации низок, пок так
				text = text.replace(regexeRemoves[i].expr, regexeRemoves[i].replacer);
			}
			for (i = 0, l = regexeInterceptions.length; i < l; i++) {
				//if (data.keydown.length)
				text = text.replace(regexeInterceptions[i].expr, function() {
					//if (!data.keydown.length) return find;
					parseArgs(arguments);
					//console.log(offset);
					//console.log(data.before.length, data.diff.length, data.after.length, offset, data.cursor.start, data.cursor.end);//log		
					if (data.cursor.start <= offset + 1 && offset + 1 <= data.cursor.end) {
						n = data.before.length + data.diff.length - offset - find.length; // + data.after.length
						if (!data.keydown[n]) {
							n = 0;
						}
						return regexeInterceptions[i].replacer(find, c, offset, str, data, n);
					}
					return find;
				});
			}
			return text;
		}

		self.get = function() {
			return {
				type: type,
				enabled: (regexeRemoves.length || regexeInterceptions.length) ? true : false,
				config: config
			};
		};

		return self;
	}

	// ReSharper disable once InconsistentNaming
	var Preprocessor = function(config) {
		var self = this;
		var i, l, result, processes = [];
		var sequence = ['layout', 'include', 'exclude', 'input'];

		for (i = 0, l = sequence.length; i < l; i++) {
			if (!config[sequence[i]]) continue;
			if (config[sequence[i]] === true) config[sequence[i]] = {};
			processes.push(new command[sequence[i]](config[sequence[i]], sequence[i]));
		}
		for (var j = 0; j < processes.length; j++) {
			if (!processes[j].get().enabled) {
				processes.splice(j--, 1);
			}
		}
		l = processes.length;
		
		self.pass = function(compute, data) {
			result = compute;
			//TODO remove noop
			for (i = 0, j = data.keydown.length; i < j; i++) {
				if (!data.keydown[i] || data.keydown[i].keyCode != 8) continue;//backspace
				//debugger
				data.keydown.splice(i, 1);
				result.diff.splice(i, 1);
			}
			for (i = 0; i < l; i++) {
				result = processes[i].exec(result, data);
				//result.type = processes[i].type;//log
				//data.log.push(JSON.parse(JSON.stringify(result)));//log
			}
			result.before = helper.codesToText(result.before);
			result.diff = helper.codesToText(result.diff);
			result.after = helper.codesToText(result.after);
			result.offset = compute.offset;
			return result;
		};
		self.config = function() {
			var cfg = {}, info;
			for (i = 0; i < l; i++) {
				info = processes[i].get();
				cfg[info.type] = info.config;
			}
			//console.log(JSON.stringify(cfg, null, 2), cfg);//log
			return cfg;
		}
		return self;
	};
	var Postprocessor = function(config) {
		var self = this;
		var i, l, result, processes = [], length;
		var sequence = ['regexulator'];

		for (i = 0, l = sequence.length; i < l; i++) {
			if (!config[sequence[i]]) continue;
			if (config[sequence[i]] === true) config[sequence[i]] = {};
			processes.push(new command[sequence[i]](config[sequence[i]], sequence[i]));
		}
		for (var j = 0; j < processes.length; j++) {
			if (!processes[j].get().enabled) {
				processes.splice(j--, 1);
			}
		}
		l = processes.length;

		self.pass = function(text, data) {
			result = text;
			length = result.length;
			for (i = 0; i < l; i++) {
				result = processes[i].exec(result, data);
				//result.type = processes[i].type;//log
				//data.log.push(JSON.parse(JSON.stringify(result)));//log
			}
			data.result.offset += length - result.length;
			return result;
		};
		self.config = function() {
			var cfg = {}, info;
			for (i = 0; i < l; i++) {
				info = processes[i].get();
				cfg[info.type] = info.config;
			}
			//console.log(JSON.stringify(cfg, null, 2), cfg);//log
			return cfg;
		}
		return self;
	};

	// ReSharper disable once InconsistentNaming
	var LiveInput = function(config) {
		var self = this;
		var lang = config.lang;
		var interval = config.interval;
		var preprocessor = new Preprocessor(config);
		var postprocessor = new Postprocessor(config);
		//processor.config();//log
		var heap = {};

		var callElementEvent = function(el, name, event) {
			if (event.old == el.value) return;
			event.value = el.value;
			helper.event.call(el, 'liveinput', event);
		};
		var event, eventIndex, eventCount;
		var callLiveinputEvent = function(el, events, name, ptr, arg) {
			if (!events[name]) return;
			event = events[name];
			for (eventIndex = 0, eventCount = event.length; eventIndex < eventCount; eventIndex++) {
				event[eventIndex].apply(ptr, arg);
			}	
		};
		//window.kb = [];
		var onkeyup = function(e, el, data, cursor, events, ptr) {

			//if (data.old == el.value) return;
			//console.log('onkeyup', e);

			//if (whitelist.indexOf(e.keyCode) == -1) return true;

			//data.log = [];//log

			//if (data.copypast) {
			//	data.keydown = [];
			//}

			//data.shift = e.shiftKey && !data.copypast;
			//data.control = e.ctrlKey && !data.copypast;
			//data.alt = e.altKey && !data.copypast;

			//console.log('before', JSON.parse(JSON.stringify(cursor)));
			//cursor.update();
			cursor.release();
			//console.log('after', JSON.parse(JSON.stringify(cursor)));
			//data.cursor = cursor.get();//log

			//if (e.keyCode == 8) {
			//	debugger
			//}

			//console.log('after', JSON.stringify(JSON.parse(cursor.get())));
			if (e.keyCode == 8) { //backspace 		
				data.before = el.value.substring(0, cursor.end);
				data.diff = '';
				data.after = el.value.substring(cursor.end);
			} else {
				data.before = el.value.substring(0, cursor.start);
				data.diff = el.value.substring(cursor.start, cursor.end);
				//console.log(helper.charToCode(data.diff));//log
				//console.log('onkeyup', data.diff);

				//var press = {};
				//press[data.diff] = e.keyCode;
				//press[data.diff.toLocaleUpperCase()] = e.keyCode;

				//window.kb.push(press);
				//console.log(press);

				data.after = el.value.substring(cursor.end);
			}

			data.result.offset = e.ctrlKey ? -data.diff.length : e.keyCode == 8 && cursor.start == cursor.end + 1 ? 1 : 0;

			if (e.ctrlKey && hotkeymap.control[e.keyCode]) {
				data.diff += hotkeymap.control[e.keyCode];
				data.result.offset--;
				//data.result.offset -= hotkeymap.control[e.keyCode].length;
				//data.hotkey = true;
			}
			
			if (e.shiftKey) {
				if (hotkeymap.shift[lang] && hotkeymap.shift[lang][e.keyCode]) {
					data.diff += hotkeymap.shift[lang][e.keyCode];
					data.result.offset--;
				}
			}
			
			//if (data.old == el.value) {
			//	data.keydown = [];
			//	ptr.timer = null;
			//	return true;
			//}

			//console.log(e.keyCode, cursor.start, cursor.end);

			data.result = preprocessor.pass({
				before: helper.textToCodes(data.before),
				diff: helper.textToCodes(data.diff),
				after: helper.textToCodes(data.after),
				offset: data.result.offset
			}, data);

			//var press = {
			//	keyCode: e.keyCode,
			//	charCode: helper.charToCode(data.result.diff)
			//}
			//console.log(press);

			data.result.value = data.result.before + data.result.diff + data.result.after;

			data.result.value = postprocessor.pass(data.result.value, data);

			el.value = data.result.value;
			callLiveinputEvent(el, events, 'change', ptr, [data.result.value, data.old, lang]);
			callElementEvent(el, 'liveinput', ptr.event);
			ptr.event.old = data.old = el.value;

			//data.old = data.result.value;
			//var copy = JSON.parse(JSON.stringify(data));//log
			//console.log(JSON.parse(JSON.stringify(data)));//log

			//cursor.range ? cursor.restore() :
			cursor.move(data.result.offset);

			//cursor.release();

			data.keydown = [];
			//data.hotkey = false;
			//delete ptr.timer;
			ptr.timer = null;
			//cursor.range = false;

			return true;
		};

		var refresh = function(el) {
			if (!el.value.length || !config.refresh) return;
			var ptr = heap[el.GUID];
			clearTimeout(ptr.timer);
			//ptr.cursor.save();
			if (!ptr.timer) {
				ptr.cursor.selectAll();
			}
			onkeyup({
				keyCode: 0
			}, el, ptr.data, ptr.cursor, ptr.events, ptr);
			//ptr.cursor.load();
		}

		var onkeydown = function(e, el, data, cursor, events, ptr) {
			//console.log('onkeydown',e);
			//data.copypast = false;

			//if (e.ctrlKey && !hotkey.control[e.keyCode]) {
			//	e.preventDefault();
			//	return false;
			//}

			//cursor.range = false;
			
			if (e.ctrlKey) {
				switch (e.keyCode) {
				case 90: //Control+Z
				case 67: //Control+C
					return false;
				//bug добавить специфическую обработку, refresh(el) не работает, буква вовращается после
				case 89: //Control+Y
					helper.preventDefault(e);
					return false;
				case 65: //Control+A
					cursor.selectAll();
					cursor.range = true;
					break;
				case 8: //Control+backspace
					cursor.moveBack = true;
					break;
				default:
					break;
				}
			}

			//switch (e.keyCode) {
			//	case 8: //backspace
			//		//refresh(el);
			//		return false;
			//	default:
			//		break;
			//}

			if (data.mousedown) {
				helper.preventDefault(e);
				return false;
			}
			//TODO сделать список клавишь при нажатии на которые срабатывает refresh
			if (helper.indexOf(whitelist, e.keyCode) == -1) {
				if (ptr.timer)
					refresh(el);
				return false;
			}

			clearTimeout(ptr.timer);
			//console.log(Date.now())

			data.keydown.push({
				keyCode: e.keyCode,
				shiftKey: e.shiftKey,
				ctrlKey: e.ctrlKey
			});

			//console.log('push', data.keydown[data.keydown.length-1]);

			if (!ptr.timer) {//!cursor.range
				cursor.press();
			}

			ptr.timer = setTimeout(function() {
				onkeyup(data.keydown[data.keydown.length - 1], el, data, cursor, events, ptr);
			}, interval);

			if (e.ctrlKey) {
				if (helper.indexOf(hotkey.control, e.keyCode) != -1) {
					helper.preventDefault(e);
					return false;
				}
			}

			if (e.shiftKey) {
				//debugger
				if (hotkey.shift[lang] && helper.indexOf(hotkey.shift[lang], e.keyCode) != -1) {
					helper.preventDefault(e);
					return false;
				}
			}

			return true;
		};
		//var onpaste = function(e, data) {
		//	//data.copypast = true;
		//	data.keydown = [];
		//	return true;
		//};

		var bind = function(el) {
			if (!el.GUID) {
				el.GUID = helper.GUID();
			}
			var ptr = heap[el.GUID] = {};
			ptr.el = el;
			ptr.event = { old: '' };
			ptr.data = {
				keydown: [],
				result: {},
				old: ''
			};
			ptr.cursor = new Cursor(el);
			var data = ptr.data;
			var cursor = ptr.data.cursor = ptr.cursor;
			var events = ptr.events = {};
			ptr.keydown = function(e) {
				console.log('keydown', e.keyCode);
				onkeydown(e, el, data, cursor, events, ptr);
			};
			ptr.paste = function(e) {
				console.log('paste');
				data.keydown = [];
				return true;
			};
			ptr.dragover = function(e) {
				console.log('dragover');
				helper.preventDefault(e);
				return false;
			};
			ptr.mousedown = function() {
				console.log('onmousedown');
				ptr.data.mousedown = true;
				refresh(el);
			};
			ptr.mouseup = function() {
				console.log('onmouseup');
				ptr.data.mousedown = false;
			};
			ptr.mouseleave = function() {
				console.log('onmouseleave');
				ptr.data.mousedown = false;
			};
			ptr.blur = function() {
				console.log('blur');
				refresh(el);
			};
			window.ptr = ptr;
			helper.event.add(el, 'keydown', ptr.keydown);
			helper.event.add(el, 'paste', ptr.paste);
			helper.event.add(el, 'mousedown', ptr.mousedown);
			helper.event.add(el, 'mouseup', ptr.mouseup);
			helper.event.add(el, 'mouseleave', ptr.mouseleave);
			helper.event.add(el, 'dragover', ptr.dragover);
			helper.event.add(el, 'blur', ptr.blur);
			
			//TODO избавиться от фокуса в пользу рефреша
			//el.focus();
			refresh(el);
		};
		var unbind = function (el) {
			if (!el.GUID || !heap[el.GUID]) return;
			var ptr = heap[el.GUID];

			helper.event.remove(el, 'keydown', ptr.keydown);
			helper.event.remove(el, 'paste', ptr.paste);
			helper.event.remove(el, 'mousedown', ptr.mousedown);
			helper.event.remove(el, 'mouseup', ptr.mouseup);
			helper.event.remove(el, 'mouseleave', ptr.mouseleave);
			helper.event.remove(el, 'dragover', ptr.dragover);
			helper.event.remove(el, 'blur', ptr.blur);

			var events = ptr.events;
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var name in events) {
				events[name].length = 0;
				delete events[name];
			}

			var props = helper.getOwnPropertyNames(ptr);
			// ReSharper disable once MissingHasOwnPropertyInForeach
			for (var prop in props) {
				delete ptr[prop];
			}

			delete heap[el.GUID];

			//TODO dispose instance
			if (!helper.getOwnPropertyNames(heap).length) {
				var key = JSON.stringify(config);
				// ReSharper disable once VariableUsedInInnerScopeBeforeDeclared
				delete cache[key];
			}
		};

		self.bind = function() {
			for (var i = 0, l = arguments.length; i < l; i++) {
				bind(arguments[i]);
			}
			return self;
		}
		self.unbind = function() {
			for (var i = 0, l = arguments.length; i < l; i++) {
				unbind(arguments[i]);
			}
			return self;
		};
		self.on = function(event, el, cb) {
			if (!el.GUID || !heap[el.GUID]) return self;
			heap[el.GUID].events[event] = heap[el.GUID].events[event] || [];
			heap[el.GUID].events[event].push(cb);

			switch (event) {
			case 'change':
				if (el.value.length)
					refresh(el);
				break;
			default:
				break;
			}
			return self;
		};
		self.off = function(event, el, cb) {
			if (!el.GUID || !heap[el.GUID]) return self;
			eventIndex = helper.indexOf(heap[el.GUID].events[event], cb);
			if (eventIndex == -1) return self;
			heap[el.GUID].events[event].splice(eventIndex, 1);
			return self;
		};
		self.refresh = function(el) {
			if (!heap[el.GUID]) return;
			refresh(el);
		}
		return self;
	};

	var setLang = function(config) {
		if (typeof config.lang == 'undefined') return;
		var lang = config.lang;
		//delete config.lang;
		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (var p in config) {
			if (!config[p]) continue;
			if (config[p] == true) {
				config[p] = {};
			}
			config[p].lang = lang;
		}
	};
	var mergeConfig = function(a, b) {
		if (!b) return a;
		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (var p in b) {
			if (typeof a[p] == 'object') {
				a[p] = mergeConfig(a[p], b[p]);
			} else { // if(a[p] === true) 
				a[p] = b[p];
			}
		}
		return a;
	};
	
	var cache = {};

	var types = {
		'default': {
			//язык ru/en
			lang: '',
			//интервал обновления
			interval: 1000 / 24, //1,
			//отключает полную проверку поля при биндинге потере фиокуса и ещё некоторых случаях
			refresh: true,
			//отвечает за перевод одного языка в другой
			layout: true,
			//отвечает за разрешённые символы
			include: {
				//буквы
				chars: true,
				//цифры
				numbers: true,
				//символы
				symbols: true,
				//произвольный список разрещённых символов
				special: ''
			},
			//отвечает за запрет символов
			exclude: {
				//список запрещённых символов
				special: '{}[]'
			},
			//Отвечает за правила ввода
			input: {
				//lower/upper
				register: '',
				//отвечает за игнорирование CapsLock'а
				capslock: false
			},
			//отвечает за регулярные выражения
			//remove-chars-after-chars, remove repeat
			regexulator: {
				//flag: g - multi search; i - ignore case; m - multi lines
				g: {
					////после любого из символов удалить повторы
					//'after-char-remove-repeat': special,
					////после любого из символов поднять символы
					//'after-char-upper-char': '\'',//['\'', ''],//'' - начало строки
					////после любого из символов удаляет символы
					//'after-chars-remove-chars': {
					//	'': special
					//}
					////после слова удаляет символы
					//'after-term-remove-chars': {
					//	'имя': '0123456789'
					//},
					////после любого из символов удаляет слово
					//'after-chars-remove-term': {
					//	'0123456789': '№'
					//},
					////после слова удаляет слова
					//'after-term-remove-term': {
					//	'из': 'в',
					//	'да': 'нет'
					//},
					////перед любым из символов удаляет символы
					////before поддерживает всё тоже что и after
					//'before-chars-remove-chars': {
					//	'№': '0123456789'
					//},
					////реализует тоже самое что и after-chars-upper-char но для кавычек
					//'after-char-replace-expr': {
					//	'"': {
					//		//регулярное выражение
					//		expr: '[a-za-яё]',
					//		//функция замены
					//		replacer: function(find, c, offset, text, data, noffset) {
					//			return find[0] + find[1].toLocaleUpperCase();
					//		}
					//	}
					//}
		
				}
			}
		},
		fio: (function() {
			var special = ' \'-';
			return {
				//lang: 'ru',
				include: {
					numbers: false,
					symbols: false,
					special: special
				},
				regexulator: {
					g: {
						'after-char-remove-repeat': special,
						'after-char-upper-char': ['\'', ''], //'' - начало строки
						'after-chars-remove-chars': {
							'': special
						}
					}
				}
			};
		})(),
		numeric: {
			include: {
				chars: false,
				numbers: true,
				symbols: false,
				special: ''
			}
		},
		address: (function() {
			var special = '-/';
			return {
				lang: '',
				include: {
					symbols: false,
					special: special
				},
				input: {
					register: 'upper',
					capslock: true
				},
				regexulator: {
					g: {
						'after-char-remove-repeat': special,
						'after-chars-remove-chars': {
							'': special
						}
					}
				}
			};
		})(),
		month: {
			//lang: 'ru',
			interval: 700,
			include: {
				numbers: true,
				symbols: false
			},
			input: {
				capslock: false
			},
			regexulator: {
				g: {
					'after-char-remove-repeat': '0',
					'after-char-upper-char': ''
				}
			}
		}
	};

	var configuration = function (config) {
		mergeConfig(types, config);
	};
	configuration.get = function (name) {
		return helper.copy(types[name]);
	};
	configuration.merge = function() {
		var config = configuration.get('default');
		for (var i = 0, l = arguments.length; i < l; i++) {
			if (arguments[i] == 'default') continue;
			var options = arguments[i];
			if (typeof options == 'string') {
				if (!types[options]) {
					throw new Error('Can not find liveinput type ' + options);
				}
				options = types[options];
			}
			mergeConfig(config, options);
		}
		return config;
	};
	configuration.add = function(name, config) {
		if (types[name]) throw new Error('Can not add exist liveinput type ' + name);
		types[name] = config;
	};
	var init = function (name, options) {
		if (typeof name == 'object' || typeof name == 'undefined') {
			options = name;
			name = 'default';
		}
		var config = configuration.merge(name, options);
		setLang(config);
		var key = JSON.stringify(config);
		var instance = cache[key] || (cache[key] = new LiveInput(config));
		return instance;
	};
	var set = function(el, value) {
		el.value = value;
		// ReSharper disable once MissingHasOwnPropertyInForeach
		for (var key in cache) {
			cache[key].refresh(el);
		}
	};
	return {
		init: init,
		configuration: configuration,
		set: set
	};
};

if (typeof module != 'undefined') {
	module.exports = liveinput;
} else if (window) {
	window.liveinput = liveinput;
}
