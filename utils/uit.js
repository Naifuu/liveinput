var Uit = function (config) {
    var self = this;

    var filter = function (arr, cb) {
        var res = [], i, l;
        for (i = 0, l = arr.length; i < l; i++) {
            if (cb(arr[i], i, arr)) res.push(arr[i]);
        }
        return res;
    }
    var except = function (target, remove) {
        return filter(target, function (i) {
            return remove.indexOf(i) == -1;
        });
    };

    var map = {
        en: {
            "0": 48,
            "1": 49,
            "2": 50,
            "3": 51,
            "4": 52,
            "5": 53,
            "6": 54,
            "7": 55,
            "8": 56,
            "9": 57,
            "`": 192,
            "-": 189,
            "=": 187,
            "q": 81,
            "Q": 81,
            "w": 87,
            "W": 87,
            "e": 69,
            "E": 69,
            "r": 82,
            "R": 82,
            "t": 84,
            "T": 84,
            "y": 89,
            "Y": 89,
            "u": 85,
            "U": 85,
            "i": 73,
            "I": 73,
            "o": 79,
            "O": 79,
            "p": 80,
            "P": 80,
            "[": 219,
            "]": 221,
            "a": 65,
            "A": 65,
            "s": 83,
            "S": 83,
            "d": 68,
            "D": 68,
            "f": 70,
            "F": 70,
            "g": 71,
            "G": 71,
            "h": 72,
            "H": 72,
            "j": 74,
            "J": 74,
            "k": 75,
            "K": 75,
            "l": 76,
            "L": 76,
            ";": 186,
            "'": 222,
            "\\": 226,
            "z": 90,
            "Z": 90,
            "x": 88,
            "X": 88,
            "c": 67,
            "C": 67,
            "v": 86,
            "V": 86,
            "b": 66,
            "B": 66,
            "n": 78,
            "N": 78,
            "m": 77,
            "M": 77,
            ",": 188,
            ".": 190,
            "/": 191,
            "~": 192,
            "!": 49,
            "@": 50,
            "#": 51,
            "$": 52,
            "%": 53,
            "^": 54,
            "&": 55,
            "*": 56,
            "(": 57,
            ")": 48,
            "_": 189,
            "+": 187,
            "{": 219,
            "}": 221,
            ":": 186,
            "\"": 222,
            "|": 226,
            "<": 188,
            ">": 190,
            "?": 191,
            " ": 32
        },
        ru: {
            "0": 48,
            "1": 49,
            "2": 50,
            "3": 51,
            "4": 52,
            "5": 53,
            "6": 54,
            "7": 55,
            "8": 56,
            "9": 57,
            "ё": 192,
            "Ё": 192,
            "-": 189,
            "=": 187,
            "й": 81,
            "Й": 81,
            "ц": 87,
            "Ц": 87,
            "у": 69,
            "У": 69,
            "к": 82,
            "К": 82,
            "е": 84,
            "Е": 84,
            "н": 89,
            "Н": 89,
            "г": 85,
            "Г": 85,
            "ш": 73,
            "Ш": 73,
            "щ": 79,
            "Щ": 79,
            "з": 80,
            "З": 80,
            "х": 219,
            "Х": 219,
            "ъ": 221,
            "Ъ": 221,
            "ф": 65,
            "Ф": 65,
            "ы": 83,
            "Ы": 83,
            "в": 68,
            "В": 68,
            "а": 70,
            "А": 70,
            "п": 71,
            "П": 71,
            "р": 72,
            "Р": 72,
            "о": 74,
            "О": 74,
            "л": 75,
            "Л": 75,
            "д": 76,
            "Д": 76,
            "ж": 186,
            "Ж": 186,
            "э": 222,
            "Э": 222,
            "\\": 226,
            "я": 90,
            "Я": 90,
            "ч": 88,
            "Ч": 88,
            "с": 67,
            "С": 67,
            "м": 86,
            "М": 86,
            "и": 66,
            "И": 66,
            "т": 78,
            "Т": 78,
            "ь": 77,
            "Ь": 77,
            "б": 188,
            "Б": 188,
            "ю": 190,
            "Ю": 190,
            ".": 191,
            "!": 49,
            "\"": 50,
            "№": 51,
            ";": 52,
            "%": 53,
            ":": 54,
            "?": 55,
            "*": 56,
            "(": 57,
            ")": 48,
            "_": 189,
            "+": 187,
            "/": 226,
            ",": 191,
            " ": 32
        }
    }
    var el = config.el;
    var lang = config.lang;
    var shift = config.shift || false;
    var control = config.control || false;
    var alt = config.alt || false;
    var langs = Object.getOwnPropertyNames(map);
    var others = lang ? except(langs, [lang]) : langs;
    var i, l = others.length, keyCode, j, k;

    var defineProperty = function (target, source, prop) {
    	Object.defineProperty(target, prop, {
    		get: function () {
    			return this[prop + 'Val'];
    		}
    	});
    	target[prop + 'Val'] = source[prop];
	}

    var input = function (el, c) {
        var event = document.createEvent('TextEvent');
        event.initTextEvent('textInput',
            true,
            true,
            null,
            c);
        el.dispatchEvent(event);
    };
    var chromeHack = function (event, obj) {
        var props = Object.getOwnPropertyNames(obj);
        if (props.length) {
            // ReSharper disable once MissingHasOwnPropertyInForeach
            for (j = 0, k = props.length; j < k; j++) {
            	defineProperty(event, obj, props[j]);
            }
        }
        Object.defineProperty(event, 'which', {
        	get: function () {
                return this.keyCodeVal;
            }
        });
    }
    var callUIEvent = function (el, obj) {
        obj = obj || {};

        if (!obj.type) throw new Error('UIEvents type undefined');

        var event = document.createEvent('UIEvents');

        event.initUIEvent(
            obj.type, //type
            obj.canBubble || true, //canBubble
            obj.cancelable || true, //cancelable
            obj.view || document.defaultView, //view
            obj.detail || 1//detail
        );

        ['type', 'canBubble', 'cancelable', 'view', 'detail'].forEach(function(p) {
            if (obj[p] !== undefined) delete obj[p];
        });

        chromeHack(event, obj);
        
        el.dispatchEvent(event);
    };
    //var callKeyboardEvent = function (el, obj) {
    //    obj = obj || {};
        
    //    if (!obj.type) throw new Error('KeyboardEvent type undefined');
    //    if (obj.keyCode == undefined) throw new Error('KeyboardEvent keyCode undefined');
    //    if (obj.charCode == undefined) throw new Error('KeyboardEvent charCode undefined');

    //    var event = document.createEvent('KeyboardEvent');

    //    if (event.initKeyboardEvent) {
    //        event.initKeyboardEvent(
    //            obj.type, //type
    //            obj.canBubble || true, //canBubble
    //            obj.cancelable || true, //cancelable
    //            obj.view || document.defaultView, //view
    //            obj.ctrlKey || false, //ctrlKey
    //            obj.altKey || false, //altKey
    //            obj.shiftKey || false, //shiftKey
    //            obj.metaKey || false, //metaKey
    //            obj.keyCode || 0, //keyCode
    //            obj.charCode || 0 //charCode
    //        );
    //    } else {
    //        event.initKeyEvent(
    //            obj.type, //type
    //            obj.canBubble || true, //canBubble
    //            obj.cancelable || true, //cancelable
    //            obj.view || document.defaultView, //view
    //            obj.ctrlKey || false, //ctrlKey
    //            obj.altKey || false, //altKey
    //            obj.shiftKey || false, //shiftKey
    //            obj.metaKey || false, //metaKey
    //            obj.keyCode || 0,//keyCode
    //            obj.charCode || 0//charCode //0
    //            );
    //    }
    //    ['type', 'canBubble', 'cancelable', 'view', 'ctrlKey', 'altKey', 'shiftKey', 'metaKey', 'keyCode', 'charCode'].forEach(function (p) {
    //        if (obj[p] !== undefined) delete obj[p];
    //    });

    //    chromeHack(event, obj);

    //    el.dispatchEvent(event);
    //}
    var getKeyCode = function(c) {
        if (lang) {
            keyCode = map[lang][c];
        }
        if (keyCode) return keyCode;
        for (i = 0; i < l; i++) {
            if (map[others[i]][c]) return map[others[i]][c];
        }
    };
    var getCharCode = function(c) {
        return c.charCodeAt(c);
    }

    //var keydown = function (c) {
    //    var e = {
    //        type: 'keydown',
    //        keyCode: getKeyCode(c),
    //        charCode: getCharCode(c),
    //        shiftKey: shift
    //    };
    //    callUIEvent(el, e);
    //    //callKeyboardEvent(el, e);
    //    input(el, c);
    //};
    //self.print = function(text) {
    //    text.split('').forEach(keydown);
    //};

    self.call = function (e, c) {
    	//setTimeout(function() {
	
    	e.shiftKey = e.shiftKey || shift;
    	e.ctrlKey = e.ctrlKey || control;
    	e.altKey = e.altKey || alt;

		callUIEvent(el, e);
		//callKeyboardEvent(el, e);
		if (c || e.charCode) {
		    input(el, c || String.fromCharCode(e.charCode));
		    console.log('input', c || String.fromCharCode(e.charCode));
		}
	    //}, 10);
    }
	var keydown = function (c) {
		var e = {
			type: 'keydown',
			keyCode: getKeyCode(c),
			charCode: getCharCode(c)
		};
		
		self.call(e, c);
	};
	self.print = function (text) {
		text.split('').forEach(keydown);
	};
    return self;
};
//var uit = new Uit({
//	el: $0,
//	lang: 'ru',
//	shift: false,
//	control: true,
//	alt: false
//});
//uit.call({
//	type: 'keydown',
//	keyCode: 50
//});

//uit.print('asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\'\,./:"|<>?{}[]');

if (typeof module != "undefined") {
	module.exports = Uit;
} else if (window) {
	window.Uit = Uit;
}