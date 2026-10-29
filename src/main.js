import './style.css';
import { setFlowSystem } from './interactions.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const systems = {
  fire: { name:'Fire protection', title:'Confidence at every level.', kicker:'PROTECTION, PLANNED IN.', description:'Sprinkler layouts, hydraulic calculations, and fabrication drawings—coordinated with the building around them.', tags:['Sprinkler design','Hydraulic calculations','BIM coordination'], color:0xf37143 },
  alarm: { name:'Fire alarm', title:'Every second, considered.', kicker:'A CLEAR SIGNAL. A SAFER BUILDING.', description:'Thoughtful device layouts, circuits, and system interfaces to support detection, notification, and a coordinated response.', tags:['Device layouts','Circuit design','System interfaces'], color:0xffb55c },
  electrical: { name:'Electrical', title:'Powering every possibility.', kicker:'INTELLIGENCE IN EVERY CIRCUIT.', description:'Coordinated electrical design for equipment, lighting, conduits, and communications, with reliability built into the details.', tags:['Lighting & power','Electrical equipment','Coordinated BIM'], color:0xe7d269 },
  hvac: { name:'HVAC', title:'Comfort, by design.', kicker:'BETTER BUILDINGS. FROM THE INSIDE.', description:'Heating, ventilation, and air-conditioning design shaped around your building, your team, and the way people use the space.', tags:['System planning','HVAC design','Building coordination'], color:0x7fc9bd },
  arcs: { name:'ARCS / BDA', title:'Connection when it matters.', kicker:'KEEP CRITICAL COMMUNICATION OPEN.', description:'Purpose-designed auxiliary radio communication systems for high-rise buildings and the emergency teams who depend on them.', tags:['ARCS / BDA','Radio systems','High-rise buildings'], color:0xb3a1e5 }
};
let currentSystem='fire';

