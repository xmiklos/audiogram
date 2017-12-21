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

a.Define.module('Data', function(ns, $){

	var data_names = ['meno', 'rodne_cislo', 'zp', 'datum', 'pracovisko', 'tinnitus', 'vysetril', 'text'];
	var data = {};

	return {
		new: function(){
			data = {};
			this.load();
		},
		save: function(){
			data = {};
			for (var i = 0; i < data_names.length; ++i) {
				var name = data_names[i];
				var val = $('.'+name).val();
				if (val) {
					data[name] = val;
				}
			}
		},
		load: function() {

			if (!data['text']) {
				
				data['text'] = $('.text').text();
			}

			if (!data['datum']) {
				data['datum'] = _time();
			}

			for (var i = 0; i < data_names.length; ++i) {
				var name = data_names[i];
				var val = data[name] || defaults[name] || '';
				$('.'+name).val(val);
			}
		},
		get: function(key) {
			return data[key] || '';
		},
	};

	function _time() {
		var d = new Date();
		return ("0" + d.getDate()).slice(-2) + ". " + ("0"+(d.getMonth()+1)).slice(-2) + ". " + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
	}

});

a.Define.class('Audiogram', function(ns, $){
	
	var canvas = document.getElementById("audiogram"); // 840, 594
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var size = 40;
	var font_size = 14;
	var khz	=	[60,	125,	250,	500,	1000,	2000,	4000,	8000,	12000];

	// fowler strata sluchu
	var db500 =	[
	//		 -10,	-5,	0,	5,	10,	15,	20,	25,	30,	35,	40,	45,	50
			 0,	0,	0,	0,	0.2,	0.5,	1.1,	1.8,	2.6,	3.7,	4.9,	6.3,	7.9,
	//		 55,	60,	65,	70,	75,	80,	85,	90,	95,	100,	105,
			 9.6,	11.3,	12.8,	13.8,	14.6,	14.8,	14.9,	15,	15,	15,	15,
	];

	var db1000 =	[
	//		 -10,	-5,	0,	5,	10,	15,	20,	25,	30,	35,	40,	45,	50
			 0,	0,	0,	0,	0.3,	0.9,	2.1,	3.6,	5.4,	7.7,	10.2,	13.0,	15.7,
	//		 55,	60,	65,	70,	75,	80,	85,	90,	95,	100,	105,
			 19.0,	21.5,	23.5,	25.5,	27.2,	28.8,	29.8,	29.9,	30.0,	30.0,	30.0,
	];

	var db2000 =	[
	//		 -10,	-5,	0,	5,	10,	15,	20,	25,	30,	35,	40,	45,	50
			 0,	0,	0,	0,	0.4,	1.3,	2.9,	4.9,	7.2,	9.8,	12.9,	17.3,	22.4,
	//		 55,	60,	65,	70,	75,	80,	85,	90,	95,	100,	105,
			 25.7,	28.0,	30.2,	32.2,	34.0,	35.8,	37.5,	39.2,	40.0,	40.0,	40.0,
	];

	var db4000 =	[
	//		 -10,	-5,	0,	5,	10,	15,	20,	25,	30,	35,	40,	45,	50
			 0,	0,	0,	0,	0.1,	0.3,	0.9,	1.7,	2.7,	3.8,	5.0,	6.4,	8.0,
	//		 55,	60,	65,	70,	75,	80,	85,	90,	95,	100,	105,
			 9.7,	11.2,	12.5,	13.5,	14.2,	14.6,	14.8,	14.9,	15,	15,	15,
	];

	var loss_left;
	var loss_right;
	var loss;

	var left;
	var right;

	function Audiogram(x, y, label) {
		this.table_x = x;
		this.table_y = y;
		this.label = label;

		this.ear	= [];
		this.bone	= [];
	}

	Audiogram.change = false;

	Audiogram.prototype = {
		drawLayout: function() {
			this.x_positions = [];
			this.y_positions = [];

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

			for (var i = 0; i < 24; ++i) {
				this.y_positions.push(this.table_y + (size/2) * i);
			}

			for (var i = 1; i < 8; ++i) {
				ctx.beginPath();
				ctx.lineWidth=2.5;
				ctx.moveTo(this.table_x + 2*size * i, this.table_y);
				ctx.lineTo(this.table_x + 2*size * i, this.table_y + size * 12);
				ctx.stroke();
				ctx.closePath();

				this.x_positions.push(this.table_x + 2*size * i);
			}

			ctx.font = font_size+"px Arial";
			ctx.textBaseline="middle";
			
			for (var i = -10, j = 0; i <= 100 ; i+=10, j++) {
				var txt = ''+i;
				ctx.fillText(txt, this.table_x - 10 - ctx.measureText(txt).width, this.table_y + size * j);
				ctx.fillText(txt, this.table_x + 8 * 2 * size + 25 - ctx.measureText(txt).width, this.table_y + size * j);
			}
			
			ctx.textBaseline="bottom";
			for (j = 0; j < khz.length ; j++) {
				var txt = ''+khz[j];
				var x = Math.min(this.table_x + j * size * 2 - ctx.measureText(txt).width / 2, this.table_x + (khz.length-1) * size * 2 - ctx.measureText(txt).width);
				ctx.fillText(txt, x, this.table_y - 5);
			}
			
			ctx.font = "bold 18px Arial";
			ctx.fillText(this.label, this.table_x, this.table_y - 30);
			ctx.font = "14px Arial";
			ctx.fillText("[Hz]", this.table_x + 8*2*size - ctx.measureText("[Hz]").width, this.table_y - 30);
			ctx.fillText("[dB]", this.table_x - 10 - ctx.measureText("[dB]").width, this.table_y + 12*size);

			//console.log('x:', this.x_positions, 'y:', this.y_positions);
		},
		draw: function(ear, bone) {
			ctx.restore();
			this.drawLayout();
			ctx.save();
			var line = false;

			// ear
			for (var i = 1; i < khz.length - 1; ++i) {
				if (this.ear[i - 1] !== null) {
					var y = this.table_y + this.ear[i - 1] * (size / 2);
					var x = this.table_x + i * 2 * size;
				
					if (line) { // end path from prev iteration
						ctx.lineTo(x - 10, y + 1);
						ctx.stroke();
						ctx.closePath();
					}

					Audiogram[ear](x, y);

					line = i + 1 < khz.length - 1 && this.ear[i] != null; // is there line to next?

					if (line) {
						ctx.beginPath();
						ctx.lineWidth=2;
						ctx.moveTo(x + 10, y + 1);
					}
				}
			}

			line = false;
			for (var i = 1; i < khz.length - 1; ++i) {
				if (this.bone[i - 1] !== null) {
					var y = this.table_y + this.bone[i - 1] * (size / 2);
					var x = this.table_x + i * 2 * size;
				
					if (line) { // end path from prev iteration
						ctx.lineTo(x - 10, y - 3);
						ctx.setLineDash([15, 5]);
						ctx.stroke();
						ctx.closePath();
					}

					ctx.setLineDash([]);
					Audiogram[bone](x, y);

					line = i + 1 < khz.length - 1 && this.bone[i] != null; // is there line to next?

					if (line) {
						ctx.beginPath();
						ctx.lineWidth=2;
						ctx.moveTo(x + 10, y - 3);
					}
				}
			}


		}
	};

	function _file_name() {
		var d = new Date();
		var meno = a.Data.get('meno').split(/\s+/g).reverse().join('_');
		return meno + "_" + d.getFullYear() + "_" + ("0"+(d.getMonth()+1)).slice(-2) + "_" + ("0" + d.getDate()).slice(-2) + ".pdf"
	
	}

	Audiogram.downloadPDF = function() {
		var pdf = new jsPDF();
		var width = pdf.internal.pageSize.width;    
		var height = pdf.internal.pageSize.height;
		pdf.addImage(canvas.toDataURL("image/jpeg", 1), "JPEG", 0, 0, width, height);
		pdf.save(_file_name());
		Audiogram.change = false;
	};

	Audiogram.clearCanvas = function() {
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		Audiogram.drawLegend();
	};

	Audiogram.drawLegend = function() {
		var save_tbl = ctx.textBaseline;
		var x = 130;
		ctx.fillStyle = "black";
		ctx.font = "bold 44px sans-serif";
		ctx.fillText("Audiogram", x, 100);

		ctx.font = "25px sans-serif";
		var meno = "Meno:";
		var rc   = "Rodné číslo:";
		var zp	 = "Poisťovňa:";
		var udaje_x = Math.max(ctx.measureText(meno).width, ctx.measureText(rc).width, ctx.measureText(zp).width) + 10;
		ctx.fillText(meno, x, 140);
		ctx.font = "bold 30px sans-serif";
		ctx.fillText(a.Data.get('meno'), x + ctx.measureText(meno).width + 5, 140);
		ctx.font = "25px sans-serif";

		ctx.fillText(rc, 900, 140);
		ctx.fillText(a.Data.get('rodne_cislo'), 900 + udaje_x, 140);

		ctx.fillText(zp, 1300, 140);
		ctx.fillText(a.Data.get('zp'), 1300 + udaje_x, 140);

		ctx.textBaseline="bottom";
		var pracovisko = a.Data.get('pracovisko');
		ctx.fillText(pracovisko, canvas.width - 130 - ctx.measureText(pracovisko).width, 81);

		var datum = a.Data.get('datum');
		ctx.fillText(datum, canvas.width - 130 - ctx.measureText(datum).width, 110);
		ctx.textBaseline = save_tbl;

		ctx.font = "18px sans-serif";
		ctx.fillText("Vedenie: vzduchom (O, X), kosťou ([, ])", 900, 200 + 12.5*size);

		Audiogram.calculateHearingLoss();
		ctx.font = "25px sans-serif";
		var ssv = loss_left.toFixed(2)+" %";
		var ssp = loss_right.toFixed(2)+" %";
		var css = loss.toFixed(2)+" %";
		var labels = ["Strata sluchu vľavo:", "Strata sluchu vpravo:", "Celková strata sluchu:"];
		var perc_x = Math.max(ctx.measureText(labels[0]).width, ctx.measureText(labels[1]).width, ctx.measureText(labels[2]).width) + 10;
		ctx.fillText("Strata sluchu vľavo:", x, 200 + 13*size);
		ctx.fillText(ssv, x + perc_x, 200 + 13*size);
		ctx.fillText("Strata sluchu vpravo:", x, 200 + 13.8 * size);
		ctx.fillText(ssp, x + perc_x, 200 + 13.8*size);
		ctx.fillText("Celková strata sluchu:", x, 200 + 14.6*size);
		ctx.fillText(css, x + perc_x, 200 + 14.6*size);

		var y = ctx.wrapText("Tinnitus: "+a.Data.get('tinnitus'), x + perc_x + 200, 200 + 13.2 *size, canvas.width - 130 - (x + perc_x + 200), 29);

		ctx.fillText("Vyšetril(a): "+a.Data.get('vysetril'), x + perc_x + 200, y + 10);

		ctx.font = "20px sans-serif";
		ctx.wrapText(a.Data.get('text'), x, y +65, canvas.width - 260, 24);
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

	};

	Audiogram._drawO = function(x, y) {
		ctx.font = ""+(font_size+10)+"px Arial";
		ctx.textBaseline = "middle";
		var txt = "O";
		ctx.fillText(txt, x - ctx.measureText(txt).width / 2, y);
	};
	Audiogram._drawLS = function(x, y) {
		ctx.beginPath();
		ctx.lineWidth=2;
		var c = 7;
		ctx.moveTo(x + c, y - c -4);
		ctx.lineTo(x - c, y - c -4);
		ctx.lineTo(x - c, y + c*2-4);
		ctx.lineTo(x + c, y + c*2-4);
		ctx.stroke();
		ctx.closePath();
	};
	Audiogram._drawRS = function(x, y) {
		ctx.beginPath();
		ctx.lineWidth=2;
		var c = 7;
		ctx.moveTo(x - c, y - c -4);
		ctx.lineTo(x + c, y - c -4);
		ctx.lineTo(x + c, y + c*2-4);
		ctx.lineTo(x - c, y + c*2-4);
		ctx.stroke();
		ctx.closePath();
	};

	Audiogram.new = function(){
		a.Data.new();
		right	= new a.Audiogram(130, 200, "Vpravo");
		left	= new a.Audiogram(900, 200, "Vľavo");
		Audiogram.reDraw();
		_reset_history();
		Audiogram.change = false;
	};

	Audiogram.reDraw = function() {
		Audiogram.clearCanvas();
		right.draw('_drawO', '_drawLS');
		left.draw('_drawX', '_drawRS');
	};

	Audiogram.calculateHearingLoss = function() {
		loss_left	= db500[ _left_i(2) ] + db1000[ _left_i(3) ] + db2000[ _left_i(4) ] + db4000[ _left_i(5) ];
		loss_right	= db500[ _right_i(2) ] + db1000[ _right_i(3) ] + db2000[ _right_i(4) ] + db4000[ _right_i(5) ];

		var min	= Math.min(loss_left, loss_right);
		var max	= Math.max(loss_left, loss_right);

		loss = ((max - min) / 4) + min;

//		console.log(loss_left, loss_right, loss);
	};

	function _left_i(freq_i) {
		var val = left.ear[freq_i];
		return val != null ? val : db500.length-1;
	}

	function _right_i(freq_i) {
		var val = right.ear[freq_i];
		return val != null ? val : db500.length-1;
	}

	Audiogram.canvasClick = function(e) {
		var rect = canvas.getBoundingClientRect();
		var scale_x = canvas.width / $('#audiogram').width();
		var scale_y = canvas.height / $('#audiogram').height();
		var left_click = e.which === 1;

		/* this will get canvas scaled coords */
		var x = (e.clientX - rect.left) * scale_x;
		var y = (e.clientY - rect.top) * scale_y;

		//console.log(x, y);

		var table_y = 200;

		if (y < table_y) { // pred audiogramom
			$('#udaje_form').foundation('open');
		} else if ( y >= table_y && y <= table_y + 12 * size) { // audiogram

			if (x > canvas.width / 2) { // vlavo
				var	i_x = _get_nearest_x_index(left, x),
					i_y = _get_nearest_y_index(left, y);
				if (i_x != null && i_y != null) {
					_save_history();
//					console.log('indexes: ', i_x, i_y);

					if (left_click) { // ear
						if (left.ear[i_x] != null && left.ear[i_x] == i_y) {
							left.ear[i_x] = null;
						} else {
							left.ear[i_x] = i_y;
						}
					} else { // bone
						if (left.bone[i_x] != null && left.bone[i_x] == i_y) {
							left.bone[i_x] = null;
						} else {
							left.bone[i_x] = i_y;
						}
					}

//					console.log(left.ear, left.bone);
					Audiogram.reDraw();
				}
			} else { // vpravo
				var	i_x = _get_nearest_x_index(right, x),
					i_y = _get_nearest_y_index(right, y);
				if (i_x != null && i_y != null) {
					_save_history();
//					console.log('indexes: ', i_x, i_y);

					if (left_click) { // ear
						if (right.ear[i_x] != null && right.ear[i_x] == i_y) {
							right.ear[i_x] = null;
						} else {
							right.ear[i_x] = i_y;
						}
					} else { // bone
						if (right.bone[i_x] != null && right.bone[i_x] == i_y) {
							right.bone[i_x] = null;
						} else {
							right.bone[i_x] = i_y;
						}
					}

//					console.log(right.ear, right.bone);
					Audiogram.reDraw();

				}

			}

		} else { // za audiogramom
			$('#udaje_form').foundation('open');
		}
		return false;
	};

	var history = [];

	function _reset_history() {
		history.length = 0;
		$('.spat').addClass('disabled');
	}

	function _save_history() {
		history.push({
			le: left.ear.slice(),
			lb: left.bone.slice(),
			re: right.ear.slice(),
			rb: right.bone.slice(),
		});

		$('.spat').removeClass('disabled');
		Audiogram.change = true;
	}

	Audiogram.load_history = function() {
		var h = history.pop();
		if (h) {
			left.ear	= h.le;
			left.bone	= h.lb;
			right.ear	= h.re;
			right.bone	= h.rb;
			Audiogram.reDraw();
		}

		if (!history.length) {
			$('.spat').addClass('disabled');
		}
	}

	function _get_nearest_x_index(instance, val) {
		var min_i	= 0,
		    min_val	= Math.abs(val - instance.x_positions[0]);

		for (var i = 0; i < instance.x_positions.length; ++i) {
			var diff = Math.abs(val - instance.x_positions[i]);

			if (diff < min_val) {
				min_val = diff;
				min_i   = i;
			}
		}

		if (min_val > size) {
			return null;
		}

		return min_i;
	}

	function _get_nearest_y_index(instance, val) {
		var min_i	= 0,
		    min_val	= Math.abs(val - instance.y_positions[0]);

		for (var i = 0; i < instance.y_positions.length; ++i) {
			var diff = Math.abs(val - instance.y_positions[i]);

			if (diff < min_val) {
				min_val = diff;
				min_i   = i;
			}
		}

		if (min_val > size) {
			return null;
		}

		return min_i;
	}


	return Audiogram;
});

CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {

    var lines = text.split("\n");

    for (var i = 0; i < lines.length; i++) {

        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        this.fillText(line, x, y);
        y += lineHeight;
    }

    return y;
}
$(document).foundation();

$(document).on('open.zf.reveal', '#udaje_form', function(){
	a.Data.load();
});

$(document).on('click', '#udaje_form .uloz', function(){
	a.Data.save();
	$('#udaje_form').foundation('close');
	a.Audiogram.reDraw();
	a.Audiogram.change = true;
});

$(document).on('click', '.novy_audiogram', function(){

	if (a.Audiogram.change && !confirm('Máte neuložené zmeny! Chcete pokračovať?')) {
		return;
	}

	a.Audiogram.new();
	$('#udaje_form').foundation('open');
	return false;
});

$(document).on('click', '.ulozit_audiogram', function(){
	a.Audiogram.downloadPDF();
	return false;
});

$(document).on('click', '.spat', function(){
	a.Audiogram.load_history();
	return false;
});

$(document).on('click', '.tlac', function(){
	print();
});

$(document).on('click contextmenu', '#audiogram', a.Audiogram.canvasClick);

$('.novy_audiogram').trigger('click');

$(window).on('beforeunload', function(){
	if (a.Audiogram.change) {
		return true;
	}

      return;
});
