const menu=document.querySelector('#menu'), links=document.querySelector('.nav-links');
function setMenu(open){links.classList.toggle('open',open);menu.setAttribute('aria-expanded',open)}
menu.onclick=()=>setMenu(!links.classList.contains('open'));
links.onclick=()=>setMenu(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('open')){setMenu(false);menu.focus()}});
const pictures=[...document.querySelectorAll('.photos img')];let slide=0;
const frames=[...document.querySelectorAll('.frame')];
frames.forEach((frame,i)=>frame.onclick=()=>changeSlide(i-slide));
function changeSlide(step){pictures[slide].classList.remove('show');slide=(slide+step+pictures.length)%pictures.length;pictures[slide].classList.add('show');frames.forEach((frame,i)=>frame.setAttribute('aria-pressed',i===slide));document.querySelector('#count').firstChild.nodeValue=String(slide+1).padStart(2,'0')+' ';}
document.querySelector('.next').onclick=()=>changeSlide(1);document.querySelector('.prev').onclick=()=>changeSlide(-1);
const cards=document.querySelectorAll('.item-card');
cards.forEach(c=>{c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-expanded','false');c.onclick=()=>{const open=!c.classList.contains('active');cards.forEach(other=>{other.classList.toggle('active',other===c&&open);other.setAttribute('aria-expanded',other===c&&open)});};c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click()}}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target)}}),{threshold:.1});document.querySelectorAll('.section-header,.item-card,.intro-copy,figure').forEach(el=>observer.observe(el));}
