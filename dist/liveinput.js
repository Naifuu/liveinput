/**
 * liveinput - Input text auto changer
 * @version v1.0.3
 * @link https://github.com/vahpetr/liveinput/
 * @license Apache-2.0
 */
var liveinput = new function() {
    var helper = function() {
        return new function() {
            var rnd = Math.random;
            var bind = Function.prototype.bind ? function(func, thisArg) {
                return func.bind(thisArg);
            } : function(func, thisArg) {
                var slice = Array.prototype.slice, args = slice.call(arguments, 2);
                return function() {
                    return func.apply(thisArg, args.concat(slice.call(arguments)));
                };
            };
            var extrude = function(thisArg) {
                return bind(Function.prototype.call, thisArg);
            };
            var filter = Array.prototype.filter ? extrude(Array.prototype.filter) : function(arr, cb) {
                var i, l, res = [];
                for (i = 0, l = arr.length; i < l; i++) if (cb(arr[i], i, arr)) res.push(arr[i]);
                return res;
            };
            var map = Array.prototype.map ? extrude(Array.prototype.map) : function(arr, cb) {
                var i, l, res = [];
                for (i = 0, l = arr.length; i < l; i++) res.push(cb(arr[i], i, arr));
                return res;
            };
            var forEach = Array.prototype.forEach ? extrude(Array.prototype.forEach) : function(arr, cb) {
                for (var i = 0, l = arr.length; i < l; i++) cb(arr[i], i, arr);
            };
            var indexOf = Array.prototype.indexOf ? extrude(Array.prototype.indexOf) : function(arr, v) {
                var i, l;
                for (i = 0, l = arr.length; i < l; i++) if (arr[i] == v) return i;
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
                return map(text.split(""), charToCode);
            };
            var codesToText = function(codes) {
                return String.fromCharCode.apply(void 0, codes);
            };
            var addEvent = function(el, event, cb) {
                if (el.addEventListener) return el.addEventListener(event, cb, true);
                return el.attachEvent("on" + event, cb);
            };
            var removeEvent = function(el, event, cb) {
                if (el.removeEventListener) return el.removeEventListener(event, cb, true);
                return el.detachEvent("on" + event, cb);
            };
            var guidchar = function() {
                return (16 * rnd() | 0).toString(16);
            };
            var guid = function() {
                return "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, guidchar);
            };
            var format = function(text, arg) {
                for (var i = 0, l = arg.length; i < l; i++) text = text.replace(new RegExp("\\{" + i + "\\}", "g"), arg[i]);
                return text;
            };
            var fill = function(l, cb) {
                var res = [];
                for (var i = 0; i < l; i++) res.push(cb(i, l, res));
                return res;
            };
            var getSelectionStart = function(el) {
                if (el.createTextRange) {
                    var r = document.selection.createRange().duplicate();
                    r.moveEnd("character", el.value.length);
                    if ("" == r.text) return el.value.length;
                    return el.value.lastIndexOf(r.text);
                } else return el.selectionStart;
            };
            var getSelectionEnd = function(el) {
                if (el.createTextRange) {
                    var r = document.selection.createRange().duplicate();
                    r.moveStart("character", -el.value.length);
                    return r.text.length;
                } else return el.selectionEnd;
            };
            var setCaretPosition = function(el, pos) {
                if (el.setSelectionRange) return el.setSelectionRange(pos.start, pos.end);
                if (!el.createTextRange) return;
                var range = el.createTextRange();
                range.collapse(true);
                range.moveStart("character", pos.start);
                range.moveEnd("character", pos.end);
                range.select();
            };
            var getOwnPropertyNames = function(obj) {
                var props = [];
                for (var p in obj) if (obj.hasOwnProperty(p)) props.push(p);
                return props;
            };
            var isArray = Array.isArray || function(arg) {
                return "[object Array]" === Object.prototype.toString.call(arg);
            };
            var extend = function(a, b) {
                if (!b) return;
                for (var p in b) a[p] = b[p];
            };
            var callEvent = function(el, event, obj) {
                var e;
                if (document.createEvent) {
                    e = document.createEvent("HTMLEvents");
                    extend(e, obj);
                    e.initEvent(event, false, false);
                    return el.dispatchEvent(e);
                }
                e = document.createEventObject();
                extend(e, obj);
                el.fireEvent("on" + event, e);
            };
            return {
                charToCode: charToCode,
                textToCodes: textToCodes,
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
                }
            };
        }();
    }();
    var Cursor = function(el) {
        var self = this;
        var max = Math.max;
        self.start = 0;
        self.end = 0;
        self.press = function() {
            self.end = self.start = helper.getSelectionStart(el);
        };
        self.release = function() {
            self.end = helper.getSelectionEnd(el);
        };
        self.change = function() {
            self.start = helper.getSelectionStart(el);
            self.end = helper.getSelectionEnd(el);
        };
        var maxpos;
        self.move = function(offset) {
            maxpos = max(self.start - offset, self.end - offset);
            helper.setCaretPosition(el, {
                start: maxpos,
                end: maxpos
            });
            self.press();
        };
        self.refresh = function() {
            helper.setCaretPosition(el, {
                start: 0,
                end: el.value.length
            });
            self.change();
        };
        return self;
    };
    var langs = [ "ru", "en" ];
    var whitelist = [ 192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 220, 226, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 111, 106, 109, 107, 12 ];
    var additional = {
        keyCodes: [ 32, 13, 8 ],
        charCodes: [ 32, 10 ]
    };
    whitelist.push.apply(whitelist, additional.keyCodes);
    var hotkeymap = {
        control: {
            50: "@",
            51: "#",
            52: "$",
            53: "%",
            54: "^",
            55: "&",
            222: "'"
        }
    };
    var parseCode = function(code) {
        return parseInt(code, 10);
    };
    var keymapper = function(map) {
        var props = helper.getOwnPropertyNames(map);
        return helper.map(props, parseCode);
    };
    var hotkey = {
        control: keymapper(hotkeymap.control)
    };
    var command = {};
    command.layout = function(config, type) {
        var self = this;
        self.type = type;
        var lang = config.lang;
        var map = {
            ru: [ 1105, 1081, 1094, 1091, 1082, 1077, 1085, 1075, 1096, 1097, 1079, 1092, 1099, 1074, 1072, 1087, 1088, 1086, 1083, 1076, 1103, 1095, 1089, 1084, 1080, 1090, 1100, 1025, 1049, 1062, 1059, 1050, 1045, 1053, 1043, 1064, 1065, 1047, 1060, 1067, 1042, 1040, 1055, 1056, 1054, 1051, 1044, 1071, 1063, 1057, 1052, 1048, 1058, 1068, 1093, 1098, 92, 49, 51, 53, 56, 57, 48, 45, 61, 1061, 1066, 47, 33, 8470, 37, 42, 40, 41, 95, 43 ],
            en: [ 96, 113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 97, 115, 100, 102, 103, 104, 106, 107, 108, 122, 120, 99, 118, 98, 110, 109, 126, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 71, 72, 74, 75, 76, 90, 88, 67, 86, 66, 78, 77, 91, 93, 92, 49, 51, 53, 56, 57, 48, 45, 61, 123, 125, 124, 33, 35, 37, 42, 40, 41, 95, 43 ]
        };
        for (var p in map) map[p].push.apply(map[p], additional.charCodes);
        var relation = {
            50: [ [ 50, 34 ], [ 50, 64 ] ],
            52: [ [ 52, 59 ], [ 52, 36 ] ],
            54: [ [ 54, 58 ], [ 54, 94 ] ],
            55: [ [ 55, 63 ], [ 55, 38 ] ],
            186: [ [ 1078, 1046 ], [ 59, 58 ] ],
            222: [ [ 1101, 1069 ], [ 39, 34 ] ],
            188: [ [ 1073, 1041 ], [ 44, 60 ] ],
            190: [ [ 1102, 1070 ], [ 46, 62 ] ],
            191: [ [ 46, 44 ], [ 47, 63 ] ]
        };
        var special = {
            50: 64,
            51: 35,
            52: 36,
            53: 37,
            54: 94,
            222: 39
        };
        var convert = {};
        var keyCode, i, l;
        for (keyCode in relation) convert[keyCode] = {};
        for (i = 0, l = langs.length; i < l; i++) for (keyCode in relation) convert[keyCode][langs[i]] = relation[keyCode][i];
        var others = lang ? helper.except(langs, [ lang ]) : langs;
        var j, diff, code, index, added, length, k = others.length;
        self.exec = function(compute, data) {
            if (!data.keydown.length) return compute;
            diff = compute.diff;
            length = diff.length;
            var converted = [];
            for (i = 0, l = diff.length; i < l; i++) {
                code = diff[i];
                added = false;
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
                if (data.keydown[i].ctrlKey && special[data.keydown[i].keyCode] == code) {
                    converted.push(code);
                    continue;
                }
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
        var lang = config.lang || "";
        var presets = [];
        helper.forEach([ "numbers", "symbols" ], function(preset) {
            if (!config[preset]) return;
            presets.push(preset);
        });
        var special = config.special || "";
        var i, l, index;
        var sources = lang ? [ lang ] : langs;
        for (i = 0, l = sources.length; i < l; i++) {
            index = helper.indexOf(presets, sources[i]);
            if (index != -1) continue;
            presets.push(sources[i]);
        }
        special = helper.textToCodes(special);
        if (special.length && helper.indexOf(presets, "special") == -1) presets.push("special");
        if (!config.chars) helper.forEach(langs, function(l) {
            index = helper.indexOf(presets, l);
            if (index == -1) return;
            presets.splice(index, 1);
        });
        var map = {
            ru: [ 1092, 1099, 1074, 1072, 1087, 1088, 1086, 1083, 1076, 1081, 1094, 1091, 1082, 1077, 1085, 1075, 1096, 1097, 1079, 1103, 1095, 1089, 1084, 1080, 1090, 1100, 1093, 1098, 1078, 1101, 1073, 1102, 1105, 1060, 1067, 1042, 1040, 1055, 1056, 1054, 1051, 1044, 1049, 1062, 1059, 1050, 1045, 1053, 1043, 1064, 1065, 1047, 1071, 1063, 1057, 1052, 1048, 1058, 1068, 1061, 1066, 1046, 1069, 1041, 1070, 1025 ],
            en: [ 97, 115, 100, 102, 103, 104, 106, 107, 108, 113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 122, 120, 99, 118, 98, 110, 109, 65, 83, 68, 70, 71, 72, 74, 75, 76, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 90, 88, 67, 86, 66, 78, 77 ],
            numbers: [ 48, 49, 50, 51, 52, 53, 54, 55, 56, 57 ],
            symbols: [ 32, 10, 96, 45, 61, 126, 33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 95, 43, 91, 93, 59, 39, 92, 44, 46, 47, 123, 125, 58, 34, 124, 60, 62, 63, 8470 ],
            special: special
        };
        var j, diff, length, added, k = presets.length;
        self.exec = function(compute, data) {
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
                enabled: presets.length || special.length ? true : false,
                config: config
            };
        };
        return self;
    };
    command.exclude = function(config, type) {
        delete config.lang;
        var self = this;
        self.type = type;
        var special = config.special || "";
        special = helper.textToCodes(special);
        var i, l, index, diff, length;
        self.exec = function(compute) {
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
                lower: [ 1092, 1099, 1074, 1072, 1087, 1088, 1086, 1083, 1076, 1078, 1101, 1081, 1094, 1091, 1082, 1077, 1085, 1075, 1096, 1097, 1079, 1093, 1098, 1103, 1095, 1089, 1084, 1080, 1090, 1100, 1073, 1102, 1105 ],
                upper: [ 1060, 1067, 1042, 1040, 1055, 1056, 1054, 1051, 1044, 1046, 1069, 1049, 1062, 1059, 1050, 1045, 1053, 1043, 1064, 1065, 1047, 1061, 1066, 1071, 1063, 1057, 1052, 1048, 1058, 1068, 1041, 1070, 1025 ]
            },
            en: {
                lower: [ 97, 115, 100, 102, 103, 104, 106, 107, 108, 113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 122, 120, 99, 118, 98, 110, 109 ],
                upper: [ 65, 83, 68, 70, 71, 72, 74, 75, 76, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 90, 88, 67, 86, 66, 78, 77 ]
            }
        };
        var sources = lang ? [ lang ] : langs;
        var findhere = helper.except(helper.getOwnPropertyNames(map[sources[0]]), [ register ])[0];
        var sequence = [ "register", "capslock" ];
        var i, l, j, index, diff, added, right, wrong, length, m, k = sources.length, n = sequence.length;
        var handler = {};
        handler.register = function(compute) {
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
        };
        handler.capslock = function(compute, data) {
            if (!data.keydown.length) return compute;
            diff = compute.diff;
            length = diff.length;
            var result = [];
            for (i = 0, l = diff.length; i < l; i++) {
                added = false;
                right = register || (data.keydown[i].shiftKey ? "upper" : "lower");
                if (register && data.keydown[i].shiftKey) right = "upper" == right ? "lower" : "upper";
                wrong = "upper" == right ? "lower" : "upper";
                for (j = 0; j < k; j++) {
                    index = helper.indexOf(map[sources[j]][right], diff[i]);
                    if (index != -1) continue;
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
        };
        self.exec = function(compute, data) {
            var result = compute;
            for (m = 0; m < n; m++) {
                if (!config[sequence[m]]) continue;
                result = handler[sequence[m]](result, data);
            }
            return result;
        };
        self.get = function() {
            return {
                type: type,
                enabled: register || capslock ? true : false,
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
            "after-chars-remove-chars": "((?:{0})+)(?:{1})+",
            "after-term-remove-chars": "((?:^|\\s)+{0}\\s+)(?:{1})+",
            "after-chars-remove-term": "((?:{0})+)\\s+{1}\\s+",
            "after-term-remove-term": "((?:^|\\s)+{0}\\s+){1}\\s+",
            "before-chars-remove-chars": "(?:{1})+((?:{0})+)",
            "before-term-remove-chars": "(?:{1})+(\\s+{0}\\s+)",
            "before-chars-remove-term": "(?:^|\\s)+{1}\\s+((?:{0})+)",
            "before-term-remove-term": "(?:^|\\s)+{1}\\s+({0}\\s+)",
            "after-char-remove-repeat": "({0}){1}+",
            "after-char-replace-expr": "({0}{1})",
            "after-term-replace-expr": "(?:^|\\s)+({0}\\s+{1})",
            "after-char-upper-char": "({0}[a-zа-яё])"
        };
        var map = {
            "[": "\\[",
            "]": "\\]",
            "\\": "\\\\",
            "/": "\\/",
            "^": "\\^",
            $: "\\$",
            ".": "\\.",
            "|": "\\|",
            "?": "\\?",
            "*": "\\*",
            "+": "\\+",
            "(": "\\(",
            ")": "\\)",
            "{": "\\{",
            "}": "\\}",
            "'": "\\'",
            "": "^"
        };
        var i, l, m, n, removes = {}, interceptions = {}, regexeRemoves = [], regexeInterceptions = [];
        var mapping = function(c) {
            return map[c] || c;
        };
        var char = function(text) {
            var chars = text.split("");
            if (!chars.length) chars.push("");
            return helper.map(chars, mapping);
        };
        var chars = function(val) {
            return [ char(val).join("|") ];
        };
        var term = function(val) {
            return [ char(val).join("") ];
        };
        var template = function(name, arr) {
            return helper.format(templates[name], arr);
        };
        var handler = {};
        handler["after-chars-remove-chars"] = function(config, name, flag) {
            for (var text in config) helper.forEach(chars(text), function(param) {
                helper.forEach(chars(config[text]), function(secondparam) {
                    removes[flag].push(template(name, [ param, secondparam ]));
                });
            });
        };
        handler["after-chars-remove-term"] = function(config, name, flag) {
            for (var text in config) helper.forEach(chars(text), function(param) {
                helper.forEach(term(config[text]), function(secondparam) {
                    removes[flag].push(template(name, [ param, secondparam ]));
                });
            });
        };
        handler["after-term-remove-chars"] = function(config, name, flag) {
            for (var text in config) helper.forEach(term(text), function(param) {
                helper.forEach(chars(config[text]), function(secondparam) {
                    removes[flag].push(template(name, [ param, secondparam ]));
                });
            });
        };
        handler["after-term-remove-term"] = function(config, name, flag) {
            for (var text in config) helper.forEach(term(text), function(param) {
                helper.forEach(term(config[text]), function(secondparam) {
                    removes[flag].push(template(name, [ param, secondparam ]));
                });
            });
        };
        handler["after-char-remove-repeat"] = function(config, name, flag) {
            helper.forEach(char(config), function(param) {
                removes[flag].push(template(name, [ param, param ]));
            });
        };
        handler["before-chars-remove-chars"] = handler["after-chars-remove-chars"];
        handler["before-chars-remove-term"] = handler["after-chars-remove-term"];
        handler["before-term-remove-chars"] = handler["after-term-remove-chars"];
        handler["before-term-remove-term"] = handler["after-term-remove-term"];
        handler["after-char-replace-expr"] = function(config, name, flag) {
            for (var text in config) helper.forEach(char(text), function(param) {
                interceptions[flag].push({
                    expr: template(name, [ param, config[text].expr ]),
                    replacer: config[text].replacer
                });
            });
        };
        handler["after-char-upper-char"] = function(config, name, flag) {
            var obj = {};
            var arr = helper.isArray(config) ? config : [ config ];
            for (var j = 0, k = arr.length; j < k; j++) obj[arr[j]] = {
                expr: "[a-zа-яё]",
                replacer: function(find, c, offset, str, data, noffset) {
                    if (1 == find.length) str = ""; else str = find[0];
                    if (!data.keydown.length) return str + find[find.length - 1].toLocaleUpperCase();
                    if (data.keydown[noffset].shiftKey) return str + find[find.length - 1].toLowerCase();
                    return str + find[find.length - 1].toLocaleUpperCase();
                }
            };
            handler["after-char-replace-expr"](obj, "after-char-replace-expr", flag);
        };
        handler["after-term-replace-expr"] = function(config, name, flag) {
            for (var text in config) helper.forEach(term(text), function(param) {
                interceptions[flag].push({
                    expr: template(name, [ param, config[text].expr ]),
                    replacer: config[text].replacer
                });
            });
        };
        for (var flag in config) {
            if (/[^igm]/g.test(flag)) throw new Error("Command regexulator can not support flag " + flag);
            flag = flag.split("").sort().join("");
            removes[flag] = removes[flag] || [];
            interceptions[flag] = interceptions[flag] || [];
            helper.forEach([ "after-chars-remove-chars", "after-term-remove-chars", "after-chars-remove-term", "after-term-remove-term", "before-chars-remove-chars", "before-term-remove-chars", "before-chars-remove-term", "before-term-remove-term", "after-char-replace-expr", "after-term-replace-expr", "after-char-remove-repeat", "after-char-upper-char" ], function(name) {
                if (void 0 == config[flag][name]) return;
                handler[name](config[flag][name], name, flag);
            });
        }
        for (flag in removes) {
            if (!removes[flag].length) continue;
            regexeRemoves.push({
                expr: new RegExp(removes[flag].join("|"), flag),
                replacer: helper.fill(removes[flag].length, function(i) {
                    return "$" + (i + 1);
                }).join("")
            });
        }
        var selector = function(i) {
            return i.expr;
        };
        for (flag in interceptions) {
            if (!interceptions[flag].length) continue;
            regexeInterceptions.push({
                expr: new RegExp(helper.map(interceptions[flag], selector).join("|"), flag),
                replacer: interceptions[flag][0].replacer
            });
        }
        var find, c, offset, str;
        var parseArgs = function(args) {
            find = args[0];
            offset = args[args.length - 2];
            str = args[args.length - 1];
            for (m = 1, n = args.length - 2; m < n; m++) if (void 0 != args[m]) {
                c = args[m];
                break;
            }
        };
        self.exec = function(text, data) {
            for (i = 0, l = regexeRemoves.length; i < l; i++) text = text.replace(regexeRemoves[i].expr, regexeRemoves[i].replacer);
            for (i = 0, l = regexeInterceptions.length; i < l; i++) text = text.replace(regexeInterceptions[i].expr, function() {
                parseArgs(arguments);
                if (data.cursor.start <= offset + 1 && offset + 1 <= data.cursor.end) {
                    n = data.before.length + data.diff.length - offset - find.length;
                    if (!data.keydown[n]) n = 0;
                    return regexeInterceptions[i].replacer(find, c, offset, str, data, n);
                }
                return find;
            });
            return text;
        };
        self.get = function() {
            return {
                type: type,
                enabled: regexeRemoves.length || regexeInterceptions.length ? true : false,
                config: config
            };
        };
        return self;
    };
    var Preprocessor = function(config) {
        var self = this;
        var i, l, result, processes = [];
        var sequence = [ "layout", "include", "exclude", "input" ];
        for (i = 0, l = sequence.length; i < l; i++) {
            if (!config[sequence[i]]) continue;
            if (true === config[sequence[i]]) config[sequence[i]] = {};
            processes.push(new command[sequence[i]](config[sequence[i]], sequence[i]));
        }
        for (var j = 0; j < processes.length; j++) if (!processes[j].get().enabled) processes.splice(j--, 1);
        l = processes.length;
        self.pass = function(compute, data) {
            result = compute;
            for (i = 0; i < l; i++) result = processes[i].exec(result, data);
            result.before = helper.codesToText(result.before);
            result.diff = helper.codesToText(result.diff);
            result.after = helper.codesToText(result.after);
            result.offset = compute.offset;
            return result;
        };
        self.config = function() {
            var info, cfg = {};
            for (i = 0; i < l; i++) {
                info = processes[i].get();
                cfg[info.type] = info.config;
            }
            return cfg;
        };
        return self;
    };
    var Postprocessor = function(config) {
        var self = this;
        var i, l, result, length, processes = [];
        var sequence = [ "regexulator" ];
        for (i = 0, l = sequence.length; i < l; i++) {
            if (!config[sequence[i]]) continue;
            if (true === config[sequence[i]]) config[sequence[i]] = {};
            processes.push(new command[sequence[i]](config[sequence[i]], sequence[i]));
        }
        for (var j = 0; j < processes.length; j++) if (!processes[j].get().enabled) processes.splice(j--, 1);
        l = processes.length;
        self.pass = function(text, data) {
            result = text;
            length = result.length;
            for (i = 0; i < l; i++) result = processes[i].exec(result, data);
            data.result.offset += length - result.length;
            return result;
        };
        self.config = function() {
            var info, cfg = {};
            for (i = 0; i < l; i++) {
                info = processes[i].get();
                cfg[info.type] = info.config;
            }
            return cfg;
        };
        return self;
    };
    var LiveInput = function(config) {
        var self = this;
        var lang = config.lang;
        var interval = config.interval;
        var preprocessor = new Preprocessor(config);
        var postprocessor = new Postprocessor(config);
        var heap = {};
        var event, eventIndex, eventCount;
        var callevents = function(el, events, name, ptr, arg) {
            if (!events[name]) return;
            event = events[name];
            for (eventIndex = 0, eventCount = event.length; eventIndex < eventCount; eventIndex++) event[eventIndex].apply(ptr, arg);
            if ("change" != name) return;
            if (ptr.event.old == el.value) return;
            ptr.event.value = el.value;
            helper.event.call(el, "liveinput", ptr.event);
        };
        var onkeyup = function(e, el, data, cursor, events, ptr) {
            cursor.release();
            if (8 == e.keyCode) {
                data.before = el.value.substring(0, cursor.end);
                data.diff = "";
                data.after = el.value.substring(cursor.end);
            } else {
                data.before = el.value.substring(0, cursor.start);
                data.diff = el.value.substring(cursor.start, cursor.end);
                data.after = el.value.substring(cursor.end);
            }
            if (e.ctrlKey && hotkeymap.control[e.keyCode]) data.diff += hotkeymap.control[e.keyCode];
            data.result = preprocessor.pass({
                before: helper.textToCodes(data.before),
                diff: helper.textToCodes(data.diff),
                after: helper.textToCodes(data.after),
                offset: e.ctrlKey && -data.diff.length || 0
            }, data);
            data.result.value = data.result.before + data.result.diff + data.result.after;
            data.result.value = postprocessor.pass(data.result.value, data);
            callevents(el, events, "change", ptr, [ data.result.value, data.old, lang ]);
            ptr.event.old = data.old = el.value;
            cursor.move(data.result.offset);
            data.keydown = [];
            ptr.timer = null;
            return true;
        };
        var refresh = function(el) {
            if (!el.value.length) return;
            var ptr = heap[el.GUID];
            clearTimeout(ptr.timer);
            if (!ptr.timer) ptr.cursor.refresh();
            onkeyup({
                keyCode: whitelist[0]
            }, el, ptr.data, ptr.cursor, ptr.events, ptr);
        };
        var onkeydown = function(e, el, data, cursor, events, ptr) {
            if (e.ctrlKey) switch (e.keyCode) {
              case 90:
              case 67:
                return false;

              case 89:
                e.preventDefault();
                return false;
            }
            if (data.mousedown) {
                e.preventDefault();
                return false;
            }
            if (helper.indexOf(whitelist, e.keyCode) == -1) {
                if (ptr.timer) refresh(el);
                return false;
            }
            clearTimeout(ptr.timer);
            data.keydown.push({
                keyCode: e.keyCode,
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey
            });
            if (!ptr.timer) cursor.press();
            ptr.timer = setTimeout(function() {
                onkeyup(e, el, data, cursor, events, ptr);
            }, interval);
            if (e.ctrlKey && helper.indexOf(hotkey.control, e.keyCode) != -1) {
                e.preventDefault();
                return false;
            }
            return true;
        };
        self.bind = function(el) {
            if (!el.GUID) el.GUID = helper.GUID();
            var ptr = heap[el.GUID] = {};
            ptr.el = el;
            ptr.event = {
                old: ""
            };
            ptr.data = {
                keydown: [],
                result: {},
                old: ""
            };
            ptr.cursor = new Cursor(el);
            var data = ptr.data;
            var cursor = ptr.data.cursor = ptr.cursor;
            var events = ptr.events = {};
            ptr.keydown = function(e) {
                onkeydown(e, el, data, cursor, events, ptr);
            };
            ptr.paste = function() {
                data.keydown = [];
                return true;
            };
            ptr.dragover = function(e) {
                e.preventDefault();
                return false;
            };
            ptr.mousedown = function() {
                ptr.data.mousedown = true;
                refresh(el);
            };
            ptr.mouseup = function() {
                ptr.data.mousedown = false;
            };
            ptr.mouseleave = function() {
                ptr.data.mousedown = false;
            };
            ptr.blur = function() {
                refresh(el);
            };
            helper.event.add(el, "keydown", ptr.keydown);
            helper.event.add(el, "paste", ptr.paste);
            helper.event.add(el, "mousedown", ptr.mousedown);
            helper.event.add(el, "mouseup", ptr.mouseup);
            helper.event.add(el, "mouseleave", ptr.mouseleave);
            helper.event.add(el, "dragover", ptr.dragover);
            helper.event.add(el, "blur", ptr.blur);
            el.focus();
            return self;
        };
        self.unbind = function(el) {
            if (!el.GUID) return;
            if (!heap[el.GUID]) return;
            var ptr = heap[el.GUID];
            helper.event.remove(el, "keydown", ptr.keydown);
            helper.event.remove(el, "paste", ptr.paste);
            helper.event.remove(el, "mousedown", ptr.mousedown);
            helper.event.remove(el, "mouseup", ptr.mouseup);
            helper.event.remove(el, "mouseleave", ptr.mouseleave);
            helper.event.remove(el, "dragover", ptr.dragover);
            helper.event.remove(el, "blur", ptr.blur);
            delete heap[el.GUID];
            delete ptr;
            return self;
        };
        self.on = function(event, el, cb) {
            if (!el.GUID) return;
            if (!heap[el.GUID]) return;
            heap[el.GUID].events[event] = heap[el.GUID].events[event] || [];
            heap[el.GUID].events[event].push(cb);
            switch (event) {
              case "change":
                if (el.value.length) refresh(el);
            }
            return self;
        };
        self.off = function(event, el, cb) {
            if (!el.GUID) return;
            if (!heap[el.GUID]) return;
            eventIndex = helper.indexOf(heap[el.GUID].events[event], cb);
            if (eventIndex == -1) return self;
            heap[el.GUID].events[event].splice(eventIndex, 1);
            return self;
        };
        return self;
    };
    var setLang = function(config) {
        if ("undefined" == typeof config.lang) return;
        var lang = config.lang;
        for (var p in config) {
            if (!config[p]) continue;
            if (true == config[p]) config[p] = {};
            config[p].lang = lang;
        }
    };
    var mergeConfig = function(a, b) {
        if (!b) return a;
        for (var p in b) if ("object" == typeof a[p]) a[p] = mergeConfig(a[p], b[p]); else a[p] = b[p];
        return a;
    };
    var init = function(name, options) {
        if ("object" == typeof name || "undefined" == typeof name) {
            options = name;
            name = "default";
        }
        if (!types[name]) throw new Error("Can not find liveinput type " + name);
        return types[name](options);
    };
    var configuration = function(config) {
        mergeConfig(types, config);
    };
    var cache = {};
    var types = {
        "default": function(options) {
            var config = mergeConfig({
                lang: "",
                interval: 0,
                layout: true,
                include: {
                    chars: true,
                    numbers: true,
                    symbols: true,
                    special: ""
                },
                exclude: {
                    special: "{}[]"
                },
                input: {
                    register: "",
                    capslock: false
                },
                regexulator: {
                    g: {}
                }
            }, options);
            setLang(config);
            var key = JSON.stringify(config);
            var instance = cache[key] || (cache[key] = new LiveInput(config));
            return instance;
        },
        fio: function(options) {
            var special = " '-";
            var config = mergeConfig({
                lang: "ru",
                include: {
                    numbers: false,
                    symbols: false,
                    special: special
                },
                regexulator: {
                    g: {
                        "after-char-remove-repeat": special,
                        "after-char-upper-char": [ "'", "" ],
                        "after-chars-remove-chars": {
                            "": special
                        }
                    }
                }
            }, options);
            return init(config);
        },
        numeric: function(options) {
            var config = mergeConfig({
                include: {
                    chars: false,
                    numbers: true,
                    symbols: false,
                    special: ""
                }
            }, options);
            return init(config);
        },
        place: function(options) {
            var special = ". '-";
            var config = mergeConfig({
                lang: "ru",
                include: {
                    numbers: false,
                    symbols: false,
                    special: special
                },
                regexulator: {
                    g: {
                        "after-char-remove-repeat": special,
                        "after-char-upper-char": [ "'", "" ],
                        "after-chars-remove-chars": {
                            "": special
                        }
                    }
                }
            }, options);
            return init(config);
        },
        "peopled-place": function(options) {
            var config = mergeConfig({
                include: {
                    numbers: true
                }
            }, options);
            return init("place", config);
        },
        address: function(options) {
            var special = "-/";
            var config = mergeConfig({
                include: {
                    symbols: false,
                    special: special
                },
                input: {
                    register: "upper",
                    capslock: true
                },
                regexulator: {
                    g: {
                        "after-char-remove-repeat": special,
                        "after-chars-remove-chars": {
                            "": special
                        }
                    }
                }
            }, options);
            return init(config);
        },
        month: function(options) {
            var config = mergeConfig({
                lang: "ru",
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
                        "after-char-remove-repeat": "0",
                        "after-char-upper-char": ""
                    }
                }
            }, options);
            return init(config);
        },
        "passport-issue": function(options) {
            var special = '. -"№';
            var config = mergeConfig({
                lang: "ru",
                include: {
                    numbers: false,
                    symbols: false,
                    special: special
                },
                input: {
                    capslock: true
                },
                regexulator: {
                    g: {
                        "after-char-remove-repeat": special,
                        "after-chars-remove-chars": {
                            "": special
                        }
                    }
                }
            }, options);
            return init(config);
        },
        "international-passport-issue": function(options) {
            var special = " -";
            var config = mergeConfig({
                lang: "",
                include: {
                    numbers: false,
                    symbols: false,
                    special: special
                },
                input: {
                    capslock: true
                },
                regexulator: {
                    g: {
                        "after-char-remove-repeat": special,
                        "after-chars-remove-chars": {
                            "": special
                        }
                    }
                }
            }, options);
            return init(config);
        },
        "international-document-serial": function(options) {
            var config = mergeConfig({
                lang: "",
                include: {
                    numbers: true,
                    symbols: false
                }
            }, options);
            return init(config);
        },
        "document-issue": function(options) {
            var special = " .,-/\"()№'";
            var config = mergeConfig({
                lang: "ru",
                include: {
                    numbers: true,
                    symbols: false,
                    special: special
                },
                input: {
                    register: "lower",
                    capslock: true
                },
                regexulator: {
                    g: {
                        "after-char-remove-repeat": special,
                        "after-chars-remove-chars": {
                            "": special
                        }
                    }
                }
            }, options);
            return init(config);
        }
    };
    return {
        init: init,
        configuration: configuration
    };
}();

if ("undefined" != typeof module) module.exports = liveinput; else if (window) window.liveinput = liveinput;