
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultEl = document.getElementById("result");

const slices = ["مكونات حاسب","تك ورش الكترونية","أساسيات شبكات حاسب","الكترونات قوى كهربية","الكترونيات رقمية","معالجات ومتحكمات دقيقة","دوائر الكترونية","بلايستيشن"];
const colors = ["#ff7f27","#00a2e8","#ffc90e","#22b14c","#a349a4","#ed1e79","#b5e61d","#3f48cc"];

let angle = 0;
let spinning = false;

// زاوية السهم: 0 = فوق ، Math.PI/2 = يمين ، Math.PI = تحت ، -Math.PI/2 = شمال
const pointerAngle = Math.PI / -4; // السهم يمين
function drawWheel(){
  const R = canvas.width/2;
  const N = slices.length;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(R,R);
  ctx.rotate(angle);
  for(let i=0;i<N;i++){
    const start=(i*2*Math.PI)/N;
    const end=((i+1)*2*Math.PI)/N;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,R,start,end);
    ctx.closePath();
    ctx.fillStyle=colors[i%colors.length];
    ctx.fill();
    ctx.strokeStyle="#222";
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.save();
    ctx.rotate((start+end)/2);
    ctx.textAlign="right";
    ctx.fillStyle="white";
    ctx.font="bold 20px Segoe UI";
    ctx.translate(R-30,0);
    ctx.fillText(slices[i],0,8);
    ctx.restore();
  }
  ctx.restore();
}

function spin(){
  if(spinning) return;
  spinning=true;
  resultEl.style.opacity=0;
  const N=slices.length;
  const sliceAngle=2*Math.PI/N;
  const winner=Math.floor(Math.random()*N);
  const targetAngle=(2*Math.PI)-(winner+0.5)*sliceAngle;
  const fullTurns=6+Math.floor(Math.random()*4);
  const finalAngle=fullTurns*2*Math.PI+targetAngle;
  const start=performance.now();
  const duration=4200+Math.random()*800;
  function frame(now){
    const t=Math.min((now-start)/duration,1);
    const eased=1-Math.pow(1-t,3);
    angle=eased*finalAngle;
    drawWheel();
    if(t<1){ requestAnimationFrame(frame); }
    else {
      spinning=false;
      // حساب النتيجة حسب زاوية السهم
      let final = angle % (2*Math.PI);
      if(final<0) final += 2*Math.PI;
      const idx = Math.floor((N - ((final - pointerAngle + 2*Math.PI) % (2*Math.PI)) / sliceAngle)) % N;
      const resultText="Result: "+slices[idx];
      resultEl.textContent=resultText;
      resultEl.style.opacity=1;
      canvas.classList.add("shake");
      setTimeout(()=>canvas.classList.remove("shake"),600);
    }
  }
  requestAnimationFrame(frame);
}

spinBtn.addEventListener("click",spin);
drawWheel();
