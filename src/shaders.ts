export const sculptureVertex = `
uniform float uTime;
uniform float uIntensity;
uniform float uWater;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vWave;
void main(){
 vec3 p=position;
 float wave=sin(p.x*2.2+uTime*.8)*.055+sin(p.z*3.4-p.x+uTime*.65)*.035;
 p.y+=wave*uWater*uIntensity;
 vWave=wave;
 vec4 world=modelMatrix*vec4(p,1.0);
 vWorld=world.xyz;
 vNormal=normalize(mat3(modelMatrix)*normal);
 gl_Position=projectionMatrix*viewMatrix*world;
}`;
export const sculptureFragment = `
uniform float uTime;
uniform float uIntensity;
uniform float uMode;
uniform float uWater;
uniform float uBase;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vWave;
void main(){
 vec3 p=vWorld;
 if(uMode>1.5 && uBase<.5) p=floor(p*16.0)/16.0;
 vec3 n=normalize(vNormal);
 float d=max(dot(n,normalize(vec3(-.7,1.0,.5))),0.0);
 if(uMode>.5 && uMode<1.5 && uBase<.5)d=floor(d*4.0)/3.0;
 vec3 color;
 if(uWater>.5){
  float ripple=sin(p.x*8.0+sin(p.z*6.0+uTime)*1.2+uTime*.8);
  float shore=abs(length(p.xz*vec2(.85,1.0))-1.25);
  float foam=(1.0-smoothstep(.07,.28,shore))*(.6+.4*sin(p.x*17.0+p.z*15.0+uTime*1.4));
  float crest=smoothstep(.65,.98,ripple)*.25*uIntensity;
  color=mix(vec3(.025,.19,.34),vec3(.09,.49,.67),.45+vWave*3.0);
  color+=vec3(.2,.45,.5)*crest;
  color=mix(color,vec3(.73,.94,.91),foam*.8);
  float glint=pow(max(0.0,sin(p.x*19.0+sin(p.z*8.0)+uTime)),18.0);
  color+=vec3(.33,.6,.69)*glint*.2;
  if(uMode>.5&&uMode<1.5)color=floor(color*6.0)/6.0;
 }else{
  float strata=sin(p.y*15.0+p.x*3.0+p.z*4.0)*.045;
  color=mix(vec3(.17,.22,.28),vec3(.68,.66,.57),d)+strata;
  float moss=smoothstep(.48,.84,n.y)*smoothstep(.5,1.2,p.y);
  color=mix(color,vec3(.36,.48,.31)*(.6+d*.5),moss*.8);
  color*=.75+.25*smoothstep(-.05,.5,p.y);
 }
 if(uBase>.5){color=mix(vec3(.2,.28,.38),vec3(.53,.62,.7),d);if(uWater>.5)color=vec3(.22,.34,.45)+vWave*.5;}
 if(uMode>1.5&&uBase<.5)color=floor(color*8.0)/8.0;
 float fog=smoothstep(7.0,28.0,length(vWorld.xz));
 color=mix(color,vec3(.30,.44,.58),fog);
 gl_FragColor=vec4(color,1.0);
}`;
