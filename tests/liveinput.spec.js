describe('liveinput', function () {
	var el, liveInputInstance, uitInstance;
	var div = document.createElement('div');
	var body = document.body;
	//var interval = 1500;

	div.innerHTML = '<input type="text">';
	el = div.children[0];
	body.appendChild(el);

	var before = function (done) {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		console.log('before end');
		done();
	};
	var after = function () {
		liveInputInstance.unbind(el);
		liveInputInstance = null;
		uitInstance = null;
		el.value = '';
		console.log('after end');
	};

	//function debounce(func, wait, immediate) {
	//	var timeout;
	//	return function() {
	//		var context = this, args = arguments;
	//		var later = function() {
	//			timeout = null;
	//			if (!immediate) func.apply(context, args);
	//		};
	//		var callNow = immediate && !timeout;
	//		clearTimeout(timeout);
	//		timeout = setTimeout(later, wait);
	//		if (callNow) func.apply(context, args);
	//	};
	//};

	var initLiveinput = function (type, config, validator) {
		return new Promise(function (resolve, reject) {
			try {
				liveInputInstance = liveinput.init(type, config);
				liveInputInstance.bind(el);
				var fn = //debounce(
					function (current, last, lang) {
						el.value = validator ? validator(current, last, lang) : current;
						resolve(el.value);
					}//, interval
				//);
				liveInputInstance.on('change', el, fn);
			} catch (e) {
				reject(e);
			}
		});
	};
	var uit = function (config) {
		config.el = el;
		uitInstance = new Uit(config);
		var print = uitInstance.print;
		uitInstance.print = function (str) {
			//interval = str.length * 35;
			print(str);
		}
		return uitInstance;
	};

	beforeEach(before);
	afterEach(after);

	it('default', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('default done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('fio', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'Фыв ФЫВ апр АПР э- эфывфыв -ЁэБЮХЪхъ';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('fio').then(function (value) {
			console.log('fio done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('numeric', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = '123';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('numeric').then(function (value) {
			console.log('fio done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('place', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'Фыв ФЫВ апр АПР э- эфывфыв -Ёэ.БЮХЪхъ';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('place').then(function (value) {
			console.log('place done', value);
			expect(value).toBe(output);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('peopled-place', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'Фыв ФЫВ апр АПР 123 э- эфывфыв -Ёэ.БЮХЪхъ';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('peopled-place').then(function (value) {
			console.log('peopled-place done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('address', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'ASDASDАПРАПР123-ASDФЫВ-/';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('address').then(function (value) {
			console.log('address done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('month', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'ФывФЫВапрАПР123ээфывфывЁэБЮХЪхъ';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('month').then(function (value) {
			console.log('month done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('passport-issue', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'фыв фыв апр апр "э- эфывфыв -ё"№э."бюхъхъ';
		var uitConfig = { lang: 'ru', shift: false };
		initLiveinput('passport-issue').then(function (value) {
			console.log('passport-issue done', value);
			expect(value).toBe(output);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('international-passport-issue', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'asd asd апр апр - asdфыв -';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('international-passport-issue').then(function (value) {
			console.log('international-passport-issue done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('international-document-serial', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'asdASDапрАПР123asdфыв';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('international-document-serial').then(function (value) {
			console.log('international-document-serial done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('document-issue', function (done) {
		var input = 'asd ASD апр АПР 123 @\'- \'asdфыв -=~!@#$%^&*()_+;\',./:"|<>?{}[]';
		var output = 'фыв фыв апр апр 123 "э- эфывфыв -ё"№()э,./"/бюхъхъ';
		var uitConfig = { lang: 'ru', shift: false, control: false, alt: false };
		initLiveinput('document-issue').then(function (value) {
			console.log('document-issue done', value);
			expect(value).toBe(output);
			expect(value).not.toBe(input);
			done();
		});
		uit(uitConfig).print(input);
	});

	it('control+2', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+2', value);
			expect(value).toBe('@');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 50
		});
	});

	it('control+3', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+3', value);
			expect(value).toBe('#');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 51
		});
	});

	it('control+4', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+4', value);
			expect(value).toBe('$');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 52
		});
	});

	it('control+5', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+5', value);
			expect(value).toBe('%');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 53
		});
	});

	it('control+6', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+6', value);
			expect(value).toBe('^');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 54
		});
	});

	it('control+7', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+7', value);
			expect(value).toBe('&');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 55
		});
	});

	it('control+э', function (done) {
		var uitConfig = { lang: 'ru', shift: false, control: true, alt: false };
		initLiveinput('default').then(function (value) {
			console.log('control+э', value);
			expect(value).toBe('\'');
			expect(value).not.toBe('');
			done();
		});
		uit(uitConfig).call({
			type: 'keydown',
			keyCode: 222
		});
	});

});