class BuildingScene {
  constructor(element, dark=false) {
    this.focusMotion={zoom:1}; this.focusTransition=null; this.el=element; this.dark=dark; this.active=true; this.exploded=0; this.targetExploded=0; this.isolated=false; this.rotating=!reducedMotion.matches; this.system='fire'; this.levels=[]; this.structure=[]; this.networks={}; this.particles=[];
    this.scene=new THREE.Scene();
    this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
    this.renderer.setClearColor(0x000000,0);
    this.renderer.shadowMap.enabled=!dark; this.renderer.shadowMap.type=THREE.PCFSoftShadowMap; this.renderer.shadowMap.autoUpdate=false; this.renderer.shadowMap.needsUpdate=true;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace; this.renderer.toneMapping=THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure=dark?1.25:1.45;
    element.appendChild(this.renderer.domElement);
    this.camera=new THREE.OrthographicCamera(-8,8,8,-8,.1,100);
    this.camera.position.set(12,9,14);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.target.set(0,3.6,0); this.controls.enableDamping=true; this.controls.dampingFactor=.045; this.controls.enableZoom=false; this.controls.enablePan=false; this.controls.minPolarAngle=.6; this.controls.maxPolarAngle=1.4; this.controls.autoRotate=this.rotating; this.controls.autoRotateSpeed=.12;
    this.controls.addEventListener('start',()=>{this.dragging=true;this.focusTransition?.kill();});this.controls.addEventListener('end',()=>{this.dragging=false;});
    this.scene.add(new THREE.HemisphereLight(0xfff8e8,dark?0x526773:0x7e8e88,3));
    const sun=new THREE.DirectionalLight(0xfff4df,4.5);sun.position.set(-5,14,10);sun.castShadow=!dark;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;this.scene.add(sun);
    const fill=new THREE.DirectionalLight(0xb3d4e1,2.5);fill.position.set(10,5,-8);this.scene.add(fill);
    this.root=new THREE.Group();this.scene.add(this.root);
    this.concrete=new THREE.MeshStandardMaterial({color:dark?0x8b9a95:0xe6e5d9,roughness:.7,metalness:.1,transparent:true});
    this.frame=new THREE.MeshStandardMaterial({color:dark?0x607873:0x52605e,roughness:.5,metalness:.5,transparent:true});
    this.glass=new THREE.MeshStandardMaterial({color:dark?0x718f8e:0x798e8b,metalness:.65,roughness:.18,transparent:true,opacity:dark?.12:.29,depthWrite:false,side:THREE.DoubleSide});
    this.white=new THREE.MeshStandardMaterial({color:0xe6e7dc,roughness:.6,transparent:true});
    this.networkMats={};
    Object.entries(systems).forEach(([key,s])=>{this.networks[key]=[];this.networkMats[key]=new THREE.MeshStandardMaterial({color:s.color,emissive:s.color,emissiveIntensity:.13,metalness:.3,roughness:.35,transparent:true});});
    if(dark){this.concrete.opacity=.18;this.frame.opacity=.45;this.white.opacity=.18;}
    this.build();
    if(!dark){const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.2;ground.receiveShadow=true;this.scene.add(ground);}
    const grid=new THREE.GridHelper(19,22,dark?0x52635b:0xc8cebd,dark?0x52635b:0xc8cebd);grid.material.transparent=true;grid.material.opacity=dark?.15:.35;grid.position.y=-.17;this.scene.add(grid);
    this.setSystem('fire');
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(element);
    this.visibilityObserver=new IntersectionObserver(([entry])=>{this.active=entry.isIntersecting;},{rootMargin:'80px'});this.visibilityObserver.observe(element);
    this.resize();this.lastTime=0;this.animate=this.animate.bind(this);this.animationId=requestAnimationFrame(this.animate);
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.active=false;});
    this.renderer.domElement.addEventListener('webglcontextrestored',()=>{this.active=true;});
  }
  box(w,h,d,x,y,z,mat,parent=this.root,struct=true){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=!this.dark;mesh.receiveShadow=true;parent.add(mesh);if(struct)this.structure.push(mesh);return mesh;
  }
  pipe(points,key,parent,r=.035){
    const path=new THREE.CurvePath();for(let i=0;i<points.length-1;i++)path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i]),new THREE.Vector3(...points[i+1])));
    const tube=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(8,points.length*5),r,6,false),this.networkMats[key]);parent.add(tube);this.networks[key].push(tube);
    if(points.length>2){const particle=new THREE.Mesh(new THREE.SphereGeometry(r*1.6,6,6),new THREE.MeshBasicMaterial({color:0xfff6da,transparent:true,opacity:.85}));parent.add(particle);this.particles.push({mesh:particle,path,key,offset:Math.random()});}
  }
  build(){
    this.box(7.8,.19,6,0,-.06,0,this.concrete);
    this.box(7.2,.08,5.4,0,.07,0,this.white);
    // The facade is deliberately cut away to reveal coordinated services.
    for(let floor=0;floor<7;floor++){
      const group=new THREE.Group();group.position.y=.25+floor*1.06;group.userData.baseY=group.position.y;this.root.add(group);this.levels.push(group);
      this.box(5,.13,3.7,0,0,0,this.concrete,group);
      for(const x of [-2.35,0,2.35])for(const z of [-1.7,1.7])this.box(.12,.98,.12,x,.51,z,this.frame,group);
      // A glazed rear and west elevation; the south-east face stays open.
      this.box(4.7,.82,.035,0,.52,-1.72,this.glass,group);
      this.box(.035,.82,3.3,-2.35,.52,0,this.glass,group);
      this.box(2.15,.82,.035,-1.18,.52,1.72,this.glass,group);
      for(let x=-2.35;x<=2.36;x+=.47)this.box(.035,.99,.05,x,.51,-1.73,this.frame,group);
      for(let x=-2.35;x<=-.23;x+=.47)this.box(.035,.99,.05,x,.51,1.73,this.frame,group);
      for(let z=-1.7;z<=1.71;z+=.48)this.box(.05,.99,.035,-2.36,.51,z,this.frame,group);
      this.box(.5,.9,.65,-1.6,.5,-.9,this.concrete,group);
      this.box(1.5,.08,.9,.6,.18,-.8,this.white,group);
      // Fire protection riser, branch lines, and sprinkler drops.
      this.pipe([[2.55,.03,-1.2],[2.55,.6,-1.2],[2.55,.6,1.98],[-1.8,.6,1.98]],'fire',group,.043);
      for(const x of [-1.3,-.3,.7,1.7]){this.pipe([[x,.6,1.98],[x,.6,-1.25],[x,.44,-1.25]],'fire',group,.027);for(const z of [-.65,.45]){const head=new THREE.Mesh(new THREE.CylinderGeometry(.065,.025,.06,8),this.networkMats.fire);head.position.set(x,.48,z);group.add(head);this.networks.fire.push(head);this.pipe([[x,.6,z],[x,.5,z]],'fire',group,.018);}}
      this.pipe([[-1.8,.6,-1.25],[-1.8,.69,1.1],[1.6,.69,1.1],[1.6,.69,-1.2]],'alarm',group,.023);
      for(const x of [-1.3,.2,1.6]){const device=this.box(.13,.06,.13,x,.65,1.1,this.networkMats.alarm,group,false);this.networks.alarm.push(device);}
      this.pipe([[-1.4,.3,-1.35],[-1.4,.8,-1.35],[1.5,.8,-1.35],[1.5,.8,.7]],'electrical',group,.035);
      for(const x of [-1,.3,1.5]){this.pipe([[x,.8,-1.35],[x,.8,.75]],'electrical',group,.02);const light=this.box(.5,.035,.13,x,.73,.3,this.networkMats.electrical,group,false);this.networks.electrical.push(light);}
      const duct=this.box(3.6,.17,.3,0,.7,-.2,this.networkMats.hvac,group,false);this.networks.hvac.push(duct);
      for(const x of [-1.2,0,1.2]){const branch=this.box(.22,.15,1.7,x,.7,-.2,this.networkMats.hvac,group,false);this.networks.hvac.push(branch);this.pipe([[x,.7,-1.3],[x,.7,1]],'hvac',group,.035);}
      this.pipe([[2.05,.08,-1.4],[2.05,.95,-1.4],[.1,.95,-1.4],[.1,.95,.8]],'arcs',group,.03);
      const radio=this.box(.16,.1,.2,.1,.86,.8,this.networkMats.arcs,group,false);this.networks.arcs.push(radio);
    }
    const roof=new THREE.Group();roof.position.y=7.67;roof.userData.baseY=7.67;this.root.add(roof);this.levels.push(roof);
    this.box(5.1,.15,3.8,0,0,0,this.white,roof);
    this.box(5.1,.22,.07,0,.16,-1.85,this.concrete,roof);this.box(.07,.22,3.7,-2.5,.16,0,this.concrete,roof);
    for(let i=0;i<3;i++){this.box(.75,.4,.9,-1.3+i*.95,.26,-.7,this.frame,roof);for(let j=0;j<5;j++)this.box(.67,.02,.035,-1.3+i*.95,.47,-1+j*.15,this.concrete,roof);}
    this.pipe([[2,.07,-1.2],[2,.75,-1.2],[.5,.75,-1.2],[.5,.47,-.7]],'fire',roof,.065);
    this.pipe([[-1,.45,-.7],[-1,.6,.7],[1.5,.6,.7]],'hvac',roof,.09);
    this.pipe([[1.6,.1,1],[1.6,1.1,1]],'arcs',roof,.025);
    // A low side wing and entrance establish a recognizable architectural scale.
    for(let floor=0;floor<3;floor++){
      this.box(1.45,.14,3.7,3.2,.25+floor*1.06,0,this.concrete);
      this.box(.04,.9,3.3,3.86,.8+floor*1.06,0,this.glass);
      this.box(1.3,.9,.04,3.2,.8+floor*1.06,1.7,this.glass);
      for(let z=-1.7;z<1.8;z+=.48)this.box(.05,.98,.05,3.87,.78+floor*1.06,z,this.frame);
    }
    this.box(1.6,.15,3.9,3.2,3.43,0,this.white);
    this.box(1.65,.09,.9,1.3,.94,2,this.frame);
    this.box(1.6,.1,.6,1.3,.13,2.25,this.concrete);
    for(const [x,z] of [[-3.1,1.6],[-3.1,-1.5],[3.1,2.3]]){
      this.box(.6,.24,.65,x,.2,z,this.concrete);
      const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(.33,1),new THREE.MeshStandardMaterial({color:this.dark?0x4f6a58:0x81937b,roughness:1,transparent:true}));shrub.position.set(x,.53,z);this.root.add(shrub);this.structure.push(shrub);
    }
  }
  resize(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);const aspect=w/h;const size=this.dark?6.1:6.6;this.camera.left=-size*aspect;this.camera.right=size*aspect;this.camera.top=size;this.camera.bottom=-size;this.camera.updateProjectionMatrix();}
  setSystem(key, animate=false){
    const changed=this.system!==key;
    if(animate && !changed)return;
    this.system=key;
    Object.entries(this.networks).forEach(([k,items])=>{
      const material=this.networkMats[k];
      gsap.killTweensOf(material);
      const selected=k===key;
      if(!animate || reducedMotion.matches){
        material.opacity=selected?1:0;
        items.forEach(mesh=>mesh.visible=selected);
      }else{
        items.forEach(mesh=>mesh.visible=selected || material.opacity>.001);
        gsap.to(material,{opacity:selected?1:0,duration:.65,ease:'power2.inOut',onComplete:()=>{
          items.forEach(mesh=>mesh.visible=k===this.system);
        }});
      }
    });
    this.particles.forEach(p=>p.mesh.visible=p.key===key);
    this.focusTransition?.kill();
    if(animate && changed && !reducedMotion.matches){
      const index=Object.keys(systems).indexOf(key);
      this.focusTransition=gsap.timeline({onUpdate:()=>{this.renderer.shadowMap.needsUpdate=true;}})
        .to(this.focusMotion,{zoom:this.dark?1.14:1.06,duration:1.15,ease:'sine.inOut'},0)
        .to(this.root.rotation,{y:[0,.16,-.12,.22,-.18][index],duration:1.8,ease:'sine.inOut'},0)
        .to(this.focusMotion,{zoom:this.dark?1.07:1.025,duration:1.2,ease:'sine.inOut'},1.15);
    }else if(reducedMotion.matches){
      this.focusMotion.zoom=1;
      this.root.rotation.y=0;
    }
  }
  setIsolated(value){this.isolated=value;this.structure.forEach(m=>{m.visible=!value;});}
  reset(){this.focusTransition?.kill();this.focusMotion.zoom=1;this.root.rotation.y=0;this.renderer.shadowMap.needsUpdate=true;this.camera.position.set(12,9,14);this.controls.target.set(0,3.6,0);this.controls.update();this.targetExploded=0;}
  animate(time){this.animationId=requestAnimationFrame(this.animate);if(!this.active||document.hidden)return;const dt=Math.min((time-this.lastTime)/1000,.05);this.lastTime=time;this.controls.autoRotate=this.rotating&&!reducedMotion.matches;if(this.controls.getAzimuthalAngle()<.15)this.controls.autoRotateSpeed=-.12;if(this.controls.getAzimuthalAngle()>1.3)this.controls.autoRotateSpeed=.12;this.controls.update(dt);if(Math.abs(this.targetExploded-this.exploded)>.001)this.renderer.shadowMap.needsUpdate=true;this.exploded+=(this.targetExploded-this.exploded)*(reducedMotion.matches?1:.055);this.levels.forEach((group,i)=>{group.position.y=group.userData.baseY+i*this.exploded*.42;});this.camera.zoom=(1-this.exploded*.14)*this.focusMotion.zoom;this.camera.updateProjectionMatrix();this.controls.target.y=3.6+this.exploded*1.1;if(!reducedMotion.matches)this.particles.forEach(p=>{if(p.key===this.system)p.mesh.position.copy(p.path.getPoint((time*.00013+p.offset)%1));});this.renderer.render(this.scene,this.camera);}
  dispose(){this.focusTransition?.kill();Object.values(this.networkMats).forEach(mat=>gsap.killTweensOf(mat));cancelAnimationFrame(this.animationId);this.resizeObserver.disconnect();this.visibilityObserver.disconnect();this.controls.dispose();const materials=new Set();this.scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});materials.forEach(m=>m.dispose());this.renderer.dispose();}
}
const scenes=[];
function createScene(id,dark){try{const s=new BuildingScene(document.getElementById(id),dark);scenes.push(s);return s;}catch(error){console.warn('3D preview unavailable:',error.message);const el=document.getElementById(id);el.innerHTML='<div class="canvas-fallback" style="display:block">ENGINEERED TO CONNECT<br><strong>Every system. Together.</strong><br>3D view is unavailable in this browser.</div>';if(!dark)document.querySelectorAll('.model-controls button').forEach(b=>b.disabled=true);else document.getElementById('isolate-toggle').disabled=true;return null;}}
const heroScene=createScene('hero-canvas',false);
const systemScene=createScene('system-canvas',true);
const explode=document.getElementById('explode-toggle');
explode.addEventListener('click',()=>{if(!heroScene)return;const next=!heroScene.targetExploded;heroScene.targetExploded=next?1:0;explode.setAttribute('aria-pressed',String(next));explode.innerHTML=`<span>⊞</span> ${next?'Assemble view':'Explode view'}`;});
const rotate=document.getElementById('rotate-toggle');
function updateRotationButton(){const rotating=heroScene?.rotating&&!reducedMotion.matches;rotate.setAttribute('aria-pressed',String(!!rotating));rotate.setAttribute('aria-label',rotating?'Pause building rotation':'Resume building rotation');rotate.textContent=rotating?'Ⅱ':'▷';}
updateRotationButton();rotate.addEventListener('click',()=>{if(heroScene){heroScene.rotating=!heroScene.rotating;updateRotationButton();}});
document.getElementById('reset-view').addEventListener('click',()=>{heroScene?.reset();explode.setAttribute('aria-pressed','false');explode.innerHTML='<span>⊞</span> Explode view';});
document.getElementById('isolate-toggle').addEventListener('click',e=>{if(!systemScene)return;systemScene.setIsolated(!systemScene.isolated);e.currentTarget.setAttribute('aria-pressed',String(systemScene.isolated));e.currentTarget.querySelector('span').textContent=systemScene.isolated?'Show building':'Isolate system';});
function selectSystem(key){currentSystem=key;const data=systems[key];document.querySelectorAll('.system-tab').forEach(tab=>{const active=tab.dataset.system===key;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});document.getElementById('system-panel').setAttribute('aria-labelledby',`tab-${key}`);document.getElementById('system-title').textContent=data.title;document.getElementById('system-description').textContent=data.description;document.querySelector('.system-kicker').textContent=data.kicker;document.getElementById('system-tags').replaceChildren(...data.tags.map(tag=>{const el=document.createElement('span');el.textContent=tag;return el;}));document.getElementById('hero-system-name').textContent=data.name;const index=Object.keys(systems).indexOf(key)+1;document.querySelector('.system-number').textContent=`0${index}`;document.querySelector('.visual-heading .mono').textContent=`0${index} / 05`;document.getElementById('system-canvas').setAttribute('aria-label',`Three-dimensional ${data.name.toLowerCase()} system illustration`);document.getElementById('system-enquire').setAttribute('aria-label',`Discuss ${data.name.toLowerCase()} engineering`);heroScene?.setSystem(key,true);systemScene?.setSystem(key,true);setFlowSystem(key,data.color);if(!reducedMotion.matches)gsap.fromTo('.system-details',{opacity:0,y:9},{opacity:1,y:0,duration:.55,overwrite:true});}
const tabs=[...document.querySelectorAll('.system-tab')];tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectSystem(tab.dataset.system));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();tabs[next].focus();selectSystem(tabs[next].dataset.system);});});
const processMessages=['Start with what you have: drawings, a scope, or simply a conversation.','Agree on disciplines, communication, and deliverables before the work begins.','Keep reviews and design decisions connected as your project takes shape.','Use the review to align on final details and the next phase of work.'];
document.querySelectorAll('.process-step').forEach(step=>{step.addEventListener('click',()=>{document.querySelectorAll('.process-step').forEach(s=>{s.classList.toggle('active',s===step);s.setAttribute('aria-expanded',String(s===step));});document.getElementById('process-insight').textContent=processMessages[Number(step.dataset.step)];});});
const dialog=document.getElementById('enquiry-dialog');let previousFocus;function openEnquiry(service){previousFocus=document.activeElement;if(service)document.querySelector('select[name="service"]').value=service;dialog.showModal();document.body.classList.add('modal-open');}document.querySelectorAll('[data-enquire]').forEach(b=>b.addEventListener('click',()=>openEnquiry()));document.getElementById('system-enquire').addEventListener('click',()=>openEnquiry(systems[currentSystem].name));document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');previousFocus?.focus();});
let draft='';document.getElementById('enquiry-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);draft=`Hello GoIGNIS team,\n\nI'm interested in ${data.get('service')} support.\n\n${data.get('message')}\n\nName: ${data.get('name')}\nWork email: ${data.get('email')}\n\nLooking forward to connecting.`;document.getElementById('email-result').hidden=false;document.getElementById('copy-status').textContent='';document.getElementById('draft-fallback').hidden=true;window.location.href=`mailto:info@goignis.com?subject=${encodeURIComponent('Project enquiry — '+data.get('service'))}&body=${encodeURIComponent(draft)}`;});document.getElementById('copy-enquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);document.getElementById('copy-status').textContent='Enquiry copied.';}catch{const fallback=document.getElementById('draft-fallback');fallback.value=draft;fallback.hidden=false;fallback.focus();fallback.select();document.getElementById('copy-status').textContent='Select and copy the draft below.';}});
function updateTimes(){const now=new Date();for(const [id,zone] of [['ny-time','America/New_York'],['india-time','Asia/Kolkata']])document.getElementById(id).textContent=new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:true}).format(now);document.getElementById('year').textContent=now.getFullYear();}updateTimes();const timeInterval=setInterval(updateTimes,30000);
const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',()=>{gsap.from('.hero-copy > *',{opacity:0,y:23,stagger:.09,duration:.9,ease:'power3.out',delay:.1});gsap.from('.hero-visual',{opacity:0,y:30,duration:1.3,delay:.25});gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{opacity:0,y:32,duration:.85,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 91%',once:true}}));gsap.to('.contact-lines',{rotation:30,y:-60,scrollTrigger:{trigger:'.contact-band',start:'top bottom',end:'bottom top',scrub:1}});});
function updateProgress(){const max=document.documentElement.scrollHeight-window.innerHeight;document.querySelector('.scroll-progress').style.width=`${max>0?window.scrollY/max*100:0}%`;}window.addEventListener('scroll',updateProgress,{passive:true});updateProgress();reducedMotion.addEventListener('change',()=>{scenes.forEach(s=>{s.rotating=!reducedMotion.matches;if(reducedMotion.matches)s.setSystem(s.system);});updateRotationButton();});window.addEventListener('pagehide',(event)=>{if(event.persisted)return;clearInterval(timeInterval);scenes.forEach(s=>s.dispose());mm.revert();},{once:true});
