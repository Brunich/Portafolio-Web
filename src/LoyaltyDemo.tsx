import { useEffect, useRef, useState } from 'react';
import './loyalty-demo.css';

// Club de clientes por NFC: el mesero apoya el celular del cliente en un chip,
// se suma un sello en su tarjeta del Wallet y el sistema le escribe por WhatsApp
// en el momento justo. Aquí se simula en el navegador; la tarjeta real está en Stamp.tsx.
const GOAL = 8;
const DAY = 24 * 60 * 60 * 1000;
const START = new Date(2026, 9, 6, 14, 10).getTime(); // martes 6 de octubre, 14:10

type Msg ={ id: number; at: number; text: [string, string]; action?: 'review' | 'reserve'; done?: boolean };
type Log = { id: number; at: number; text: [string, string]; kind: 'visit' | 'msg' | 'rule' | 'win' };
type Screen = 'lock' | 'join' | 'wallet' | 'chat';

export default function LoyaltyDemo({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const t = (a: string, b: string) => (es ? a : b);
 const [now, setNow] = useState(START);
 const [screen, setScreen] = useState<Screen>('lock');
 const [member, setMember] = useState<{ name: string; phone: string; birthday: string } | null>(null);
 const [form, setForm] = useState({ name: 'Mariana', phone: '81 5550 0142', birthday: '1999-11-02' });
 const [stamps, setStamps] = useState(0);
 const [rewards, setRewards] = useState(0);
 const [lastVisit, setLastVisit] = useState<number | null>(null);
 const [pendingReview, setPendingReview] = useState(false);
 const [msgs, setMsgs] = useState<Msg[]>([]);
 const [log, setLog] = useState<Log[]>([]);
 const [stats, setStats] = useState({ visits: 0, sent: 0, reviews: 0, reservations: 0 });
 const [tapping, setTapping] = useState(false);
 const [fresh, setFresh] = useState(-1);
 const [unread, setUnread] = useState(0);
 const seq = useRef(0);
 const chat = useRef<HTMLDivElement>(null);

 useEffect(() => { chat.current?.scrollTo({ top: chat.current.scrollHeight, behavior: 'smooth' }); }, [msgs, screen]);
 useEffect(() => { if (screen === 'chat') setUnread(0); }, [screen]);

 const when = (ms: number) => { const s = new Date(ms).toLocaleString(es ? 'es-MX' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); return s.charAt(0).toUpperCase() + s.slice(1); };
 const clock = (ms: number) => new Date(ms).toLocaleTimeString(es ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' });
 const note = (text: [string, string], kind: Log['kind'], at = now) => setLog(l => [{ id: ++seq.current, at, text, kind }, ...l].slice(0, 9));
 const send = (text: [string, string], at: number, action?: Msg['action']) => {
  setMsgs(m => [...m, { id: ++seq.current, at, text, action }]);
  setStats(s => ({ ...s, sent: s.sent + 1 }));
  setUnread(u => u + 1);
  setScreen('chat');
 };
 const first = member?.name ?? form.name;

 function tap() {
  setTapping(true); setTimeout(() => setTapping(false), 700);
  if (!member) { setScreen('join'); note(['Chip leído · cliente nuevo, se le pide unirse', 'Chip read · new customer, asked to join'], 'visit'); return; }
  // Regla contra trampas: un sello por día, aunque apoyen el celular varias veces.
  if (lastVisit !== null && new Date(lastVisit).toDateString() === new Date(now).toDateString()) {
   setScreen('wallet'); note([`Segundo toque de ${first} hoy · no suma sello`, `${first}’s second tap today · no stamp`], 'rule'); return;
  }
  stamp();
 }
 function stamp(at = now) {
  const next = stamps + 1;
  setStats(s => ({ ...s, visits: s.visits + 1 }));
  setLastVisit(at); setPendingReview(true); setScreen('wallet');
  if (next >= GOAL) {
   setStamps(0); setRewards(r => r + 1); setFresh(GOAL - 1);
   note([`${first} completó ${GOAL} sellos · premio desbloqueado`, `${first} completed ${GOAL} stamps · reward unlocked`], 'win', at);
  } else {
   setStamps(next); setFresh(next - 1);
   note([`Visita de ${first} · sello ${next} de ${GOAL}`, `${first}’s visit · stamp ${next} of ${GOAL}`], 'visit', at);
  }
 }
 function join(e: React.FormEvent) {
  e.preventDefault();
  if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 10) return;
  setMember({ ...form, name: form.name.trim() });
  note([`${form.name.trim()} se unió al club · tarjeta enviada al Wallet`, `${form.name.trim()} joined · pass added to Wallet`], 'win');
  setTimeout(() => stamp(now), 0);
 }
 function advance(kind: 'hours' | 'weeks' | 'birthday') {
  if (!member) return;
  if (kind === 'hours') {
   const at = now + 2 * 60 * 60 * 1000; setNow(at);
   if (pendingReview) {
    setPendingReview(false);
    send([`Hola ${first}, gracias por venir hoy a El Cerro. ¿Qué tal estuvo todo? Si te gustó, una reseña nos ayuda muchísimo.`, `Hi ${first}, thanks for coming to El Cerro today. How was everything? If you liked it, a review helps us a lot.`], at, 'review');
    note(['2 h después de la visita · se pidió una reseña', '2 h after the visit · review requested'], 'msg', at);
   } else note(['Pasaron 2 horas · nada pendiente', '2 hours passed · nothing pending'], 'rule', at);
  }
  if (kind === 'weeks') {
   const at = now + 35 * DAY; setNow(at);
   send([`${first}, hace más de un mes que no te vemos. Tu próxima visita trae un agua fresca de regalo: sólo muestra tu tarjeta.`, `${first}, it’s been over a month. Your next visit comes with a free agua fresca: just show your card.`], at);
   note(['35 días sin venir · mensaje para que vuelva', '35 days without a visit · win-back message'], 'msg', at);
  }
  if (kind === 'birthday') {
   const [, m, d] = member.birthday.split('-').map(Number);
   let b = new Date(new Date(now).getFullYear(), m - 1, d, 11, 0).getTime() - 7 * DAY;
   if (b <= now) b = new Date(new Date(now).getFullYear() + 1, m - 1, d, 11, 0).getTime() - 7 * DAY;
   setNow(b);
   send([`¡Se acerca tu cumpleaños, ${first}! Ven a festejarlo esta semana: el postre de la casa va por nuestra cuenta.`, `Your birthday is coming up, ${first}! Celebrate with us this week: the house dessert is on us.`], b);
   note(['7 días antes del cumpleaños · promoción enviada', '7 days before birthday · promo sent'], 'msg', b);
  }
 }
 function campaign() {
  if (!member) return;
  send(['Este viernes: 2×1 en tacos al pastor de 7 a 10 pm. ¿Te apartamos mesa?', 'This Friday: 2-for-1 al pastor tacos, 7 to 10 pm. Want us to save you a table?'], now, 'reserve');
  note(['Campaña enviada a todo el club', 'Campaign sent to the whole club'], 'msg');
 }
 function act(m: Msg) {
  setMsgs(all => all.map(x => x.id === m.id ? { ...x, done: true } : x));
  if (m.action === 'review') {
   setStats(s => ({ ...s, reviews: s.reviews + 1 }));
   setMsgs(all => [...all, { id: ++seq.current, at: now, text: ['Se abrió Google Maps en la ficha del restaurante para dejar la reseña. ¡Gracias!', 'Google Maps opened on the restaurant page to leave the review. Thank you!'] }]);
   note([`${first} abrió el enlace de reseña`, `${first} opened the review link`], 'win');
  } else {
   setStats(s => ({ ...s, reservations: s.reservations + 1 }));
   setMsgs(all => [...all, { id: ++seq.current, at: now, text: ['Quedó confirmada tu reserva para 4 personas el viernes a las 21:00. ¡Te esperamos!', 'Your table for 4 is confirmed for Friday at 9:00 pm. See you then!'] }]);
   note(['Reserva confirmada desde WhatsApp · 4 personas', 'Booking confirmed from WhatsApp · 4 guests'], 'win');
  }
 }
 function reset() {
  setNow(START); setScreen('lock'); setMember(null); setStamps(0); setRewards(0); setLastVisit(null); setPendingReview(false);
  setMsgs([]); setLog([]); setStats({ visits: 0, sent: 0, reviews: 0, reservations: 0 }); setFresh(-1); setUnread(0);
 }

 return <div className="ld">
  <div className="ld-stage">
   {/* Celular del cliente */}
   <div className={`ld-phone${tapping ? ' ld-tapping' : ''}`}>
    <div className="ld-notch" aria-hidden="true"/>
    <div className="ld-status" aria-hidden="true"><span>{clock(now)}</span><span>5G ▮▮▮</span></div>
    <div className="ld-screen" aria-live="polite">
     {screen === 'lock' && <div className="ld-lock"><strong>{clock(now)}</strong><span>{when(now)}</span><p>{t('Pide la cuenta. El mesero apoya el chip de la carpeta en tu celular.', 'Ask for the bill. The waiter taps the folder’s chip on your phone.')}</p></div>}
     {screen === 'join' && <form className="ld-join" onSubmit={join}>
      <span className="ld-url">elcerro.club/t/mesa-7</span>
      <div className="ld-brand" aria-hidden="true">EC</div>
      <h3>{t('Únete al club de El Cerro', 'Join El Cerro’s club')}</h3>
      <p>{t(`Cada visita suma un sello. Con ${GOAL}, la comida va por la casa.`, `Every visit adds a stamp. With ${GOAL}, your meal is on the house.`)}</p>
      <label>{t('Nombre', 'Name')}<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required/></label>
      <label>WhatsApp<input value={form.phone} inputMode="tel" onChange={e => setForm({ ...form, phone: e.target.value })} required/></label>
      <label>{t('Cumpleaños', 'Birthday')}<input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} required/></label>
      <button type="submit">{t('Agregar a mi Wallet', 'Add to my Wallet')}</button>
      <small>{t('Acepto recibir mensajes de El Cerro. Escribe BAJA para dejar de recibirlos.', 'I agree to receive messages from El Cerro. Reply STOP to opt out.')}</small>
     </form>}
     {screen === 'wallet' && member && <div className="ld-wallet">
      <span className="ld-app">Wallet</span>
      <div className="ld-pass">
       <div className="ld-pass-top"><span className="ld-brand" aria-hidden="true">EC</span><div><strong>El Cerro</strong><small>{t('Restaurante · Monterrey', 'Restaurant · Monterrey')}</small></div><span className="ld-pass-count">{stamps}/{GOAL}</span></div>
       <div className="ld-stamps" role="img" aria-label={t(`${stamps} de ${GOAL} sellos`, `${stamps} of ${GOAL} stamps`)}>
        {Array.from({ length: GOAL }, (_, i) => <span key={i} className={`${i < stamps ? 'on' : ''}${i === fresh ? ' fresh' : ''}`}>{i === GOAL - 1 ? '★' : ''}</span>)}
       </div>
       {rewards > 0 && <p className="ld-reward">{t(`${rewards} comida${rewards > 1 ? 's' : ''} gratis lista${rewards > 1 ? 's' : ''} para canjear`, `${rewards} free meal${rewards > 1 ? 's' : ''} ready to redeem`)}</p>}
       <div className="ld-pass-foot"><span>{member.name}</span><span>{t('Miembro desde oct 2026', 'Member since Oct 2026')}</span></div>
      </div>
      <p className="ld-hint">{t('Vive en el Wallet: sin app ni tarjeta de cartón.', 'Lives in the Wallet: no app, no paper card.')}</p>
     </div>}
     {screen === 'chat' && <div className="ld-chat">
      <div className="ld-chat-head"><span className="ld-brand" aria-hidden="true">EC</span><div><strong>El Cerro</strong><small>{t('Cuenta de empresa', 'Business account')}</small></div></div>
      <div className="ld-chat-body" ref={chat}>
       {msgs.map(m => <div key={m.id} className="ld-bubble"><p>{m.text[L]}</p>
        {m.action && !m.done && <button onClick={() => act(m)}>{m.action === 'review' ? t('Dejar reseña en Google', 'Leave a Google review') : t('Reservar mesa', 'Book a table')}</button>}
        <time>{clock(m.at)}</time></div>)}
      </div>
     </div>}
    </div>
    <div className="ld-tabs">
     <button aria-pressed={screen === 'wallet'} disabled={!member} onClick={() => setScreen('wallet')}>Wallet</button>
     <button aria-pressed={screen === 'chat'} disabled={!msgs.length} onClick={() => setScreen('chat')}>WhatsApp{unread > 0 && screen !== 'chat' && <span className="ld-badge">{unread}</span>}</button>
    </div>
   </div>

   {/* Lo que hace el mesero y el paso del tiempo */}
   <div className="ld-controls">
    <button className={`ld-chip${tapping ? ' on' : ''}`} onClick={tap}>
     <span className="ld-rings" aria-hidden="true"><i/><i/><i/></span>
     <span className="ld-chip-icon" aria-hidden="true">NFC</span>
     <span><strong>{t('Apoyar el celular en el chip', 'Tap the phone on the chip')}</strong><small>{member ? t('Suma la visita de hoy', 'Adds today’s visit') : t('Primera vez: le pide unirse', 'First time: asks to join')}</small></span>
    </button>
    <p className="ld-label">{t('Adelantar el tiempo', 'Fast-forward')}</p>
    <div className="ld-time">
     <button disabled={!member} onClick={() => advance('hours')}>{t('+2 horas', '+2 hours')}<small>{t('pide reseña', 'asks for review')}</small></button>
     <button disabled={!member} onClick={() => advance('weeks')}>{t('+5 semanas sin venir', '+5 weeks away')}<small>{t('lo invita a volver', 'invites them back')}</small></button>
     <button disabled={!member} onClick={() => advance('birthday')}>{t('Su cumpleaños', 'Their birthday')}<small>{t('7 días antes', '7 days before')}</small></button>
    </div>
    <p className="ld-label">{t('Desde el panel del local', 'From the business panel')}</p>
    <button className="ld-campaign" disabled={!member} onClick={campaign}>{t('Enviar campaña: 2×1 el viernes', 'Send campaign: Friday 2-for-1')}</button>
    <button className="ld-reset" onClick={reset}>{t('Empezar de nuevo', 'Start over')}</button>
    {!member && <p className="ld-tip">{t('Empieza apoyando el celular en el chip.', 'Start by tapping the phone on the chip.')}</p>}
   </div>

   {/* Panel del dueño */}
   <div className="ld-panel">
    <div className="ld-panel-head"><strong>{t('Panel de El Cerro', 'El Cerro dashboard')}</strong><span>{when(now)}</span></div>
    <dl className="ld-kpis">
     <div><dt>{t('En el club', 'Members')}</dt><dd>{member ? 1 : 0}</dd></div>
     <div><dt>{t('Visitas', 'Visits')}</dt><dd>{stats.visits}</dd></div>
     <div><dt>{t('Mensajes', 'Messages')}</dt><dd>{stats.sent}</dd></div>
     <div><dt>{t('Reseñas', 'Reviews')}</dt><dd>{stats.reviews}</dd></div>
    </dl>
    {member && <div className="ld-contact"><span className="ld-avatar" aria-hidden="true">{member.name.charAt(0).toUpperCase()}</span><div><strong>{member.name}</strong><small>{member.phone} · {t('cumple', 'bday')} {member.birthday.slice(5).split('-').reverse().join('/')}</small></div><span className="ld-stampmini">{stamps}/{GOAL}</span></div>}
    <p className="ld-label">{t('Lo que pasó', 'Activity')}</p>
    <ol className="ld-log" aria-live="polite">
     {log.length === 0 && <li className="ld-empty">{t('Aún no hay visitas.', 'No visits yet.')}</li>}
     {log.map(l => <li key={l.id} className={`ld-${l.kind}`}><time>{when(l.at)}</time>{l.text[L]}</li>)}
    </ol>
   </div>
  </div>
  <p className="ld-note">{t('El Cerro es un restaurante de ejemplo y en esta demo no se envía ningún WhatsApp.', 'El Cerro is a sample restaurant and this demo sends no WhatsApp messages.')}</p>
 </div>;
}
