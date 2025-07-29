 // Canvas animation
 const canvas = document.getElementById("canvas");
 const ctx = canvas.getContext("2d");

 let width = window.innerWidth;
 let height = window.innerHeight;
 canvas.width = width;
 canvas.height = height;

 window.addEventListener("resize", () => {
   width = window.innerWidth;
   height = window.innerHeight;
   canvas.width = width;
   canvas.height = height;
 });

 class Particle {
   constructor(x, y, options = {}) {
     this.x = x;
     this.y = y;
     this.radius = options.radius || 20;
     this.alpha = options.alpha || 0.07;
     this.fade = options.fade || 0.0005;
     this.dx = (Math.random() - 0.5) * (options.speed || 2);
     this.dy = (Math.random() - 0.5) * (options.speed || 2);
     this.color = options.color || `rgba(0, 0, 0, ALPHA)`;
     this.glow = options.glow || false;
     this.glowColor = options.glowColor || "#ffffff";
     this.isPermanent = options.isPermanent || false;
     this.isHeadFog = options.isHeadFog || false;
   }

   update() {
     this.x += this.dx;
     this.y += this.dy;
     this.alpha -= this.isPermanent ? this.fade * 0.4 : this.fade;
     this.radius *= this.isPermanent ? 0.98 : 0.95;

     if (this.isPermanent && (this.alpha <= 0.02 || this.x < -50 || 
         this.x > width + 50 || this.y < -50 || this.y > height + 50)) {
       this.reset();
     }
   }

   reset() {
     if (this.isHeadFog) {
       const avatar = document.querySelector('.avatar-container');
       const rect = avatar.getBoundingClientRect();
       this.x = rect.left + rect.width/2 + (Math.random() - 0.5) * 60;
       this.y = rect.top + 40 + Math.random() * 40;
       this.alpha = 0.2 + Math.random() * 0.1;
       this.radius = 10 + Math.random() * 10;
       this.dx = (Math.random() - 0.5) * 1.5;
       this.dy = -1 - Math.random() * 2;
     } else {
       this.x = Math.random() * width;
       this.y = Math.random() * height;
       this.alpha = 0.07 + Math.random() * 0.05;
       this.radius = 15 + Math.random() * 15;
       this.dx = (Math.random() - 0.5) * 2;
       this.dy = (Math.random() - 0.5) * 2;
     }
   }

   draw(ctx) {
     ctx.beginPath();
     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
     ctx.fillStyle = this.color.replace("ALPHA", this.alpha.toFixed(3));
     if (this.glow) {
       ctx.shadowBlur = 15;
       ctx.shadowColor = this.glowColor;
     } else {
       ctx.shadowBlur = 0;
     }
     ctx.fill();
   }
 }

 let particles = [];

 // Create permanent background particles
 function spawnPermanentParticlesBatch(count = 100) {
   for (let i = 0; i < count; i++) {
     particles.push(
       new Particle(Math.random() * width, Math.random() * height, {
         radius: 15 + Math.random() * 15,
         alpha: 0.07 + Math.random() * 0.05,
         fade: 0.0003 + Math.random() * 0.0004,
         speed: 1.5 + Math.random() * 1,
         color: `rgba(0, 0, 0, ALPHA)`,
         glow: true,
         glowColor: `rgba(0,0,0,0.2)`,
         isPermanent: true
       })
     );
   }
 }

 // Create head fog particles (black fog like mouse animation)
 function spawnHeadFogParticles(count = 20) {
   const avatar = document.querySelector('.avatar-container');
   const rect = avatar.getBoundingClientRect();
   
   for (let i = 0; i < count; i++) {
     particles.push(
       new Particle(
         rect.left + rect.width/2 + (Math.random() - 0.5) * 60,
         rect.top + 40 + Math.random() * 40,
         {
           radius: 10 + Math.random() * 10,
           alpha: 0.2 + Math.random() * 0.1,
           fade: 0.0005 + Math.random() * 0.0003,
           speed: 1.5,
           color: `rgba(0, 0, 0, ALPHA)`,
           glow: true,
           glowColor: `rgba(0,0,0,0.3)`,
           isPermanent: true,
           isHeadFog: true
         }
       )
     );
   }
 }

 spawnPermanentParticlesBatch(100);
 spawnHeadFogParticles(20);

 setInterval(() => {
   // Maintain background particles
   if (particles.filter(p => p.isPermanent && !p.isHeadFog).length < 150) {
     particles.push(
       new Particle(Math.random() * width, Math.random() * height, {
         radius: 15 + Math.random() * 15,
         alpha: 0.07 + Math.random() * 0.05,
         fade: 0.0003 + Math.random() * 0.0004,
         speed: 1.5 + Math.random() * 1,
         color: `rgba(0, 0, 0, ALPHA)`,
         glow: true,
         glowColor: `rgba(0,0,0,0.2)`,
         isPermanent: true
       })
     );
   }
   
   // Maintain head fog particles
   if (particles.filter(p => p.isHeadFog).length < 25) {
     spawnHeadFogParticles(5);
   }
 }, 20);

 // Check if point is inside avatar's head area
 function isInsideAvatar(x, y) {
   const avatar = document.querySelector('.avatar-container');
   const rect = avatar.getBoundingClientRect();
   const centerX = rect.left + rect.width / 2;
   const centerY = rect.top + rect.height / 2 - 60;
   const radius = 100; // Approximate head radius
   
   const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
   return distance < radius;
 }

 window.addEventListener("mousemove", (e) => {
   // Only create particles outside avatar head area
   if (!isInsideAvatar(e.clientX, e.clientY)) {
     for (let i = 0; i < 8; i++) {
       particles.push(
         new Particle(e.clientX, e.clientY, {
           radius: 20,
           alpha: 1,
           fade: 0.001,
           speed: 2,
           color: `black`,
           glow: false,
           isPermanent: false
         })
       );
     }
   }
 });

 window.addEventListener("click", (e) => {
   // Only create particles outside avatar head area
   if (!isInsideAvatar(e.clientX, e.clientY)) {
     for (let i = 0; i < 30; i++) {
       const r = Math.floor(Math.random() * 255);
       const g = Math.floor(Math.random() * 255);
       const b = Math.floor(Math.random() * 255);
       particles.push(
         new Particle(e.clientX, e.clientY, {
           radius: 8 + Math.random() * 6,
           alpha: 1,
           fade: 0.02,
           speed: 3,
           color: `rgba(${r}, ${g}, ${b}, ALPHA)`,
           glow: true,
           glowColor: `rgb(${r}, ${g}, ${b})`,
           isPermanent: false
         })
       );
     }
   }
 });

 function animate() {
   ctx.clearRect(0, 0, width, height);
   particles = particles.filter((p) => {
     if (p.alpha === undefined) return true;
     return p.alpha > 0.01 && p.radius > 0.5;
   });
   for (let i = 0; i < particles.length; i++) {
     if (particles[i].update) particles[i].update();
     if (particles[i].draw) particles[i].draw(ctx);
   }
   requestAnimationFrame(animate);
 }

 // Enhanced Name Animation
 document.addEventListener('DOMContentLoaded', function() {
   const name = "Raslen Neji";
   const animatedName = document.getElementById('animatedName');
   
   for (let i = 0; i < name.length; i++) {
     const charSpan = document.createElement('span');
     charSpan.className = 'animated-char';
     charSpan.textContent = name[i];
     charSpan.style.setProperty('--char-index', i);
     
     if (name[i] === ' ') {
       charSpan.classList.add('space-char');
     }
     
     animatedName.appendChild(charSpan);
   }

   // Random animation intensity
   setInterval(() => {
     const chars = document.querySelectorAll('.animated-char');
     const intensity = 0.8 + Math.random() * 0.7;
     chars.forEach(char => {
       char.style.animationDuration = `${3 * intensity}s, ${8 * intensity}s, ${6 * intensity}s`;
     });
   }, 8000);

   // Avatar eye movement
   document.addEventListener("mousemove", (e) => {
     const container = document.querySelector(".avatar-container");
     const rect = container.getBoundingClientRect();
     const mouseX = e.clientX - rect.left;
     const mouseY = e.clientY - rect.top;
     
     const movePupil = (eyeX, eyeY, pupilID) => {
         const dx = mouseX - eyeX;
         const dy = mouseY - eyeY;
         const angle = Math.atan2(dy, dx);
         const distance = Math.min(6, Math.sqrt(dx*dx + dy*dy)/25);
         const pupil = document.getElementById(pupilID);
         pupil.style.transform = `translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px)`;
     };
     
     movePupil(90, 120, "pupil-left");
     movePupil(210, 120, "pupil-right");
   });

   // Navigation functionality
   const menuToggle = document.querySelector('.menu-toggle');
   const navLinks = document.querySelector('.nav-links');
   
   menuToggle.addEventListener('click', function() {
     navLinks.classList.toggle('active');
     menuToggle.innerHTML = navLinks.classList.contains('active') ? 
       '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
   });
   
   const themeToggle = document.querySelector('.theme-toggle');
   themeToggle.addEventListener('click', function() {
     document.body.classList.toggle('dark-mode');
     themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? 
       '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
   });
   
   window.addEventListener('scroll', function() {
     const nav = document.querySelector('.glass-nav');
     if (window.scrollY > 50) {
       nav.style.background = 'rgba(255, 255, 255, 0.95)';
       nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
     } else {
       nav.style.background = 'rgba(255, 255, 255, 0.8)';
       nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
     }
   });
   
   document.querySelectorAll('.nav-link').forEach(link => {
     link.addEventListener('click', function() {
       if (navLinks.classList.contains('active')) {
         navLinks.classList.remove('active');
         menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
       }
     });
   });
 });

 animate();