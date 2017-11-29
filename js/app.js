"use strict";

(function(window, $, undefined){

var default_descriptor = {
	writable:       false,
	configurable:   true,
	enumerable:     true,
};

function a(dot_selector) {
	var split = dot_selector.split('.');

	var tmp = a;
	for (var i = 0; i < split.length; ++i) {
		try {
			tmp = tmp[split[i]];
		} catch (e) {
			return undefined;
		}
	}

	return tmp;
}


function _defineProperty(name, value, descriptor) {

	descriptor = $.extend({}, default_descriptor, descriptor);

	descriptor.value = value;

	if (a.hasOwnProperty(name)) {
		throw "Property '"+name+"' uz existuje!";
	}

	return Object.defineProperty(a, name, descriptor);
}

function defineProperty(name, value, descriptor) {

	if ($.isFunction(value)) {
		throw "Pokus o vytvorenie property typu function v a! Pouzite Define.module.";
	}
	if(!/^[a-z]/.test(''+name)) {
		throw "Nazov property ("+name+") v a musi zacinat s malym pismenom!";
	}

	return _defineProperty.apply(null, arguments);
}

function defineClass(name, func) {

	if (!$.isFunction(func)) {
		throw "Parameter 'func' musi byt typu function!";
	}
	if (!/^[A-Z]/.test(''+name)) {
		throw "Nazov triedy ("+name+") musi zacinat s velkym pismenom!";
	}

	var clas = func('a'+name, $);

	if (!$.isFunction(clas)) {
		throw "Navratova hodnota funkce predanej ako parameter 'func' musi byt typu function!";
	}

	return _defineProperty(name, clas);
}

function defineModule(name, func) {

	if (!$.isFunction(func)) {
		throw "Parameter 'func' musi byt typu function!";
	}
	if (!/^[A-Z]/.test(''+name)) {
		throw "Nazov modulu ("+name+") musi zacinat s velkym pismenom!";
	}

	var module = func('a'+name, $);

	if (!$.isPlainObject(module)) {
		throw "Navratova hodnota funkce parametru func musi byt typu object!";
	}

	return _defineProperty(name, module);
}

defineModule('Define', function() {
	return {
		property:	defineProperty,
		'class':	defineClass,
		module:		defineModule,
	};
});

Object.defineProperty(window, 'a', $.extend(default_descriptor, { value: a }));

})(window, jQuery);

a.Define.module('Audiogram', function(ns, $){
	return {
		
	};
});

$(document).foundation();

var c = document.getElementById("audiogram"); // 840, 594
var ctx = c.getContext("2d");
ctx.moveTo(1,1);
ctx.lineTo(1, 593);
ctx.lineTo(839, 593);
ctx.lineTo(839, 1);
ctx.lineTo(1, 1);
ctx.stroke();

var pdf = new jsPDF();
var width = pdf.internal.pageSize.width;    
var height = pdf.internal.pageSize.height;
console.log(width, height / 2);
pdf.addImage(c.toDataURL("image/png"),"PNG", 0, 0, width, height / 2);
pdf.save("test.pdf");
