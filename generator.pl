#!/usr/bin/perl

my $udaje_form = <<EOF;
<div class="reveal" id="udaje_form" data-reveal>
 	<h4>Údaje:</h4>
	<div class="row">
		<div class="column small-12 medium-6">
			<label>Meno
				<input type="text" class="meno">
			</label>
		</div>
		<div class="column small-12 medium-6">
			<label>Rodné číslo
				<input type="text" class="rodne_cislo">
			</label>
		</div>
	</div>
	<div class="row">
		<div class="column small-12 medium-6">
			<label>Zdravotná poisťovňa
				<input type="text" class="zp">
			</label>
		</div>
		<div class="column small-12 medium-6">
			<label>Dátum a čas vyšetrenia
				<input type="text" class="datum">
			</label>
		</div>
	</div>
	<div class="row">
		<div class="column small-12 medium-6">
			<label>Pracovisko
				<input type="text" class="pracovisko">
			</label>
		</div>
		<div class="column small-12 medium-6">
			<label>Vyšetril(a)
				<input type="text" class="vysetril">
			</label>
		</div>
	</div>
	<div class="row">
		<div class="column small-12">
			<label>Tinnitus
				<textarea class="tinnitus" rows="4"></textarea>
			</label>
		</div>
	</div>
	<div class="row">
		<div class="column small-12">
			<label>Zapnúť text pod <input type="checkbox" name="enable_text_pod"/></label>
			<label>Text pod
				<textarea class="text" rows="4">Informovaný súhlas

Ja, dolupodpísaný pacient (prípadne zákonný zástupca pacienta) prehlasujem, že mi bolo ošetrujúcim zdravotníckym pracovníkom poskytnuté poučenie v zmysle §6 zákona č. 576/2004 o zdravotnej starostlivosti, službách súvisiacich s poskytovaním zdravotnej starostlivosti a o zmene a doplnení niektorých zákonov v platnom znení. Ošetrujúci zdravotnícky pracovník ma informoval o účele, povahe, následkoch a rizikách poskytnutia zdravotnej starostlivosti, o možnostiach voľby navrhovaných postupov a rizikách odmietnutia poskytnutia zdravotnej starostlivosti. Ošetrujúci zdravotnícky pracovník mi poskytol poučenie zrozumiteľne, ohľaduplne, bez nátlaku, s možnosťou a dostatočným časom slobodne sa rozhodnúť pre informovaný súhlas a primerane mojej rozumovej a vôľovej vyspelosti a môjmu zdravotnému stavu. Bol som poučený o ďalšom postupe a nakladaní s  výsledkom vyšetrenia sluchu, s ktorým  sa mám hlásiť u lekára, ktorý ma na vyšetrenie sluchu odoslal.
Svojím podpisom potvrdzujem, že  mi bol vydaný výsledok vyšetrenia sluchu: audiogram, tympanogram.


Podpis pacienta ........................</textarea>
			</label>
		</div>
	</div>

	<div class="row align-right">
		<div class="column shrink">
			<input type="button" class="button uloz" value="Uložiť">
		</div>
	</div>
</div>
EOF

my $textovy_audiogram_reveal = <<EOF;
<div class="reveal large" id="textovy_audiogram" data-reveal>
 	<h4>Textový audiogram:</h4>
	<div class="row">
		<div class="column small-12">
		        <textarea class="textovy_audiogram"></textarea>
		        <button class="button copy float-right">Skopírovať</button>
		</div>
	</div>

</div>
EOF

my $body = <<EOF;
<div class="sticky_menu">
	<div class="row">
		<div class="column">
			<ul class="dropdown menu" data-dropdown-menu>
				<li class="menu-text">Audiogram</li>
				<li>
					<a href="#">Súbor</a>
					<ul class="menu vertical">
						<li><a href="#" class="novy_audiogram">Nový</a></li>
						<li><a href="#" class="ulozit_audiogram">Uložiť</a></li>
						<li><a href="#" class="tlac">Tlačiť</a></li>
					</ul>
				</li>
				<li>
					<a href="#">Upraviť</a>
					<ul class="menu vertical">
						<li><a href="#" class="spat disabled">&#8617; Späť</a></li>
						<li><a href="#" data-open="udaje_form">Údaje</a></li>
						<li><a href="#" data-open="textovy_audiogram">Textový audiogram</a></li>
					</ul>
				</li>
				<li>
					<a href="#">Pomoc</a>
					<ul class="menu vertical">
						<li><a href="#" data-open="o_programe">O programe</a></li>
					</ul>
				</li>

			</ul>
		</div>
	</div>
</div>
<div class="row page_row">
	<div class="column">
		<div class="page">
			<canvas id="audiogram" width="1680" height="2376"></canvas>
		</div>
	</div>
</div>
$udaje_form
$textovy_audiogram_reveal
<div class="reveal" id="o_programe" data-reveal>
	<div class="row">
		<div class="column" style="text-align: center;">
			<p>Vytvoril:
			<a href="mailto:michalmiklos47\@gmail.com">Michal Mikloš</a>, 2017</p>
			<p><a href="https://github.com/xmiklos/audiogram">Github</a></p>
		</div>
	</div>
</div>
EOF

my $html = <<EOF;
<!doctype html>
<html class="no-js" lang="sk">
<head>
	<meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Audiogram</title>
	<link rel="stylesheet" href="css/foundation.css">
	<link rel="stylesheet" href="css/app.css">
	<link rel="stylesheet" href="css/print.css" media="print">
</head>
<body>
	<div id="app_content">
		$body
	</div>
	<script src="js/vendor/jquery.js"></script>
	<script src="js/vendor/foundation.js"></script>
	<script src="js/vendor/jspdf.debug.js"></script>
	<script src="js/defaults.js"></script>
	<script src="js/app.js"></script>
</body>
</html>
EOF

print $html;
