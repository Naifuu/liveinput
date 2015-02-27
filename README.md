# liveinput

Example:
```javascript
//fio
var instance = liveinput.init('fio', { lang: 'en' });
var surname = document.getElementById('surname');
instance.bind(surname);
instance.on('change', surname, function (current, last, lang) {
	surname.value = current;
});
var name = document.getElementById('name');
instance.bind(name);
instance.on('change', name, function (current, last, lang) {
	name.value = current;
});

instance.unbind(surname);
instance.unbind(name);

//month
var instance = liveinput.init('month', { lang: 'en' });
var month = document.getElementById('month');
instance.bind(month);
var validator = function (current, last, lang) {
		lang = lang || 'ru';
		var mouth = parseInt(current, 10);
		return 1 <= mouth && mouth <= 12 ?
			new Date(current).toLocaleDateString(lang, { month: 'long' }) :
			current;
	}
instance.on('change', month, function (current, last, lang) {
	el.value = validator(current, last, lang);
});

instance.unbind(month);
```

License
----

Apache 2.0 License
