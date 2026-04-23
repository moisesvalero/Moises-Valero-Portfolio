<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	onMount(() => {
		const MARCHAS = {
			Llana: 'Llanero i President, Al Basora, Filà Llana',
			'Judíos': 'Éxodo, Jamalajam, Als Judios',
			'Domingo Miques': 'El moro del Sinc',
			Chano: 'A mons pares',
			Verdes: 'Moros Verdes',
			Magenta: "Marxa del Centenari, Uzul el M'Selmein, Jamalajam",
			'Cordón': 'Cordón 95, Tarde de Abril',
			Ligeros: 'Als Ligeros',
			'Mudéjares': 'El moro del Sinc, El Kàbila, Centenari Mudéjar',
			Abencerrajes: "Uzul el M'Selmein, Tarde de Abril",
			Marrakesch: 'Xavier el coixo',
			Realistes: 'Al-Wazir, El President, Jamalajam',
			Berberiscos: 'Als Berebers, Marxa del Centenari',
			Benimerines: 'Marxa Benimerins',
			Andaluces: 'Ragón Falez',
			Asturianos: 'Xirimiqui, El desitjat',
			Cides: 'Tino Herrera',
			Labradores: 'Pas als Maseros',
			Guzmanes: 'Monjos guerrers, Claus i corretges, Mai Sabel',
			Vascos: 'El conqueridor, Ix el cristià',
			'Mozárabes': 'Mozárabes y Alfarrasí',
			'Almogávares': 'Amogàvar i alcoià',
			Navarros: "L'ambaixador cristià",
			Tomasinas: 'Ramón Petit',
			Muntanyesos: 'Alcoi escata i destral, Muntanya de ferro, Muntanyés i festa',
			Cruzados: 'Als creuats',
			Alcodianos: 'Bonus Christianus, Signum, Lácrima',
			Aragonesos: "Aragonesos 99, L'aragonés Perfecte, Aragonesos més que mai"
		};

		const MOROS = [
			'Llana',
			'Judíos',
			'Domingo Miques',
			'Chano',
			'Verdes',
			'Magenta',
			'Cordón',
			'Ligeros',
			'Mudéjares',
			'Abencerrajes',
			'Marrakesch',
			'Realistes',
			'Berberiscos',
			'Benimerines'
		];
		const CRIST = [
			'Andaluces',
			'Asturianos',
			'Cides',
			'Labradores',
			'Guzmanes',
			'Vascos',
			'Mozárabes',
			'Almogávares',
			'Navarros',
			'Tomasinas',
			'Muntanyesos',
			'Cruzados',
			'Alcodianos',
			'Aragonesos'
		];

		function getMarchas(nombre) {
			const base = nombre
				.replace(/\s*\(.*?\)/g, '')
				.replace(/\s*(Capitán|Alférez|filà.*|filà del Mig|Sant Jordiet|Timbaleros.*|Embajador.*|Sargento.*|Mossèn.*)/gi, '')
				.trim();
			for (const k in MARCHAS) {
				if (base === k || base.indexOf(k) !== -1 || k.indexOf(base) !== -1) return MARCHAS[k];
			}
			return null;
		}

		const DIAS = [
			{
				id: 'd24',
				label: 'Vie 24',
				actos: [
					{
						hora: '19:00',
						nombre: 'Fiesta del Pasodoble',
						lugar: 'Av. País Valencià',
						nota: "Desfile de corporaciones musicales hasta la Plaça d'Espanya. A las 18:45h abren las colles de dolçainers. Fuegos artificiales al finalizar.",
						bandos: null
					},
					{
						hora: '21:30',
						nombre: "Nit de l'Olla",
						lugar: 'Font Redona',
						nota: 'Cena de festers y músicos en las filaes. Después desfilan de paisano.',
						bandos: null
					}
				]
			},
			{
				id: 'd25',
				label: 'Sáb 25 — Entradas',
				actos: [
					{ hora: '05:00', nombre: 'Missa del Fester', lugar: 'Parroquia de Santa María', nota: '', bandos: null },
					{
						hora: '05:45',
						nombre: 'Diana',
						lugar: "Plaça d'Espanya",
						nota: 'Primera filà arranca a las 5:50h. Última sobre las 7:45h.',
						bandos: {
							crist: [
								'Sargento Cristiano',
								'Andaluces (Capitán)',
								'Cides',
								'Labradores',
								'Guzmanes',
								'Vascos',
								'Mozárabes',
								'Almogávares',
								'Asturianos (Alférez)',
								'Navarros',
								'Tomasinas',
								'Muntanyesos',
								'Cruzados',
								'Alcodianos',
								'Aragonesos'
							],
							moro: [
								'Sargento Moro',
								'Marrakesch (Capitán)',
								'Llana',
								'Judíos',
								'Domingo Miques',
								'Chano',
								'Verdes',
								'Magenta',
								'Realistes (Alférez)',
								'Cordón',
								'Ligeros',
								'Mudéjares',
								'Abencerrajes',
								'Berberiscos',
								'Benimerines'
							]
						}
					},
					{
						hora: '10:30',
						nombre: 'Entrada de Cristianos',
						lugar: 'El Partidor',
						nota: "El Capitán llega a la Plaça sobre las 11:15h y recibe las llaves de la Villa.",
						bandos: {
							crist: [
								'Timbaleros y clarines',
								'Sargento Cristiano',
								'Capitán Cristiano',
								'Andaluces (Capitán)',
								'Aragonesos',
								'Alcodianos',
								'Cruzados',
								'Muntanyesos',
								'Tomasinas',
								'Navarros',
								'Almogávares (filà del Mig)',
								'Mozárabes',
								'Vascos',
								'Guzmanes',
								'Labradores',
								'Cides',
								'Embajador y Abanderado',
								'Alférez Cristiano',
								'Mossèn Torregrosa',
								'Asturianos (Alférez)'
							],
							moro: null
						}
					},
					{
						hora: '17:00',
						nombre: 'Entrada de Moros',
						lugar: 'El Partidor',
						nota: "El Capitán llega a la Plaça sobre las 17:45h.",
						bandos: {
							crist: null,
							moro: [
								'Timbaleros y clarines',
								'Sargento Moro',
								'Capitán Moro',
								'Marrakesch (Capitán)',
								'Abencerrajes',
								'Mudéjares',
								'Ligeros',
								'Cordón',
								'Magenta',
								'Verdes (filà del Mig)',
								'Chano',
								'Domingo Miques',
								'Judíos',
								'Llana',
								'Benimerines',
								'Berberiscos',
								'Embajador y Abanderado',
								'Alférez Moro',
								'Realistes (Alférez)'
							]
						}
					}
				]
			},
			{
				id: 'd26',
				label: 'Dom 26 — Sant Jordi',
				actos: [
					{
						hora: '08:30',
						nombre: 'Segunda Diana',
						lugar: 'Av. País Valencià / Font Redona',
						nota: 'Especial participación de la niñez festera. Hasta las 10:30h.',
						bandos: {
							crist: [
								'Andaluces (Capitán)',
								'Asturianos (Alférez)',
								'Cides',
								'Labradores',
								'Guzmanes',
								'Vascos',
								'Mozárabes',
								'Almogávares',
								'Navarros',
								'Tomasinas',
								'Muntanyesos',
								'Cruzados',
								'Alcodianos',
								'Aragonesos'
							],
							moro: [
								'Llana (filà Sant Jordiet)',
								'Marrakesch (Capitán)',
								'Realistes (Alférez)',
								'Benimerines',
								'Domingo Miques',
								'Magenta',
								'Judíos',
								'Chano',
								'Verdes',
								'Cordón',
								'Ligeros',
								'Mudéjares',
								'Abencerrajes',
								'Berberiscos'
							]
						}
					},
					{
						hora: '11:00',
						nombre: 'Procesión de la Reliquia',
						lugar: 'Iglesia de San Jorge',
						nota: 'Traslado hasta Santa María. Finaliza sobre las 12:00h. Seguidamente Solemne Misa Mayor.',
						bandos: null
					},
					{ hora: '14:00', nombre: 'Mascletà', lugar: "Plaça d'Espanya", nota: '', bandos: null },
					{
						hora: '18:00',
						nombre: 'Diana Vespertina del Cavallet',
						lugar: 'Font Redona',
						nota: 'Filaes Realistes y Berberiscos como protagonistas.',
						bandos: null
					},
					{
						hora: '19:30',
						nombre: 'Procesión General',
						lugar: 'Placeta del Carbó',
						nota: 'Se devuelve la Reliquia a su templo. Termina sobre las 21:30h.',
						bandos: null
					},
					{
						hora: '23:30',
						nombre: 'Retreta',
						lugar: 'Cruce El Camí / Sant Mateu',
						nota: "Desfile informal de festers y músicos. Recorrido por Sant Nicolau, Plaça d'Espanya y Sant Tomàs.",
						bandos: null
					}
				]
			},
			{
				id: 'd27',
				label: 'Lun 27 — Alardo',
				actos: [
					{
						hora: '08:00',
						nombre: 'Contrabando',
						lugar: "Plaça d'Espanya",
						nota: 'Acto representado por las filaes Andaluces y Labradores.',
						bandos: null
					},
					{
						hora: '08:45',
						nombre: 'Guerrillas',
						lugar: 'Zona Centro',
						nota: 'Escaramuzas con arcabucería por diversas calles. Termina hacia las 9:45h.',
						bandos: null
					},
					{
						hora: '10:00',
						nombre: 'Estafeta y Embajada Mora',
						lugar: "Plaça d'Espanya",
						nota: 'El estafeta intima la rendición del castillo. A continuación el Embajador Moro realiza la embajada.',
						bandos: null
					},
					{
						hora: '11:00',
						nombre: 'Alardo de la mañana',
						lugar: "Plaça d'Espanya",
						nota: 'Los cristianos salen del castillo. Al final lucha con arma blanca y toma del castillo por los moros.',
						bandos: {
							crist: [
								'Capitán Cristiano',
								'Andaluces',
								'Cides',
								'Guzmanes',
								'Mozárabes',
								'Navarros',
								'Muntanyesos',
								'Alcodianos',
								'Alférez Cristiano',
								'Asturianos',
								'Labradores',
								'Vascos',
								'Almogávares',
								'Tomasinas',
								'Cruzados',
								'Aragonesos'
							],
							moro: [
								'Capitán Moro',
								'Marrakesch',
								'Llana',
								'Domingo Miques',
								'Verdes',
								'Cordón',
								'Mudéjares',
								'Berberiscos',
								'Alférez Moro',
								'Realistes',
								'Judíos',
								'Chano',
								'Magenta',
								'Ligeros',
								'Abencerrajes',
								'Benimerines'
							]
						}
					},
					{
						hora: '16:30',
						nombre: 'Estafeta y Embajada Cristiana',
						lugar: "Plaça d'Espanya",
						nota: 'Igual que la de la mañana pero con signo cristiano.',
						bandos: null
					},
					{
						hora: '17:30',
						nombre: 'Alardo de la tarde',
						lugar: "Plaça d'Espanya",
						nota: 'Los moros salen del castillo. Al final toma del castillo por los cristianos. Termina antes de las 20:00h.',
						bandos: {
							crist: [
								'Capitán Cristiano',
								'Andaluces',
								'Cides',
								'Guzmanes',
								'Mozárabes',
								'Navarros',
								'Muntanyesos',
								'Alcodianos',
								'Alférez Cristiano',
								'Asturianos',
								'Labradores',
								'Vascos',
								'Almogávares',
								'Tomasinas',
								'Cruzados',
								'Aragonesos'
							],
							moro: [
								'Capitán Moro',
								'Marrakesch',
								'Llana',
								'Domingo Miques',
								'Verdes',
								'Cordón',
								'Mudéjares',
								'Berberiscos',
								'Alférez Moro',
								'Realistes',
								'Judíos',
								'Chano',
								'Magenta',
								'Ligeros',
								'Abencerrajes',
								'Benimerines'
							]
						}
					},
					{
						hora: '21:30',
						nombre: 'Aparición de San Jorge',
						lugar: "Plaça d'Espanya",
						nota: 'San Jorge aparece sobre las almenas del castillo. Castillo de fuegos artificiales.',
						bandos: null
					},
					{
						hora: '22:00',
						nombre: 'Soparets',
						lugar: "Plaça d'Espanya",
						nota: 'Tradicional acto tras la salida del castillo del Sant Jordiet.',
						bandos: null
					}
				]
			},
			{ id: 'musica', label: 'Música', actos: null }
		];

		let diaActivo = DIAS[0].id;
		const diaMap = { d24: 5, d25: 6, d26: 0, d27: 1 };

		function getNowMin() {
			const n = new Date();
			return n.getHours() * 60 + n.getMinutes();
		}

		function horaMin(s) {
			const p = s.split(':');
			return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
		}

		function isToday(id) {
			return diaMap[id] === new Date().getDay();
		}

		function activoIdx(actos) {
			const cur = getNowMin();
			let last = -1;
			for (let i = 0; i < actos.length; i++) {
				if (horaMin(actos[i].hora) <= cur) last = i;
			}
			return last;
		}

		function notifyParentHeight() {
			const root = document.getElementById('mc-tracker');
			const doc = document.documentElement;
			const body = document.body;
			const rootHeight = root ? root.scrollHeight : 0;
			const pageHeight = Math.max(
				rootHeight,
				doc ? doc.scrollHeight : 0,
				body ? body.scrollHeight : 0,
				doc ? doc.offsetHeight : 0,
				body ? body.offsetHeight : 0
			);
			if (window.parent && window.parent !== window) {
				window.parent.postMessage({ type: 'mc-tracker-height', height: pageHeight }, '*');
			}
		}

		function toggle(head) {
			const body = head.nextElementSibling;
			const chev = head.querySelector('.chev');
			const o = body.classList.toggle('open');
			chev.classList.toggle('open', o);
			requestAnimationFrame(() => notifyParentHeight());
		}

		function toggleMarchas(btn) {
			const wrap = btn.closest('.fila-wrap');
			const m = wrap?.querySelector('.fila-marchas');
			if (!m) return;
			const o = m.style.display === 'block';
			m.style.display = o ? 'none' : 'block';
			btn.textContent = o ? 'marchas' : 'cerrar';
			requestAnimationFrame(() => notifyParentHeight());
		}

		window.toggle = toggle;
		window.toggleMarchas = toggleMarchas;

		function renderTabs() {
			const c = document.getElementById('mct-tabs');
			if (!c) return;
			c.innerHTML = '';
			DIAS.forEach((d) => {
				const b = document.createElement('button');
				let label = d.label;
				if (d.id !== 'musica' && isToday(d.id)) label += ' ●';
				b.textContent = label;
				if (d.id === diaActivo) b.classList.add('on');
				b.onclick = () => {
					diaActivo = d.id;
					render();
				};
				c.appendChild(b);
			});
		}

		function renderBandos(b) {
			if (!b) return '';
			let html = '<div class="bandos">';
			['crist', 'moro'].forEach((lado) => {
				if (b[lado]) {
					html += '<div class="bando ' + (lado === 'crist' ? 'bc' : 'bm') + '">';
					html += '<div class="bando-t">' + (lado === 'crist' ? 'Bando cristiano' : 'Bando moro') + '</div>';
					b[lado].forEach((f, i) => {
						const m = getMarchas(f);
						html += '<div class="fila-wrap">';
						html += '<div class="fila">';
						html += '<span class="fn">' + (i + 1) + '</span>';
						html += '<span class="fila-name">' + f + '</span>';
						if (m) html += '<button class="fila-btn" onclick="toggleMarchas(this)">marchas</button>';
						html += '</div>';
						if (m) html += '<div class="fila-marchas">🎵 ' + m + '</div>';
						html += '</div>';
					});
					html += '</div>';
				} else {
					html += '<div></div>';
				}
			});
			html += '</div>';
			return html;
		}

		function renderMusica() {
			const c = document.getElementById('mct-actos');
			const banner = document.getElementById('mct-banner');
			if (!c || !banner) return;
			banner.style.display = 'none';
			let html = '<div class="musica-section">';
			html += '<div class="musica-bando-t">Bando cristiano</div>';
			CRIST.forEach((f) => {
				const m = MARCHAS[f];
				html += '<div class="musica-fila">';
				html += '<div class="musica-fila-nombre">' + f + '</div>';
				html += m
					? '<div class="musica-fila-marchas">🎵 ' + m + '</div>'
					: '<div class="musica-fila-none">Sin marcha registrada</div>';
				html += '</div>';
			});
			html += '<div class="musica-bando-t">Bando moro</div>';
			MOROS.forEach((f) => {
				const m = MARCHAS[f];
				html += '<div class="musica-fila">';
				html += '<div class="musica-fila-nombre">' + f + '</div>';
				html += m
					? '<div class="musica-fila-marchas">🎵 ' + m + '</div>'
					: '<div class="musica-fila-none">Sin marcha registrada</div>';
				html += '</div>';
			});
			html += '</div>';
			c.innerHTML = html;
		}

		function renderActos() {
			const dia = DIAS.find((d) => d.id === diaActivo);
			if (!dia) return;
			if (dia.id === 'musica') {
				renderMusica();
				requestAnimationFrame(() => notifyParentHeight());
				return;
			}
			const c = document.getElementById('mct-actos');
			const banner = document.getElementById('mct-banner');
			if (!c || !banner) return;
			c.innerHTML = '';
			const hoy = isToday(diaActivo);
			const activo = hoy ? activoIdx(dia.actos) : -1;
			banner.style.display = hoy && activo >= 0 ? 'block' : 'none';
			if (hoy && activo >= 0) {
				banner.textContent = 'En directo ahora: ' + dia.actos[activo].nombre + ' · ' + dia.actos[activo].hora + 'h';
			}
			dia.actos.forEach((a, i) => {
				const isOpen = i === activo || (activo === -1 && i === 0);
				const div = document.createElement('div');
				div.className = 'acto';
				const livePill = hoy && i === activo ? '<span class="live-pill">EN DIRECTO</span>' : '';
				div.innerHTML =
					'<div class="acto-head" onclick="toggle(this)">' +
					livePill +
					'<span class="acto-hora">' +
					a.hora +
					'h</span>' +
					'<span class="acto-nombre">' +
					a.nombre +
					'</span>' +
					'<span class="acto-lugar">' +
					a.lugar +
					'</span>' +
					'<span class="chev' +
					(isOpen ? ' open' : '') +
					'">&#9654;</span>' +
					'</div>' +
					'<div class="acto-body' +
					(isOpen ? ' open' : '') +
					'">' +
					(a.nota ? '<p class="nota">' + a.nota + '</p>' : '') +
					renderBandos(a.bandos) +
					(a.bandos ? '<p class="aviso">⚠️ Orden orientativo según guión oficial. Los tiempos reales pueden variar.</p>' : '') +
					'</div>';
				c.appendChild(div);
			});
			requestAnimationFrame(() => notifyParentHeight());
		}

		function render() {
			renderTabs();
			renderActos();
		}

		render();

		const resizeObserver =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => notifyParentHeight()) : null;
		if (resizeObserver && document.body) {
			resizeObserver.observe(document.body);
		}

		window.addEventListener('load', notifyParentHeight);
		window.addEventListener('resize', notifyParentHeight);
		requestAnimationFrame(() => notifyParentHeight());
		setTimeout(() => notifyParentHeight(), 120);

		return () => {
			window.removeEventListener('load', notifyParentHeight);
			window.removeEventListener('resize', notifyParentHeight);
			if (resizeObserver) resizeObserver.disconnect();
			delete window.toggle;
			delete window.toggleMarchas;
		};
	});
