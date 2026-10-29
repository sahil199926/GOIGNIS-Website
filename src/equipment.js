import gsap from 'gsap';

const equipment = {
  fire: {name:'Fire pump assembly', discipline:'FIRE PROTECTION', purpose:'Pressure behind the protection.', drawing:`
    <path class="machine-pipe" d="M560 180H474Q458 180 458 196V220H390"/>
    <path class="machine-travel" d="M560 180H474Q458 180 458 196V220H390"/>
    <path class="machine-pipe" d="M330 172V110Q330 94 346 94H406V62"/>
    <rect class="machine-body" x="128" y="270" width="314" height="17" rx="4"/><path class="machine-detail" d="M149 287v14m270-14v14"/>
    <rect class="machine-metal" x="155" y="184" width="136" height="69" rx="14"/><ellipse class="machine-body" cx="155" cy="219" rx="20" ry="34"/>
    <path class="machine-detail" d="M180 193v51m13-51v51m13-51v51m13-51v51m13-51v51m13-51v51m13-51v51"/>
    <rect class="machine-body" x="284" y="204" width="39" height="26" rx="5"/>
    <circle class="machine-metal" cx="347" cy="218" r="49"/><circle class="machine-ring" cx="347" cy="218" r="33"/>
    <g class="pump-rotor"><path class="machine-accent" d="M347 194q-27 11 0 24q11-27 24 0q-27-11-24 24q27-11 0-24q-11 27-24 0q27 11 24-24"/></g>
    <path class="machine-support" d="M178 251v19m75-19v19m77-4v4m34-4v4"/>
    <path class="machine-detail" d="M417 179v-31"/><circle class="machine-body" cx="417" cy="133" r="20"/><path class="machine-accent gauge-needle" d="M417 133l10-9"/><path class="machine-detail" d="M404 136a14 14 0 0 1 26 0"/>
    <path class="machine-detail" d="M468 206h-20m20 7h-20M321 117h18m-18 7h18"/>
    <text x="155" y="326">MOTOR</text><text x="315" y="326">PUMP</text><path class="machine-dimension" d="M155 305h235"/>`},
  alarm: {name:'Fire alarm panel & detection loop', discipline:'FIRE ALARM', purpose:'From detection to notification, one connected circuit.', drawing:`
    <path class="alarm-loop cable-jacket" d="M258 117V64H138V97M138 97V207M138 274V294H259V267"/>
    <path class="alarm-loop cable-core" d="M258 117V64H138V97M138 97V207M138 274V294H259V267"/>
    <path class="machine-travel" d="M258 117V64H138V207M138 274V294H259V267"/>
    <ellipse class="machine-metal" cx="138" cy="102" rx="42" ry="15"/><path class="detector-shell" d="M99 102q6 29 39 29t39-29"/><ellipse class="machine-detail" cx="138" cy="108" rx="25" ry="8"/>
    <path class="machine-detail" d="M111 111v9m9-6v12m10-10v14m16-14v14m10-16v12m9-15v9"/><circle class="equipment-led" cx="138" cy="122" r="3"/>
    <text class="equipment-device-label" x="94" y="155">SMOKE DETECTOR</text>
    <rect class="alarm-enclosure" x="104" y="204" width="68" height="71" rx="7"/><rect class="strobe-lens" x="112" y="212" width="52" height="20" rx="4"/>
    <path class="machine-detail" d="M116 242h44m-44 7h44m-44 7h44m-44 7h44"/><path class="notification-wave" d="M93 219q-10 17 0 34m91-34q10 17 0 34"/>
    <text class="equipment-device-label" x="103" y="317">HORN / STROBE</text>
    <path class="alarm-side" d="M238 113l16-14h177v192l-16 15z"/><rect class="alarm-enclosure" x="238" y="113" width="177" height="194" rx="5"/>
    <text class="equipment-panel-title" x="255" y="140">FIRE ALARM</text>
    <rect class="machine-screen" x="255" y="152" width="142" height="49" rx="3"/><text class="machine-screen-text" x="265" y="168">DETECTION LOOP</text><path class="machine-wave" d="M265 185h25l7-10 9 18 8-12h67"/>
    <circle class="equipment-led" cx="264" cy="220" r="4"/><circle class="machine-indicator" cx="284" cy="220" r="4"/><circle class="machine-indicator" cx="304" cy="220" r="4"/>
    <path class="machine-detail" d="M256 245h70m-70 9h70m-70 9h70"/><g class="machine-keys"><rect x="349" y="239" width="16" height="14" rx="2"/><rect x="375" y="239" width="16" height="14" rx="2"/><rect x="349" y="264" width="16" height="14" rx="2"/><rect x="375" y="264" width="16" height="14" rx="2"/></g>
    <path class="cable-jacket" d="M560 180H417"/><path class="cable-core" d="M560 180H417"/><path class="machine-travel" d="M560 180H417"/>
    <rect class="cable-gland" x="410" y="172" width="22" height="16" rx="3"/><path class="gland-thread" d="M416 174v12m5-12v12m5-12v12"/>
    <text class="equipment-feed-label" x="457" y="162">SIGNAL CABLE</text><path class="machine-dimension" d="M421 198v21h61"/>
    <text class="equipment-port-label" x="445" y="233">LOOP TERMINAL</text>`},
  electrical: {name:'Switchgear & power distribution', discipline:'ELECTRICAL', purpose:'An incoming power feed, distributed through protected circuits.', drawing:`
    <path class="machine-side" d="M130 82l22-19h293v241l-22 19z"/><rect class="machine-body" x="130" y="82" width="293" height="241" rx="4"/>
    <rect class="machine-body" x="122" y="322" width="311" height="13" rx="2"/><path class="machine-detail" d="M268 82v240"/>
    <rect class="machine-screen" x="149" y="103" width="100" height="54" rx="3"/><path class="meter-trace" d="M158 140h17l7-16 10 24 10-16h36"/><text class="machine-screen-text" x="158" y="117">POWER METER</text>
    <rect class="machine-metal" x="152" y="177" width="96" height="57" rx="4"/><circle class="machine-ring" cx="200" cy="204" r="18"/><path class="breaker-handle" d="M199 191v26"/><text class="equipment-device-label" x="164" y="251">MAIN BREAKER</text>
    <path class="warning-plate" d="M183 270h35l17 31h-69z"/><path class="warning-bolt" d="M202 275l-9 12h8l-6 11 14-16h-8l5-7"/>
    <rect class="busbar-window" x="283" y="99" width="123" height="208" rx="3"/>
    <path class="power-bus phase-a" d="M301 115v176"/><path class="power-bus phase-b" d="M344 115v176"/><path class="power-bus phase-c" d="M387 115v176"/>
    <text class="phase-label" x="294" y="113">L1</text><text class="phase-label" x="337" y="113">L2</text><text class="phase-label" x="380" y="113">L3</text>
    <g class="machine-breakers"><rect x="291" y="143" width="20" height="29" rx="3"/><rect x="334" y="143" width="20" height="29" rx="3"/><rect x="377" y="143" width="20" height="29" rx="3"/><rect x="291" y="241" width="20" height="29" rx="3"/><rect x="334" y="241" width="20" height="29" rx="3"/><rect x="377" y="241" width="20" height="29" rx="3"/></g>
    <path class="machine-accent" d="M301 152v10m43-10v10m43-10v10m-86 88v10m43-10v10m43-10v10"/>
    <path class="power-sleeve" d="M560 180H450Q439 180 439 192V206H423"/>
    <path class="power-feed" d="M560 180H450Q439 180 439 192V206H423"/><path class="machine-travel" d="M560 180H450Q439 180 439 192V206H423"/>
    <rect class="cable-gland" x="414" y="195" width="20" height="22" rx="3"/><path class="gland-thread" d="M419 198v16m5-16v16m5-16v16"/>
    <text class="equipment-feed-label" x="463" y="161">POWER FEED</text><text class="equipment-device-label" x="293" y="351">BUSBARS / CIRCUITS</text>`},
  hvac: {name:'Air handling unit', discipline:'HVAC', purpose:'The motion behind everyday comfort.', drawing:`
    <path class="machine-duct" d="M560 180H438"/><path class="machine-travel" d="M560 180H438"/>
    <path class="machine-side" d="M138 116l32-27h296l-29 27zM437 116l29-27v177l-29 27z"/>
    <rect class="machine-body" x="137" y="116" width="300" height="177" rx="5"/>
    <rect class="machine-metal" x="151" y="132" width="271" height="130" rx="3"/>
    <circle class="machine-ring" cx="217" cy="196" r="47"/><circle class="machine-ring" cx="354" cy="196" r="47"/>
    <g class="fan-left"><path class="fan-blade" d="M217 196q-44-2-19-36q22-2 19 36M217 196q24-37 41 1q-9 22-41-1M217 196q21 39-20 36q-15-18 20-36"/></g>
    <g class="fan-right"><path class="fan-blade" d="M354 196q-44-2-19-36q22-2 19 36M354 196q24-37 41 1q-9 22-41-1M354 196q21 39-20 36q-15-18 20-36"/></g>
    <circle class="machine-hub" cx="217" cy="196" r="8"/><circle class="machine-hub" cx="354" cy="196" r="8"/>
    <path class="machine-detail" d="M168 278h126m35 0h78M167 294v19m242-19v19"/><circle class="equipment-led" cx="314" cy="278" r="3"/>
    <text x="176" y="338">AIRFLOW · FILTRATION · COMFORT</text>`},
  arcs: {name:'BDA amplifier & antenna network', discipline:'ARCS / BDA', purpose:'Coax connects the amplifier to donor and indoor antennas.', drawing:`
    <path class="antenna-mast" d="M145 54v90M111 71l69-28"/><path class="antenna-elements" d="M112 55l10 28m4-36l13 31m4-40l14 34m3-43l14 36"/>
    <path class="radio-wave wave-one" d="M188 34q19 12 10 32"/><path class="radio-wave wave-two" d="M201 23q31 19 16 51"/><path class="radio-wave wave-three" d="M215 11q40 28 21 73"/>
    <text class="equipment-device-label" x="91" y="164">DONOR ANTENNA</text>
    <path class="coax-jacket" d="M145 144V182Q145 192 155 192H221"/><path class="cable-core" d="M145 144V182Q145 192 155 192H221"/>
    <path class="machine-side" d="M230 153l15-15h179v128l-15 15z"/><rect class="machine-metal" x="230" y="153" width="179" height="128" rx="5"/>
    <path class="amplifier-fins" d="M241 160v113m9-113v113m9-113v113m127-113v113m9-113v113"/>
    <rect class="machine-body" x="270" y="172" width="106" height="83" rx="3"/><text class="amplifier-title" x="291" y="198">BDA</text><text class="machine-screen-text" x="282" y="213">SIGNAL AMPLIFIER</text><circle class="equipment-led" cx="289" cy="235" r="3"/><circle class="equipment-led" cx="309" cy="235" r="3"/><path class="machine-detail" d="M329 235h31"/>
    <path class="coax-jacket" d="M560 180H454Q440 180 440 194V206H409"/><path class="cable-core" d="M560 180H454Q440 180 440 194V206H409"/><path class="machine-travel" d="M560 180H454Q440 180 440 194V206H409"/>
    <rect class="coax-connector" x="403" y="200" width="23" height="12" rx="2"/><path class="gland-thread" d="M410 201v10m4-10v10m4-10v10m4-10v10"/>
    <rect class="coax-connector" x="219" y="186" width="16" height="12" rx="2"/>
    <path class="coax-jacket" d="M284 282V304Q284 316 272 316H156Q144 316 144 304V259"/><path class="cable-core" d="M284 282V304Q284 316 272 316H156Q144 316 144 304V259"/><path class="machine-travel" d="M284 282V304Q284 316 272 316H156Q144 316 144 304V259"/>
    <rect class="coax-connector" x="278" y="273" width="12" height="18" rx="2"/>
    <ellipse class="machine-metal" cx="144" cy="249" rx="38" ry="9"/><path class="detector-shell" d="M113 250q31 34 62 0"/>
    <path class="radio-wave wave-one" d="M121 277q23 18 46 0"/><path class="radio-wave wave-two" d="M113 287q31 23 62 0"/>
    <text class="equipment-feed-label" x="466" y="161">COAX FEED</text><path class="machine-dimension" d="M418 223v21h60"/><text class="equipment-port-label" x="445" y="257">RF CONNECTOR</text>
    <text class="equipment-device-label" x="97" y="346">INDOOR ANTENNA</text>`}
};
const svg = document.getElementById('equipment-svg');
const drawing = document.querySelector('.equipment-drawing');
let selected;
export function setEquipmentSystem(key) {
  if (selected === key) return;
  selected = key;
  const item = equipment[key];
  svg.innerHTML = `<defs><linearGradient id="equipment-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#718079"/><stop offset=".45" stop-color="#43534c"/><stop offset="1" stop-color="#293b34"/></linearGradient></defs><ellipse class="machine-shadow" cx="300" cy="312" rx="220" ry="17"/><path class="machine-grid" d="M65 315h480M95 330h420M135 345h340"/>${item.drawing}<circle class="machine-socket" cx="560" cy="180" r="7"/><circle class="machine-socket-core" cx="560" cy="180" r="2.5"/>`;
  drawing.setAttribute('aria-label', `Illustrative ${item.name.toLowerCase()}`);
  document.getElementById('equipment-name').textContent = item.name;
  document.getElementById('equipment-purpose').textContent = item.purpose;
  document.getElementById('equipment-discipline').textContent = item.discipline;
  document.querySelector('.equipment-index').textContent = `0${Object.keys(equipment).indexOf(key) + 1} / 05`;
  document.querySelectorAll('[data-equipment]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.equipment === key)));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.fromTo(svg, {opacity:.25}, {opacity:1,duration:.65,overwrite:true,ease:'power2.out'});
    gsap.fromTo('.equipment-description', {opacity:.3,y:5}, {opacity:1,y:0,duration:.5,overwrite:true});
  }
}
setEquipmentSystem('fire');
document.querySelectorAll('[data-equipment]').forEach(button => button.addEventListener('click', () => {
  document.getElementById(`tab-${button.dataset.equipment}`).click();
}));
