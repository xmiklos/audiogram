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
	
	var canvas = document.getElementById("audiogram"); // 840, 594
	var ctx = canvas.getContext("2d");
	var table_x = 50;
	var table_y = 100;
	var size = 35;
	var font_size = 12;
	var khz = [60, 125, 250, 500, 1000, 2000, 4000, 8000, 12000];
	
	return {
		drawLayout: function() {
			
			ctx.lineWidth=3;
			ctx.moveTo(table_x, table_y);
			ctx.lineTo(table_x, table_y + 12 * size);
			ctx.lineTo(table_x + 8 * size * 2, table_y + 12 * size);
			ctx.lineTo(table_x + 8 * size * 2, table_y);
			ctx.lineTo(table_x, table_y);
			ctx.stroke();
			
			for (var i = 1; i < 12; ++i) {
				ctx.beginPath();
				ctx.lineWidth=1;
				ctx.moveTo(table_x, table_y + size * i);
				ctx.lineTo(table_x + 8 * size * 2, table_y + size * i);
				ctx.stroke();
			}
			
			for (var i = 1; i < 8; ++i) {
				ctx.beginPath();
				ctx.lineWidth=2.5;
				ctx.moveTo(table_x + 2*size * i, table_y);
				ctx.lineTo(table_x + 2*size * i, table_y + size * 12);
				ctx.stroke();
			}
			
			ctx.font= font_size+"px Arial";
			ctx.textBaseline="middle";
			
			for (var i = -10, j = 0; i <= 100 ; i+=10, j++) {
				var txt = ''+i;
				ctx.fillText(txt, table_x - 10 - ctx.measureText(txt).width, table_y + size * j + (size / 2));
				ctx.fillText(txt, table_x + 8 * 2 * size + 25 - ctx.measureText(txt).width, table_y + size * j + (size / 2));
			}
			
			ctx.textBaseline="bottom";
			for (j = 0; j < khz.length ; j++) {
				var txt = ''+khz[j];
				ctx.fillText(txt, table_x + j * size * 2 - ctx.measureText(txt).width / 2, table_y - 5);
			}
			
			ctx.save();
		},
		reDraw: function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			this.drawLayout();
			for (var i = 1; i < khz.length - 1; ++i) {
				var db = $('#vv_'+khz[i]+'_input').val();
				_drawX(table_x + i + 2 * size, table_y + size + (db/10)*size);
			}
		},
	};
	
	function _drawX(x, y) {
		ctx.beginPath();
		ctx.lineWidth=1;
		ctx.moveTo(x - 10, y - 10);
		ctx.lineTo(x + 10, y + 10);
		ctx.moveTo(x - 10, y + 10);
		ctx.lineTo(x + 10, y - 10);
		ctx.stroke();
	}
});

$(document).foundation();

$('.input_show').change(function(){ 
	a.Audiogram.reDraw();
});

$('.slider').on('moved.zf.slider', function(e) {
	var $target = $(e.target);
	$('#'+$target.attr('id')+'_input').val(100 - $target.find('input').val()).trigger('change'); 
});


a.Audiogram.drawLayout();



/*
var pdf = new jsPDF();
var width = pdf.internal.pageSize.width;    
var height = pdf.internal.pageSize.height;
console.log(width, height / 2);
pdf.addImage(c.toDataURL("image/png"),"PNG", 0, 0, width, height / 2);
pdf.save("test.pdf");
*/
