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

a.Define.class('Audiogram', function(ns, $){
	
	var canvas = document.getElementById("audiogram"); // 840, 594
	var ctx = canvas.getContext("2d");
	var size = 40;
	var font_size = 14;
	var khz = [60, 125, 250, 500, 1000, 2000, 4000, 8000, 12000];
	
	function Audiogram(x, y, prefixes, fncs) {
		this.table_x = x;
		this.table_y = y;	
		this.prefixes = prefixes;
		this.fncs = fncs;
	}
	
	Audiogram.prototype = {
		drawLayout: function() {

			ctx.beginPath();
			ctx.lineWidth=3;
			ctx.moveTo(this.table_x, this.table_y);
			ctx.lineTo(this.table_x, this.table_y + 12 * size);
			ctx.lineTo(this.table_x + 8 * size * 2, this.table_y + 12 * size);
			ctx.lineTo(this.table_x + 8 * size * 2, this.table_y);
			ctx.lineTo(this.table_x, this.table_y);
			ctx.stroke();
			ctx.closePath();
			
			for (var i = 1; i < 12; ++i) {
				ctx.beginPath();
				ctx.lineWidth=1.5;
				ctx.moveTo(this.table_x, this.table_y + size * i);
				ctx.lineTo(this.table_x + 8 * size * 2, this.table_y + size * i);
				ctx.stroke();
				ctx.closePath();
			}
			
			for (var i = 1; i < 8; ++i) {
				ctx.beginPath();
				ctx.lineWidth=2.5;
				ctx.moveTo(this.table_x + 2*size * i, this.table_y);
				ctx.lineTo(this.table_x + 2*size * i, this.table_y + size * 12);
				ctx.stroke();
				ctx.closePath();
			}
			
			ctx.font= font_size+"px Arial";
			ctx.textBaseline="middle";
			
			for (var i = -10, j = 0; i <= 100 ; i+=10, j++) {
				var txt = ''+i;
				ctx.fillText(txt, this.table_x - 10 - ctx.measureText(txt).width, this.table_y + size * j);
				ctx.fillText(txt, this.table_x + 8 * 2 * size + 25 - ctx.measureText(txt).width, this.table_y + size * j);
			}
			
			ctx.textBaseline="bottom";
			for (j = 0; j < khz.length ; j++) {
				var txt = ''+khz[j];
				ctx.fillText(txt, this.table_x + j * size * 2 - ctx.measureText(txt).width / 2, this.table_y - 5);
			}
		},
		reDraw: function() {
			ctx.restore();
			this.drawLayout();
			ctx.save();
			var line = false;
			
			for (var j = 0; j < this.prefixes.length; ++j) {
				var prefix = this.prefixes[j];
				
				if (j > 1) {
					ctx.setLineDash([7, 5]);
				}
				
				for (var i = 1; i < khz.length - 1; ++i) {
					var db = $('#'+prefix+khz[i]+'_input').val();
					var enabled = $('.'+prefix+khz[i]+'_en').is(':checked');
					if (enabled) {
						var x = this.table_x + i * 2 * size;
						var y = this.table_y + size + (db/10)*size;
					
						if (line) { // end path from prev iteration
							ctx.lineTo(x - 10, y - 3);
							ctx.stroke();
							ctx.closePath();
						}

						this.fncs[j](x, y);

						line = i + 1 < khz.length - 1 && $('.'+prefix+khz[i + 1]+'_en').is(':checked'); // is there line to next?

						if (line) {
							ctx.beginPath();
							ctx.lineWidth=2;
							ctx.moveTo(x + 10, y - 3);
						}
					}
				}
			}
		},
		clearLayout: function() {			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},
		downloadPDF: function() {
			var pdf = new jsPDF();
			var width = pdf.internal.pageSize.width;    
			var height = pdf.internal.pageSize.height;
			pdf.addImage(canvas.toDataURL("image/png"),"PNG", 0, 0, width, height / 2);
			pdf.save("test.pdf");
		},
	};
	
	Audiogram._drawX = function(x, y) {
	
		ctx.beginPath();
		ctx.lineWidth=2;
		var c = 7;
		ctx.moveTo(x - c, y - c);
		ctx.lineTo(x + c, y + c);
		ctx.moveTo(x - c, y + c);
		ctx.lineTo(x + c, y - c);
		ctx.stroke();
		ctx.closePath();
	/*
		ctx.font = ""+(font_size+10)+"px Arial";
		ctx.textBaseline = "middle";
		var txt = "x";
		ctx.fillText(txt, x - ctx.measureText(txt).width / 2, y);*/
	}
	
	Audiogram._drawO = function(x, y) {
		ctx.font = ""+(font_size+18)+"px Arial";
		ctx.textBaseline = "middle";
		var txt = "o";
		ctx.fillText(txt, x - ctx.measureText(txt).width / 2, y);
	}
	
	Audiogram._drawLS = function(x, y) {/*
		ctx.font = ""+(font_size+12)+"px Arial";
		ctx.textBaseline = "middle";
		var txt = "[";
		ctx.fillText(txt, x - ctx.measureText(txt).width - 2, y);*/
	}
	
	Audiogram._drawRS = function(x, y) {/*
		ctx.font = ""+(font_size+12)+"px Arial";
		ctx.textBaseline = "middle";
		var txt = "]";
		ctx.fillText(txt, x + 2, y);*/
		
		ctx.beginPath();
		ctx.lineWidth=2;
		var c = 7;
		ctx.moveTo(x - c, y - c -4);
		ctx.lineTo(x + c, y - c -4);
		ctx.lineTo(x + c, y + c*2-4);
		ctx.lineTo(x - c, y + c*2-4);
		ctx.stroke();
		ctx.closePath();
	}
	
	return Audiogram;
});

$(document).foundation();

var a1 = new a.Audiogram(50, 100, ['vv_', 'vk_'], [a.Audiogram._drawX, a.Audiogram._drawRS]);
var a2 = new a.Audiogram(800, 100, ['pv_','pk_'], [a.Audiogram._drawO, a.Audiogram._drawLS]);

$('.input_show, .khz_en').change(function(){
	a1.clearLayout();
	a1.reDraw();
	a2.reDraw();
});

$('.slider').on('moved.zf.slider', function(e) {
	var $target = $(e.target);
	$('#'+$target.attr('id')+'_input').val(100 - $target.find('input').val()).trigger('change'); 
});

a1.drawLayout();
a2.drawLayout();

$('button').click(function() {
	a1.downloadPDF();
});




