# liveinput

Example:
```javascript
//fio
var surname = document.getElementById('surname');
var name = document.getElementById('name');

var instance = liveinput
    .init('fio', { lang: 'en' })
    .bind(surname, name);

instance.unbind(surname);
liveinput.init('fio', { lang: 'en' }).unbind(name);

//month
var month = document.getElementById('month');

var instance = liveinput
    .init('month', { lang: 'en' })
    .bind(month);

var validator = function (current, last, lang) {
    lang = lang || 'en';
    var mouth = parseInt(current, 10);
    return 1 <= mouth && mouth <= 12 ?
		new Date(current).toLocaleDateString(lang, { month: 'long' }) :
		current;
};

instance.on('change', month, function (current, last, lang) {
	this.el.value = validator(current, last, lang);
});

instance.unbind(month);
```

License
----

Apache 2.0 License