</script>

<div id="mc-tracker">
	<div class="tabs" id="mct-tabs"></div>
	<div class="live-banner" id="mct-banner"></div>
	<div id="mct-actos"></div>
</div>

<style>
	:global(#mc-tracker *) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	:global(#mc-tracker) {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 15px;
		line-height: 1.5;
		background: #fff;
		padding: 1rem;
	}
	:global(#mc-tracker .tabs) {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	:global(#mc-tracker button) {
		font-family: inherit;
		font-size: 13px;
		padding: 6px 14px;
		border: 1px solid #ccc;
		border-radius: 8px;
		cursor: pointer;
		background: #fff;
		color: #555;
		transition: all 0.15s;
	}
	:global(#mc-tracker button.on) {
		background: #111;
		color: #fff;
		border-color: #111;
	}
	:global(#mc-tracker .live-banner) {
		background: #fff0f0;
		border: 1px solid #fca5a5;
		border-radius: 8px;
		padding: 10px 14px;
		margin-bottom: 12px;
		font-size: 13px;
		color: #b91c1c;
		font-weight: 500;
		display: none;
	}
	:global(#mc-tracker .acto) {
		border: 1px solid #e5e5e5;
		border-radius: 10px;
		margin-bottom: 8px;
		overflow: hidden;
	}
	:global(#mc-tracker .acto-head) {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 15px;
		cursor: pointer;
		background: #fff;
		user-select: none;
	}
	:global(#mc-tracker .acto-head:hover) {
		background: #f9f9f9;
	}
	:global(#mc-tracker .live-pill) {
		background: #dc2626;
		color: #fff;
		font-size: 10px;
		border-radius: 99px;
		padding: 2px 8px;
		font-weight: 600;
		white-space: nowrap;
	}
	:global(#mc-tracker .acto-hora) {
		font-size: 12px;
		color: #888;
		min-width: 44px;
		font-variant-numeric: tabular-nums;
	}
	:global(#mc-tracker .acto-nombre) {
		font-size: 14px;
		font-weight: 600;
		color: #111;
		flex: 1;
	}
	:global(#mc-tracker .acto-lugar) {
		font-size: 12px;
		color: #aaa;
	}
	:global(#mc-tracker .chev) {
		font-size: 11px;
		color: #aaa;
		margin-left: auto;
		transition: transform 0.2s;
		flex-shrink: 0;
	}
	:global(#mc-tracker .chev.open) {
		transform: rotate(90deg);
	}
	:global(#mc-tracker .acto-body) {
		padding: 14px 15px;
		border-top: 1px solid #f0f0f0;
		display: none;
	}
	:global(#mc-tracker .acto-body.open) {
		display: block;
	}
	:global(#mc-tracker .nota) {
		font-size: 12px;
		color: #666;
		margin-bottom: 12px;
		line-height: 1.6;
	}
	:global(#mc-tracker .bandos) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-top: 8px;
	}
	:global(#mc-tracker .bando) {
		border-radius: 8px;
		padding: 10px 12px;
	}
	:global(#mc-tracker .bc) {
		background: #eff6ff;
	}
	:global(#mc-tracker .bm) {
		background: #fffbeb;
	}
	:global(#mc-tracker .bando-t) {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 8px;
	}
	:global(#mc-tracker .bc .bando-t) {
		color: #1d4ed8;
	}
	:global(#mc-tracker .bm .bando-t) {
		color: #92400e;
	}
	:global(#mc-tracker .fila) {
		font-size: 12px;
		padding: 4px 6px;
		border-radius: 6px;
		color: #222;
		display: flex;
		gap: 5px;
		align-items: center;
		cursor: pointer;
		transition: background 0.1s;
	}
	:global(#mc-tracker .fila:hover) {
		background: rgba(0, 0, 0, 0.05);
	}
	:global(#mc-tracker .fn) {
		font-size: 10px;
		color: #bbb;
		min-width: 14px;
		flex-shrink: 0;
	}
	:global(#mc-tracker .fila-wrap) {
		margin-bottom: 2px;
	}
	:global(#mc-tracker .fila-name) {
		flex: 1;
	}
	:global(#mc-tracker .fila-btn) {
		font-size: 10px;
		background: #f0f0f0;
		border: none;
		border-radius: 4px;
		padding: 2px 6px;
		color: #555;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
	}
	:global(#mc-tracker .fila-btn:hover) {
		background: #e0e0e0;
	}
	:global(#mc-tracker .fila-marchas) {
		font-size: 11px;
		color: #666;
		padding: 4px 6px 6px 25px;
		line-height: 1.5;
		font-style: italic;
		display: none;
	}
	:global(#mc-tracker .aviso) {
		font-size: 11px;
		color: #999;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 1px solid #f0f0f0;
	}
	:global(#mc-tracker .musica-section) {
		padding: 4px 0;
	}
	:global(#mc-tracker .musica-bando-t) {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 16px 0 8px;
		color: #888;
	}
	:global(#mc-tracker .musica-bando-t:first-child) {
		margin-top: 0;
	}
	:global(#mc-tracker .musica-fila) {
		border: 1px solid #f0f0f0;
		border-radius: 8px;
		padding: 10px 12px;
		margin-bottom: 6px;
		background: #fafafa;
	}
	:global(#mc-tracker .musica-fila-nombre) {
		font-size: 13px;
		font-weight: 600;
		color: #111;
		margin-bottom: 3px;
	}
	:global(#mc-tracker .musica-fila-marchas) {
		font-size: 12px;
		color: #666;
		line-height: 1.5;
		font-style: italic;
	}
	:global(#mc-tracker .musica-fila-none) {
		font-size: 12px;
		color: #bbb;
		font-style: italic;
	}
	@media (max-width: 480px) {
		:global(#mc-tracker .bandos) {
			grid-template-columns: 1fr;
		}
		:global(#mc-tracker .acto-lugar) {
			display: none;
		}
	}
</style>
