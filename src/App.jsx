import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Users, Compass, Bell, UserRound, Search, Plus, Send, Smile, LogOut, House, Palette, ShoppingBag, BriefcaseBusiness, Store, MoreHorizontal, Pencil, Trash2, X, Archive, BellOff, Volume2, ChevronLeft, ChevronRight, Eye, Settings as SettingsIcon, Sun, Moon, Mic, Camera, Square, ShieldAlert, Ban, Pin, Gamepad2, Trophy } from 'lucide-react';
import { supabase } from './lib/supabase';
import * as THREE from 'three';
import ExpansionGames from './ExpansionGames';

const fallbackChats = [{ id: 'welcome', name: 'Welcome to GRIN', preview: 'This is where your conversations come alive.', initials: 'G' }];

const footballTriviaEasy = [{"q":"Which country won the 2022 FIFA Men's World Cup?","options":["France","Argentina","Croatia","Brazil"],"answer":1,"explain":"Argentina beat France on penalties in the final."},{"q":"How many players does one team normally have on the pitch at kickoff?","options":["9","10","11","12"],"answer":2,"explain":"A full side has 11 players, including the goalkeeper."},{"q":"What is the standard length of a football match, before added time?","options":["80 minutes","90 minutes","100 minutes","120 minutes"],"answer":1,"explain":"Two 45-minute halves make 90 minutes."},{"q":"Which card means a player is sent off?","options":["Blue","Green","Yellow","Red"],"answer":3,"explain":"A red card sends a player off."},{"q":"What is it called when a player scores three goals in one match?","options":["A hat-trick","A clean sheet","A brace","A treble save"],"answer":0,"explain":"Three goals by one player is a hat-trick."},{"q":"Which position is usually the only one allowed to handle the ball inside their own penalty area?","options":["Centre-back","Striker","Goalkeeper","Captain"],"answer":2,"explain":"The goalkeeper can handle the ball inside their own penalty area, subject to the Laws of the Game."},{"q":"How far is the penalty spot from the goal line?","options":["9 metres","10 metres","11 metres","12 metres"],"answer":2,"explain":"The penalty mark is 11 metres (12 yards) from the goal line."},{"q":"Which tournament is contested by European national teams?","options":["Copa América","UEFA European Championship","AFC Asian Cup","Africa Cup of Nations"],"answer":1,"explain":"The UEFA European Championship is Europe's national-team tournament."},{"q":"What does VAR stand for in football?","options":["Video Assistant Referee","Verified Action Review","Virtual Assistant Replay","Video Attack Rule"],"answer":0,"explain":"VAR means Video Assistant Referee."},{"q":"How many points does a team earn for a win in most league competitions?","options":["1","2","3","4"],"answer":2,"explain":"Most league systems award three points for a win."}];
const footballTriviaMedium = [{"q":"Which club won the first Premier League season in 1992–93?","options":["Manchester United","Blackburn Rovers","Arsenal","Leeds United"],"answer":0,"explain":"Manchester United won the inaugural Premier League title."},{"q":"Which country won AFCON 2023, played in early 2024?","options":["Nigeria","Senegal","Ivory Coast","Morocco"],"answer":2,"explain":"Ivory Coast came back to beat Nigeria in the final."},{"q":"Who scored 36 goals in the 2022–23 Premier League season?","options":["Mohamed Salah","Erling Haaland","Alan Shearer","Harry Kane"],"answer":1,"explain":"Erling Haaland set the 38-game-season record with 36 goals."},{"q":"Which club is nicknamed Los Colchoneros?","options":["Real Madrid","Barcelona","Atlético Madrid","Sevilla"],"answer":2,"explain":"Atlético Madrid are known as Los Colchoneros."},{"q":"Which nation won the 2018 FIFA Men's World Cup?","options":["Germany","France","Argentina","Portugal"],"answer":1,"explain":"France beat Croatia 4–2 in the final."},{"q":"What is the usual maximum substitutions under the five-substitution rule?","options":["3","4","5","6"],"answer":2,"explain":"Many competitions use a five-substitution maximum, subject to competition rules."},{"q":"Which goalkeeper was Italy's first choice during their 2006 World Cup triumph?","options":["Gianluigi Buffon","Dino Zoff","Walter Zenga","Angelo Peruzzi"],"answer":0,"explain":"Buffon was Italy's first-choice goalkeeper in 2006."},{"q":"Which club plays at Signal Iduna Park?","options":["Bayern Munich","Borussia Dortmund","RB Leipzig","Schalke 04"],"answer":1,"explain":"Signal Iduna Park is Borussia Dortmund's home stadium."},{"q":"Which country hosted the 2010 FIFA Men's World Cup?","options":["Brazil","Germany","South Africa","Mexico"],"answer":2,"explain":"South Africa was the first African nation to host the tournament."},{"q":"How many teams competed in the first Premier League season?","options":["18","20","22","24"],"answer":2,"explain":"The 1992–93 Premier League had 22 clubs."}];
const footballTriviaHard = [{"q":"Which club won the first European Cup in 1956?","options":["AC Milan","Real Madrid","Benfica","Stade de Reims"],"answer":1,"explain":"Real Madrid beat Stade de Reims in the inaugural final."},{"q":"Who scored the fastest goal in FIFA Men's World Cup history?","options":["Hakan Şükür","Miroslav Klose","Clint Dempsey","Robbie Keane"],"answer":0,"explain":"Hakan Şükür scored after about 11 seconds for Türkiye in 2002."},{"q":"Who won the inaugural UEFA European Championship in 1960?","options":["Spain","Soviet Union","Yugoslavia","Hungary"],"answer":1,"explain":"The Soviet Union won the 1960 final against Yugoslavia."},{"q":"Who was the first player to win the Ballon d'Or three times?","options":["Johan Cruyff","Michel Platini","Alfredo Di Stéfano","Marco van Basten"],"answer":0,"explain":"Johan Cruyff won in 1971, 1973 and 1974."},{"q":"Which African nation first reached the men's World Cup quarter-finals?","options":["Ghana","Cameroon","Senegal","Nigeria"],"answer":1,"explain":"Cameroon reached the quarter-finals in 1990."},{"q":"Which club won the 2004 UEFA Champions League final?","options":["Porto","Monaco","AC Milan","Liverpool"],"answer":0,"explain":"Porto beat Monaco 3–0."},{"q":"Who scored the winning goal in the 2010 World Cup final?","options":["David Villa","Xavi","Andrés Iniesta","Fernando Torres"],"answer":2,"explain":"Iniesta scored in extra time against the Netherlands."},{"q":"Which team completed the Premier League season unbeaten in 2003–04?","options":["Chelsea","Arsenal","Manchester United","Liverpool"],"answer":1,"explain":"Arsenal's Invincibles finished the league season unbeaten."},{"q":"Who won the first Africa Cup of Nations in 1957?","options":["Egypt","Ethiopia","South Africa","Sudan"],"answer":0,"explain":"Egypt won the inaugural tournament."},{"q":"Who scored a hat-trick in the 1966 World Cup final?","options":["Geoff Hurst","Bobby Charlton","Eusébio","Pelé"],"answer":0,"explain":"Geoff Hurst scored three times for England."}];
const footballTriviaQuestionSets = { Easy: footballTriviaEasy, Medium: footballTriviaMedium, Hard: footballTriviaHard };

function buildTriviaRound(level, recentByDifficulty = {}) {
  const pool = footballTriviaQuestionSets[level] || footballTriviaEasy;
  const recent = recentByDifficulty[level] || [];
  let available = pool.filter(question => !recent.includes(question.q));
  if (available.length < 5) available = pool.slice();
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, 5);
}



function Penalty3D({ animation, result, phase, shotPower = 70 }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer, raf = 0, disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111b27');
    scene.fog = new THREE.Fog('#111b27', 22, 48);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 3.55, 11.8);
    camera.lookAt(0, 1.25, -2.9);
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }); }
    catch (e) { host.innerHTML = '<div class="penalty-3d-fallback">3D graphics are unavailable in this browser. Try opening GRIN in Chrome.</div>'; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(host.clientWidth || 360, host.clientHeight || 360);
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x183323, 2.35));
    const sun = new THREE.DirectionalLight(0xfff1d2, 3);
    sun.position.set(-5, 11, 8); sun.castShadow = true; sun.shadow.mapSize.set(768,768); scene.add(sun);
    const fill = new THREE.DirectionalLight(0x88baff, 1.5); fill.position.set(7,6,-8); scene.add(fill);
    const material = (color, roughness=0.8) => new THREE.MeshStandardMaterial({color, roughness});
    const white = material('#e5ebe7',0.45), net = new THREE.MeshStandardMaterial({color:'#dce7e2',transparent:true,opacity:0.28});
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(36,42),material('#17613b'));
    ground.rotation.x=-Math.PI/2; ground.position.set(0,-0.04,-3); ground.receiveShadow=true; scene.add(ground);
    for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(36,2.55),material(i%2?'#1b7043':'#145734'));m.rotation.x=-Math.PI/2;m.position.set(0,-0.025,14-i*4.5);scene.add(m);}
    const line=(a,b,mat=white,r=.025)=>{const d=new THREE.Vector3().subVectors(b,a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());scene.add(m);return m;};
    line(new THREE.Vector3(-7,.015,-13),new THREE.Vector3(7,.015,-13));line(new THREE.Vector3(-7,.015,-13),new THREE.Vector3(-7,.015,-5));line(new THREE.Vector3(7,.015,-13),new THREE.Vector3(7,.015,-5));line(new THREE.Vector3(-7,.015,-5),new THREE.Vector3(7,.015,-5));
    const spot=new THREE.Mesh(new THREE.CircleGeometry(.075,16),white);spot.rotation.x=-Math.PI/2;spot.position.set(0,.018,5);scene.add(spot);
    const W=7.2,H=2.85,Z=-6.2,D=1.45;
    line(new THREE.Vector3(-W/2,.04,Z),new THREE.Vector3(W/2,.04,Z),white,.06);
    line(new THREE.Vector3(-W/2,.04,Z),new THREE.Vector3(-W/2,H,Z),white,.06);line(new THREE.Vector3(W/2,.04,Z),new THREE.Vector3(W/2,H,Z),white,.06);line(new THREE.Vector3(-W/2,H,Z),new THREE.Vector3(W/2,H,Z),white,.06);
    line(new THREE.Vector3(-W/2,H,Z),new THREE.Vector3(-W/2,H-.15,Z-D));line(new THREE.Vector3(W/2,H,Z),new THREE.Vector3(W/2,H-.15,Z-D));line(new THREE.Vector3(-W/2,H-.15,Z-D),new THREE.Vector3(W/2,H-.15,Z-D));
    for(let x=-W/2;x<=W/2+.01;x+=.45)line(new THREE.Vector3(x,.05,Z),new THREE.Vector3(x,H,Z),net,.012);
    for(let y=.25;y<H;y+=.38)line(new THREE.Vector3(-W/2,y,Z),new THREE.Vector3(W/2,y,Z),net,.012);
    for(let x=-W/2;x<=W/2+.01;x+=.6)line(new THREE.Vector3(x,.05,Z-D),new THREE.Vector3(x,H-.15,Z),net,.01);
    for(let tier=0;tier<5;tier++){const row=new THREE.Mesh(new THREE.BoxGeometry(35,.58,1.2),material(tier%2?'#293847':'#1d2b3a'));row.position.set(0,2+tier*.72,-15.5-tier*.42);scene.add(row);for(let j=0;j<50;j++){const colors=['#37434c','#7b6556','#495563','#293746'];const seat=new THREE.Mesh(new THREE.BoxGeometry(.35,.2,.2),material(colors[(j+tier)%4]));seat.position.set(-16.5+j*.67,2.35+tier*.72,-15.1-tier*.42);scene.add(seat);}}
    for(const x of [-12,12]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,7,8),material('#152334'));pole.position.set(x,3.5,-8);scene.add(pole);const light=new THREE.PointLight(0xfff0c8,28,24,2);light.position.set(x,7,-7);scene.add(light);}
    const keeper=new THREE.Group();keeper.position.set(0,0,-5.75);scene.add(keeper);
    const skin=material('#a96f4b'),jersey=material('#e5b631'),shorts=material('#17263a'),glove=material('#f1f0dc');
    const sphere=(r,m,p,scale)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),m);o.position.set(...p);if(scale)o.scale.set(...scale);o.castShadow=true;keeper.add(o);};
    const limb=(p1,p2,r,m)=>{const a=new THREE.Vector3(...p1),b=new THREE.Vector3(...p2),d=new THREE.Vector3().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,d.length(),8),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.castShadow=true;keeper.add(o);};
    sphere(.22,skin,[0,2.25,0],[.86,1,.86]);
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.56,4,8),jersey);torso.position.set(0,1.62,0);torso.castShadow=true;keeper.add(torso);
    const hip=new THREE.Mesh(new THREE.BoxGeometry(.52,.22,.32),shorts);hip.position.set(0,1.12,0);keeper.add(hip);
    limb([-.25,1.85,0],[-.62,1.45,0],.105,jersey);limb([-.62,1.45,0],[-.94,1.55,0],.09,jersey);limb([.25,1.85,0],[.62,1.45,0],.105,jersey);limb([.62,1.45,0],[.94,1.55,0],.09,jersey);
    sphere(.13,glove,[-.96,1.57,0]);sphere(.13,glove,[.96,1.57,0]);
    limb([-.16,1.05,0],[-.25,.52,0],.13,shorts);limb([.16,1.05,0],[.25,.52,0],.13,shorts);limb([-.25,.52,0],[-.3,.12,.06],.09,shorts);limb([.25,.52,0],[.3,.12,.06],.09,shorts);
    const ball=new THREE.Group();const ballMat=material('#f1f2ed',.4);const core=new THREE.Mesh(new THREE.SphereGeometry(.28,24,18),ballMat);core.castShadow=true;ball.add(core);
    const patchMat=material('#252b31',.5);for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.CircleGeometry(.075,5),patchMat);p.position.set(Math.cos(i*Math.PI*2/5)*.14,Math.sin(i*Math.PI*2/5)*.14,.235);p.lookAt(new THREE.Vector3(p.position.x*2,p.position.y*2,1));ball.add(p);}
    ball.position.set(0,.3,5);scene.add(ball);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.42,24),new THREE.MeshBasicMaterial({color:'#07120c',transparent:true,opacity:.28,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,.025,5);scene.add(shadow);
    sceneRef.current={renderer,camera,scene,host,ball,keeper,shadow};
    const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
    const obs=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;obs?.observe(host);resize();
    const draw=()=>{if(disposed)return;renderer.render(scene,camera);raf=requestAnimationFrame(draw);};draw();
    return ()=>{disposed=true;cancelAnimationFrame(raf);obs?.disconnect();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material?.dispose?.();});if(renderer.domElement.parentNode===host)host.removeChild(renderer.domElement);sceneRef.current=null;};
  }, []);
  useEffect(()=>{
    const o=sceneRef.current;if(!o)return;
    const {ball,keeper,shadow}=o;
    ball.position.set(0,.3,5);ball.rotation.set(0,0,0);shadow.position.set(0,.025,5);shadow.scale.setScalar(1);
    keeper.position.set(0,0,-5.75);keeper.rotation.set(0,0,0);keeper.scale.set(1,1,1);
    if(!animation||animation==='idle')return;
    const a=animation.match(/shot-(left|center|right)-(goal|saved)-keeper-(left|center|right)/);
    const b=animation.match(/keeper-(left|center|right)-(save|goal)-shot-(left|center|right)/);
    const match=a||b;if(!match)return;
    const target=a?match[1]:match[3],keeperDirection=a?match[4]:match[1],saved=a?match[2]==='saved':match[2]==='save';
    const power=Math.max(0,Math.min(100,Number(shotPower)||0));const start=performance.now(),duration=1050-power;let frame=0;
    const tick=now=>{const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,2.4);const x=target==='left'?-2.45:target==='right'?2.45:0;const y=saved?1.45:(target==='center'?2.05:1.85);const arc=(.48+power/95)*Math.sin(t*Math.PI);ball.position.set(x*e,.3+(y-.3)*e+arc,5+(-10.65)*e);ball.rotation.x=e*(7+power/18);ball.rotation.z=e*(4+power/24);shadow.position.set(ball.position.x,.025,ball.position.z);shadow.scale.setScalar(1-e*.62);if(saved||b){const d=keeperDirection==='left'?-1:keeperDirection==='right'?1:0;const dive=e*e;keeper.position.x=d*1.95*dive;keeper.position.y=.18*dive;keeper.rotation.z=-d*1.02*dive;keeper.rotation.x=-.35*dive;keeper.scale.set(1+.18*dive,1-.16*dive,1);}if(t<1)frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[animation]);
  return <div className="penalty-3d-shell"><div className="penalty-3d-hud"><span>GRIN 3D FOOTBALL</span><span>{phase==='shoot'?'ATTACK':'GOALKEEPER'}</span></div><div className="penalty-3d-canvas" ref={hostRef}/><div className={'penalty-3d-result'+(animation!=='idle'?' is-visible':'')}>{animation!=='idle'?result:''}</div><div className="penalty-3d-hint">{phase==='shoot'?'Pick your shot placement':'Read the shot and dive'}</div></div>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(() => { try { const saved = localStorage.getItem('grin-last-page'); return ['discover','chats','status','directory','explore','profile','business','creators','marketplace','jobs','communities','saved','notifications','settings','games'].includes(saved) ? saved : 'discover'; } catch { return 'discover'; } });
  const [theme, setTheme] = useState(() => { try { const saved = localStorage.getItem('grin-theme'); return ['light','dark','grin'].includes(saved) ? saved : 'grin'; } catch { return 'grin'; } });
  const [notificationToast, setNotificationToast] = useState(null);
  const [toastEnabled, setToastEnabled] = useState(() => { try { return localStorage.getItem('grin-toasts') !== 'off'; } catch { return true; } });
  const swipeStart = useRef(null);
  const navigationHistoryReady = useRef(false);
  const skipNextHistoryPush = useRef(false);
  const messagesEndRef = useRef(null);
  const skipOlderMessageScrollRef = useRef(false);
  const [gameBoard, setGameBoard] = useState(Array(9).fill(''));
  const [gameTurn, setGameTurn] = useState('X');
  const [gameRoomCode, setGameRoomCode] = useState('');
  const [gameJoinCode, setGameJoinCode] = useState('');
  const [gameMark, setGameMark] = useState('X');
  const [gameNotice, setGameNotice] = useState('');
  const [grinTicTacToeThinking, setGrinTicTacToeThinking] = useState(false);
  const [grinBotDifficulty, setGrinBotDifficulty] = useState('normal');
  const [gameInviteTarget, setGameInviteTarget] = useState('');
  const [gameInviteCommunity, setGameInviteCommunity] = useState('');
  const [selectedGrinGame, setSelectedGrinGame] = useState('ttt');
  const [numberTiles, setNumberTiles] = useState(() => create2048Board());
  const [numberScore, setNumberScore] = useState(0);
  const [numberBest, setNumberBest] = useState(0);
  const [numberNotice, setNumberNotice] = useState('Combine matching tiles to reach 2048.');
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaDifficulty, setTriviaDifficulty] = useState('Easy');
  const [triviaRoundQuestions, setTriviaRoundQuestions] = useState(() => buildTriviaRound('Easy'));
  const [triviaRecentQuestions, setTriviaRecentQuestions] = useState({});
  const activeTriviaQuestions = triviaRoundQuestions;
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaAnswer, setTriviaAnswer] = useState(null);
  const [triviaFinished, setTriviaFinished] = useState(false);

  const [connectFourBoard, setConnectFourBoard] = useState(Array(42).fill(''));
  const [connectFourThinking, setConnectFourThinking] = useState(false);
  const [connectFourNotice, setConnectFourNotice] = useState('Your turn — choose a column.');
  const [connectFourOver, setConnectFourOver] = useState(false);
  const [onlinePenaltyRoom, setOnlinePenaltyRoom] = useState('');
  const [onlinePenaltyRole, setOnlinePenaltyRole] = useState('');
  const [onlinePenaltyJoinCode, setOnlinePenaltyJoinCode] = useState('');
  const [onlinePenalty, setOnlinePenalty] = useState({turn:'host',phase:'shoot',scores:{host:0,guest:0},attempts:0,shot:'center',done:false,notice:'Create a room or join a friend to play head-to-head.'});
  const onlinePenaltyRef = useRef(onlinePenalty);
  const onlinePenaltyChannelRef = useRef(null);
  onlinePenaltyRef.current = onlinePenalty;
  const [penaltyRound, setPenaltyRound] = useState(1);
  const [penaltyPlayerGoals, setPenaltyPlayerGoals] = useState(0);
  const [penaltyBotGoals, setPenaltyBotGoals] = useState(0);
  const [penaltyPhase, setPenaltyPhase] = useState('shoot');
  const [penaltyDone, setPenaltyDone] = useState(false);
  const [penaltyNotice, setPenaltyNotice] = useState('Pick a direction to take your first penalty.');
  const [penaltyAnimation, setPenaltyAnimation] = useState('idle');
  const [penaltyLastResult, setPenaltyLastResult] = useState('');
  const [penaltyAim, setPenaltyAim] = useState('center');
  const [penaltyPower, setPenaltyPower] = useState(0);
  const [penaltyCharging, setPenaltyCharging] = useState(false);
  const penaltyChargeStartRef = useRef(0);
  const penaltyPowerRef = useRef(0);
  useEffect(() => {
    if (!penaltyCharging) return;
    const timer = window.setInterval(() => {
      const power = Math.min(100, Math.round((performance.now() - penaltyChargeStartRef.current) / 13));
      penaltyPowerRef.current = power;
      setPenaltyPower(power);
    }, 30);
    return () => window.clearInterval(timer);
  }, [penaltyCharging]);




  const [snakeBody, setSnakeBody] = useState([34, 33, 32]);
  const [snakeFood, setSnakeFood] = useState(105);
  const [snakeDirection, setSnakeDirection] = useState('right');
  const [snakeRunning, setSnakeRunning] = useState(false);
  const [snakeSpeed, setSnakeSpeed] = useState('normal');
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeOpponentBody, setSnakeOpponentBody] = useState([141,142,143]);
  const [snakeOpponentScore, setSnakeOpponentScore] = useState(0);
  const [snakeOpponentDirection, setSnakeOpponentDirection] = useState('left');
  const snakeOpponentBodyRef = useRef([141,142,143]);
  const snakeOpponentDirectionRef = useRef('left');
  const snakeOpponentScoreRef = useRef(0);
  const [snakeNotice, setSnakeNotice] = useState('Press Start Snake to play.');
  const [snakeRoomCode, setSnakeRoomCode] = useState('');
  const [snakeRoomRole, setSnakeRoomRole] = useState('');
  const [snakeJoinCode, setSnakeJoinCode] = useState('');
  const snakeChannelRef = useRef(null);
  const snakeSwipeStartRef = useRef(null);
  const [memoryCards, setMemoryCards] = useState(['🍋','🍋','🍓','🍓','🍇','🍇','🍉','🍉','🥝','🥝','🍒','🍒','🍊','🍊','🍍','🍍','🥑','🥑','🍌','🍌'].map((emoji,id)=>({id,emoji})).sort(()=>Math.random()-.5));
  const [memoryFlipped, setMemoryFlipped] = useState([]);
  const [memoryMatched, setMemoryMatched] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryDifficulty, setMemoryDifficulty] = useState('normal');
  const [memoryNotice, setMemoryNotice] = useState('Find all ten matching pairs.');
  const [memoryRoomCode,setMemoryRoomCode]=useState('');
  const [memoryRoomRole,setMemoryRoomRole]=useState('');
  const [memoryJoinCode,setMemoryJoinCode]=useState('');
  const [memoryTurn,setMemoryTurn]=useState('host');
  const [memoryScores,setMemoryScores]=useState({host:0,guest:0});
  const memoryChannelRef=useRef(null);
  const memoryPendingMismatchRef=useRef(false);
  const memoryMismatchTimerRef=useRef(null);
  const memoryStateRef=useRef({});
  const [rpsChoice, setRpsChoice] = useState('');
  const [rpsResult, setRpsResult] = useState('Choose rock, paper or scissors to play against GRIN Bot.');
  const [rpsScore, setRpsScore] = useState({wins:0,draws:0,losses:0});
  const [rpsRoomCode,setRpsRoomCode]=useState('');
  const [rpsRoomRole,setRpsRoomRole]=useState('');
  const [rpsJoinCode,setRpsJoinCode]=useState('');
  const [rpsOpponentChoice,setRpsOpponentChoice]=useState('');
  const [rpsRoundWins,setRpsRoundWins]=useState({you:0,opponent:0});
  const [rpsRoundResolved,setRpsRoundResolved]=useState(false);
  const rpsChannelRef=useRef(null);
  const snakeBodyRef = useRef(snakeBody);
  const snakeFoodRef = useRef(snakeFood);
  const snakeDirectionRef = useRef(snakeDirection);
  const snakeScoreRef = useRef(snakeScore);
  const gameChannelRef = useRef(null);
  const gameBoardRef = useRef(gameBoard);
  const gameTurnRef = useRef(gameTurn);
  gameBoardRef.current = gameBoard;
  gameTurnRef.current = gameTurn;
  snakeBodyRef.current = snakeBody;
  snakeFoodRef.current = snakeFood;
  snakeDirectionRef.current = snakeDirection;
  snakeScoreRef.current = snakeScore;
  snakeOpponentBodyRef.current = snakeOpponentBody;
  snakeOpponentDirectionRef.current = snakeOpponentDirection;
  snakeOpponentScoreRef.current = snakeOpponentScore;
  memoryStateRef.current={cards:memoryCards,flipped:memoryFlipped,matched:memoryMatched,moves:memoryMoves,scores:memoryScores,turn:memoryTurn,notice:memoryNotice};
  useEffect(() => {
    if (active !== 'games' || selectedGrinGame !== 'snake' || !snakeRunning || (snakeRoomCode && snakeRoomRole !== 'host')) return;
    const step = (body, direction, otherBody) => {
      const head=body[0], x=head%16, y=Math.floor(head/16);
      const nextHead=direction==='right'?(x<15?head+1:-1):direction==='left'?(x>0?head-1:-1):direction==='down'?(y<11?head+16:-1):(y>0?head-16:-1);
      const eating=nextHead===snakeFoodRef.current, occupied=eating?body:body.slice(0,-1);
      if(nextHead<0||occupied.includes(nextHead)||otherBody.includes(nextHead))return {dead:true,body,eating:false};
      const nextBody=[nextHead,...body];if(!eating)nextBody.pop();return {dead:false,body:nextBody,eating};
    };
    const timer=window.setInterval(()=>{
      const body=snakeBodyRef.current,direction=snakeDirectionRef.current;
      if(snakeRoomCode){
        const rivalBody=snakeOpponentBodyRef.current,rivalDirection=snakeOpponentDirectionRef.current;
        const player=step(body,direction,rivalBody),rival=step(rivalBody,rivalDirection,body);
        let food=snakeFoodRef.current,playerScore=snakeScoreRef.current,rivalScore=snakeOpponentScoreRef.current;
        if(player.dead||rival.dead){
          setSnakeRunning(false);
          const notice=player.dead&&rival.dead?'Draw! Both snakes crashed.':player.dead?'Arena over — your opponent wins!':'Arena over — you win!';
          setSnakeNotice(notice);
          snakeChannelRef.current?.send({type:'broadcast',event:'snake-state',payload:{room:snakeRoomCode,hostBody:player.body,guestBody:rival.body,hostDirection:direction,guestDirection:rivalDirection,hostScore:playerScore,guestScore:rivalScore,food,running:false,score:playerScore,notice}});
          return;
        }
        if(player.eating)playerScore++;if(rival.eating)rivalScore++;
        if(player.eating||rival.eating){const occupied=[...player.body,...rival.body];do{food=Math.floor(Math.random()*192);}while(occupied.includes(food));}
        snakeBodyRef.current=player.body;snakeOpponentBodyRef.current=rival.body;snakeScoreRef.current=playerScore;snakeOpponentScoreRef.current=rivalScore;snakeFoodRef.current=food;
        setSnakeBody(player.body);setSnakeOpponentBody(rival.body);setSnakeScore(playerScore);setSnakeOpponentScore(rivalScore);setSnakeFood(food);
        if(player.eating||rival.eating)setSnakeNotice(player.eating&&rival.eating?'Both players scored!':player.eating?'You scored!':'Opponent scored!');
        snakeChannelRef.current?.send({type:'broadcast',event:'snake-state',payload:{room:snakeRoomCode,hostBody:player.body,guestBody:rival.body,hostDirection:direction,guestDirection:rivalDirection,hostScore:playerScore,guestScore:rivalScore,food,running:true,score:playerScore,notice:'Arena live — compete for the fruit!'}});
        return;
      }
      const next=step(body,direction,[]);
      if(next.dead){setSnakeRunning(false);setSnakeNotice('Game over! Score: '+snakeScoreRef.current+'. Press Play again to restart.');return;}
      snakeBodyRef.current=next.body;setSnakeBody(next.body);
      if(next.eating){const score=snakeScoreRef.current+1;snakeScoreRef.current=score;setSnakeScore(score);let food;do{food=Math.floor(Math.random()*192);}while(next.body.includes(food));snakeFoodRef.current=food;setSnakeFood(food);setSnakeNotice('Nice! Keep going.');}
    },snakeRoomCode?180:(snakeSpeed==='slow'?260:snakeSpeed==='fast'?120:180));
    return ()=>window.clearInterval(timer);
  },[active,selectedGrinGame,snakeRunning,snakeRoomCode,snakeRoomRole,snakeSpeed]);

  useEffect(() => {
    if (active !== 'games' || selectedGrinGame !== 'snake') return;
    const onKeyDown = event => {
      const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
      const next = keys[event.key];
      if (!next) return;
      event.preventDefault();
      const current = snakeDirectionRef.current;
      const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
      if (next !== opposite[current]) {
        snakeDirectionRef.current = next;
        setSnakeDirection(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, selectedGrinGame]);

  function handleSnakeSwipeStart(event) {
    const touch = event.touches?.[0];
    if (touch) snakeSwipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }
  function handleSnakeSwipeEnd(event) {
    const start = snakeSwipeStartRef.current;
    snakeSwipeStartRef.current = null;
    const touch = event.changedTouches?.[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    const next = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    steerGrinSnake(next);
  }

  function startGrinSnake() {
    const body = snakeRoomRole==='guest'?[141,142,143]:[34,33,32];
    const rivalBody = snakeRoomCode?(snakeRoomRole==='guest'?[34,33,32]:[141,142,143]):[141,142,143];
    let food = Math.floor(Math.random() * 192);
    while ([...body,...rivalBody].includes(food)) food = Math.floor(Math.random() * 192);
    snakeBodyRef.current=body;snakeOpponentBodyRef.current=rivalBody;snakeFoodRef.current=food;
    snakeDirectionRef.current=snakeRoomRole==='guest'?'left':'right';snakeOpponentDirectionRef.current=snakeRoomRole==='guest'?'right':'left';
    snakeScoreRef.current=0;snakeOpponentScoreRef.current=0;
    setSnakeBody(body);setSnakeOpponentBody(rivalBody);setSnakeFood(food);setSnakeDirection(snakeDirectionRef.current);setSnakeOpponentDirection(snakeOpponentDirectionRef.current);
    setSnakeScore(0);setSnakeOpponentScore(0);setSnakeRunning(true);setSnakeNotice(snakeRoomCode?'Arena started! Each player controls their own snake.':'Swipe on the board to steer, or use arrow keys / WASD on desktop.');
    if(snakeRoomCode&&snakeRoomRole==='host'&&snakeChannelRef.current)snakeChannelRef.current.send({type:'broadcast',event:'snake-state',payload:{room:snakeRoomCode,hostBody:body,guestBody:rivalBody,hostDirection:'right',guestDirection:'left',hostScore:0,guestScore:0,food,running:true,score:0,notice:'Arena started! Each player controls their own snake.'}});
  }
  function steerGrinSnake(next) {
    const opposite={up:'down',down:'up',left:'right',right:'left'};
    if(snakeRoomCode&&snakeRoomRole==='guest'){
      if(next!==opposite[snakeDirectionRef.current]){
        snakeDirectionRef.current=next;setSnakeDirection(next);
        snakeChannelRef.current?.send({type:'broadcast',event:'snake-direction',payload:{room:snakeRoomCode,player:'guest',direction:next}});
      }
      return;
    }
    if(next!==opposite[snakeDirectionRef.current]){
      snakeDirectionRef.current=next;setSnakeDirection(next);
      if(snakeRoomCode)snakeChannelRef.current?.send({type:'broadcast',event:'snake-direction',payload:{room:snakeRoomCode,player:'host',direction:next}});
    }
  }



  function connectFourDrop(board, column, mark) {
    const next = board.slice();
    for (let row = 5; row >= 0; row--) {
      const index = row * 7 + column;
      if (!next[index]) { next[index] = mark; return { board: next, index }; }
    }
    return { board: next, index: -1 };
  }
  function connectFourWinner(board, mark) {
    for (let row = 0; row < 6; row++) for (let col = 0; col < 7; col++) {
      const i = row * 7 + col;
      if (board[i] !== mark) continue;
      if (col <= 3 && [1,2,3].every(n => board[i+n] === mark)) return true;
      if (row <= 2 && [1,2,3].every(n => board[i+n*7] === mark)) return true;
      if (row <= 2 && col <= 3 && [1,2,3].every(n => board[i+n*8] === mark)) return true;
      if (row <= 2 && col >= 3 && [1,2,3].every(n => board[i+n*6] === mark)) return true;
    }
    return false;
  }
  function resetConnectFour() {
    setConnectFourBoard(Array(42).fill(''));
    setConnectFourOver(false);
    setConnectFourThinking(false);
    setConnectFourNotice('Your turn — choose a column.');
  }
  function playConnectFour(column) {
    if (connectFourOver || connectFourThinking) return;
    const human = connectFourDrop(connectFourBoard, column, 'R');
    if (human.index < 0) { setConnectFourNotice('That column is full. Pick another one.'); return; }
    setConnectFourBoard(human.board);
    if (connectFourWinner(human.board, 'R')) {
      setConnectFourOver(true); setConnectFourNotice('You win! Four in a row. 🎉'); return;
    }
    if (human.board.every(Boolean)) {
      setConnectFourOver(true); setConnectFourNotice('It’s a draw! Start another round.'); return;
    }
    setConnectFourThinking(true);
    setConnectFourNotice('🤔 GRIN Bot is thinking…');
    window.setTimeout(() => {
      const legal = Array.from({length:7},(_,col)=>col).filter(col=>human.board[col] === '');
      const findWinningColumn = (board, mark) => legal.find(col => { const move=connectFourDrop(board,col,mark); return move.index >= 0 && connectFourWinner(move.board,mark); });
      let botColumn = findWinningColumn(human.board, 'Y');
      if (botColumn == null) botColumn = findWinningColumn(human.board, 'R');
      if (botColumn == null) {
        const available = [3,2,4,1,5,0,6].filter(col=>legal.includes(col));
        botColumn = available[Math.floor(Math.random() * Math.min(3, available.length))] ?? available[0];
      }
      const bot = connectFourDrop(human.board, botColumn, 'Y');
      setConnectFourBoard(bot.board);
      setConnectFourThinking(false);
      if (connectFourWinner(bot.board, 'Y')) { setConnectFourOver(true); setConnectFourNotice('GRIN Bot got four in a row. Try again!'); }
      else if (bot.board.every(Boolean)) { setConnectFourOver(true); setConnectFourNotice('It’s a draw! Start another round.'); }
      else setConnectFourNotice('GRIN Bot played. Your turn — choose a column.');
    }, 1800);
  }

  function createOnlinePenaltyRoom() {
    const code = crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
    setOnlinePenaltyRoom(code); setOnlinePenaltyRole('host'); setOnlinePenaltyJoinCode('');
    setOnlinePenalty({turn:'host',phase:'shoot',scores:{host:0,guest:0},attempts:0,shot:'center',done:false,notice:'Room created. You shoot first — share the invitation link.'});
    setSelectedGrinGame('football'); setActive('games');
    const params=new URLSearchParams(window.location.search); params.set('game','penalty'); params.set('room',code);
    window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
  }
  function joinOnlinePenaltyRoom(codeInput=onlinePenaltyJoinCode) {
    const code=String(codeInput||'').trim().toUpperCase();
    if(!/^[A-Z0-9]{6,12}$/.test(code)){setOnlinePenalty(s=>({...s,notice:'Enter a valid 6–12 character room code.'}));return;}
    setOnlinePenaltyRoom(code); setOnlinePenaltyRole('guest');
    setOnlinePenalty({turn:'host',phase:'shoot',scores:{host:0,guest:0},attempts:0,shot:'center',done:false,notice:'Joining room… waiting for the host game state.'});
    setSelectedGrinGame('football'); setActive('games');
    const params=new URLSearchParams(window.location.search); params.set('game','penalty'); params.set('room',code);
    window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
  }
  function leaveOnlinePenaltyRoom() {
    if(onlinePenaltyChannelRef.current){supabase.removeChannel(onlinePenaltyChannelRef.current);onlinePenaltyChannelRef.current=null;}
    setOnlinePenaltyRoom('');setOnlinePenaltyRole('');setOnlinePenaltyJoinCode('');
    setOnlinePenalty({turn:'host',phase:'shoot',scores:{host:0,guest:0},attempts:0,shot:'center',done:false,notice:'Create a room or join a friend to play head-to-head.'});
    const params=new URLSearchParams(window.location.search);params.delete('game');params.delete('room');const query=params.toString();
    window.history.replaceState({},'',window.location.pathname+(query?'?'+query:'')+window.location.hash);
  }
  function applyOnlinePenaltyAction(player, action, direction) {
    const current=onlinePenaltyRef.current;
    if(!onlinePenaltyRoom||onlinePenaltyRole!=='host'||current.done||player!==current.turn)return;
    if(!['left','center','right'].includes(direction))return;
    let next;
    if(current.phase==='shoot'){
      next={...current,phase:'save',shot:direction,turn:player==='host'?'guest':'host',notice:(player==='host'?'Host':'Guest')+' shot '+direction+'. Opponent: choose your dive.'};
    } else {
      const scored=current.shot!==direction;
      const scores={...current.scores};
      const shooter=player==='host'?'guest':'host';
      if(scored)scores[shooter]+=1;
      const attempts=current.attempts+1;
      const done=attempts>=10;
      const nextShooter=attempts%2===0?'host':'guest';
      next={...current,scores,attempts,phase:'shoot',shot:'center',turn:done?player:nextShooter,done,notice:done?'FULL TIME — '+scores.host+'–'+scores.guest+'. '+(scores.host===scores.guest?'It is a draw!':scores.host>scores.guest?'Host wins!':'Guest wins!'):(scored?'GOAL!':'SAVED!')+' '+(nextShooter==='host'?'Host':'Guest')+' shoots next.'};
    }
    onlinePenaltyRef.current=next;
    setOnlinePenalty(next);
  }
  function chooseOnlinePenaltyAction(direction) {
    if(!onlinePenaltyRoom||onlinePenalty.done||onlinePenalty.turn!==onlinePenaltyRole)return;
    if(onlinePenaltyRole==='host')applyOnlinePenaltyAction('host','move',direction);
    else onlinePenaltyChannelRef.current?.send({type:'broadcast',event:'penalty-action',payload:{room:onlinePenaltyRoom,player:'guest',direction}});
  }
  function restartOnlinePenaltyMatch() {
    const next={turn:'host',phase:'shoot',scores:{host:0,guest:0},attempts:0,shot:'center',done:false,notice:'New shootout! Host shoots first.'};
    if(onlinePenaltyRole==='host'){onlinePenaltyRef.current=next;setOnlinePenalty(next);}
    else onlinePenaltyChannelRef.current?.send({type:'broadcast',event:'penalty-restart',payload:{room:onlinePenaltyRoom,player:'guest'}});
  }
  useEffect(()=>{
    if(!onlinePenaltyRoom||!session?.user?.id||selectedGrinGame!=='football')return;
    const room=onlinePenaltyRoom;
    const channel=supabase.channel('grin-penalty-'+room,{config:{broadcast:{self:false}}});
    onlinePenaltyChannelRef.current=channel;
    channel.on('broadcast',{event:'penalty-action'},({payload})=>{
      if(payload?.room===room&&onlinePenaltyRole==='host'&&payload.player==='guest')applyOnlinePenaltyAction('guest','move',payload.direction);
    }).on('broadcast',{event:'penalty-restart'},({payload})=>{
      if(payload?.room===room&&onlinePenaltyRole==='host') { const next={turn:'host',phase:'shoot',scores:{host:0,guest:0},attempts:0,shot:'center',done:false,notice:'New shootout! Host shoots first.'}; onlinePenaltyRef.current=next;setOnlinePenalty(next); }
    }).on('broadcast',{event:'penalty-state'},({payload})=>{
      if(payload?.room===room&&onlinePenaltyRole==='guest'&&payload.state){onlinePenaltyRef.current=payload.state;setOnlinePenalty(payload.state);}
    }).on('broadcast',{event:'penalty-request-state'},({payload})=>{
      if(payload?.room===room&&onlinePenaltyRole==='host')channel.send({type:'broadcast',event:'penalty-state',payload:{room,state:onlinePenaltyRef.current}});
    }).subscribe(status=>{
      if(status==='SUBSCRIBED'){
        if(onlinePenaltyRole==='host')channel.send({type:'broadcast',event:'penalty-state',payload:{room,state:onlinePenaltyRef.current}});
        else channel.send({type:'broadcast',event:'penalty-request-state',payload:{room}});
      }
    });
    return()=>{if(onlinePenaltyChannelRef.current===channel)onlinePenaltyChannelRef.current=null;supabase.removeChannel(channel);};
  },[onlinePenaltyRoom,onlinePenaltyRole,session?.user?.id,selectedGrinGame]);
  useEffect(()=>{
    if(!onlinePenaltyRoom||onlinePenaltyRole!=='host'||!onlinePenaltyChannelRef.current)return;
    onlinePenaltyChannelRef.current.send({type:'broadcast',event:'penalty-state',payload:{room:onlinePenaltyRoom,state:onlinePenalty}});
  },[onlinePenalty,onlinePenaltyRoom,onlinePenaltyRole]);

  function resetPenaltyShootout() {
    setPenaltyRound(1); setPenaltyPlayerGoals(0); setPenaltyBotGoals(0);
    setPenaltyPhase('shoot'); setPenaltyDone(false); setPenaltyAnimation('idle'); setPenaltyLastResult('');
    setPenaltyAim('center'); setPenaltyPower(0); penaltyPowerRef.current=0; setPenaltyCharging(false);
    setPenaltyNotice('Aim your shot, then hold R2 to build power.');
  }
  function playPenaltyDirection(direction, power=70) {
    if (penaltyDone || penaltyAnimation !== 'idle') return;
    const directions = ['left','center','right'];
    if (penaltyPhase === 'shoot') {
      const keeper = directions[Math.floor(Math.random() * directions.length)];
      const powerFactor = Math.max(0, Math.min(100, power));
      const keeperReads = Math.random() < (0.42 - powerFactor / 250);
      const scored = keeper !== direction || !keeperReads;
      setPenaltyAnimation('shot-'+direction+(scored ? '-goal' : '-saved')+'-keeper-'+keeper);
      setPenaltyLastResult(scored ? 'GOAL!' : 'SAVED!');
      setPenaltyPlayerGoals(penaltyPlayerGoals + (scored ? 1 : 0));
      setPenaltyPhase('save');
      setPenaltyNotice(scored
        ? 'GOAL! '+powerFactor+'% power — the keeper went '+keeper+'. Your turn to defend — choose where to dive.'
        : 'SAVED! GRIN Bot read your '+direction+' shot. Your turn to defend.');
      setTimeout(() => setPenaltyAnimation('idle'), 1050-powerFactor);
      return;
    }
    const shot = directions[Math.floor(Math.random() * directions.length)];
    const saved = shot === direction;
    const botGoals = penaltyBotGoals + (saved ? 0 : 1);
    setPenaltyAnimation('keeper-'+direction+(saved ? '-save' : '-goal')+'-shot-'+shot);
    setPenaltyLastResult(saved ? 'BIG SAVE!' : 'BOT SCORES');
    setPenaltyBotGoals(botGoals);
    setTimeout(() => setPenaltyAnimation('idle'), 950);
    if (penaltyRound >= 5) {
      setPenaltyDone(true);
      setPenaltyPhase('shoot');
      setPenaltyNotice(penaltyPlayerGoals > botGoals
        ? 'FULL TIME — YOU WIN '+penaltyPlayerGoals+'–'+botGoals+'! 🏆'
        : penaltyPlayerGoals < botGoals
          ? 'FULL TIME — GRIN BOT WINS '+penaltyPlayerGoals+'–'+botGoals+'. Rematch?'
          : 'FULL TIME — IT’S A '+penaltyPlayerGoals+'–'+botGoals+' DRAW!');
    } else {
      setPenaltyRound(penaltyRound + 1);
      setPenaltyPhase('shoot');
      setPenaltyNotice(saved
        ? 'WHAT A SAVE! GRIN Bot shot '+shot+'. Round '+(penaltyRound+1)+' — your next penalty.'
        : 'GRIN Bot scores, shooting '+shot+'. Round '+(penaltyRound+1)+' — your next penalty.');
    }
  }

  function startFootballTriviaRound(level = triviaDifficulty) {
    const nextQuestions = buildTriviaRound(level, triviaRecentQuestions);
    setTriviaRecentQuestions(previous => ({ ...previous, [level]: nextQuestions.map(question => question.q) }));
    setTriviaRoundQuestions(nextQuestions);
    setTriviaDifficulty(level);
    setTriviaIndex(0); setTriviaScore(0); setTriviaAnswer(null); setTriviaFinished(false);
  }

  function answerFootballTrivia(optionIndex) {
    if (triviaAnswer !== null || triviaFinished) return;
    setTriviaAnswer(optionIndex);
    if (optionIndex === activeTriviaQuestions[triviaIndex].answer) setTriviaScore(score => score + 1);
  }
  function nextFootballTrivia() {
    if (triviaIndex >= activeTriviaQuestions.length - 1) {
      setTriviaFinished(true);
      return;
    }
    setTriviaIndex(index => index + 1);
    setTriviaAnswer(null);
  }
  function resetFootballTrivia() {
    startFootballTriviaRound(triviaDifficulty);
  }

  function create2048Board(){
    const board=Array(16).fill(0);
    for(let n=0;n<2;n++){
      const empty=board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
      if(empty.length){const at=empty[Math.floor(Math.random()*empty.length)];board[at]=Math.random()<0.9?2:4;}
    }
    return board;
  }
  function reset2048(){setNumberTiles(create2048Board());setNumberScore(0);setNumberNotice('New game started. Combine matching tiles to reach 2048.');}
  function move2048(direction){
    const next=numberTiles.slice();let gained=0;let moved=false;
    for(let line=0;line<4;line++){
      const indexes=[];
      for(let step=0;step<4;step++){
        if(direction==='left')indexes.push(line*4+step);
        else if(direction==='right')indexes.push(line*4+(3-step));
        else if(direction==='up')indexes.push(step*4+line);
        else indexes.push((3-step)*4+line);
      }
      const values=indexes.map(i=>next[i]).filter(v=>v!==0);const merged=[];
      for(let i=0;i<values.length;i++){
        if(values[i]===values[i+1]){merged.push(values[i]*2);gained+=values[i]*2;i++;}
        else merged.push(values[i]);
      }
      while(merged.length<4)merged.push(0);
      indexes.forEach((idx,pos)=>{if(next[idx]!==merged[pos])moved=true;next[idx]=merged[pos];});
    }
    if(!moved)return;
    const empty=next.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
    if(empty.length){const at=empty[Math.floor(Math.random()*empty.length)];next[at]=Math.random()<0.9?2:4;}
    const score=numberScore+gained;setNumberScore(score);setNumberBest(best=>Math.max(best,score));setNumberTiles(next);
    if(next.includes(2048))setNumberNotice('2048! You did it! Keep going or start a new game.');
    else if(!next.some(v=>v===0)&&!next.some((v,i)=>i%4<3&&v===next[i+1])&&!next.some((v,i)=>i<12&&v===next[i+4]))setNumberNotice('No moves left. Start a new game to try again.');
    else setNumberNotice(gained?'+'+gained+' points. Keep going!':'Nice move — keep merging tiles.');
  }
  function createSnakeRoom() {
    const code = crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
    setSnakeRoomCode(code); setSnakeRoomRole('host'); setSnakeJoinCode('');
    setSelectedGrinGame('snake'); setActive('games'); setSnakeRunning(false);
    setSnakeNotice('Snake Arena room created. Share the room link, then press Start Arena.');
    const params = new URLSearchParams(window.location.search); params.set('game','snake'); params.set('room',code);
    window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
  }
  function joinSnakeRoom() {
    const code = snakeJoinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,12}$/.test(code)) { setSnakeNotice('Enter a valid 6–12 character room code.'); return; }
    setSnakeRoomCode(code); setSnakeRoomRole('guest'); setSelectedGrinGame('snake'); setActive('games');
    setSnakeRunning(false); setSnakeNotice('Joining Snake Arena…');
    const params = new URLSearchParams(window.location.search); params.set('game','snake'); params.set('room',code);
    window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
  }
  function exitSnakeRoom() {
    if (snakeChannelRef.current) { supabase.removeChannel(snakeChannelRef.current); snakeChannelRef.current = null; }
    setSnakeRoomCode(''); setSnakeRoomRole(''); setSnakeJoinCode(''); setSnakeRunning(false);
    setSnakeNotice('You left Snake Arena. You can play solo or join another room.');
    const params = new URLSearchParams(window.location.search); params.delete('game'); params.delete('room');
    const query = params.toString();
    window.history.replaceState({},'',window.location.pathname+(query?'?'+query:'')+window.location.hash);
  }
  async function copySnakeRoomLink() {
    if (!snakeRoomCode) return;
    const link = window.location.origin + window.location.pathname + '?game=snake&room=' + encodeURIComponent(snakeRoomCode);
    try { await navigator.clipboard.writeText(link); setSnakeNotice('Snake Arena link copied. Share it with your friend.'); }
    catch { window.prompt('Copy your Snake Arena link:',link); }
  }
  useEffect(() => {
    if(!snakeRoomCode||!session?.user?.id||selectedGrinGame!=='snake')return;
    const room=snakeRoomCode;
    const channel=supabase.channel('grin-snake-'+room,{config:{broadcast:{self:false}}});
    snakeChannelRef.current=channel;
    channel.on('broadcast',{event:'snake-state'},({payload})=>{
      if(payload?.room!==room)return;
      if(snakeRoomRole==='guest'&&Array.isArray(payload.hostBody)&&Array.isArray(payload.guestBody)){
        snakeBodyRef.current=payload.guestBody;snakeOpponentBodyRef.current=payload.hostBody;snakeFoodRef.current=payload.food;
        snakeDirectionRef.current=payload.guestDirection||'left';snakeOpponentDirectionRef.current=payload.hostDirection||'right';
        snakeScoreRef.current=payload.guestScore||0;snakeOpponentScoreRef.current=payload.hostScore||0;
        setSnakeBody(payload.guestBody);setSnakeOpponentBody(payload.hostBody);setSnakeFood(payload.food);
        setSnakeDirection(payload.guestDirection||'left');setSnakeOpponentDirection(payload.hostDirection||'right');
        setSnakeScore(payload.guestScore||0);setSnakeOpponentScore(payload.hostScore||0);setSnakeRunning(!!payload.running);setSnakeNotice(payload.notice||'Snake Arena is live.');
      }else if(snakeRoomRole==='host'&&Array.isArray(payload.guestBody)){
        snakeOpponentBodyRef.current=payload.guestBody;snakeOpponentDirectionRef.current=payload.guestDirection||'left';snakeOpponentScoreRef.current=payload.guestScore||0;
        setSnakeOpponentBody(payload.guestBody);setSnakeOpponentDirection(payload.guestDirection||'left');setSnakeOpponentScore(payload.guestScore||0);
      }
    }).on('broadcast',{event:'snake-direction'},({payload})=>{
      if(payload?.room!==room||!['up','down','left','right'].includes(payload.direction))return;
      const key=payload.player==='guest'?'guest':'host';
      if(snakeRoomRole==='host'&&key==='guest'){
        const opposite={up:'down',down:'up',left:'right',right:'left'};
        if(payload.direction!==opposite[snakeOpponentDirectionRef.current]){snakeOpponentDirectionRef.current=payload.direction;setSnakeOpponentDirection(payload.direction);}
      }else if(snakeRoomRole==='guest'&&key==='host'){
        const opposite={up:'down',down:'up',left:'right',right:'left'};
        if(payload.direction!==opposite[snakeOpponentDirectionRef.current]){snakeOpponentDirectionRef.current=payload.direction;setSnakeOpponentDirection(payload.direction);}
      }
    }).on('broadcast',{event:'snake-request-state'},()=>{
      if(snakeRoomRole==='host')channel.send({type:'broadcast',event:'snake-state',payload:{room,hostBody:snakeBodyRef.current,guestBody:snakeOpponentBodyRef.current,hostDirection:snakeDirectionRef.current,guestDirection:snakeOpponentDirectionRef.current,hostScore:snakeScoreRef.current,guestScore:snakeOpponentScoreRef.current,food:snakeFoodRef.current,running:snakeRunning,score:snakeScoreRef.current,notice:'Arena ready. Both players control their own snake.'}});
    }).subscribe(status=>{
      if(status==='SUBSCRIBED')channel.send({type:'broadcast',event:'snake-request-state',payload:{room}});
    });
    return()=>{if(snakeChannelRef.current===channel)snakeChannelRef.current=null;supabase.removeChannel(channel);};
  },[snakeRoomCode,session?.user?.id,selectedGrinGame,snakeRoomRole]);

  useEffect(()=>{
    if(!memoryRoomCode||!session?.user?.id||selectedGrinGame!=='memory')return;
    const room=memoryRoomCode;
    const channel=supabase.channel('grin-memory-'+room,{config:{broadcast:{self:false}}});memoryChannelRef.current=channel;
    channel.on('broadcast',{event:'memory-state'},({payload})=>{
      if(payload?.room!==room||!Array.isArray(payload.cards)||!Array.isArray(payload.flipped)||!Array.isArray(payload.matched))return;
      setMemoryCards(payload.cards);setMemoryFlipped(payload.flipped);setMemoryMatched(payload.matched);setMemoryMoves(payload.moves||0);setMemoryScores(payload.scores||{host:0,guest:0});setMemoryTurn(payload.turn||'host');setMemoryNotice(payload.notice||'Memory Match is live.');
      if(memoryRoomRole==='host'&&payload.flipped.length===2&&payload.cards[payload.flipped[0]]?.emoji!==payload.cards[payload.flipped[1]]?.emoji)scheduleMemoryMismatchClear(payload);
    }).on('broadcast',{event:'memory-request-state'},()=>{
      if(memoryRoomRole==='host')channel.send({type:'broadcast',event:'memory-state',payload:{room,...memoryStateRef.current}});
    }).subscribe(status=>{if(status==='SUBSCRIBED')channel.send({type:'broadcast',event:'memory-request-state',payload:{room}});});
    return()=>{if(memoryChannelRef.current===channel)memoryChannelRef.current=null;supabase.removeChannel(channel);};
  },[memoryRoomCode,memoryRoomRole,session?.user?.id,selectedGrinGame]);

  useEffect(()=>{
    if(!rpsRoomCode||!session?.user?.id||selectedGrinGame!=='rps')return;
    const room=rpsRoomCode;
    const channel=supabase.channel('grin-rps-'+room,{config:{broadcast:{self:false}}});rpsChannelRef.current=channel;
    channel.on('broadcast',{event:'rps-choice'},({payload})=>{
      if(payload?.room!==room||payload.player===rpsRoomRole||!['rock','paper','scissors'].includes(payload.choice))return;
      setRpsOpponentChoice(payload.choice);
    }).subscribe(status=>{if(status==='SUBSCRIBED')setRpsResult(rpsRoomRole==='host'?'Room ready. Waiting for your opponent to choose.':'Connected. Waiting for the host to choose.');});
    return()=>{if(rpsChannelRef.current===channel)rpsChannelRef.current=null;supabase.removeChannel(channel);};
  },[rpsRoomCode,rpsRoomRole,session?.user?.id,selectedGrinGame]);

  useEffect(()=>{
    if(!rpsRoomCode||!rpsChoice||!rpsOpponentChoice||rpsRoundResolved)return;
    const own=rpsChoice,other=rpsOpponentChoice;
    const result=own===other?'draw':((own==='rock'&&other==='scissors')||(own==='paper'&&other==='rock')||(own==='scissors'&&other==='paper'))?'win':'loss';
    setRpsRoundResolved(true);
    setRpsResult('You chose '+own+' · Opponent chose '+other+'. '+(result==='draw'?'It’s a draw!':result==='win'?'You win this round!':'Your opponent wins this round.'));
    setRpsRoundWins(s=>({...s,you:s.you+(result==='win'?1:0),opponent:s.opponent+(result==='loss'?1:0)}));
    const nextWins={you:rpsRoundWins.you+(result==='win'?1:0),opponent:rpsRoundWins.opponent+(result==='loss'?1:0)};
    const matchOver=nextWins.you>=3||nextWins.opponent>=3;
    if(matchOver)setRpsResult(nextWins.you>=3?'You won the match! 🎉':'Your opponent won the match.');
    const timer=window.setTimeout(()=>{if(!matchOver){setRpsChoice('');setRpsOpponentChoice('');setRpsRoundResolved(false);setRpsResult('Choose your next move.');}},1400);
    return()=>window.clearTimeout(timer);
  },[rpsRoomCode,rpsChoice,rpsOpponentChoice,rpsRoundResolved]);

  function startMemoryGame(difficulty=memoryDifficulty) {
    if(memoryMismatchTimerRef.current!==null){window.clearTimeout(memoryMismatchTimerRef.current);memoryMismatchTimerRef.current=null;}
    memoryPendingMismatchRef.current=false;
    const pairCount=difficulty==='easy'?6:difficulty==='hard'?16:10;
    const emojiPool=['🍋','🍓','🍇','🍉','🥝','🍒','🍊','🍍','🥑','🍌','🍎','🍐','🍑','🥥','🫐','🥕'];
    const deck=emojiPool.slice(0,pairCount).flatMap(emoji=>[emoji,emoji]);
    const cards=deck.map((emoji,id)=>({id,emoji})).sort(()=>Math.random()-.5);
    setMemoryCards(cards);setMemoryFlipped([]);setMemoryMatched([]);setMemoryMoves(0);setMemoryScores({host:0,guest:0});setMemoryTurn('host');setMemoryNotice('Find all '+pairCount+' matching pairs.');
    if(memoryRoomCode&&memoryRoomRole==='host')memoryChannelRef.current?.send({type:'broadcast',event:'memory-state',payload:{room:memoryRoomCode,cards,flipped:[],matched:[],moves:0,scores:{host:0,guest:0},turn:'host',notice:'New Memory Match round started.'}});
  }
  function flipMemoryCard(index) {
    if(memoryRoomCode&&memoryTurn!==memoryRoomRole)return;
    if(memoryFlipped.includes(index)||memoryMatched.includes(index)||memoryFlipped.length>=2)return;
    const next=[...memoryFlipped,index];let matched=memoryMatched.slice(),scores={...memoryScores},turn=memoryTurn,moves=memoryMoves+ (next.length===2?1:0);
    let notice='Choose another card.';
    if(next.length===2){
      if(memoryCards[next[0]].emoji===memoryCards[next[1]].emoji){
        matched=[...matched,...next];scores[memoryRoomCode?memoryRoomRole:'host']++;
        notice=matched.length===memoryCards.length?'All pairs found! 🎉':'Match found! Take another turn.';
        setMemoryFlipped([]);
      }else{
        notice='Not a match.';
        if(memoryRoomCode){turn=memoryRoomRole==='host'?'guest':'host';}
      }
    }
    setMemoryFlipped(next.length===2&&memoryCards[next[0]].emoji===memoryCards[next[1]].emoji?[]:next);
    setMemoryMatched(matched);setMemoryMoves(moves);setMemoryScores(scores);setMemoryTurn(turn);setMemoryNotice(notice);
    const snapshot={room:memoryRoomCode,cards:memoryCards,flipped:next.length===2&&memoryCards[next[0]].emoji===memoryCards[next[1]].emoji?[]:next,matched,moves,scores,turn,notice};
    if(memoryRoomCode)memoryChannelRef.current?.send({type:'broadcast',event:'memory-state',payload:snapshot});
    if(next.length===2&&memoryCards[next[0]].emoji!==memoryCards[next[1]].emoji&&memoryRoomCode&&memoryRoomRole==='host')scheduleMemoryMismatchClear(snapshot);
    if(next.length===2&&memoryCards[next[0]].emoji!==memoryCards[next[1]].emoji&&!memoryRoomCode)window.setTimeout(()=>setMemoryFlipped([]),700);
  }
  function scheduleMemoryMismatchClear(snapshot){
    if(memoryPendingMismatchRef.current)return;
    memoryPendingMismatchRef.current=true;
    memoryMismatchTimerRef.current=window.setTimeout(()=>{
      memoryMismatchTimerRef.current=null;
      const latest=memoryStateRef.current||{};
      const samePair=Array.isArray(latest.flipped)&&latest.flipped.length===2&&
        latest.flipped[0]===snapshot.flipped?.[0]&&latest.flipped[1]===snapshot.flipped?.[1];
      if(samePair&&latest.cards?.[latest.flipped[0]]?.emoji!==latest.cards?.[latest.flipped[1]]?.emoji){
        const clean={...latest,room:memoryRoomCode,flipped:[],notice:'Next player’s turn.'};
        setMemoryFlipped([]);setMemoryTurn(clean.turn||'guest');setMemoryNotice(clean.notice);
        memoryChannelRef.current?.send({type:'broadcast',event:'memory-state',payload:clean});
      }
      memoryPendingMismatchRef.current=false;
    },750);
  }
  function createMemoryRoom(){
    const code=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
    setMemoryRoomCode(code);setMemoryRoomRole('host');setMemoryJoinCode('');setMemoryTurn('host');setMemoryScores({host:0,guest:0});
    startMemoryGame();setSelectedGrinGame('memory');setActive('games');
    const params=new URLSearchParams(window.location.search);params.set('game','memory');params.set('room',code);window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
    setMemoryNotice('Room created. Share the link and take turns finding pairs.');
  }
  function joinMemoryRoom(){
    const code=memoryJoinCode.trim().toUpperCase();
    if(!/^[A-Z0-9]{6,12}$/.test(code)){setMemoryNotice('Enter a valid 6–12 character room code.');return;}
    setMemoryRoomCode(code);setMemoryRoomRole('guest');setSelectedGrinGame('memory');setActive('games');setMemoryNotice('Joining Memory Match…');
    const params=new URLSearchParams(window.location.search);params.set('game','memory');params.set('room',code);window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
  }
  function exitMemoryRoom(){
    if(memoryMismatchTimerRef.current!==null){window.clearTimeout(memoryMismatchTimerRef.current);memoryMismatchTimerRef.current=null;}
    memoryPendingMismatchRef.current=false;
    if(memoryChannelRef.current){supabase.removeChannel(memoryChannelRef.current);memoryChannelRef.current=null;}
    setMemoryRoomCode('');setMemoryRoomRole('');setMemoryJoinCode('');setMemoryTurn('host');setMemoryScores({host:0,guest:0});
    const params=new URLSearchParams(window.location.search);params.delete('game');params.delete('room');const query=params.toString();window.history.replaceState({},'',window.location.pathname+(query?'?'+query:'')+window.location.hash);
    setMemoryNotice('You left the room. Solo Memory Match is ready.');
  }
  async function copyMemoryRoomLink(){
    if(!memoryRoomCode)return;const link=window.location.origin+window.location.pathname+'?game=memory&room='+encodeURIComponent(memoryRoomCode);
    try{await navigator.clipboard.writeText(link);setMemoryNotice('Memory Match link copied.');}catch{window.prompt('Copy your Memory Match link:',link);}
  }
  function createRpsRoom(){
    const code=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
    setRpsRoomCode(code);setRpsRoomRole('host');setRpsJoinCode('');setRpsChoice('');setRpsOpponentChoice('');setRpsRoundResolved(false);setRpsRoundWins({you:0,opponent:0});setSelectedGrinGame('rps');setActive('games');
    const params=new URLSearchParams(window.location.search);params.set('game','rps');params.set('room',code);window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
    setRpsResult('Room created. Share the link and play best of five.');
  }
  function joinRpsRoom(){
    const code=rpsJoinCode.trim().toUpperCase();
    if(!/^[A-Z0-9]{6,12}$/.test(code)){setRpsResult('Enter a valid 6–12 character room code.');return;}
    setRpsRoomCode(code);setRpsRoomRole('guest');setRpsChoice('');setRpsOpponentChoice('');setRpsRoundResolved(false);setRpsRoundWins({you:0,opponent:0});setSelectedGrinGame('rps');setActive('games');
    const params=new URLSearchParams(window.location.search);params.set('game','rps');params.set('room',code);window.history.replaceState({},'',window.location.pathname+'?'+params.toString()+window.location.hash);
    setRpsResult('Joining match…');
  }
  function exitRpsRoom(){
    if(rpsChannelRef.current){supabase.removeChannel(rpsChannelRef.current);rpsChannelRef.current=null;}
    setRpsRoomCode('');setRpsRoomRole('');setRpsJoinCode('');setRpsChoice('');setRpsOpponentChoice('');setRpsRoundResolved(false);setRpsRoundWins({you:0,opponent:0});
    setRpsResult('Choose rock, paper or scissors to play against GRIN Bot.');
    const params=new URLSearchParams(window.location.search);params.delete('game');params.delete('room');const query=params.toString();window.history.replaceState({},'',window.location.pathname+(query?'?'+query:'')+window.location.hash);
  }
  async function copyRpsRoomLink(){
    if(!rpsRoomCode)return;const link=window.location.origin+window.location.pathname+'?game=rps&room='+encodeURIComponent(rpsRoomCode);
    try{await navigator.clipboard.writeText(link);setRpsResult('Match link copied. Share it with your friend.');}catch{window.prompt('Copy your match link:',link);}
  }
  function playRockPaperScissors(choice) {
    if(rpsRoomCode){
      if(rpsRoundResolved||rpsChoice)return;
      setRpsChoice(choice);setRpsResult('You chose '+choice+'. Waiting for your opponent…');
      rpsChannelRef.current?.send({type:'broadcast',event:'rps-choice',payload:{room:rpsRoomCode,player:rpsRoomRole,choice}});
      return;
    }
    const options=['rock','paper','scissors'];
    const bot=options[Math.floor(Math.random()*options.length)];
    const result=choice===bot?'draw':((choice==='rock'&&bot==='scissors')||(choice==='paper'&&bot==='rock')||(choice==='scissors'&&bot==='paper'))?'win':'loss';
    setRpsChoice(choice);
    setRpsResult('You chose '+choice+' · GRIN Bot chose '+bot+'. '+(result==='draw'?'It’s a draw!':result==='win'?'You win this round!':'GRIN Bot wins this round.'));
    setRpsScore(s=>({...s,wins:s.wins+(result==='win'?1:0),draws:s.draws+(result==='draw'?1:0),losses:s.losses+(result==='loss'?1:0)}));
  }
  function resetRockPaperScissors() { setRpsChoice(''); setRpsResult('Choose rock, paper or scissors to play against GRIN Bot.'); setRpsScore({wins:0,draws:0,losses:0}); }
  function resetRpsMatch(){setRpsChoice('');setRpsOpponentChoice('');setRpsRoundResolved(false);setRpsRoundWins({you:0,opponent:0});setRpsResult('New match started. Choose your move.');}

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [ownPostMenuId, setOwnPostMenuId] = useState(null);
  const [searchNotice, setSearchNotice] = useState('');
  const [chats, setChats] = useState(fallbackChats);
  const [selected, setSelected] = useState(fallbackChats[0]);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [people, setPeople] = useState([]);
  const [directoryPeople, setDirectoryPeople] = useState([]);
  const [directoryPeopleLoading, setDirectoryPeopleLoading] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ username:'', display_name:'', bio:'', avatar_url:'', phone_e164:'' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [posts, setPosts] = useState([]);
  const [feedMode, setFeedMode] = useState('for-you');
  const [followedIds, setFollowedIds] = useState(new Set());
  const [suggestedPeople, setSuggestedPeople] = useState([]);
  const [suggestedCreators, setSuggestedCreators] = useState([]);
  const [suggestedBusinesses, setSuggestedBusinesses] = useState([]);
  const [sharePostTarget, setSharePostTarget] = useState(null);
  const [postBody, setPostBody] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostBody, setEditingPostBody] = useState('');
  const [postMutationBusy, setPostMutationBusy] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [postNotice, setPostNotice] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({});
  const [reactionMine, setReactionMine] = useState({});
  const [reactionMenu, setReactionMenu] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [openComments, setOpenComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentNotice, setCommentNotice] = useState('');
  const [comments, setComments] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessForm, setBusinessForm] = useState({name:'',handle:'',category:'Business',description:'',website:'',location:''});
  const [businessNotice, setBusinessNotice] = useState('');
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({business_id:'',name:'',description:'',price:'',currency:'NGN'});
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({business_id:'',name:'',description:'',price:'',currency:'NGN',product_url:''});
  const [professional, setProfessional] = useState({headline:'',industry:'',location:'',website:'',skills:'',portfolio_url:'',availability:'available',hourly_rate:'',currency:'NGN'});
  const [proNotice, setProNotice] = useState('');
  const [businessStats, setBusinessStats] = useState({views:0,followers:0,contacts:0,productViews:0});
  const [creatorForm,setCreatorForm]=useState({category:'Creator',headline:'',bio:'',location:'',website:'',rate:'',currency:'NGN',available:true});
  const [creatorNotice,setCreatorNotice]=useState('');
  const [creators,setCreators]=useState([]);
  const [listings,setListings]=useState([]);
  const [listingForm,setListingForm]=useState({title:'',description:'',category:'Other',price:'',currency:'NGN',external_url:''});
  const [listingNotice,setListingNotice]=useState('');
  const [jobs,setJobs]=useState([]);
  const [jobForm,setJobForm]=useState({title:'',description:'',category:'Other',budget:'',currency:'NGN'});
  const [jobNotice,setJobNotice]=useState('');
  const [stories,setStories]=useState([]);
  const [showStoryComposer,setShowStoryComposer]=useState(false);
  const [activeStatusAuthorId,setActiveStatusAuthorId]=useState(null);
  const [activeStatusIndex,setActiveStatusIndex]=useState(0);
  const [storyCaption,setStoryCaption]=useState('');
  const [storyFile,setStoryFile]=useState(null);
  const [storyNotice,setStoryNotice]=useState('');
  const [statusViewers,setStatusViewers]=useState([]);
  const [statusViewCount,setStatusViewCount]=useState(0);
  const [statusReplyDraft,setStatusReplyDraft]=useState('');
  const [statusReplyNotice,setStatusReplyNotice]=useState('');
  const [statusReplies,setStatusReplies]=useState([]);
  const [pollQuestion,setPollQuestion]=useState('');
  const [pollOptions,setPollOptions]=useState(['','']);
  const [pollNotice,setPollNotice]=useState('');
  const [showPollComposer,setShowPollComposer]=useState(false);
  const [polls,setPolls]=useState({});
  const [pollVotes,setPollVotes]=useState({});
  const [pollVoteCounts,setPollVoteCounts]=useState({});
  const [bookmarks,setBookmarks]=useState(new Set());
  const [savedPosts,setSavedPosts]=useState([]);
  const [savedPostsLoading,setSavedPostsLoading]=useState(false);
  const [sharePostNotice,setSharePostNotice]=useState('');
  const [sharePostSending,setSharePostSending]=useState(false);
  const [communities,setCommunities]=useState([]);
  const [communityMembers,setCommunityMembers]=useState({});
  const [communityForm,setCommunityForm]=useState({name:'',description:'',category:'General'});
  const [communityNotice,setCommunityNotice]=useState('');
  const [selectedCommunity,setSelectedCommunity]=useState(null);
  const [communityPosts,setCommunityPosts]=useState([]);
  const [communityPost,setCommunityPost]=useState('');
  const [communitySearch,setCommunitySearch]=useState('');
  const [communityCategory,setCommunityCategory]=useState('All');
  const [groupMode,setGroupMode]=useState(false);
  const [groupName,setGroupName]=useState('');
  const [groupSelected,setGroupSelected]=useState([]);
  const [messageFile,setMessageFile]=useState(null);
  const [sendingMessage,setSendingMessage]=useState(false);
  const [isRecordingVoice,setIsRecordingVoice]=useState(false);
  const mediaRecorderRef=useRef(null);
  const audioChunksRef=useRef([]);
  const [editingMessage,setEditingMessage]=useState(null);
  const [messageReactions,setMessageReactions]=useState({});
  const [replyingTo,setReplyingTo]=useState(null);
  const [chatSearch,setChatSearch]=useState('');
  const [pinnedChatIds,setPinnedChatIds]=useState([]);
  const [archivedChatIds,setArchivedChatIds]=useState([]);
  const [mutedChatIds,setMutedChatIds]=useState([]);
  const [showArchivedChats,setShowArchivedChats]=useState(false);
  const [unreadCounts,setUnreadCounts]=useState({});
  const [peerReadAt,setPeerReadAt]=useState(null);
  const [onlineUsers,setOnlineUsers]=useState({});
  const [typingUsers,setTypingUsers]=useState({});
  const [exploreQuery,setExploreQuery]=useState('');
  const [exploreResults,setExploreResults]=useState({people:[],businesses:[],creators:[],listings:[],jobs:[],posts:[],communityPosts:[],communities:[]});
  const [exploreLoading,setExploreLoading]=useState(false);
  const [profileView,setProfileView]=useState(null);
  const [profileFollowed,setProfileFollowed]=useState(false);
  const [profileFollowers,setProfileFollowers]=useState(0);
  const [profileFollowing,setProfileFollowing]=useState(0);
  const [profilePosts,setProfilePosts]=useState([]);
  const [savedListings,setSavedListings]=useState(new Set());
  const [followedCreators,setFollowedCreators]=useState(new Set());
  const [businessView,setBusinessView]=useState(null);
  const [businessFollowed,setBusinessFollowed]=useState(false);
  const [businessFollowerCount,setBusinessFollowerCount]=useState(0);
  const [shareProfileTarget,setShareProfileTarget]=useState(null);
  const [shareListingTarget,setShareListingTarget]=useState(null);
  const [sharedProfileUsername,setSharedProfileUsername] = useState(() => new URLSearchParams(window.location.search).get('profile'));
  const [externalProfileShareNotice,setExternalProfileShareNotice] = useState('');
  const [sharedPostId,setSharedPostId] = useState(() => new URLSearchParams(window.location.search).get('post'));
  const [externalShareNotice,setExternalShareNotice] = useState('');
  const [inviteNotice, setInviteNotice] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [safetyNotice, setSafetyNotice] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('grin-last-page', active); } catch {}
  }, [active]);

  useEffect(() => {
    if (skipOlderMessageScrollRef.current) { skipOlderMessageScrollRef.current = false; return; }
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages, selected.id]);

  useEffect(() => {
    try { localStorage.setItem('grin-theme', theme); } catch {}
    document.documentElement.dataset.grinTheme = theme;
  }, [theme]);

  // Open the profile first; fetch counts and posts only after the modal has rendered.
  useEffect(() => {
    if (!session?.user?.id || profileView?.type !== 'person' || !profileView.id) return;
    let cancelled = false;
    const personId = profileView.id;
    (async () => {
      const [{ data: follow }, { count: followers }, { count: following }, { data: personPosts }] = await Promise.all([
        supabase.from('grin_follows').select('following_id').eq('follower_id', session.user.id).eq('following_id', personId).maybeSingle(),
        supabase.from('grin_follows').select('*', { count: 'exact', head: true }).eq('following_id', personId),
        supabase.from('grin_follows').select('*', { count: 'exact', head: true }).eq('follower_id', personId),
        supabase.from('grin_posts').select('id,body,media_url,media_type,created_at').eq('author_id', personId).order('created_at', { ascending: false }).limit(12)
      ]);
      if (cancelled) return;
      setProfileFollowed(!!follow);
      setProfileFollowers(followers || 0);
      setProfileFollowing(following || 0);
      setProfilePosts(personPosts || []);
    })();
    return () => { cancelled = true; };
  }, [profileView?.id, profileView?.type, session?.user?.id]);

  useEffect(() => {
    const onPopState = (event) => {
      const previousPage = event.state?.grinActivePage;
      if (typeof previousPage === 'string') {
        if (previousPage === active) {
          // Stay in the app at its root instead of exiting on the first back press.
          window.history.pushState({ ...event.state, grinActivePage: active }, '', window.location.href);
          return;
        }
        skipNextHistoryPush.current = true;
        setActive(previousPage);
        setShowMoreMenu(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [active]);

  useEffect(() => {
    if (skipNextHistoryPush.current) {
      skipNextHistoryPush.current = false;
      navigationHistoryReady.current = true;
      return;
    }
    const state = { ...(window.history.state || {}), grinAppNavigation: true, grinActivePage: active };
    if (!navigationHistoryReady.current) {
      window.history.replaceState(state, '', window.location.href);
      window.history.pushState(state, '', window.location.href);
      navigationHistoryReady.current = true;
      return;
    }
    window.history.pushState(state, '', window.location.href);
  }, [active]);

  useEffect(() => {
    try { localStorage.setItem('grin-toasts', toastEnabled ? 'on' : 'off'); } catch {}
  }, [toastEnabled]);

  // Keep gestures limited to the three primary areas, in a fixed order.
  // Controls, media, chat panes and horizontal carousels keep their own gestures.
  const swipePages = ['discover','chats','explore'];
  const swipeExcluded = 'input,textarea,select,button,a,[role="button"],video,audio,[contenteditable="true"],.grin-status-viewer,.grin-stories-strip,.composer,.feed-tabs,.post-footer,.post-media,.chat-list,.chat-window,.chat-messages,[data-no-page-swipe="true"]';
  function handleSwipeStart(event) {
    if (event.touches?.length !== 1) { swipeStart.current = null; return; }
    const target = event.target;
    if (!target.closest?.('.content') || target.closest?.(swipeExcluded)) { swipeStart.current = null; return; }
    swipeStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, target };
  }
  function handleSwipeEnd(event) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || !event.changedTouches?.length) return;
    if (start.target?.closest?.(swipeExcluded)) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    // Require a clear horizontal intent so normal scrolling never changes pages.
    if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const current = swipePages.indexOf(active);
    if (current < 0) return;
    const next = current + (dx < 0 ? 1 : -1);
    if (next < 0 || next >= swipePages.length) return;
    setActive(swipePages[next]);
    setShowMoreMenu(false);
  }

  // Load only the core data needed for the first screen. Other sections fetch
  // their data when opened, avoiding a burst of unrelated requests at sign-in.
  useEffect(() => {
    if (!session) return;
    loadChats();
    loadProfile();
    loadPosts();
    loadNotifications();
    loadBookmarks();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (active === 'status') loadStories();
    if (active === 'saved') loadSavedPosts();
    if (active === 'communities' || active === 'games') loadCommunities();
    if (active === 'business') {
      loadBusinesses();
      loadBusinessData();
      loadProfessional();
    }
    if (active === 'creators') {
      loadCreators();
      loadFollowedCreators();
    }
    if (active === 'marketplace') {
      loadListings();
      loadSavedListings();
    }
    if (active === 'jobs') loadJobs();
    if (active === 'settings') loadBlockedUsers();
  }, [session, active]);

  useEffect(() => {
    if (!session?.user?.id || active !== 'explore') return;
    let cancelled = false;
    async function loadDirectoryPeople() {
      setDirectoryPeopleLoading(true);
      const { data, error } = await supabase.from('grin_profiles')
        .select('id,username,display_name,bio,avatar_url')
        .neq('id', session.user.id)
        .order('display_name', { ascending: true })
        .limit(50);
      if (cancelled) return;
      if (error) {
        setSearchNotice('People directory could not load. Please try again.');
      } else {
        const blockedIds = new Set(blockedUsers.map(person => person.id));
        setDirectoryPeople((data || []).filter(person => !blockedIds.has(person.id)));
      }
      setDirectoryPeopleLoading(false);
    }
    loadDirectoryPeople();
    return () => { cancelled = true; };
  }, [active, session, blockedUsers]);

  async function loadBlockedUsers(){
    if(!session?.user?.id)return;
    const {data:blocks,error}=await supabase.from('grin_user_blocks').select('blocked_id').eq('blocker_id',session.user.id);
    if(error){setSafetyNotice('Block settings could not load. Please try again.');return;}
    const ids=(blocks||[]).map(row=>row.blocked_id);
    if(!ids.length){setBlockedUsers([]);return;}
    const {data:profiles}=await supabase.from('grin_profiles').select('id,username,display_name,avatar_url').in('id',ids);
    setBlockedUsers(profiles||[]);
  }

  async function blockPerson(person){
    if(!person?.id||person.id===session.user.id)return;
    const name=person.display_name||person.username||'this account';
    if(!window.confirm('Block '+name+'? They will be removed from your people search. You can unblock them in Settings.'))return;
    const {error}=await supabase.from('grin_user_blocks').insert({blocker_id:session.user.id,blocked_id:person.id});
    if(error){setSafetyNotice(error.code==='23505'?'This account is already blocked.':'Could not block this account. Please try again.');return;}
    setSafetyNotice(name+' has been blocked.');
    window.alert(name+' has been blocked. You can manage blocked accounts in Settings.');
    await loadBlockedUsers();
    setExploreResults(current=>({...current,people:current.people.filter(p=>p.id!==person.id)}));
    setPeople(current=>current.filter(p=>p.id!==person.id));
    setSuggestedPeople(current=>current.filter(p=>p.id!==person.id));
    setSuggestedCreators(current=>current.filter(p=>p.id!==person.id));
    setDirectoryPeople(current=>current.filter(p=>p.id!==person.id));
    setProfileView(null);
  }

  async function unblockPerson(person){
    if(!person?.id)return;
    if(!window.confirm('Unblock '+(person.display_name||person.username||'this account')+'?'))return;
    const {error}=await supabase.from('grin_user_blocks').delete().eq('blocker_id',session.user.id).eq('blocked_id',person.id);
    if(error){setSafetyNotice('Could not unblock this account. Please try again.');return;}
    setSafetyNotice('Account unblocked.');
    await loadBlockedUsers();
  }

  async function reportPerson(person){
    if(!person?.id||person.id===session.user.id)return;
    const choice=window.prompt('Why are you reporting this account?\n1. Harassment or bullying\n2. Spam or scams\n3. Impersonation\n4. Inappropriate content\n5. Other');
    if(choice===null)return;
    const index=Number(choice.trim())-1;
    if(!Number.isInteger(index)||index<0||index>4){setSafetyNotice('Choose a reason from 1 to 5 to submit a report.');return;}
    const details=window.prompt('Add details (optional, up to 1000 characters). Leave blank to skip:');
    if(details===null)return;
    if(details.length>1000){setSafetyNotice('Report details must be 1000 characters or fewer.');return;}
    const reasonKeys=['harassment','spam','impersonation','inappropriate_content','other'];
    const {error}=await supabase.from('grin_user_reports').insert({reporter_id:session.user.id,reported_user_id:person.id,reason:reasonKeys[index],details:details.trim()||null});
    if(error){setSafetyNotice('Could not submit your report. Please try again.');return;}
    setSafetyNotice('Report submitted. Thank you for helping keep GRIN safe.');
    window.alert('Report submitted. Thank you for helping keep GRIN safe.');
    setProfileView(null);
  }

  function openPersonProfile(person){setProfileFollowed(false);setProfileFollowers(0);setProfileFollowing(0);setProfilePosts([]);setProfileView({type:'person',...person});}
  async function messagePerson(person){if(!person?.id||person.id===session.user.id)return;const {data,error}=await supabase.rpc('grin_create_direct_conversation',{other_user:person.id});if(error||!data){setSearchNotice('Could not open this conversation. Please try again.');return;}const name=person.display_name||person.username||'GRIN User';const chat={id:data,name,preview:'Start a conversation.',initials:name.slice(0,2).toUpperCase(),avatar_url:person.avatar_url||null,peer_id:person.id,peer_username:person.username,kind:'direct'};setChats(current=>current.some(item=>item.id===data)?current:[chat,...current.filter(item=>item.id!=='welcome')]);setSelected(chat);setChatOpen(true);setSearchNotice('');setProfileView(null);setActive('chats');}
  async function togglePersonFollow(person){const target=person||profileView;if(!target||target.type==='creator'||target.id===session.user.id)return false;const followed=person?followedIds.has(target.id):profileFollowed;const result=followed?await supabase.from('grin_follows').delete().eq('follower_id',session.user.id).eq('following_id',target.id):await supabase.from('grin_follows').insert({follower_id:session.user.id,following_id:target.id});if(result.error){setSearchNotice(followed?'Could not unfollow this person. Please try again.':'Could not follow this person. Please try again.');return false;}if(person)setFollowedIds(current=>{const updated=new Set(current);if(followed)updated.delete(target.id);else updated.add(target.id);return updated;});else setProfileFollowed(!followed);setSearchNotice('');return true;}

  async function searchExplore(queryValue = exploreQuery) {
    const q = queryValue.trim().replace(/[\\%_(),]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!q) {
      setExploreResults({people:[],businesses:[],creators:[],listings:[],jobs:[],posts:[],communityPosts:[],communities:[]});
      setSearchNotice('');
      setExploreLoading(false);
      return;
    }
    setExploreLoading(true);
    setSearchNotice('');
    const term = '%' + q + '%';
    try {
      const results = await Promise.all([
        supabase.from('grin_profiles').select('id,username,display_name,bio,avatar_url').neq('id',session.user.id).or('username.ilike.'+term+',display_name.ilike.'+term+',bio.ilike.'+term).limit(20),
        supabase.from('grin_businesses').select('id,name,handle,category,description,location').or('name.ilike.'+term+',handle.ilike.'+term+',category.ilike.'+term+',description.ilike.'+term+',location.ilike.'+term).limit(20),
        supabase.from('grin_creator_profiles').select('user_id,category,headline,bio,location,rate,currency,grin_profiles(username,display_name,avatar_url)').or('category.ilike.'+term+',headline.ilike.'+term+',bio.ilike.'+term+',location.ilike.'+term).limit(20),
        supabase.from('grin_marketplace_listings').select('id,title,description,category,price,currency,image_url,external_url').or('title.ilike.'+term+',description.ilike.'+term+',category.ilike.'+term).limit(20),
        supabase.from('grin_jobs').select('id,title,description,category,budget,currency').or('title.ilike.'+term+',description.ilike.'+term+',category.ilike.'+term).limit(20),
        supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,created_at,grin_profiles(username,display_name,avatar_url)').ilike('body',term).order('created_at',{ascending:false}).limit(30),
        supabase.from('grin_community_posts').select('id,community_id,author_id,body,created_at,grin_communities(name,category)').ilike('body',term).order('created_at',{ascending:false}).limit(20),
        supabase.from('grin_communities').select('id,name,description,category').or('name.ilike.'+term+',description.ilike.'+term+',category.ilike.'+term).limit(20)
      ]);
      const [pp,bb,cc,ll,jj,postRows,communityPostRows,communityRows] = results;const blockedIds=new Set(blockedUsers.map(person=>person.id));
      setExploreResults({people:(pp.data||[]).filter(person=>!blockedIds.has(person.id)),businesses:bb.data||[],creators:cc.data||[],listings:ll.data||[],jobs:jj.data||[],posts:postRows.data||[],communityPosts:communityPostRows.data||[],communities:communityRows.data||[]});
      if (results.some(result => result.error)) setSearchNotice('Some results could not load. Try again in a moment.');
    } catch (error) {
      setSearchNotice('Search could not connect. Check your connection and try again.');
    } finally {
      setExploreLoading(false);
    }
  }

  useEffect(() => {
    if (active !== 'discover' && active !== 'explore') return;
    const query = exploreQuery.trim();
    if (!query) {
      setExploreResults({people:[],businesses:[],creators:[],listings:[],jobs:[],posts:[],communityPosts:[],communities:[]});
      setSearchNotice('');
      setExploreLoading(false);
      return;
    }
    const timer = window.setTimeout(() => searchExplore(query), 400);
    return () => window.clearTimeout(timer);
  }, [exploreQuery, active, session]);

  async function loadCreators(){const {data}=await supabase.from('grin_creator_profiles').select('*,grin_profiles(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(30);setCreators(data||[]);}
  async function saveCreator(e){e.preventDefault();setCreatorNotice('');const payload={user_id:session.user.id,...creatorForm,rate:creatorForm.rate?Number(creatorForm.rate):null};const {error}=await supabase.from('grin_creator_profiles').upsert(payload);setCreatorNotice(error?.message||'Creator profile saved.');if(!error)loadCreators();}
  async function loadListings(){const {data}=await supabase.from('grin_marketplace_listings').select('*').order('created_at',{ascending:false}).limit(50);setListings(data||[]);}
  async function createListing(e){e.preventDefault();const payload={...listingForm,seller_id:session.user.id,price:listingForm.price?Number(listingForm.price):null};const {error}=await supabase.from('grin_marketplace_listings').insert(payload);setListingNotice(error?.message||'Listing published.');if(!error){setListingForm({title:'',description:'',category:'Other',price:'',currency:'NGN',external_url:''});loadListings();}}
  async function loadJobs(){const {data}=await supabase.from('grin_jobs').select('*').order('created_at',{ascending:false}).limit(50);setJobs(data||[]);}
  async function createJob(e){e.preventDefault();const payload={...jobForm,poster_id:session.user.id,budget:jobForm.budget?Number(jobForm.budget):null};const {error}=await supabase.from('grin_jobs').insert(payload);setJobNotice(error?.message||'Job posted.');if(!error){setJobForm({title:'',description:'',category:'Other',budget:'',currency:'NGN'});loadJobs();}}
  async function applyJob(job){const message=window.prompt('Tell the poster why you are a good fit:');if(!message?.trim())return;const {error}=await supabase.from('grin_job_applications').insert({job_id:job.id,applicant_id:session.user.id,message:message.trim()});setJobNotice(error?.message||'Application sent.');}

  async function loadStories(){
    const {data,error}=await supabase.from('grin_stories').select('*,grin_profiles(id,username,display_name,avatar_url)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(100);
    if(error){console.error('GRIN statuses failed to load',error);setStoryNotice('Statuses could not load. Please try again.');return;}
    setStories(data||[]);
  }
  async function trackStatusView(story){if(!story?.id||story.author_id===session?.user?.id)return;const {error}=await supabase.from('grin_story_views').upsert({story_id:story.id,viewer_id:session.user.id,viewed_at:new Date().toISOString()},{onConflict:'story_id,viewer_id'});if(error)console.error('GRIN status view failed',error);}
  async function loadStatusViewers(story){if(!story?.id||story.author_id!==session?.user?.id){setStatusViewers([]);setStatusViewCount(0);return;}const {data,error}=await supabase.from('grin_story_views').select('id,viewed_at,viewer:grin_profiles!grin_story_views_viewer_id_fkey(id,username,display_name,avatar_url)').eq('story_id',story.id).order('viewed_at',{ascending:false}).limit(100);if(error){console.error('GRIN status viewers failed',error);setStatusViewers([]);setStatusViewCount(0);return;}setStatusViewers(data||[]);setStatusViewCount((data||[]).length);}
  async function loadStatusReplies(storyId){if(!storyId){setStatusReplies([]);return;}const {data,error}=await supabase.from('grin_story_replies').select('id,story_id,author_id,body,created_at,grin_profiles!grin_story_replies_author_id_fkey(id,username,display_name,avatar_url)').eq('story_id',storyId).order('created_at',{ascending:true}).limit(50);if(error){console.error('GRIN status replies failed',error);setStatusReplies([]);return;}setStatusReplies(data||[]);}
  async function replyToStatus(){const body=statusReplyDraft.trim();if(!body||!activeStatus||activeStatus.author_id===session?.user?.id)return;setStatusReplyNotice('');const {error}=await supabase.from('grin_story_replies').insert({story_id:activeStatus.id,author_id:session.user.id,body});if(error){console.error('GRIN status reply failed',error);setStatusReplyNotice('Could not send your reply. Please try again.');return;}setStatusReplyDraft('');setStatusReplyNotice('Reply sent.');await loadStatusReplies(activeStatus.id);window.setTimeout(()=>setStatusReplyNotice(current=>current==='Reply sent.'?'':current),2200);}

  async function createStory(e){
    e.preventDefault();
    const caption=storyCaption.trim();
    if(!caption&&!storyFile)return;
    let media_url=null, media_type=null;
    if(storyFile){
      if(storyFile.size>50*1024*1024){setStoryNotice('Story file must be 50 MB or less.');return;}
      media_type=storyFile.type.startsWith('video/')?'video':'image';
      const safe=storyFile.name.replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=session.user.id+'/stories/'+crypto.randomUUID()+'-'+safe;
      const {error:uploadError}=await supabase.storage.from('grin-media').upload(path,storyFile,{contentType:storyFile.type,upsert:false});
      if(uploadError){setStoryNotice(uploadError.message);return;}
      media_url=supabase.storage.from('grin-media').getPublicUrl(path).data.publicUrl;
    }
    const {error}=await supabase.from('grin_stories').insert({author_id:session.user.id,caption,media_url,media_type,expires_at:new Date(Date.now()+48*60*60*1000).toISOString()});
    setStoryNotice(error?.message||'Story posted for 48 hours.');
    if(!error){setStoryCaption('');setStoryFile(null);const x=document.getElementById('grin-story-input');if(x)x.value='';loadStories();}
  }
  async function openBusinessProfile(b){const [{data:f},{count}]=await Promise.all([supabase.from('grin_business_follows').select('business_id').eq('user_id',session.user.id).eq('business_id',b.id).maybeSingle(),supabase.from('grin_business_follows').select('*',{count:'exact',head:true}).eq('business_id',b.id)]);const [{data:sv},{data:pr}]=await Promise.all([supabase.from('grin_business_services').select('id,name,description,price,currency').eq('business_id',b.id).eq('active',true).limit(12),supabase.from('grin_business_products').select('id,name,description,price,currency,image_url,product_url').eq('business_id',b.id).eq('active',true).limit(12)]);setBusinessView({...b,services:sv||[],products:pr||[]});setBusinessFollowed(!!f);setBusinessFollowerCount(count||0);}
  async function toggleBusinessFollow(){if(!businessView||businessView.owner_id===session.user.id)return;if(businessFollowed){await supabase.from('grin_business_follows').delete().eq('business_id',businessView.id).eq('user_id',session.user.id);setBusinessFollowed(false);setBusinessFollowerCount(x=>Math.max(0,x-1));}else{await supabase.from('grin_business_follows').insert({business_id:businessView.id,user_id:session.user.id});setBusinessFollowed(true);setBusinessFollowerCount(x=>x+1);}}
  async function openCreatorProfile(creator){const [{count}]=await Promise.all([supabase.from('grin_creator_follows').select('*',{count:'exact',head:true}).eq('creator_id',creator.user_id)]);setProfileView({type:'creator',creator_id:creator.user_id,display_name:creator.grin_profiles?.display_name||'GRIN Creator',username:creator.grin_profiles?.username,bio:creator.bio,avatar_url:creator.grin_profiles?.avatar_url,headline:creator.headline,category:creator.category,location:creator.location,rate:creator.rate,currency:creator.currency,creatorFollowerCount:count||0});setProfileFollowed(followedCreators.has(creator.user_id));}

  async function loadSavedListings(){const {data}=await supabase.from('grin_marketplace_saved').select('listing_id').eq('user_id',session.user.id);setSavedListings(new Set((data||[]).map(x=>x.listing_id)));}
  async function toggleSavedListing(id){if(savedListings.has(id)){await supabase.from('grin_marketplace_saved').delete().eq('listing_id',id).eq('user_id',session.user.id);setSavedListings(x=>{const n=new Set(x);n.delete(id);return n;});}else{await supabase.from('grin_marketplace_saved').insert({listing_id:id,user_id:session.user.id});setSavedListings(x=>new Set([...x,id]));}}
  async function loadFollowedCreators(){const {data}=await supabase.from('grin_creator_follows').select('creator_id').eq('follower_id',session.user.id);setFollowedCreators(new Set((data||[]).map(x=>x.creator_id)));}
  async function toggleCreatorFollow(id){if(followedCreators.has(id)){await supabase.from('grin_creator_follows').delete().eq('creator_id',id).eq('follower_id',session.user.id);setFollowedCreators(x=>{const n=new Set(x);n.delete(id);return n;});}else{await supabase.from('grin_creator_follows').insert({creator_id:id,follower_id:session.user.id});setFollowedCreators(x=>new Set([...x,id]));}}

  async function loadBookmarks(){
    const {data,error}=await supabase.from('grin_bookmarks').select('post_id').eq('user_id',session.user.id);
    if(error){console.error('GRIN bookmarks could not load',error);return;}
    setBookmarks(new Set((data||[]).map(x=>x.post_id)));
  }

  async function loadSavedPosts(){
    if(!session?.user?.id)return;
    setSavedPostsLoading(true);
    const {data:marks,error:markError}=await supabase.from('grin_bookmarks').select('post_id').eq('user_id',session.user.id);
    if(markError){setPostNotice('Saved posts could not load: '+markError.message);setSavedPostsLoading(false);return;}
    const ids=(marks||[]).map(row=>row.post_id);
    setBookmarks(new Set(ids));
    if(!ids.length){setSavedPosts([]);setSavedPostsLoading(false);return;}
    const {data,error}=await supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,repost_of_id,created_at,grin_profiles(username,display_name,avatar_url)').in('id',ids).order('created_at',{ascending:false});
    if(error){setPostNotice('Saved posts could not load: '+error.message);setSavedPosts([]);}else{setSavedPosts(data||[]);setPostNotice('');}
    setSavedPostsLoading(false);
  }
  async function toggleBookmark(postId){
    if(bookmarks.has(postId)){
      await supabase.from('grin_bookmarks').delete().eq('post_id',postId).eq('user_id',session.user.id);
      setBookmarks(prev=>{const n=new Set(prev);n.delete(postId);return n;});
    }else{
      const {error}=await supabase.from('grin_bookmarks').insert({post_id:postId,user_id:session.user.id});
      if(!error)setBookmarks(prev=>new Set([...prev,postId]));
    }
  }
  async function createPoll(postId){
    const q=pollQuestion.trim();
    const opts=pollOptions.map(x=>x.trim()).filter(Boolean);
    if(!q||opts.length<2){setPollNotice('Add a question and at least two options.');return;}
    const {data:poll,error}=await supabase.from('grin_polls').insert({post_id:postId,question:q,expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString()}).select().single();
    if(error){setPollNotice(error.message);return;}
    const {error:optError}=await supabase.from('grin_poll_options').insert(opts.map((option_text,i)=>({poll_id:poll.id,option_text,position:i})));
    setPollNotice(optError?.message||'Poll created.');
    if(!optError){setPollQuestion('');setPollOptions(['','']);}
  }


  function resetGrinGame(){const board=Array(9).fill('');setGameBoard(board);setGameTurn('X');setGrinTicTacToeThinking(false);setGameNotice('');if(gameRoomCode&&gameChannelRef.current)gameChannelRef.current.send({type:'broadcast',event:'game-state',payload:{board,turn:'X',winner:null,room:gameRoomCode}});}
  function exitGrinGameRoom(){
    if(!gameRoomCode){setGameNotice('You are not in an online room.');return;}
    setGameRoomCode('');
    setGameMark('X');
    setGameJoinCode('');
    const board=Array(9).fill('');
    setGameBoard(board);
    setGameTurn('X');
    setGameNotice('You left the room. You can play against GRIN Bot or join another room.');
    const params=new URLSearchParams(window.location.search);
    params.delete('game');params.delete('room');
    const query=params.toString();
    window.history.replaceState({},'',window.location.pathname+(query?'?'+query:'')+window.location.hash);
  }
  function grinGameWinner(board){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,d] of lines)if(board[a]&&board[a]===board[b]&&board[a]===board[d])return board[a];
    return board.every(Boolean)?'draw':null;
  }
  function startGrinGameRoom(){
    const code=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
    resetGrinGame();setGameRoomCode(code);setGameMark('X');setActive('games');
    setGameNotice('Room created. Send the invitation link to play online.');
  }
  function joinGrinGameRoom(){
    const code=gameJoinCode.trim().toUpperCase();
    if(!/^[A-Z0-9]{6,12}$/.test(code)){setGameNotice('Enter a valid room code.');return;}
    setGameRoomCode(code);setGameMark('O');setGameNotice('Joining room…');
  }
  function chooseGrinBotMove(board){
    const legal=[];
    for(let i=0;i<9;i++)if(!board[i])legal.push(i);
    if(!legal.length)return -1;
    // Easy intentionally makes occasional blunders; Normal mixes strong play
    // with imperfect choices; Hard uses the optimal minimax move.
    const randomChance=grinBotDifficulty==='easy'?0.62:grinBotDifficulty==='normal'?0.24:0;
    if(Math.random()<randomChance)return legal[Math.floor(Math.random()*legal.length)];
    const scores=[];
    for(const i of legal){
      const next=board.slice();next[i]='O';
      scores.push({i,score:grinBotMinimax(next,false)});
    }
    scores.sort((a,b)=>b.score-a.score);
    if(grinBotDifficulty==='normal'&&scores.length>1&&Math.random()<0.38){
      const weaker=scores.filter(move=>move.score<scores[0].score);
      if(weaker.length)return weaker[Math.floor(Math.random()*weaker.length)].i;
    }
    return scores[0]?.i??-1;
  }
  function grinBotMinimax(board,botTurn){
    const winner=grinGameWinner(board);
    if(winner==='O')return 10;
    if(winner==='X')return -10;
    if(winner==='draw')return 0;
    const scores=[];
    for(let i=0;i<9;i++)if(!board[i]){
      const next=board.slice();next[i]=botTurn?'O':'X';
      scores.push(grinBotMinimax(next,!botTurn));
    }
    return botTurn?Math.max(...scores):Math.min(...scores);
  }
  function playGrinGameCell(index){
    if(grinTicTacToeThinking||gameBoard[index]||grinGameWinner(gameBoard)||(gameRoomCode&&gameTurn!==gameMark))return;
    const board=gameBoard.slice();board[index]=gameTurn;
    const winner=grinGameWinner(board);
    if(gameRoomCode){
      const next=gameTurn==='X'?'O':'X';setGameBoard(board);setGameTurn(next);
      setGameNotice(winner?(winner==='draw'?'It is a draw!':winner+' wins!'):'Move played. Waiting for your opponent…');
      if(gameChannelRef.current)gameChannelRef.current.send({type:'broadcast',event:'game-state',payload:{board,turn:next,winner,room:gameRoomCode}});
      return;
    }
    if(winner){setGameBoard(board);setGameNotice(winner==='draw'?'It is a draw!':'You win!');return;}
    setGrinTicTacToeThinking(true);setGameNotice('🤔 GRIN Bot is thinking…');
    window.setTimeout(()=>{
      const botIndex=chooseGrinBotMove(board);
      if(botIndex<0){setGameBoard(board);setGrinTicTacToeThinking(false);setGameNotice('It is a draw!');return;}
      const afterBot=board.slice();afterBot[botIndex]='O';
      const botWinner=grinGameWinner(afterBot);
      setGameBoard(afterBot);setGameTurn('X');setGrinTicTacToeThinking(false);
      setGameNotice(botWinner?(botWinner==='draw'?'It is a draw!':'GRIN Bot wins!'):'Your turn — you are X.');
    },1800);
  }
  async function copyGrinGameLink(){
    if(!gameRoomCode){setGameNotice('Create an online room first.');return;}
    const link=window.location.origin+window.location.pathname+'?game=ttt&room='+encodeURIComponent(gameRoomCode);
    try{await navigator.clipboard.writeText(link);setGameNotice('Game link copied. Paste it into a chat or community post.');}
    catch{window.prompt('Copy your GRIN game link:',link);setGameNotice('If the link was copied from the prompt, paste it into a chat or community post.');}
  }
  async function shareGrinGameLink(){
    if(!gameRoomCode){setGameNotice('Create an online room first.');return;}
    const link=window.location.origin+window.location.pathname+'?game=ttt&room='+encodeURIComponent(gameRoomCode);
    const shareData={title:'Play Tic-Tac-Toe on GRIN',text:'Join my GRIN Tic-Tac-Toe game. Room '+gameRoomCode, url:link};
    try{
      if(navigator.share){await navigator.share(shareData);setGameNotice('Game link shared.');}
      else{await navigator.clipboard.writeText(link);setGameNotice('This device does not support direct sharing here, so the game link was copied.');}
    }catch(error){if(error?.name!=='AbortError')setGameNotice('Could not open sharing. Try Copy game link instead.');}
  }
  async function sendGrinGameInvite(){
    if(!gameRoomCode){setGameNotice('Create a game room first, then invite people.');return;}
    const link=window.location.origin+window.location.pathname+'?game=ttt&room='+encodeURIComponent(gameRoomCode);
    const body='🎮 You are invited to play Tic-Tac-Toe on GRIN! Room '+gameRoomCode+': '+link;
    if(gameInviteTarget){
      const chat=chats.find(item=>item.id===gameInviteTarget);
      if(!chat||chat.id==='welcome'){setGameNotice('Choose a real conversation to send the invite.');return;}
      const {data,error}=await supabase.from('grin_messages').insert({conversation_id:chat.id,sender_id:session.user.id,body}).select().single();
      if(error||!data){console.error('GRIN game invite message failed',error);setGameNotice('Could not send the invite: '+(error?.message||'please try again.'));return;}
      if(selected?.id===chat.id)setMessages(current=>current.some(item=>item.id===data.id)?current:[...current,data]);
      setChats(current=>current.map(item=>item.id===chat.id?{...item,preview:body,lastMessageAt:data.created_at||new Date().toISOString()}:item));
      setGameNotice('Invitation sent to '+chat.name+'.');setGameInviteTarget('');return;
    }
    if(gameInviteCommunity){
      const {error}=await supabase.from('grin_community_posts').insert({community_id:gameInviteCommunity,author_id:session.user.id,body});
      if(error){console.error('GRIN community game invite failed',error);setGameNotice('Could not post the invite: '+(error.message||'check that you belong to the community.'));return;}
      setGameNotice('Invitation posted to the selected community.');setGameInviteCommunity('');return;
    }
    setGameNotice('Choose a conversation or community to invite.');
  }
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get('game')==='penalty'&&params.get('room')){
      const code=(params.get('room')||'').toUpperCase();
      if(/^[A-Z0-9]{6,12}$/.test(code)){setOnlinePenaltyRoom(code);setOnlinePenaltyRole('guest');setSelectedGrinGame('football');setActive('games');setOnlinePenalty(s=>({...s,notice:'You have been invited to a GRIN penalty shootout.'}));}
    }
    if(params.get('game')==='memory'&&params.get('room')){
      const code=(params.get('room')||'').toUpperCase();
      if(/^[A-Z0-9]{6,12}$/.test(code)){setMemoryRoomCode(code);setMemoryRoomRole('guest');setSelectedGrinGame('memory');setActive('games');setMemoryNotice('You have been invited to Memory Match.');}
    }
    if(params.get('game')==='rps'&&params.get('room')){
      const code=(params.get('room')||'').toUpperCase();
      if(/^[A-Z0-9]{6,12}$/.test(code)){setRpsRoomCode(code);setRpsRoomRole('guest');setSelectedGrinGame('rps');setActive('games');setRpsResult('You have been invited to a Rock Paper Scissors match.');}
    }
    if(params.get('game')==='ttt'&&params.get('room')){
      const code=(params.get('room')||'').toUpperCase();
      if(/^[A-Z0-9]{6,12}$/.test(code)){setGameRoomCode(code);setGameMark('O');setActive('games');setGameNotice('You have been invited. You play O.');}
    }
  },[]);
  useEffect(()=>{
    if(!gameRoomCode||!session?.user?.id)return;
    const channel=supabase.channel('grin-game-'+gameRoomCode,{config:{broadcast:{self:false}}});
    gameChannelRef.current=channel;
    channel.on('broadcast',{event:'game-state'},({payload})=>{
      if(payload?.room!==gameRoomCode||!Array.isArray(payload.board)||payload.board.length!==9)return;
      setGameBoard(payload.board);setGameTurn(payload.turn==='O'?'O':'X');
      if(payload.winner)setGameNotice(payload.winner==='draw'?'It is a draw!':payload.winner+' wins!');
      else setGameNotice('Your opponent made a move.');
    }).on('broadcast',{event:'game-request-state'},()=>{
      if(gameMark==='X'){const board=gameBoardRef.current;channel.send({type:'broadcast',event:'game-state',payload:{board,turn:gameTurnRef.current,winner:grinGameWinner(board),room:gameRoomCode}});}
    }).subscribe(status=>{
      if(status==='SUBSCRIBED'){
        setGameNotice(gameMark==='X'?'Room ready. Send your invite link.':'Connected to room. Waiting for the first move.');
        if(gameMark==='O')channel.send({type:'broadcast',event:'game-request-state',payload:{room:gameRoomCode}});
      }
    });
    return()=>{supabase.removeChannel(channel);if(gameChannelRef.current===channel)gameChannelRef.current=null;};
  },[gameRoomCode,session?.user?.id,gameMark]);

  async function loadCommunities(){
    const {data}=await supabase.from('grin_communities').select('*').order('created_at',{ascending:false}).limit(50);
    const rows=data||[];
    setCommunities(rows);
    if(!rows.length){setCommunityMembers({});return;}
    const {data:members}=await supabase.from('grin_community_members').select('community_id,user_id').in('community_id',rows.map(x=>x.id));
    const counts={};
    (members||[]).forEach(m=>{if(!counts[m.community_id])counts[m.community_id]={count:0,joined:false};counts[m.community_id].count++;if(m.user_id===session.user.id)counts[m.community_id].joined=true;});
    setCommunityMembers(counts);
  }
  async function createCommunity(e){
    e.preventDefault();
    const {data,error}=await supabase.from('grin_communities').insert({...communityForm,owner_id:session.user.id}).select().single();
    if(error){setCommunityNotice(error.message);return;}
    await supabase.from('grin_community_members').insert({community_id:data.id,user_id:session.user.id,role:'owner'});
    setCommunityNotice('Community created.');
    setCommunityForm({name:'',description:'',category:'General'});
    loadCommunities();
  }
  async function toggleCommunityMembership(id){
    const state=communityMembers[id]||{count:0,joined:false};
    if(state.joined){
      const community=communities.find(x=>x.id===id);
      if(community?.owner_id===session.user.id){setCommunityNotice('Community owners cannot leave their own community.');return;}
      const {error}=await supabase.from('grin_community_members').delete().eq('community_id',id).eq('user_id',session.user.id);
      if(error){setCommunityNotice(error.message);return;}
      setCommunityNotice('You left the community.');
    }else{
      const {error}=await supabase.from('grin_community_members').insert({community_id:id,user_id:session.user.id});
      if(error){setCommunityNotice(error.code==='23505'?'You are already a member.':error.message);return;}
      setCommunityNotice('Joined community.');
    }
    loadCommunities();
  }

  async function loadCommunityPosts(communityId){
    const {data}=await supabase.from('grin_community_posts').select('*').eq('community_id',communityId).order('created_at',{ascending:false}).limit(100);
    setCommunityPosts(data||[]);
  }
  async function publishCommunityPost(e){
    e.preventDefault();
    if(!selectedCommunity||!communityPost.trim()) return;
    const {error}=await supabase.from('grin_community_posts').insert({community_id:selectedCommunity.id,author_id:session.user.id,body:communityPost.trim()});
    if(error){setCommunityNotice(error.message);return;}
    setCommunityPost('');
    loadCommunityPosts(selectedCommunity.id);
  }

  async function loadBusinesses() {
    const { data } = await supabase.from('grin_businesses').select('*').order('created_at',{ascending:false});
    setBusinesses(data || []);
  }
  async function loadBusinessData() {
    const {data:bs}=await supabase.from('grin_businesses').select('id,owner_id').eq('owner_id',session.user.id);
    if(!bs?.length) return;
    const ids=bs.map(b=>b.id);
    const [{data:ss},{data:ll},{data:pp},{data:ev},{data:ff}]=await Promise.all([
      supabase.from('grin_business_services').select('*').in('business_id',ids).order('created_at',{ascending:false}),
      supabase.from('grin_business_leads').select('*').in('business_id',ids).order('created_at',{ascending:false}),
      supabase.from('grin_business_products').select('*').in('business_id',ids).order('created_at',{ascending:false}),
      supabase.from('grin_business_events').select('event_type').in('business_id',ids),
      supabase.from('grin_business_follows').select('business_id').in('business_id',ids)
    ]);
    setServices(ss||[]); setLeads(ll||[]); setProducts(pp||[]);
    const stats={views:0,followers:(ff||[]).length,contacts:0,productViews:0};
    (ev||[]).forEach(e=>{if(e.event_type==='view')stats.views++;if(e.event_type==='contact')stats.contacts++;if(e.event_type==='product_view')stats.productViews++;});
    setBusinessStats(stats);
    if(!serviceForm.business_id) setServiceForm(x=>({...x,business_id:ids[0]}));
    if(!productForm.business_id) setProductForm(x=>({...x,business_id:ids[0]}));
  }
  async function addProduct(e) {
    e.preventDefault();
    const payload={...productForm,price:productForm.price?Number(productForm.price):null};
    const {data,error}=await supabase.from('grin_business_products').insert(payload).select().single();
    if(!error&&data){setProducts(x=>[data,...x]);setProductForm(x=>({...x,name:'',description:'',price:'',product_url:''}));}
    else setBusinessNotice(error?.message||'Could not add product.');
  }
  async function saveProfessional(e) {
    e.preventDefault(); setProNotice('');
    const payload={user_id:session.user.id,...professional,skills:professional.skills.split(',').map(x=>x.trim()).filter(Boolean),hourly_rate:professional.hourly_rate?Number(professional.hourly_rate):null};
    const {data,error}=await supabase.from('grin_professional_profiles').upsert(payload).select().single();
    if(error)setProNotice(error.message); else {setProfessional({...data,skills:(data.skills||[]).join(', '),hourly_rate:data.hourly_rate||''});setProNotice('Professional profile saved.');}
  }
  async function loadProfessional() {
    const {data}=await supabase.from('grin_professional_profiles').select('*').eq('user_id',session.user.id).maybeSingle();
    if(data)setProfessional({...data,skills:(data.skills||[]).join(', '),hourly_rate:data.hourly_rate||''});
  }

  async function addService(e) {
    e.preventDefault();
    const payload={...serviceForm,price:serviceForm.price?Number(serviceForm.price):null};
    const {data,error}=await supabase.from('grin_business_services').insert(payload).select().single();
    if(!error&&data){setServices(x=>[data,...x]);setServiceForm(x=>({...x,name:'',description:'',price:''}));}
    else setBusinessNotice(error?.message||'Could not add service.');
  }
  async function createLead(businessId) {
    const message=window.prompt('What would you like to ask this business?');
    if(!message?.trim()) return;
    const {error}=await supabase.from('grin_business_leads').insert({business_id:businessId,user_id:session.user.id,message:message.trim()});
    if(!error) await supabase.from('grin_business_events').insert({business_id:businessId,user_id:session.user.id,event_type:'contact'});
    setBusinessNotice(error?.message||'Message sent to business.');
    if(!error) loadBusinessData();
  }

  async function createBusiness(e) {
    e.preventDefault(); setBusinessNotice('');
    const payload={...businessForm,owner_id:session.user.id,handle:businessForm.handle.trim().toLowerCase().replace(/[^a-z0-9_]/g,'_')};
    const {data,error}=await supabase.from('grin_businesses').insert(payload).select().single();
    if(error) setBusinessNotice(error.message); else {setBusinesses(x=>[data,...x]);setBusinessForm({name:'',handle:'',category:'Business',description:'',website:'',location:''});setBusinessNotice('Business profile created.');}
  }
  async function followBusiness(businessId) {
    const {data:existing}=await supabase.from('grin_business_follows').select('business_id').eq('business_id',businessId).eq('user_id',session.user.id).maybeSingle();
    if(existing) await supabase.from('grin_business_follows').delete().eq('business_id',businessId).eq('user_id',session.user.id);
    else { await supabase.from('grin_business_follows').insert({business_id:businessId,user_id:session.user.id}); await supabase.from('grin_business_events').insert({business_id:businessId,user_id:session.user.id,event_type:'follow'}); }
    loadBusinessData();
  }

  async function loadNotifications() {
    const { data, error } = await supabase.from('grin_notifications').select('id,actor_id,kind,post_id,story_id,conversation_id,body,read_at,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(50);
    if(error){ console.error('GRIN notifications load failed',error); setNotifications([]); return; }
    const rows=data||[]; const actorIds=[...new Set(rows.map(n=>n.actor_id).filter(Boolean))];
    let profiles=[];
    if(actorIds.length){ const {data:p,error:pe}=await supabase.from('grin_profiles').select('id,username,display_name,avatar_url').in('id',actorIds); if(!pe) profiles=p||[]; }
    const byId=Object.fromEntries(profiles.map(p=>[p.id,p]));
    const enriched = rows.map(n=>({...n,grin_profiles:byId[n.actor_id]||null}));
    setNotifications(enriched);
    return enriched;
  }
  useEffect(() => {
    if (!session?.user?.id) return;
    let toastTimer;
    const channel = supabase.channel('grin:notifications:' + session.user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grin_notifications', filter: 'user_id=eq.' + session.user.id }, payload => {
        const incoming = payload.new;
        if (!incoming?.id || incoming.actor_id === session.user.id) return;
        const isMutedConversation = Boolean(incoming.conversation_id && mutedChatIds.includes(incoming.conversation_id));
        const item = { ...incoming, grin_profiles: null };
        // Update the visible list immediately instead of re-fetching 50 notifications per event.
        setNotifications(current => current.some(n => n.id === item.id) ? current : [item, ...current].slice(0, 50));
        if (toastEnabled && !isMutedConversation) setNotificationToast(item);
        if (!isMutedConversation && document.visibilityState === 'hidden' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification('GRIN', { body: item.body || ('New ' + String(item.kind || 'activity').replaceAll('_',' ') + ' notification') }); } catch {}
        }
        if (toastTimer) window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => setNotificationToast(current => current?.id === item.id ? null : current), 5500);
        // Enrich the notification quietly so opening it can navigate to the actor's profile.
        if (item.actor_id) {
          supabase.from('grin_profiles').select('id,username,display_name,avatar_url').eq('id', item.actor_id).maybeSingle()
            .then(({ data }) => {
              if (!data) return;
              const enriched = { ...item, grin_profiles: data };
              setNotifications(current => current.map(n => n.id === item.id ? enriched : n));
              setNotificationToast(current => current?.id === item.id ? enriched : current);
            }).catch(() => {});
        }
      }).subscribe();
    return () => {
      if (toastTimer) window.clearTimeout(toastTimer);
      supabase.removeChannel(channel);
    };
  }, [session, toastEnabled, mutedChatIds]);

  async function markNotificationsRead() { await supabase.from('grin_notifications').update({read_at:new Date().toISOString()}).eq('user_id',session.user.id).is('read_at',null); setNotifications(x=>x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()}))); }

  async function openNotification(notification) {
    if (!notification) return;
    if (!notification.read_at) {
      const now = new Date().toISOString();
      await supabase.from('grin_notifications').update({read_at:now}).eq('id',notification.id);
      setNotifications(items=>items.map(item=>item.id===notification.id?{...item,read_at:now}:item));
    }
    if (notification.story_id) { const {data:story}=await supabase.from('grin_stories').select('id,author_id,caption,media_url,media_type,created_at,expires_at,grin_profiles(id,username,display_name,avatar_url)').eq('id',notification.story_id).maybeSingle(); if(story&&new Date(story.expires_at)>new Date()){setStories(current=>[story,...current.filter(item=>item.id!==story.id)]);setActive('status');setActiveStatusAuthorId(story.author_id);setActiveStatusIndex(0);}else setActive('status');return; }
    if (notification.post_id) { setSharedPostId(notification.post_id);setActive('discover');return; }
    if (notification.conversation_id) {
      let chat=chats.find(item=>item.id===notification.conversation_id);
      if(!chat){
        const {data,error}=await supabase.rpc('grin_get_my_conversation_list');
        if(!error&&Array.isArray(data)){
          const row=data.find(item=>item.conversation_id===notification.conversation_id);
          if(row){
            const name=row.conversation_title||row.peer_display_name||row.peer_username||'GRIN chat';
            const preview=row.last_message_at?(row.last_message_media_type==='audio'?'🎙 Voice note':row.last_message_media_type==='image'?'📷 Photo':row.last_message_media_type==='video'?'🎥 Video':row.last_message_body||'Message'):'Start a conversation.';
            chat={id:row.conversation_id,name,preview,initials:name.slice(0,2).toUpperCase(),avatar_url:row.peer_avatar_url||null,peer_id:row.peer_id||null,peer_username:row.peer_username||null,kind:row.conversation_kind||'direct',lastMessageAt:row.last_message_at||row.joined_at};
            setChats(current=>[chat,...current.filter(item=>item.id!==chat.id&&item.id!=='welcome')]);
          }
        }
      }
      if(chat){setSelected(chat);setChatOpen(true);}
      else setSearchNotice('Could not find that conversation. Refresh your chats and try again.');
      setActive('chats');
      return;
    }
    if (notification.actor_id && notification.grin_profiles) {
      await openPersonProfile({id:notification.actor_id,...notification.grin_profiles});
      return;
    }
    if (notification.kind === 'message') setActive('chats');
  }

  async function loadPosts() {
    // These two independent reads run together to shorten the first-feed wait.
    const [{ data: follows }, { data, error: postError }] = await Promise.all([
      supabase.from('grin_follows').select('following_id').eq('follower_id',session.user.id),
      supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,repost_of_id,created_at,grin_profiles(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(50)
    ]);
    const nextFollowed=new Set((follows||[]).map(x=>x.following_id)); setFollowedIds(nextFollowed);
    if(postError){ console.error('GRIN feed load failed',postError); setPosts([]); setPostNotice('Could not load the GRIN feed. Please refresh.'); return; }
    setPosts(data || []);
    const [{data:people},{data:creatorRows},{data:businessRows},{data:allFollows}]=await Promise.all([
      supabase.from('grin_profiles').select('id,username,display_name,avatar_url,bio').neq('id',session.user.id).limit(30),
      supabase.from('grin_creator_profiles').select('user_id,category,headline,bio,location').neq('user_id',session.user.id).limit(10),
      supabase.from('grin_businesses').select('id,name,handle,category,description,logo_url,verified,owner_id').neq('owner_id',session.user.id).limit(10),
      nextFollowed.size ? supabase.from('grin_follows').select('follower_id,following_id').in('following_id',Array.from(nextFollowed)) : Promise.resolve({data:[]})
    ]);
    const myFollowing=new Set(nextFollowed);
    const mutuals={};
    (allFollows||[]).forEach(f=>{if(myFollowing.has(f.following_id)&&f.follower_id!==session.user.id){mutuals[f.follower_id]=(mutuals[f.follower_id]||0)+1;}});
    const ranked=(people||[]).filter(p=>!nextFollowed.has(p.id)).map(p=>({...p,mutualCount:mutuals[p.id]||0})).sort((a,b)=>(b.mutualCount-a.mutualCount)||a.display_name?.localeCompare(b.display_name||'')).slice(0,5);
    setSuggestedPeople(ranked);
    const creatorIds=(creatorRows||[]).map(x=>x.user_id);
    let creatorProfiles=[]; if(creatorIds.length){const {data:p}=await supabase.from('grin_profiles').select('id,username,display_name,avatar_url').in('id',creatorIds);creatorProfiles=p||[];}
    const cp=Object.fromEntries(creatorProfiles.map(p=>[p.id,p])); setSuggestedCreators((creatorRows||[]).map(x=>({...x,grin_profiles:cp[x.user_id]})).slice(0,5));
    setSuggestedBusinesses((businessRows||[]).slice(0,5));
    if (data?.length) {
      const ids=data.map(p=>p.id);
      const [{data:rx,error:rxError},{data:mine,error:mineError},{data:cm,error:cmError},{data:pollRows,error:pollError}]=await Promise.all([
        supabase.from('grin_post_reactions').select('post_id').in('post_id',ids),
        supabase.from('grin_post_reactions').select('post_id,reaction').eq('user_id',session.user.id).in('post_id',ids),
        supabase.from('grin_post_comments').select('post_id').in('post_id',ids),
        supabase.from('grin_polls').select('id,post_id,question,expires_at,grin_poll_options(id,option_text,position)').in('post_id',ids)
      ]);
      if(rxError||mineError||cmError||pollError) console.error('GRIN feed extras failed',{rxError,mineError,cmError,pollError});
      const rc={},rm={},cc={},pm={};
      (rx||[]).forEach(x=>rc[x.post_id]=(rc[x.post_id]||0)+1);
      (mine||[]).forEach(x=>rm[x.post_id]=x.reaction);
      (cm||[]).forEach(x=>cc[x.post_id]=(cc[x.post_id]||0)+1);
      (pollRows||[]).forEach(x=>pm[x.post_id]=x);
      setReactionCounts(rc); setReactionMine(rm); setCommentCounts(cc); setPolls(pm);
      const pollIds=(pollRows||[]).map(x=>x.id);
      if(pollIds.length){
        const [{data:votes},{data:allVotes}]=await Promise.all([
          supabase.from('grin_poll_votes').select('poll_id,option_id').eq('user_id',session.user.id).in('poll_id',pollIds),
          supabase.from('grin_poll_votes').select('poll_id,option_id').in('poll_id',pollIds)
        ]);
        const vm={},counts={}; (votes||[]).forEach(v=>vm[v.poll_id]=v.option_id); (allVotes||[]).forEach(v=>{if(!counts[v.poll_id])counts[v.poll_id]={};counts[v.poll_id][v.option_id]=(counts[v.poll_id][v.option_id]||0)+1;}); setPollVotes(vm); setPollVoteCounts(counts);
      } else { setPollVotes({}); setPollVoteCounts({}); }
    } else { setReactionCounts({}); setReactionMine({}); setCommentCounts({}); setPolls({}); setPollVotes({}); setPollVoteCounts({}); }
  }
  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel('grin:feed')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'grin_posts'}, async payload => {
        const { data } = await supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,created_at,grin_profiles(username,display_name,avatar_url)').eq('id',payload.new.id).single();
        if (data) setPosts(current => current.some(p=>p.id===data.id) ? current : [data,...current]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  async function savePostEdit(post) {
    const body=editingPostBody.trim();
    if(!body){setPostNotice('A post cannot be empty.');return;}
    if(postMutationBusy)return;
    setPostMutationBusy(true);setPostNotice('');
    const {error}=await supabase.from('grin_posts').update({body}).eq('id',post.id).eq('author_id',session.user.id);
    if(error){setPostNotice('Could not update this post: '+error.message);}
    else {setPosts(current=>current.map(item=>item.id===post.id?{...item,body}:item));setEditingPostId(null);setEditingPostBody('');setPostNotice('Post updated.');}
    setPostMutationBusy(false);
  }

  async function deleteOwnPost(post) {
    if(postMutationBusy)return;
    if(!window.confirm('Delete this post? This cannot be undone.'))return;
    setPostMutationBusy(true);setPostNotice('');
    const {error}=await supabase.from('grin_posts').delete().eq('id',post.id).eq('author_id',session.user.id);
    if(error){setPostNotice('Could not delete this post: '+error.message);}
    else {setPosts(current=>current.filter(item=>item.id!==post.id));setPostNotice('Post deleted.');}
    setPostMutationBusy(false);
  }

  async function createPost(e) {
    e?.preventDefault();
    const body=postBody.trim();
    if ((!body && !postFile) || postLoading) return;
    setPostLoading(true); setPostNotice('');
    let mediaUrl=null, mediaType=null;
    if (postFile) {
      if (postFile.size > 50 * 1024 * 1024) { setPostNotice('Media must be 50MB or smaller.'); setPostLoading(false); return; }
      mediaType=postFile.type.startsWith('video/')?'video':'image';
      const safe=postFile.name.replace(/[^a-zA-Z0-9._-]/g,'_');
      const path=session.user.id+'/'+crypto.randomUUID()+'-'+safe;
      const { error:uploadError }=await supabase.storage.from('grin-media').upload(path,postFile,{contentType:postFile.type,cacheControl:'3600'});
      if(uploadError){setPostNotice(uploadError.message);setPostLoading(false);return;}
      const { data:pub }=supabase.storage.from('grin-media').getPublicUrl(path);
      mediaUrl=pub.publicUrl;
    }
    const { data, error } = await supabase.rpc('grin_create_post_with_media',{p_body:body,p_media_url:mediaUrl,p_media_type:mediaType});
    if (error) setPostNotice(error.message);
    else {
      const {data:full}=await supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,created_at,grin_profiles(username,display_name,avatar_url)').eq('id',data.id).single();
      if(full) setPosts(current=>current.some(p=>p.id===full.id)?current:[full,...current]);
      if(showPollComposer){
        const q=pollQuestion.trim(), opts=pollOptions.map(x=>x.trim()).filter(Boolean);
        if(!q||opts.length<2){setPostNotice('Post created, but add a poll question and at least two options.');}
        else{
          const {data:poll,error:pollError}=await supabase.from('grin_polls').insert({post_id:data.id,question:q,expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString()}).select().single();
          if(!pollError){
            const {data:createdOptions,error:optError}=await supabase.from('grin_poll_options').insert(opts.map((option_text,i)=>({poll_id:poll.id,option_text,position:i}))).select();
            if(optError) setPostNotice(optError.message);
            else {setPolls(x=>({...x,[data.id]:{...poll,grin_poll_options:createdOptions||[]}}));setPollQuestion('');setPollOptions(['','']);}
          } else setPostNotice(pollError.message);
        }
      }
      setPostBody(''); setPostFile(null); setShowPollComposer(false);
      const input=document.getElementById('grin-media-input'); if(input) input.value='';
    }
    setPostLoading(false);
  }

  async function votePoll(poll,optionId){
    if(!poll||pollVotes[poll.id]===optionId||new Date(poll.expires_at)<=new Date()) return;
    const existing=pollVotes[poll.id];
    if(existing) await supabase.from('grin_poll_votes').delete().eq('poll_id',poll.id).eq('user_id',session.user.id);
    const {error}=await supabase.from('grin_poll_votes').insert({poll_id:poll.id,option_id:optionId,user_id:session.user.id});
    if(error){setPostNotice(error.message);return;}
    setPollVotes(x=>({...x,[poll.id]:optionId}));
    setPollVoteCounts(x=>{const next={...x,[poll.id]:{...(x[poll.id]||{})}}; if(existing) next[poll.id][existing]=Math.max(0,(next[poll.id][existing]||1)-1); next[poll.id][optionId]=(next[poll.id][optionId]||0)+1; return next;});
  }

  async function reactToPost(postId,reaction='like') {
    setPostNotice('');
    const { data: existing, error: lookupError } = await supabase.from('grin_post_reactions').select('reaction').eq('post_id',postId).eq('user_id',session.user.id).maybeSingle();
    if (lookupError) { setPostNotice('Could not load your reaction. Please try again.'); return; }
    if (existing?.reaction===reaction) {
      const {error}=await supabase.from('grin_post_reactions').delete().eq('post_id',postId).eq('user_id',session.user.id);
      if(error){setPostNotice('Could not remove your reaction: '+error.message);return;}
      setReactionCounts(x=>({...x,[postId]:Math.max(0,(x[postId]||1)-1)}));
      setReactionMine(x=>({...x,[postId]:null}));
    } else {
      if(existing) {
        const {error:deleteError}=await supabase.from('grin_post_reactions').delete().eq('post_id',postId).eq('user_id',session.user.id);
        if(deleteError){setPostNotice('Could not update your reaction: '+deleteError.message);return;}
      }
      const {error:insertError}=await supabase.from('grin_post_reactions').insert({post_id:postId,user_id:session.user.id,reaction});
      if(insertError){setPostNotice('Could not save your reaction: '+insertError.message);return;}
      setReactionCounts(x=>({...x,[postId]:(x[postId]||0)+(existing?0:1)}));
      setReactionMine(x=>({...x,[postId]:reaction}));
    }
    setReactionMenu(null);
  }


  async function repostPost(p){const {error}=await supabase.from('grin_posts').insert({author_id:session.user.id,body:'Reposted: '+(p.body||'GRIN post'),repost_of_id:p.id});if(!error){setPostNotice('Reposted to your GRIN profile.');loadPosts();}}

  async function loadComments(postId) {
    setCommentNotice('');
    const {data,error}=await supabase.from('grin_post_comments').select('id,post_id,user_id,body,created_at').eq('post_id',postId).order('created_at');
    if(error){console.error('GRIN comments could not load',error);setCommentNotice('Comments could not load: '+error.message);return;}
    const ids=[...new Set((data||[]).map(row=>row.user_id).filter(Boolean))];
    let profiles=[];
    if(ids.length){const {data:profileRows,error:profileError}=await supabase.from('grin_profiles').select('id,username,display_name,avatar_url').in('id',ids);if(profileError)console.error('GRIN comment authors could not load',profileError);profiles=profileRows||[];}
    const byId=Object.fromEntries(profiles.map(person=>[person.id,person]));
    setComments(x=>({...x,[postId]:(data||[]).map(row=>({...row,grin_profiles:byId[row.user_id]||null}))}));
  }

  async function addComment(postId) {
    const body=commentDraft.trim();
    if(!body) return;
    if(!session?.user?.id){setCommentNotice('Please sign in to comment.');return;}
    setCommentNotice('');
    const {data,error}=await supabase.from('grin_post_comments').insert({post_id:postId,user_id:session.user.id,body}).select('id,post_id,user_id,body,created_at').single();
    if(error){console.error('GRIN comment insert failed',error);setCommentNotice('Comment could not be sent: '+error.message);return;}
    const {data:author}=await supabase.from('grin_profiles').select('id,username,display_name,avatar_url').eq('id',session.user.id).maybeSingle();
    const comment={...data,grin_profiles:author||profile||null};
    setComments(x=>({...x,[postId]:[...(x[postId]||[]),comment]}));
    setCommentCounts(x=>({...x,[postId]:(x[postId]||0)+1}));
    setCommentDraft('');setCommentNotice('');
  }

  async function toggleComments(postId) {
    if(openComments===postId){setOpenComments(null);return;}
    setOpenComments(postId); await loadComments(postId);
  }

  async function loadProfile() {
    const { data } = await supabase.from('grin_profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      const { data: privateSettings } = await supabase.from('grin_private_contact_settings').select('phone_e164').eq('user_id', session.user.id).maybeSingle();
      setProfileForm({ username:data.username || '', display_name:data.display_name || '', bio:data.bio || '', avatar_url:data.avatar_url || '', phone_e164:privateSettings?.phone_e164 || '' });
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true); setProfileNotice('');
    let avatarUrl = profileForm.avatar_url.trim() || null;
    if (avatarFile) {
      if (!avatarFile.type.startsWith('image/')) {
        setProfileNotice('Choose an image file for your profile photo.');
        setProfileSaving(false);
        return;
      }
      if (avatarFile.size > 5 * 1024 * 1024) {
        setProfileNotice('Profile photos must be 5 MB or smaller.');
        setProfileSaving(false);
        return;
      }
      const safe = avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = session.user.id + '/profile/' + crypto.randomUUID() + '-' + safe;
      const { error: uploadError } = await supabase.storage.from('grin-media').upload(path, avatarFile, { contentType: avatarFile.type, upsert: false });
      if (uploadError) {
        setProfileNotice('Photo upload failed: ' + uploadError.message);
        setProfileSaving(false);
        return;
      }
      avatarUrl = supabase.storage.from('grin-media').getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      username: profileForm.username.trim().toLowerCase(),
      display_name: profileForm.display_name.trim() || 'GRIN User',
      bio: profileForm.bio.trim(),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };
    const phone = profileForm.phone_e164.trim();
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      setProfileNotice('Use international format for your phone number, e.g. +2348012345678.');
      setProfileSaving(false);
      return;
    }
    const { data, error } = await supabase.from('grin_profiles').update(payload).eq('id', session.user.id).select().single();
    if (error) setProfileNotice(error.message);
    else {
      const { error: privateSettingsError } = await supabase.from('grin_private_contact_settings').upsert({ user_id: session.user.id, phone_e164: phone || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      setProfile(data);
      setProfileForm(x => ({ ...x, avatar_url: data.avatar_url || '' }));
      setAvatarFile(null);
      setAvatarPreview('');
      const picker = document.getElementById('grin-avatar-input');
      if (picker) picker.value = '';
      setProfileNotice(privateSettingsError ? 'Profile saved, but the private phone setting could not be saved. Contact discovery setup is not complete yet.' : 'Profile saved. Your phone number is stored separately from your public profile. Contact matching will stay inactive until phone verification is implemented.');
    }
    setProfileSaving(false);
  }

  useEffect(() => { setMessageSearch(''); }, [selected.id]);

  useEffect(() => {
    if (!session || selected.id === 'welcome') return;
    loadMessages(selected.id); markChatRead(selected.id); loadPeerReadReceipt(selected.id);
    const channel = supabase.channel('grin:conversation:' + selected.id, { config: { private: false } })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grin_messages', filter: 'conversation_id=eq.' + selected.id }, payload => {
        setMessages(current => current.some(m => m.id === payload.new.id) ? current : [...current, payload.new]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'grin_messages', filter: 'conversation_id=eq.' + selected.id }, payload => {
        setMessages(current => current.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
      }).subscribe();
    const receiptTimer = selected.kind === 'direct' && selected.peer_id
      ? window.setInterval(() => loadPeerReadReceipt(selected.id), 5000)
      : null;
    return () => {
      if (receiptTimer !== null) window.clearInterval(receiptTimer);
      supabase.removeChannel(channel);
    };
  }, [session, selected.id]);

  async function searchPeople(value) {
    setPersonSearch(value);
    if (!value.trim()) { setPeople([]); return; }
    setPeopleLoading(true);
    const clean = value.replace(/[\\%_]/g, '');
    const { data } = await supabase.from('grin_profiles')
      .select('id, username, display_name, avatar_url')
      .neq('id', session.user.id)
      .or('username.ilike.%' + clean + '%,display_name.ilike.%' + clean + '%')
      .limit(12);
    setPeople(data || []);
    setPeopleLoading(false);
  }

  async function startChat(person) {
    if(groupMode){
      setGroupSelected(current=>current.some(x=>x.id===person.id)?current.filter(x=>x.id!==person.id):[...current,person]);
      return;
    }
    const { data, error } = await supabase.rpc('grin_create_direct_conversation', { other_user: person.id });
    if (error || !data) { setSearchNotice('Could not open this conversation. Please try again.'); return; }
    const chat = { id: data, name: person.display_name || person.username || 'GRIN User', preview: 'Start a conversation.', initials: (person.display_name || person.username || 'GR').slice(0, 2).toUpperCase(), avatar_url:person.avatar_url||null, peer_id:person.id, peer_username:person.username, kind:'direct' };
    setChats(current => current.some(x => x.id === chat.id) ? current : [chat, ...current.filter(x => x.id !== 'welcome')]);
    setSelected(chat);
    setChatOpen(true);
    setSearchNotice('');
    setActive('chats');
    setPeople([]);
    setPersonSearch('');
  }

  async function createGroup(){
    const title=groupName.trim();
    if(!title||groupSelected.length<1){setAuthError('Give the group a name and select at least one person.');return;}
    const {data,error}=await supabase.rpc('grin_create_group_conversation',{p_title:title,p_member_ids:groupSelected.map(x=>x.id)});
    if(error){setAuthError(error.message);return;}
    const chat={id:data,name:title,preview:groupSelected.length+' members',initials:title.slice(0,2).toUpperCase()};
    setChats(current=>[chat,...current.filter(x=>x.id!=='welcome'&&x.id!==data)]);
    setSelected(chat);setChatOpen(true);setActive('chats');setGroupMode(false);setGroupName('');setGroupSelected([]);setPeople([]);setPersonSearch('');setAuthError('');
  }

  async function loadUnreadCounts(rows){const ids=(rows||[]).filter(x=>x.id!=='welcome').map(x=>x.id);if(!ids.length){setUnreadCounts({});return;}const {data:members,error}=await supabase.from('grin_conversation_members').select('conversation_id,last_read_at').eq('user_id',session.user.id).in('conversation_id',ids);if(error){console.error('GRIN unread counts failed',error);return;}const results=await Promise.all((members||[]).map(async m=>{let q=supabase.from('grin_messages').select('id',{count:'exact',head:true}).eq('conversation_id',m.conversation_id).neq('sender_id',session.user.id);if(m.last_read_at)q=q.gt('created_at',m.last_read_at);const {count,error}=await q;if(error)console.error('GRIN unread count failed',m.conversation_id,error);return [m.conversation_id,count||0];}));setUnreadCounts(Object.fromEntries(results));}

  async function loadChats() {
    // Show this account's last known chat list immediately while Supabase refreshes it.
    const cacheKey='grin-chat-list-'+session.user.id;
    try {
      const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');
      if(Array.isArray(cached)&&cached.length) setChats(cached);
    } catch {}
    const {data,error}=await supabase.rpc('grin_get_my_conversation_list');
    if(error){console.error('GRIN chat list failed to load',error);return;}
    const rows=(data||[]).map(x=>{
      const name=x.conversation_title||x.peer_display_name||x.peer_username||'GRIN chat';
      const preview=x.last_message_at?(x.last_message_media_type==='audio'?'🎙 Voice note':x.last_message_media_type==='image'?'📷 Photo':x.last_message_media_type==='video'?'🎥 Video':x.last_message_body||'Message'):'Start a conversation.';
      return {id:x.conversation_id,name,preview,initials:name.slice(0,2).toUpperCase(),avatar_url:x.peer_avatar_url||null,peer_id:x.peer_id||null,peer_username:x.peer_username||null,kind:x.conversation_kind||'direct',lastMessageAt:x.last_message_at||x.joined_at};
    });
    if(!rows.length){setChats(fallbackChats);setUnreadCounts({});try{localStorage.removeItem(cacheKey);}catch{}return;}
    setChats(rows);
    try { localStorage.setItem(cacheKey,JSON.stringify(rows)); } catch {}
    loadUnreadCounts(rows);
  }

  useEffect(() => { if (!session) return; const channel=supabase.channel('grin:presence',{config:{presence:{key:session.user.id}}}); channel.on('presence',{event:'sync'},()=>{const state=channel.presenceState();const map={};Object.entries(state).forEach(([id,rows])=>{if(id!==session.user.id)map[id]=rows[0]?.display_name||rows[0]?.username||'GRIN user';});setOnlineUsers(map);}).on('broadcast',{event:'typing'},({payload})=>{if(payload.user_id===session.user.id)return;setTypingUsers(x=>({...x,[payload.user_id]:payload.typing}));setTimeout(()=>setTypingUsers(x=>({...x,[payload.user_id]:false})),1800);}).subscribe(async status=>{if(status==='SUBSCRIBED')await channel.track({user_id:session.user.id,display_name:profile?.display_name||profile?.username||'GRIN user'});}); return ()=>{channel.untrack();supabase.removeChannel(channel);}; },[session,profile]);
  function broadcastTyping(value){if(!session)return;supabase.channel('grin:presence').send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:value}});}

  useEffect(() => { if (!session?.user?.id) { setPinnedChatIds([]); return; } try { const stored = JSON.parse(localStorage.getItem('grin-pinned-chats-' + session.user.id) || '[]'); setPinnedChatIds(Array.isArray(stored) ? stored : []); } catch { setPinnedChatIds([]); } }, [session?.user?.id]);

  function togglePinnedChat(chatId) { if (!session?.user?.id) return; setPinnedChatIds(current => { const next = current.includes(chatId) ? current.filter(id => id !== chatId) : [...current, chatId]; try { localStorage.setItem('grin-pinned-chats-' + session.user.id, JSON.stringify(next)); } catch {} return next; }); }
  useEffect(() => { if (!session?.user?.id) { setArchivedChatIds([]); setMutedChatIds([]); return; } try { setArchivedChatIds(JSON.parse(localStorage.getItem('grin-archived-chats-' + session.user.id) || '[]')); setMutedChatIds(JSON.parse(localStorage.getItem('grin-muted-chats-' + session.user.id) || '[]')); } catch { setArchivedChatIds([]); setMutedChatIds([]); } }, [session?.user?.id]);
  function toggleChatPreference(chatId, kind) { if (!session?.user?.id) return; const setter = kind === 'archive' ? setArchivedChatIds : setMutedChatIds; const key = kind === 'archive' ? 'grin-archived-chats-' : 'grin-muted-chats-'; setter(current => { const next = current.includes(chatId) ? current.filter(id => id !== chatId) : [...current, chatId]; try { localStorage.setItem(key + session.user.id, JSON.stringify(next)); } catch {} return next; }); }

  async function enrichMessages(rows) {
    const senderIds=[...new Set(rows.map(m=>m.sender_id).filter(Boolean))];
    const creatorIds=[...new Set(rows.map(m=>m.shared_creator_id).filter(Boolean))];
    const businessIds=[...new Set(rows.map(m=>m.shared_business_id).filter(Boolean))];
    const listingIds=[...new Set(rows.map(m=>m.shared_listing_id).filter(Boolean))];
    const [{data:senderRows},{data:creatorRows},{data:businessRows},{data:listingRows}]=await Promise.all([
      senderIds.length?supabase.from('grin_profiles').select('id,username,display_name,avatar_url').in('id',senderIds):Promise.resolve({data:[]} ),
      creatorIds.length?supabase.from('grin_creator_profiles').select('user_id,category,headline,bio,location,rate,currency,grin_profiles(username,display_name,avatar_url)').in('user_id',creatorIds):Promise.resolve({data:[]} ),
      businessIds.length?supabase.from('grin_businesses').select('id,name,handle,category,description,location,logo_url,cover_url,verified,owner_id').in('id',businessIds):Promise.resolve({data:[]} ),
      listingIds.length?supabase.from('grin_marketplace_listings').select('id,title,description,category,price,currency,external_url,seller_id').in('id',listingIds):Promise.resolve({data:[]} )
    ]);
    const senders=Object.fromEntries((senderRows||[]).map(x=>[x.id,x]));
    const creators=Object.fromEntries((creatorRows||[]).map(x=>[x.user_id,x]));
    const businessMap=Object.fromEntries((businessRows||[]).map(x=>[x.id,x]));
    const listingMap=Object.fromEntries((listingRows||[]).map(x=>[x.id,x]));
    return rows.map(m=>({...m,sender_profile:senders[m.sender_id]||null,shared_creator:creators[m.shared_creator_id]||null,shared_business:businessMap[m.shared_business_id]||null,shared_listing:listingMap[m.shared_listing_id]||null}));
  }

  async function loadMessages(conversationId) {
    setHasMoreMessages(false);
    const { data, error } = await supabase.from('grin_messages').select('*').eq('conversation_id', conversationId).order('created_at',{ascending:false}).limit(50);
    if(error){console.error('GRIN messages failed to load',error);return;}
    const fetched=data||[];
    const rows=await enrichMessages([...fetched].reverse());
    setMessages(rows);
    setHasMoreMessages(fetched.length===50);
    const ids=fetched.map(m=>m.id);
    if(ids.length){const {data:r}=await supabase.from('grin_message_reactions').select('*').in('message_id',ids); const map={}; (r||[]).forEach(x=>{map[x.message_id]=[...(map[x.message_id]||[]),x]}); setMessageReactions(map);}
    else setMessageReactions({});
  }

  async function loadOlderMessages(){
    if(loadingOlderMessages||!hasMoreMessages||!messages.length)return;
    setLoadingOlderMessages(true);
    const oldest=messages[0].created_at;
    const conversationId=selected.id;
    const {data,error}=await supabase.from('grin_messages').select('*').eq('conversation_id',conversationId).lt('created_at',oldest).order('created_at',{ascending:false}).limit(50);
    if(error){console.error('GRIN older messages failed to load',error);setLoadingOlderMessages(false);return;}
    const fetched=data||[];
    const rows=await enrichMessages([...fetched].reverse());
    if(selected.id===conversationId){
      skipOlderMessageScrollRef.current = true;
      setMessages(current=>[...rows,...current.filter(m=>!rows.some(old=>old.id===m.id))]);
      setHasMoreMessages(fetched.length===50);
      const ids=fetched.map(m=>m.id);
      if(ids.length){const {data:r}=await supabase.from('grin_message_reactions').select('*').in('message_id',ids); const map={}; (r||[]).forEach(x=>{map[x.message_id]=[...(map[x.message_id]||[]),x]}); setMessageReactions(current=>({...current,...map}));}
    }
    setLoadingOlderMessages(false);
  }
  async function markChatRead(conversationId){ await supabase.from('grin_conversation_members').update({last_read_at:new Date().toISOString()}).eq('conversation_id',conversationId).eq('user_id',session.user.id); setUnreadCounts(x=>({...x,[conversationId]:0})); }
  async function loadPeerReadReceipt(conversationId){
    if(!selected.peer_id||selected.kind!=='direct'){setPeerReadAt(null);return;}
    const {data,error}=await supabase.rpc('grin_get_peer_read_at',{p_conversation_id:conversationId,p_peer_id:selected.peer_id});
    if(error){console.warn('GRIN read receipt unavailable',error);setPeerReadAt(null);return;}
    setPeerReadAt(data||null);
  }
  async function inviteFriends(){
    setInviteNotice('');
    const inviteUrl = window.location.origin + window.location.pathname;
    const shareData = {
      title: 'Join me on GRIN',
      text: 'Let’s connect on GRIN — find people, chat and share updates.',
      url: inviteUrl
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setInviteNotice('Invite ready to share.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        setInviteNotice('GRIN link copied. Send it to friends so they can join and find you by username.');
      } else {
        window.prompt('Copy this GRIN invite link:', inviteUrl);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setInviteNotice('Could not open sharing. Please try copying the GRIN link from your browser.');
    }
  }

  async function shareProfileExternally(person){
    const username = person?.username || profile?.username;
    if (!username) { setExternalProfileShareNotice('Add a username to your profile before sharing it.'); return; }
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('profile', username);
    const shareData = { title: (person?.display_name || profile?.display_name || 'GRIN profile'), text: 'Connect with me on GRIN', url: url.toString() };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        setExternalProfileShareNotice('Profile link copied. Recipients can open it in GRIN after signing in.');
      } else window.prompt('Copy this GRIN profile link:', url.toString());
    } catch (error) {
      if (error?.name !== 'AbortError') setExternalProfileShareNotice('Could not share automatically. Please try again.');
    }
  }

  useEffect(() => {
    if (!session || !sharedProfileUsername) return;
    let cancelled = false;
    async function openSharedProfile() {
      const { data } = await supabase.from('grin_profiles')
        .select('id,username,display_name,avatar_url,bio')
        .eq('username', sharedProfileUsername).maybeSingle();
      if (!data || cancelled) return;
      await openPersonProfile(data);
    }
    openSharedProfile();
    return () => { cancelled = true; };
  }, [session, sharedProfileUsername]);

  async function sharePostExternally(post){
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('post', post.id);
    const shareData = { title: 'GRIN post', text: (post.body || 'Check out this post on GRIN').slice(0,180), url: url.toString() };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        setExternalShareNotice('Post link copied. Anyone opening it in GRIN can jump straight to this post after signing in.');
      } else {
        window.prompt('Copy this GRIN post link:', url.toString());
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setExternalShareNotice('Could not share automatically. Open Share again and copy the link.');
    }
  }

  useEffect(() => {
    if (!session || !sharedPostId) return;
    let cancelled = false;
    async function openSharedPost() {
      let post = posts.find(item => item.id === sharedPostId);
      if (!post) {
        const { data } = await supabase.from('grin_posts')
          .select('id,author_id,body,media_url,media_type,repost_of_id,created_at,grin_profiles(username,display_name,avatar_url)')
          .eq('id', sharedPostId).maybeSingle();
        if (data && !cancelled) {
          post = data;
          setPosts(current => current.some(item => item.id === data.id) ? current : [data, ...current]);
        }
      }
      if (cancelled || !post) return;
      setActive('discover');
      window.setTimeout(() => document.getElementById('grin-post-' + sharedPostId)?.scrollIntoView({behavior:'smooth',block:'center'}), 350);
    }
    openSharedPost();
    return () => { cancelled = true; };
  }, [session, sharedPostId, posts.length]);

  async function sharePostToChat(chat){
    if(!sharePostTarget||!chat?.id||chat.id==='welcome'||sharePostSending) return;
    if(!session?.user?.id){
      setSharePostNotice('Please sign in again before sending a post.');
      return;
    }
    setSharePostSending(true);
    setSharePostNotice('');
    try {
      const p=sharePostTarget;
      const isCommunityPost=Boolean(p.community_id);
      const payload=isCommunityPost
        ? {conversation_id:chat.id,sender_id:session.user.id,body:p.body?.trim()||'Shared a GRIN community post',shared_community_post_id:p.id}
        : {conversation_id:chat.id,sender_id:session.user.id,body:p.body?.trim()||'Shared a GRIN post',shared_post_id:p.id};
      const {data,error}=await supabase.from('grin_messages').insert(payload).select('*').single();
      if(error){
        console.error('GRIN post share failed', {code:error.code,message:error.message,details:error.details,hint:error.hint,payload});
        setSharePostNotice('Could not send this post. '+(error.message||'Please try again.'));
        return;
      }
      setSharePostTarget(null);
      setSharePostNotice('');
      setSelected(chat);
      setChatOpen(true);
      setActive('chats');
      if(data){
        setMessages(current=>chat.id===selected.id
          ? (current.some(m=>m.id===data.id)?current:[...current,data])
          : current);
      }
      await loadMessages(chat.id);
    } catch(error) {
      console.error('Unexpected GRIN post share failure',error);
      setSharePostNotice('Something went wrong while sending. Please try again.');
    } finally {
      setSharePostSending(false);
    }
  }

    async function shareProfileToChat(chat){
    if(!shareProfileTarget||!chat?.id||chat.id==='welcome') return;
    const p=shareProfileTarget;
    const payload=p.type==='creator'
      ? {conversation_id:chat.id,sender_id:session.user.id,body:'Shared a GRIN creator profile',shared_creator_id:p.creator_id}
      : {conversation_id:chat.id,sender_id:session.user.id,body:'Shared a GRIN business profile',shared_business_id:p.id};
    const {data,error}=await supabase.from('grin_messages').insert(payload).select().single();
    if(error){setAuthError(error.message);return;}
    setShareProfileTarget(null); setSelected(chat); setActive('chats');
    if(selected.id===chat.id)setMessages(current=>current.some(m=>m.id===data.id)?current:[...current,data]);
  }

  async function shareListingToChat(chat){
    if(!shareListingTarget||!chat?.id||chat.id==='welcome') return;
    const listing=shareListingTarget;
    const {data,error}=await supabase.from('grin_messages').insert({conversation_id:chat.id,sender_id:session.user.id,body:'Shared a GRIN marketplace listing',shared_listing_id:listing.id}).select().single();
    if(error){setAuthError(error.message);return;}
    setShareListingTarget(null);setSelected(chat);setChatOpen(true);setActive('chats');
    if(selected.id===chat.id)setMessages(current=>current.some(m=>m.id===data.id)?current:[...current,data]);
  }

  async function toggleVoiceRecording() {
    if (isRecordingVoice) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAuthError('Voice recording is not supported by this browser. Try a recent version of Chrome.');
      return;
    }
    try {
      setAuthError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = event => { if (event.data?.size) audioChunksRef.current.push(event.data); };
      recorder.onerror = () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecordingVoice(false);
        setAuthError('Voice recording failed. Please try again.');
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        audioChunksRef.current = [];
        if (blob.size) {
          const extension = type.includes('mp4') ? 'm4a' : (type.includes('ogg') ? 'ogg' : 'webm');
          setMessageFile(new File([blob], 'voice-note-' + Date.now() + '.' + extension, { type }));
        }
        setIsRecordingVoice(false);
        mediaRecorderRef.current = null;
      };
      recorder.start();
      setIsRecordingVoice(true);
    } catch (error) {
      setAuthError(error?.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow microphone access and try again.' : 'Could not start voice recording. Check your microphone and try again.');
      setIsRecordingVoice(false);
    }
  }

  async function send() {
    const body = message.trim();
    if (sendingMessage || (!body && !messageFile) || !session || selected.id === 'welcome') return;
    const conversationId = selected.id;
    const attachment = messageFile;
    const replyId = replyingTo?.id || null;
    setSendingMessage(true);
    setAuthError('');
    try {
      let media_url=null, media_type=null;
      if(attachment){
        if(attachment.size>50*1024*1024){setAuthError('Media must be 50 MB or less. Your message is still here.');return;}
        const safe=attachment.name.replace(/[^a-zA-Z0-9._-]/g,'-');
        const path=session.user.id+'/messages/'+crypto.randomUUID()+'-'+safe;
        const {error:uploadError}=await supabase.storage.from('grin-media').upload(path,attachment,{contentType:attachment.type,upsert:false});
        if(uploadError){console.error('GRIN message attachment upload failed',uploadError);setAuthError('Attachment could not be uploaded. Your message is still here. Please try again.');return;}
        media_url=supabase.storage.from('grin-media').getPublicUrl(path).data.publicUrl;
        media_type=attachment.type.startsWith('audio/')?'audio':(attachment.type.startsWith('video/')?'video':'image');
      }
      const { data, error } = await supabase.from('grin_messages').insert({ conversation_id:conversationId,sender_id:session.user.id,body:body||(media_type==='audio'?'Voice note':media_type==='video'?'Video':'Photo'),media_url,media_type,reply_to_id:replyId}).select().single();
      if(error||!data){
        console.error('GRIN message send failed',error);
        setAuthError('Message could not be sent. Your draft is still here. Check your connection and try again.');
        return;
      }
      setMessages(current => current.some(m => m.id === data.id) ? current : [...current, data]);
      setMessage(current=>current===message?'':current);
      setMessageFile(current=>current===attachment?null:current);
      setReplyingTo(current=>current?.id===replyId?null:current);
      setAuthError('');
      await markChatRead(conversationId);
    } catch(error) {
      console.error('GRIN message send failed unexpectedly',error);
      setAuthError('Message could not be sent. Your draft is still here. Check your connection and try again.');
    } finally {
      setSendingMessage(false);
    }
  }
  async function editMessage(m){
    const body=prompt('Edit message',m.body);
    if(body===null||!body.trim()) return;
    const {data,error}=await supabase.from('grin_messages').update({body:body.trim(),edited_at:new Date().toISOString()}).eq('id',m.id).eq('sender_id',session.user.id).select().single();
    if(!error&&data)setMessages(x=>x.map(v=>v.id===m.id?data:v));
  }
  async function deleteMessage(m){
    const {data,error}=await supabase.from('grin_messages').update({deleted_at:new Date().toISOString(),body:'This message was deleted.'}).eq('id',m.id).eq('sender_id',session.user.id).select().single();
    if(!error&&data)setMessages(x=>x.map(v=>v.id===m.id?data:v));
  }
  async function toggleMessageReaction(m,reaction){const mine=(messageReactions[m.id]||[]).find(x=>x.user_id===session.user.id&&x.reaction===reaction); if(mine) await supabase.from('grin_message_reactions').delete().match({message_id:m.id,user_id:session.user.id,reaction}); else await supabase.from('grin_message_reactions').insert({message_id:m.id,user_id:session.user.id,reaction}); const {data}=await supabase.from('grin_message_reactions').select('*').eq('message_id',m.id); setMessageReactions(x=>({...x,[m.id]:data||[]}));}


  async function authenticate(e) {
    e.preventDefault(); setAuthError('');
    const result = authMode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { username: username.trim() || email.split('@')[0] } } });
    if (result.error) setAuthError(result.error.message);
    else if (authMode === 'signup' && !result.data.session) setAuthError('Check your email to confirm your GRIN account.');
  }

  const storyGroups = Object.values(stories.reduce((groups, story) => {
    const authorId = story.author_id || story.grin_profiles?.id || story.id;
    if (!groups[authorId]) groups[authorId] = { authorId, profile: story.grin_profiles || {}, items: [] };
    groups[authorId].items.push(story);
    return groups;
  }, {}));
  const activeStatusGroup = storyGroups.find(group => group.authorId === activeStatusAuthorId) || null;
  const activeStatus = activeStatusGroup?.items[activeStatusIndex] || null;
  useEffect(()=>{if(!activeStatus?.id)return;setStatusReplyDraft('');setStatusReplyNotice('');trackStatusView(activeStatus);loadStatusViewers(activeStatus);loadStatusReplies(activeStatus.id);},[activeStatus?.id,session?.user?.id]);
  function openStatusGroup(authorId) { setActiveStatusAuthorId(authorId); setActiveStatusIndex(0); }
  function closeStatusViewer() { setActiveStatusAuthorId(null); setActiveStatusIndex(0); }
  function moveStatus(direction) {
    if (!activeStatusGroup) return;
    const groupIndex = storyGroups.findIndex(group => group.authorId === activeStatusGroup.authorId);
    if (direction > 0 && activeStatusIndex < activeStatusGroup.items.length - 1) { setActiveStatusIndex(index => index + 1); return; }
    if (direction < 0 && activeStatusIndex > 0) { setActiveStatusIndex(index => index - 1); return; }
    const nextGroup = storyGroups[groupIndex + direction];
    if (!nextGroup) { closeStatusViewer(); return; }
    setActiveStatusAuthorId(nextGroup.authorId);
    setActiveStatusIndex(direction > 0 ? 0 : nextGroup.items.length - 1);
  }

  if (loading) return <div className="auth-screen"><div className="auth-card"><div className="brand large"><span className="brand-mark">☺</span><span>GRIN</span></div><p>Loading...</p></div></div>;

  if (!session) return <div className="auth-screen"><form className="auth-card" onSubmit={authenticate}><div className="brand large"><span className="brand-mark">☺</span><span>GRIN</span></div><h1>{authMode === 'signin' ? 'Welcome back' : 'Create your GRIN account'}</h1><p>People, ideas and moments — all in one place.</p>{authMode === 'signup' && <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required minLength={3}/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required minLength={6}/>{authError && <div className="auth-error">{authError}</div>}<button className="primary" type="submit">{authMode === 'signin' ? 'Sign in' : 'Create account'}</button><button className="switch" type="button" onClick={()=>{setAuthMode(authMode==='signin'?'signup':'signin');setAuthError('')}}>{authMode === 'signin' ? 'Create a new account' : 'I already have an account'}</button></form></div>;

  return <div className="app" data-grin-theme={theme}>{notificationToast&&<button type="button" className="grin-toast" onClick={()=>{const item=notificationToast;setNotificationToast(null);openNotification(item);}} aria-live="polite"><span className="grin-toast-icon"><Bell size={18}/></span><span><strong>GRIN notification</strong><small>{notificationToast.body || ('New ' + String(notificationToast.kind || 'activity').replaceAll('_',' ') + ' notification')}</small></span><X size={16} onClick={event=>{event.stopPropagation();setNotificationToast(null);}}/></button>}{activeStatus&&activeStatusGroup&&<div className="grin-status-viewer" role="dialog" aria-modal="true" aria-label="Status viewer" onClick={closeStatusViewer}><div className="grin-status-viewer-card" onClick={event=>event.stopPropagation()}><div className="grin-status-progress">{activeStatusGroup.items.map((item,index)=><span key={item.id} className={index<=activeStatusIndex?'complete':''}><i/></span>)}</div><header className="grin-status-viewer-head"><button type="button" className="grin-status-viewer-avatar" aria-label="Open status author's profile" onClick={()=>activeStatus.author_id!==session.user.id&&openPersonProfile({id:activeStatus.author_id,...activeStatusGroup.profile})} style={{border:0,cursor:activeStatus.author_id===session.user.id?'default':'pointer'}}>{activeStatusGroup.profile?.avatar_url?<img src={activeStatusGroup.profile.avatar_url} alt=""/>:(activeStatusGroup.profile?.display_name||activeStatusGroup.profile?.username||'G').slice(0,1).toUpperCase()}</button><div className="grin-status-viewer-person"><strong>{activeStatus.author_id===session.user.id?(activeStatusGroup.profile?.display_name||activeStatusGroup.profile?.username||'My status'):<button type="button" onClick={()=>openPersonProfile({id:activeStatus.author_id,...activeStatusGroup.profile})} style={{border:0,padding:0,background:'transparent',color:'inherit',font:'inherit',fontWeight:650,cursor:'pointer'}}>{activeStatusGroup.profile?.display_name||activeStatusGroup.profile?.username||'GRIN user'}</button>}</strong><small>{new Date(activeStatus.created_at).toLocaleString()}</small></div><button type="button" aria-label="Close status" onClick={closeStatusViewer}><X size={22}/></button></header><div className="grin-status-viewer-media">{activeStatus.media_url?(activeStatus.media_type==='video'?<video src={activeStatus.media_url} autoPlay playsInline controls/>:<img src={activeStatus.media_url} alt="Status update"/>):<div className="grin-status-text-card">{activeStatus.caption||'A moment shared on GRIN'}</div>}{activeStatus.media_url&&activeStatus.caption&&<div className="grin-status-caption">{activeStatus.caption}</div>}<button type="button" className="grin-status-tap grin-status-tap-left" aria-label="Previous status" onClick={()=>moveStatus(-1)}><ChevronLeft size={28}/></button><button type="button" className="grin-status-tap grin-status-tap-right" aria-label="Next status" onClick={()=>moveStatus(1)}><ChevronRight size={28}/></button></div><footer className="grin-status-viewer-foot"><span><Eye size={15}/> {activeStatus.author_id===session.user.id?statusViewCount+' viewer'+(statusViewCount===1?'':'s'):'Status · 48 hours'}</span>{activeStatus.media_url&&<a href={activeStatus.media_url} download target="_blank" rel="noreferrer">Download</a>}</footer>{activeStatus.author_id===session.user.id?<div className="grin-status-viewer-details"><strong>Seen by</strong>{statusViewers.length?statusViewers.map(row=><div className="grin-status-viewer-row" key={row.id}><button type="button" className="chat-avatar" aria-label="Open status viewer's profile" onClick={()=>openPersonProfile(row.viewer||{id:row.viewer_id})} style={{border:0,cursor:'pointer'}}>{row.viewer?.avatar_url?<img src={row.viewer.avatar_url} alt=""/>:(row.viewer?.display_name||row.viewer?.username||'G').slice(0,1).toUpperCase()}</button><button type="button" onClick={()=>openPersonProfile(row.viewer||{id:row.viewer_id})} style={{border:0,padding:0,background:'transparent',color:'inherit',font:'inherit',cursor:'pointer',textAlign:'left'}}>{row.viewer?.display_name||row.viewer?.username||'GRIN user'}</button><small>{new Date(row.viewed_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>):<small>No views yet.</small>}</div>:<div className="grin-status-reply"><div className="grin-status-replies">{statusReplies.map(reply=><div key={reply.id}><strong><button type="button" onClick={()=>openPersonProfile({id:reply.author_id,...reply.grin_profiles})} style={{border:0,padding:0,background:'transparent',color:'inherit',font:'inherit',fontWeight:650,cursor:'pointer',textAlign:'left'}}>{reply.grin_profiles?.display_name||reply.grin_profiles?.username||'GRIN user'}</button></strong><span>{reply.body}</span></div>)}</div><form onSubmit={event=>{event.preventDefault();replyToStatus();}}><input value={statusReplyDraft} onChange={event=>setStatusReplyDraft(event.target.value)} placeholder="Reply to this status…" maxLength={2000} aria-label="Reply to status"/><button type="submit" disabled={!statusReplyDraft.trim()}><Send size={16}/></button></form>{statusReplyNotice&&<small role="status">{statusReplyNotice}</small>}</div>}</div></div>}<header className="topbar"><div className="brand"><span className="brand-mark">☺</span><span>GRIN</span></div><div className="search people-search"><Search size={18}/><input value={personSearch} onChange={e=>searchPeople(e.target.value)} placeholder={groupMode?'Search people to add to group':'Find people on GRIN'} aria-label="Find people on GRIN"/>{personSearch.trim() && <div className="people-results" role="status" aria-live="polite">{peopleLoading ? <div className="people-search-status">Finding people…</div> : people.length ? people.map(p=><button key={p.id} className={groupSelected.some(x=>x.id===p.id)?'selected-person':''} onClick={()=>openPersonProfile(p)}><div className="chat-avatar">{p.avatar_url?<img src={p.avatar_url} alt=""/>:(p.display_name||p.username).slice(0,2).toUpperCase()}</div><div><strong>{p.display_name||'GRIN User'}</strong><span>@{p.username}{groupMode&&groupSelected.some(x=>x.id===p.id)?' · Selected':''}</span></div><UserRound size={16}/></button>) : <div className="people-search-status">No people found. Try another name or username.</div>}</div>}</div><div className="top-actions"><button className="more-menu-toggle" type="button" aria-expanded={showMoreMenu} onClick={()=>setShowMoreMenu(x=>!x)}><Compass size={18}/><span>Explore GRIN</span></button><button className="avatar" type="button" onClick={()=>setActive('profile')} aria-label="Open your profile" title="Your profile">{(profile?.display_name||session.user.email||'G')[0].toUpperCase()}</button><button className="logout" onClick={()=>supabase.auth.signOut({ scope: 'local' })} title="Sign out"><LogOut size={18}/></button></div></header>{showMoreMenu&&<div className="more-menu-panel" role="navigation" aria-label="More GRIN functions">{[[House,'Home','discover'],[Gamepad2,'Games','games'],[Compass,'Explore','explore'],[MessageCircle,'Messages','chats'],[Users,'Communities','communities'],[Palette,'Creators','creators'],[ShoppingBag,'Marketplace','marketplace'],[BriefcaseBusiness,'Jobs & Gigs','jobs'],[Store,'Business & Pro','business'],[Bell,'Notifications','notifications'],[SettingsIcon,'Settings','settings'],[Archive,'Saved posts','saved'],[UserRound,'Profile','profile'],[Compass,'Discover all','directory']].map(([Icon,label,key])=><button type="button" key={key} className={active===key?'more-menu-item active':'more-menu-item'} onClick={()=>{setActive(key);if(key==='explore')window.setTimeout(()=>document.querySelector('.explore-search input')?.focus(),120);setShowMoreMenu(false);}}><Icon size={18}/><span>{label}</span></button>)}</div>}<main className="layout" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}><nav className="desktop-sidebar" aria-label="Main navigation"><div className="desktop-nav-label">YOUR SPACE</div>{[[House,'Home','discover'],[Gamepad2,'Games','games'],[Eye,'Status','status'],[Compass,'Explore','explore'],[Compass,'Discover all','directory'],[MessageCircle,'Messages','chats'],[Users,'Communities','communities'],[ShoppingBag,'Marketplace','marketplace'],[BriefcaseBusiness,'Jobs & Gigs','jobs'],[Store,'Business & Pro','business']].map(([Icon,label,key])=><button type="button" key={key} className={active===key?'desktop-nav-item active':'desktop-nav-item'} onClick={()=>{setActive(key);if(key==='chats')setChatOpen(false);setShowMoreMenu(false);}}><Icon size={19}/><span>{label}</span></button>)}<div className="desktop-nav-divider"/><div className="desktop-nav-label">ACCOUNT</div>{[[Bell,'Notifications','notifications'],[Archive,'Saved posts','saved'],[UserRound,'Profile','profile'],[SettingsIcon,'Settings','settings']].map(([Icon,label,key])=><button type="button" key={key} className={active===key?'desktop-nav-item active':'desktop-nav-item'} onClick={()=>{setActive(key);setShowMoreMenu(false);}}><Icon size={19}/><span>{label}</span></button>)}</nav><section className="content">{active === 'saved' ? <div className="feed-page saved-posts-page"><div className="feed-head"><div><h1>Saved posts</h1><p>Posts you bookmarked, kept in one place.</p></div><button type="button" className="secondary-btn" onClick={loadSavedPosts} disabled={savedPostsLoading}>{savedPostsLoading?'Loading…':'Refresh'}</button></div>{postNotice&&<p className="profile-notice" role="status">{postNotice}</p>}{savedPostsLoading?<div className="empty-state">Loading your saved posts…</div>:savedPosts.length===0?<div className="empty-state"><h2>No saved posts yet</h2><p>When you tap Save on a post, you’ll find it here.</p><button type="button" className="primary" onClick={()=>setActive('discover')}>Explore posts</button></div>:<div className="post-list">{savedPosts.map(p=><article className="post-card" key={p.id} id={'grin-post-'+p.id}><div className="post-author"><button type="button" className="chat-avatar" aria-label={"Open "+(p.grin_profiles?.display_name||'GRIN User')+"'s profile"} onClick={()=>openPersonProfile({id:p.author_id,...p.grin_profiles})} style={{border:0,cursor:'pointer'}}>{p.grin_profiles?.avatar_url?<img src={p.grin_profiles.avatar_url} alt=""/>:(p.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</button><div><button type="button" onClick={()=>openPersonProfile({id:p.author_id,...p.grin_profiles})} style={{border:0,padding:0,background:'transparent',color:'inherit',font:'inherit',fontWeight:650,cursor:'pointer',textAlign:'left'}}>{p.grin_profiles?.display_name||'GRIN User'}</button><small>@{p.grin_profiles?.username||'user'} · {new Date(p.created_at).toLocaleString()}</small></div></div>{p.body&&<p className="post-body">{p.body?.split(' ').map((part,index)=>part.startsWith('https://')||part.startsWith('http://')?<a key={index} href={part} target="_blank" rel="noreferrer">{part}</a>:part+' ')}</p>}{p.media_url&&(p.media_type==='video'?<video className="post-media" src={p.media_url} controls/>:<img className="post-media" src={p.media_url} alt="Saved post media"/>)}<div className="post-footer"><button type="button" onClick={()=>{setActive('discover');window.setTimeout(()=>document.getElementById('grin-post-'+p.id)?.scrollIntoView({behavior:'smooth',block:'center'}),150);}}>View in feed</button><button type="button" onClick={()=>{setSharePostNotice('');setSharePostTarget(p);}}>✉ Send in GRIN</button><button type="button" onClick={async()=>{await toggleBookmark(p.id);setSavedPosts(current=>current.filter(item=>item.id!==p.id));}}>Remove saved</button></div></article>)}</div>}</div> : active === 'settings' ? <div className="settings-page"><div className="feed-head"><div><h1>Settings</h1><p>Make GRIN feel right for you.</p></div></div><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><Palette size={20}/></span><div><h2>Appearance</h2><p>Choose the look you want across GRIN.</p></div></div><div className="theme-options">{[{id:'light',name:'Light',detail:'Bright and clean',icon:Sun},{id:'dark',name:'Dark',detail:'Easy on the eyes',icon:Moon},{id:'grin',name:'GRIN',detail:'Forest green, cream and gold',icon:Palette}].map(option=>{const Icon=option.icon;return <button type="button" key={option.id} className={'theme-option '+(theme===option.id?'selected':'')} onClick={()=>setTheme(option.id)} aria-pressed={theme===option.id}><span className={'theme-swatch '+option.id}><Icon size={20}/></span><span><strong>{option.name}</strong><small>{option.detail}</small></span><span className="theme-check">{theme===option.id?'✓':''}</span></button>;})}</div></section><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><Bell size={20}/></span><div><h2>Notifications</h2><p>Control the alerts that appear while you use GRIN.</p></div></div><label className="settings-toggle"><span><strong>In-app pop-ups</strong><small>Show a small alert when new activity arrives.</small></span><input type="checkbox" checked={toastEnabled} onChange={e=>setToastEnabled(e.target.checked)}/></label><div className="settings-action-row"><div><strong>Phone push notifications</strong><small>Receive GRIN alerts on this device even when the app is closed, once push delivery is configured.</small></div><button type="button" className="secondary-btn" onClick={async()=>{try{const vapidKey=import.meta.env.VITE_VAPID_PUBLIC_KEY||'BGEjQ8G68ODNd5Lz_Vv5IMG5m6JitnZYfRblTkHDyu0lcXtWX_MF8HrnQkYx728xkK4vh0DQbUf0ZeBfHU45LrU';if(!vapidKey){setSearchNotice('Phone push setup is not complete yet: the public VAPID key still needs to be configured for GRIN.');return;}if(!('serviceWorker'in navigator)||!('PushManager'in window)||typeof Notification==='undefined'){setSearchNotice('Push notifications are not supported by this browser. Try installing GRIN and opening it in Chrome.');return;}const permission=await Notification.requestPermission();if(permission!=='granted'){setSearchNotice(permission==='denied'?'Notifications are blocked in browser settings. Allow them for GRIN, then try again.':'Notification permission was not granted.');return;}const registration=await navigator.serviceWorker.ready;let subscription=await registration.pushManager.getSubscription();if(!subscription){const padding='='.repeat((4-vapidKey.length%4)%4);const bytes=Uint8Array.from(atob((vapidKey+padding).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});}const payload=subscription.toJSON();const {error}=await supabase.from('grin_push_subscriptions').upsert({user_id:session.user.id,endpoint:payload.endpoint,subscription:payload,updated_at:new Date().toISOString()},{onConflict:'endpoint'});if(error)throw error;setSearchNotice('This device is subscribed. Background delivery will start once GRIN’s push sender is configured.');}catch(error){console.error('GRIN push subscription failed:',error);setSearchNotice(error?.message||'Could not enable phone notifications. Please try again.');}}}>Enable phone notifications</button></div>{searchNotice&&<p className="settings-note" role="status">{searchNotice}</p>}</section><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><UserRound size={20}/></span><div><h2>Account & safety</h2><p>Manage your account and personal space.</p></div></div><button type="button" className="settings-link" onClick={()=>setActive('profile')}>Edit profile <ChevronRight size={18}/></button><button type="button" className="settings-link" onClick={()=>setActive('notifications')}>Manage notifications <ChevronRight size={18}/></button><button type="button" className="settings-link" onClick={()=>supabase.auth.signOut({ scope: 'local' })}>Sign out <LogOut size={18}/></button></section><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><Ban size={20}/></span><div><h2>Blocked accounts</h2><p>People you have blocked are hidden from people search.</p></div></div>{safetyNotice&&<p className="settings-note" role="status">{safetyNotice}</p>}{blockedUsers.length?blockedUsers.map(person=><div className="settings-action-row" key={person.id}><div><strong>{person.display_name||person.username||'GRIN user'}</strong><small>@{person.username||'user'}</small></div><button type="button" className="secondary-btn" onClick={()=>unblockPerson(person)}>Unblock</button></div>):<p className="settings-note">You have not blocked anyone.</p>}</section></div> : active === 'directory' ? <div className="directory-page"><div className="feed-head"><div><h1>Discover GRIN</h1><p>Everything happening across your community, in one place.</p></div></div><div className="directory-search"><Search size={18}/><input value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} placeholder="Search people, products, jobs and more" aria-label="Search all of GRIN"/><button type="button" onClick={()=>searchExplore()}>Search</button></div><div className="directory-grid">{[{key:'explore',title:'Explore',desc:'Find people, ideas and fresh activity',icon:Compass,number:suggestedPeople.length},{key:'marketplace',title:'Marketplace',desc:'Products, services and sellers',icon:ShoppingBag,number:listings.length},{key:'communities',title:'Communities',desc:'Join groups and conversations',icon:Users,number:communities.length},{key:'jobs',title:'Jobs & Gigs',desc:'Work, freelance gigs and hiring',icon:BriefcaseBusiness,number:jobs.length},{key:'creators',title:'Creators',desc:'Discover talent and creative work',icon:Palette,number:creators.length},{key:'business',title:'Business & Pro',desc:'Businesses and professional profiles',icon:Store,number:businesses.length},{key:'chats',title:'Chat',desc:'Continue your conversations',icon:MessageCircle,number:Object.values(unreadCounts).reduce((a,b)=>a+b,0)},{key:'notifications',title:'Notifications',desc:'See replies, follows and activity',icon:Bell,number:notifications.filter(n=>!n.read_at).length},{key:'profile',title:'Your profile',desc:'Your identity and posts on GRIN',icon:UserRound,number:posts.filter(p=>p.author_id===session.user.id).length},{key:'settings',title:'Settings',desc:'Themes, alerts and account options',icon:SettingsIcon,number:null}].map(item=>{const Icon=item.icon;return <button type="button" className="directory-card" key={item.key} onClick={()=>setActive(item.key)}><span className="directory-card-icon"><Icon size={22}/></span><span className="directory-card-copy"><strong>{item.title}</strong><small>{item.desc}</small></span>{item.number!==null&&<span className="directory-count">{item.number}</span>}<ChevronRight size={18}/></button>;})}</div>{exploreQuery.trim()&&<div className="directory-results"><h2>Search results</h2>{exploreLoading?<p>Searching GRIN…</p>:searchNotice?<p>{searchNotice}</p>:<div className="directory-result-grid">{[['People',exploreResults.people,x=>x.display_name||x.username],['Posts',exploreResults.posts,x=>x.body?.slice(0,110)],['Community posts',exploreResults.communityPosts,x=>x.body?.slice(0,110)],['Communities',exploreResults.communities,x=>x.name],['Businesses',exploreResults.businesses,x=>x.name],['Creators',exploreResults.creators,x=>x.headline||x.category],['Marketplace',exploreResults.listings,x=>x.title],['Jobs & Gigs',exploreResults.jobs,x=>x.title]].map(([label,rows,getName])=><section key={label}><h3>{label}</h3>{rows.length?rows.slice(0,5).map((row,i)=>label==='People'?<div className="explore-person-result" key={row.id}><button type="button" className="suggestion-person-link" onClick={()=>openPersonProfile(row)}><span className="chat-avatar">{(row.display_name||row.username||'G').slice(0,2).toUpperCase()}</span><strong>{row.display_name||'GRIN User'}</strong><small>@{row.username||'user'}</small>{row.bio&&<small className="explore-person-bio">{row.bio}</small>}</button><button type="button" className="secondary-btn" onClick={()=>togglePersonFollow(row)}>{followedIds.has(row.id)?'Following':'Follow'}</button><button type="button" className="secondary-btn" onClick={()=>startChat(row)}><MessageCircle size={15}/> Message</button></div>:<p key={row.id||row.user_id||i}>{getName(row)||label}</p>):<small>No matches</small>}</section>)}</div>}</div>}</div> : active === 'explore' ? <div className="explore-page"><div className="feed-head"><div><h1>Explore</h1><p>Search across people, creators, businesses, listings and jobs.</p></div></div><section className="profile-card" aria-label="Find and invite friends"><div className="feed-head"><div><h2>Find your people</h2><p>Search for people by name or username, or invite friends to join GRIN. Your phone contacts stay on your device.</p></div><button type="button" className="primary" onClick={inviteFriends}>Invite friends</button></div>{inviteNotice&&<p className="profile-notice" role="status">{inviteNotice}</p>}</section><section className="profile-card people-directory" aria-label="People on GRIN"><div className="feed-head"><div><h2>People on GRIN</h2><p>Browse accounts and open a profile to follow, message, block or report.</p></div><span className="directory-count">{directoryPeople.length}</span></div>{directoryPeopleLoading ? <p className="settings-note">Loading people…</p> : directoryPeople.length ? <div className="people-directory-list">{directoryPeople.map(person=><div className="people-directory-row" key={person.id}><button type="button" className="suggestion-person-link" onClick={()=>openPersonProfile(person)}><span className="chat-avatar">{person.avatar_url?<img src={person.avatar_url} alt=""/>:(person.display_name||person.username||'G').slice(0,2).toUpperCase()}</span><span><strong>{person.display_name||'GRIN User'}</strong><small>@{person.username||'user'}</small></span></button><button type="button" className="secondary-btn" onClick={()=>openPersonProfile(person)}>View profile</button></div>)}</div> : <p className="settings-note">No other accounts are available to show yet.</p>}</section><div className="directory-search explore-search"><Search size={18}/><input value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} placeholder="What are you looking for?" aria-label="Search GRIN"/><button type="button" onClick={()=>searchExplore()}>Search</button></div>{exploreLoading?<div className="empty-state">Searching GRIN…</div>:<div className="directory-results"><div className="directory-result-grid">{[['People',exploreResults.people,x=>x.display_name||x.username],['Posts',exploreResults.posts,x=>x.body?.slice(0,110)],['Community posts',exploreResults.communityPosts,x=>x.body?.slice(0,110)],['Communities',exploreResults.communities,x=>x.name],['Businesses',exploreResults.businesses,x=>x.name],['Creators',exploreResults.creators,x=>x.headline||x.category],['Marketplace',exploreResults.listings,x=>x.title],['Jobs & Gigs',exploreResults.jobs,x=>x.title]].map(([label,rows,getName])=><section key={label}><h3>{label}</h3>{rows.length?rows.slice(0,8).map((row,i)=>label==='People'?<div className="explore-person-result" key={row.id}><button type="button" className="suggestion-person-link" onClick={()=>openPersonProfile(row)}><span className="chat-avatar">{(row.display_name||row.username||'G').slice(0,2).toUpperCase()}</span><strong>{row.display_name||'GRIN User'}</strong><small>@{row.username||'user'}</small>{row.bio&&<small className="explore-person-bio">{row.bio}</small>}</button><button type="button" className="secondary-btn" onClick={()=>togglePersonFollow(row)}>{followedIds.has(row.id)?'Following':'Follow'}</button><button type="button" className="secondary-btn" onClick={()=>startChat(row)}><MessageCircle size={15}/> Message</button></div>:<p key={row.id||row.user_id||i}>{getName(row)||label}</p>):<small>{exploreQuery?'No matches yet':'Start with a search above'}</small>}</section>)}</div></div>}</div> 
: active === 'games' ? <div className="feed-page grin-games-page">
  <div className="feed-head"><div><h1><Gamepad2 size={27} style={{verticalAlign:'middle',marginRight:8}}/>GRIN Games</h1><p>Take a break, challenge your people, and play together.</p></div></div>
  <section className="profile-card grin-game-card">
    <div className="grin-game-picker" role="group" aria-label="Choose a game">
      <button type="button" className={selectedGrinGame === 'ttt' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('ttt')}>Tic-Tac-Toe</button>
      <button type="button" className={selectedGrinGame === 'snake' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('snake')}>Snake</button>
      <button type="button" className={selectedGrinGame === 'memory' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('memory')}>Memory Match</button>
      <button type="button" className={selectedGrinGame === 'rps' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('rps')}>Rock Paper Scissors</button>
      <button type="button" className={selectedGrinGame === '2048' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('2048')}>2048</button>
      <button type="button" className={selectedGrinGame === 'connect4' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('connect4')}>Connect Four</button>
      <button type="button" className={selectedGrinGame === 'football' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('football')}>Penalty Shootout ⚽</button>
      <button type="button" className={selectedGrinGame === 'trivia' ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('trivia')}>Football Trivia 🧠</button>
      <button type="button" className={['wordguess','mines','chess','draughts','grintrivia','predict','party','couples','rewards'].includes(selectedGrinGame) ? 'primary' : 'secondary-btn'} onClick={()=>setSelectedGrinGame('wordguess')}>🕹️ Arcade Expansion</button>
    </div>
    {['wordguess','mines','chess','draughts','grintrivia','predict','party','couples','rewards'].includes(selectedGrinGame) ? <ExpansionGames key="grin-expansion" /> : selectedGrinGame === 'trivia' ? <>
      <div className="trivia-hero"><div className="trivia-hero-kicker"><span className="trivia-live-dot" /> GRIN SPORTS · QUIZ ARENA</div><div className="trivia-hero-main"><div><h2>Football <em>Trivia</em></h2><p>Know the game. Prove your football IQ.</p></div><div className="trivia-ball-art" aria-hidden="true">⚽</div></div><div className="trivia-hero-stats"><span><strong>5</strong> QUESTIONS</span><span><strong>3</strong> DIFFICULTIES</span><span><strong>FREE</strong> TO PLAY</span></div></div>
      <section className="trivia-difficulty-wrap" aria-label="Choose difficulty"><div className="trivia-section-label"><span>01 / SELECT YOUR LEVEL</span><small>Choose your challenge</small></div><div className="trivia-difficulty-grid">{['Easy','Medium','Hard'].map((level,index)=><button key={level} type="button" className={'trivia-difficulty '+(triviaDifficulty===level?'is-selected':'')} onClick={()=>startFootballTriviaRound(level)}><span className="trivia-difficulty-icon">{['◉','◆','✦'][index]}</span><strong>{level}</strong><small>{['Warm-up · Fundamentals','Matchday · Deeper knowledge','Elite · For the obsessed'][index]}</small><span className="trivia-difficulty-check">{triviaDifficulty===level?'✓':'+'}</span></button>)}</div></section>
      <div className="trivia-score-strip"><span><small>QUESTION</small><strong>{triviaFinished?5:triviaIndex+1}<i> / 5</i></strong></span><span><small>YOUR SCORE</small><strong>{triviaScore}<i> / 5</i></strong></span><span><small>LEVEL</small><strong>{triviaDifficulty.toUpperCase()}</strong></span></div><div className="trivia-progress-track"><i style={{width:((triviaFinished?5:triviaIndex)/5*100)+'%'}} /></div>
      {triviaFinished?<div className="trivia-finish-panel"><div className="trivia-result-ring"><strong>{Math.round(triviaScore/5*100)}<small>%</small></strong></div><span className="trivia-eyebrow">FULL TIME · {triviaDifficulty.toUpperCase()} LEVEL</span><h3>{triviaScore===5?'Flawless. Absolute class.':triviaScore>=4?'Top-class performance!':triviaScore>=2?'Good game. Keep building.':'Back to training.'}</h3><p>You scored <strong>{triviaScore} out of 5</strong>. {triviaScore>=4?'You know your football.':triviaScore>=2?'A few more rounds and you’ll be flying.':'Every great player studies the game.'}</p><button type="button" className="primary" onClick={resetFootballTrivia}>Play again ↻</button></div>:<>
        <div className="trivia-question-card"><div className="trivia-question-top"><span className="trivia-eyebrow">MATCH IQ / {String(triviaIndex+1).padStart(2,'0')}</span><span className="trivia-difficulty-chip">{triviaDifficulty.toUpperCase()}</span></div><h3>{activeTriviaQuestions[triviaIndex].q}</h3></div>
        <div className="trivia-options" role="group" aria-label="Answer options">
          {activeTriviaQuestions[triviaIndex].options.map((option,index)=><button key={option} type="button" className={'trivia-option'+(triviaAnswer!==null?(index===activeTriviaQuestions[triviaIndex].answer?' is-correct':index===triviaAnswer?' is-wrong':''):'')} onClick={()=>answerFootballTrivia(index)} disabled={triviaAnswer!==null}><span className="trivia-option-letter">{String.fromCharCode(65+index)}</span><span>{option}</span>{triviaAnswer!==null&&index===activeTriviaQuestions[triviaIndex].answer?<strong>✓</strong>:null}</button>)}
        </div>
        {triviaAnswer!==null ? <div className="trivia-feedback"><p><strong>{triviaAnswer===activeTriviaQuestions[triviaIndex].answer?'Correct!':'Not quite.'}</strong> {activeTriviaQuestions[triviaIndex].explain}</p><button type="button" className="primary" onClick={nextFootballTrivia}>{triviaIndex===activeTriviaQuestions.length-1?'See results':'Next question'} →</button></div> : <p className="game-turn-status">Choose your answer to lock it in.</p>}
      </>}
    </> : selectedGrinGame === 'football' ? <>
      {onlinePenaltyRoom ? <>
        <div className="feed-head"><div><h2>Penalty Shootout · Online ⚽</h2><p>Challenge a friend in a live, turn-based shootout.</p></div><Trophy size={25}/></div>
        <div className="profile-form"><label>Room invitation link</label><input readOnly value={window.location.origin+window.location.pathname+'?game=penalty&room='+encodeURIComponent(onlinePenaltyRoom)} onFocus={e=>e.target.select()}/><div className="card-actions"><button type="button" className="primary" onClick={()=>{const link=window.location.origin+window.location.pathname+'?game=penalty&room='+encodeURIComponent(onlinePenaltyRoom);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(link).then(()=>setOnlinePenalty(s=>({...s,notice:'Invite link copied. Share it with your opponent.'}))).catch(()=>window.prompt('Copy invite link:',link));else window.prompt('Copy invite link:',link);}}>Copy invite link</button><button type="button" className="secondary-btn" onClick={leaveOnlinePenaltyRoom}>Leave room</button></div><label>Join another room</label><div className="card-actions"><input value={onlinePenaltyJoinCode} onChange={e=>setOnlinePenaltyJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code" maxLength={12}/><button type="button" className="secondary-btn" onClick={()=>joinOnlinePenaltyRoom()}>Join</button></div></div>
        <div className="penalty-scoreboard"><div><span>HOST</span><strong>{onlinePenalty.scores.host}</strong></div><div className="penalty-score-divider">VS</div><div><span>GUEST</span><strong>{onlinePenalty.scores.guest}</strong></div></div>
        <p className="penalty-round-label">{onlinePenalty.done?'Shootout complete':'Attempt '+(Math.floor(onlinePenalty.attempts/2)+1)+' of 5'} · {onlinePenalty.phase==='shoot'?'Shoot':'Goalkeeper dive'} · {onlinePenalty.turn===onlinePenaltyRole?'Your turn':onlinePenalty.turn==='host'?'Host’s turn':'Guest’s turn'}</p>
        <div className="penalty-aim-pad" role="group" aria-label="Choose shot or dive direction">{['left','center','right'].map(direction=><button type="button" key={direction} className="penalty-aim-lane" disabled={onlinePenalty.done||onlinePenalty.turn!==onlinePenaltyRole} onClick={()=>chooseOnlinePenaltyAction(direction)}><span>{direction==='left'?'↖':direction==='center'?'↑':'↗'}</span><small>{onlinePenalty.phase==='shoot'?'SHOOT':'DIVE'} {direction==='center'?'CENTRE':direction.toUpperCase()}</small></button>)}</div>
        <p className="game-turn-status" aria-live="polite">{onlinePenalty.notice}</p>{onlinePenalty.done&&<button type="button" className="primary" onClick={restartOnlinePenaltyMatch}>Rematch</button>}
      </> : <>
        <div className="profile-form"><h3>Play against a friend</h3><p>Create a private room, then send the invitation link. The host and guest take turns shooting and saving.</p><div className="card-actions"><button type="button" className="primary" onClick={createOnlinePenaltyRoom}>Create online match</button></div><form onSubmit={e=>{e.preventDefault();joinOnlinePenaltyRoom();}}><label>Join a friend's match</label><input value={onlinePenaltyJoinCode} onChange={e=>setOnlinePenaltyJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code" maxLength={12}/><button type="submit" className="secondary-btn">Join match</button></form></div>

      <div className="feed-head"><div><h2>Penalty Shootout ⚽</h2><p>Five rounds against GRIN Bot. Shoot past the keeper, then dive to try to save its shot.</p></div><Trophy size={25}/></div>
      <div className="penalty-scoreboard" aria-live="polite">
        <div><span>You</span><strong>{penaltyPlayerGoals}</strong></div>
        <div className="penalty-score-divider">VS</div>
        <div><span>GRIN Bot</span><strong>{penaltyBotGoals}</strong></div>
      </div>
      <p className="penalty-round-label">{penaltyDone ? 'Shootout complete' : 'Round '+penaltyRound+' of 5'} · {penaltyPhase === 'shoot' ? 'Your penalty' : 'Defend the goal'}</p>
      <Penalty3D animation={penaltyAnimation} result={penaltyLastResult} phase={penaltyPhase} shotPower={penaltyPower} />
      <p className="game-turn-status" aria-live="polite">{penaltyNotice}</p>
      {penaltyPhase === 'shoot' && !penaltyDone ? <>
        <div className="penalty-console-label"><span>LEFT STICK</span><strong>AIM SHOT</strong><span className="penalty-console-status">{penaltyCharging ? 'CHARGING' : 'READY'}</span></div>
        <div className="penalty-aim-pad" role="group" aria-label="Aim your penalty">
          {['left','center','right'].map((direction)=><button key={direction} type="button" aria-pressed={penaltyAim===direction} className={'penalty-aim-lane '+(penaltyAim===direction?'is-aimed':'')} onClick={()=>setPenaltyAim(direction)} disabled={penaltyAnimation!=='idle'}>
            <span>{direction==='left'?'↖':direction==='center'?'↑':'↗'}</span><small>{direction==='left'?'LEFT':direction==='center'?'CENTRE':'RIGHT'}</small>
          </button>)}
        </div>
        <div className="penalty-power-row"><div className="penalty-power-copy"><strong>SHOT POWER</strong><span>{penaltyPower}%</span></div><div className="penalty-power-meter"><i style={{width:penaltyPower+'%'}} /></div></div>
        <button type="button" className={'penalty-r2-trigger '+(penaltyCharging?'is-charging':'')} disabled={penaltyDone||penaltyAnimation!=='idle'} onPointerDown={event=>{event.preventDefault();if(penaltyDone||penaltyAnimation!=='idle')return;event.currentTarget.setPointerCapture?.(event.pointerId);penaltyChargeStartRef.current=performance.now();penaltyPowerRef.current=0;setPenaltyPower(0);setPenaltyCharging(true);}} onPointerUp={event=>{event.preventDefault();if(!penaltyCharging)return;const power=Math.max(18,Math.min(100,Math.round((performance.now()-penaltyChargeStartRef.current)/13)));penaltyPowerRef.current=power;setPenaltyPower(power);setPenaltyCharging(false);playPenaltyDirection(penaltyAim,power);setTimeout(()=>{setPenaltyPower(0);penaltyPowerRef.current=0;},1150);}} onPointerCancel={()=>setPenaltyCharging(false)} onContextMenu={event=>event.preventDefault()} aria-label="Hold R2 to charge and release to shoot">
          <span className="penalty-r2-pill">R2</span><span className="penalty-r2-label">{penaltyCharging?'RELEASE TO SHOOT':'HOLD TO SHOOT'}</span><span className="penalty-r2-sub">{penaltyCharging?'BUILDING POWER':'PRESS & HOLD'}</span>
        </button>
        <p className="penalty-control-footnote">Choose a lane, hold R2, then release. More power makes the shot harder to stop.</p>
      </> : <div className="penalty-console-defense">
        <div className="penalty-console-label"><span>LEFT STICK</span><strong>CHOOSE YOUR DIVE</strong><span className="penalty-console-status">KEEPER</span></div>
        <div className="penalty-directions penalty-dive-pad" role="group" aria-label="Choose where to dive">
          {['left','center','right'].map((direction)=><button key={direction} type="button" className="penalty-action-btn dive-action" onClick={()=>playPenaltyDirection(direction)} disabled={penaltyDone||penaltyAnimation!=='idle'}>
            <span className="penalty-control-arrow">{direction==='left'?'↙':direction==='center'?'↑':'↘'}</span><strong>DIVE</strong><small>{direction==='left'?'LEFT':direction==='center'?'CENTRE':'RIGHT'}</small>
          </button>)}
        </div>
        <p className="penalty-control-footnote">{penaltyDone?'Shootout complete. Run it back?':'Read the striker and choose your dive.'}</p>
      </div>}
      <div className="card-actions"><button type="button" className="primary" onClick={resetPenaltyShootout}>{penaltyDone ? 'Play again' : 'Restart shootout'}</button></div>
      </>}
    </> : selectedGrinGame === 'connect4' ? <>
      <section className="connect-four-hero"><div><span className="connect-four-kicker"><i/> GRIN ARCADE · STRATEGY</span><h2>Connect <em>Four</em></h2><p>Read the board. Block the threat. Line up four to win.</p></div><div className="connect-four-hero-art" aria-hidden="true"><i/><i/><i/><i/></div></section>
      <div className="connect-four-matchbar"><span><i className="disc-red"/> YOU <b>RED</b></span><span className="connect-four-vs">VS</span><span><i className="disc-yellow"/> GRIN BOT <b>GOLD</b></span></div>
      <div className="connect-four-board-shell"><div className="connect-four-board" role="group" aria-label="Connect Four board">
        {Array.from({length:7},(_,col)=><button key={col} type="button" className="connect-four-drop" onClick={()=>playConnectFour(col)} disabled={connectFourOver||connectFourThinking||connectFourBoard[col]!==''} aria-label={'Drop disc in column '+(col+1)}>↓</button>)}
        {connectFourBoard.map((cell,index)=><div key={index} className={'connect-four-cell'+(cell?' '+(cell==='R'?'disc-red':'disc-yellow'):'')} role="img" aria-label={cell==='R'?'Red disc':cell==='Y'?'Yellow disc':'Empty space'} />)}
      </div></div>
      <p className={'connect-four-status'+(connectFourThinking?' is-thinking':'')} aria-live="polite">{connectFourNotice}{connectFourThinking && <span className="connect-four-thinking-dots" aria-hidden="true"><i/><i/><i/></span>}</p>
      <div className="card-actions"><button type="button" className="primary" onClick={resetConnectFour}>↻ New round</button></div>
    </> : selectedGrinGame === '2048' ? <>
      <section className="number2048-hero"><div><span className="number2048-kicker"><i/> GRIN ARCADE · PUZZLE MODE</span><h2>2048 <em>Merge Lab</em></h2><p>Think ahead. Chain your merges. Chase the golden tile.</p></div><div className="number2048-hero-art" aria-hidden="true"><span>2</span><span>4</span><span>8</span></div></section>
      <div className="number2048-scorecards"><div><small>CURRENT SCORE</small><strong>{numberScore.toLocaleString()}</strong></div><div><small>BEST THIS SESSION</small><strong>{numberBest.toLocaleString()}</strong></div></div>
      <div className="number2048-play-wrap">
        <div className="number2048-board" role="group" aria-label="2048 number puzzle" tabIndex={0} onClick={e=>e.currentTarget.focus()} onKeyDown={e=>{const dirs={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(dirs[e.key]){e.preventDefault();move2048(dirs[e.key]);}}} onTouchStart={e=>{const t=e.touches[0];e.currentTarget.dataset.touchX=t.clientX;e.currentTarget.dataset.touchY=t.clientY;}} onTouchEnd={e=>{const x=Number(e.currentTarget.dataset.touchX),y=Number(e.currentTarget.dataset.touchY),t=e.changedTouches[0],dx=t.clientX-x,dy=t.clientY-y;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;if(Math.abs(dx)>Math.abs(dy))move2048(dx>0?'right':'left');else move2048(dy>0?'down':'up');}}>
          {numberTiles.map((value,index)=><div key={index} className={'number2048-tile'+(value?' has-value tile-'+Math.min(value,2048):'')} aria-label={value?String(value):'Empty tile'}>{value||''}</div>)}
        </div>
        <div className="number2048-controls" role="group" aria-label="Move tiles">
          <button type="button" className="number2048-arrow" onClick={()=>move2048('up')} aria-label="Move up">↑</button>
          <div><button type="button" className="number2048-arrow" onClick={()=>move2048('left')} aria-label="Move left">←</button><button type="button" className="number2048-arrow" onClick={()=>move2048('down')} aria-label="Move down">↓</button><button type="button" className="number2048-arrow" onClick={()=>move2048('right')} aria-label="Move right">→</button></div>
        </div>
      </div>
      <p className="number2048-hint">HOW TO PLAY <span>Use arrow keys, tap the controls, or swipe on the board.</span></p>
      <p className="number2048-status" aria-live="polite">{numberNotice}</p>
      <div className="card-actions"><button type="button" className="primary" onClick={reset2048}>↻ New game</button></div>
    </> : selectedGrinGame === 'ttt' ? <>
      <div className="feed-head"><div><h2>Tic-Tac-Toe</h2><p>{gameRoomCode?'Room '+gameRoomCode+' · You play as '+gameMark:'Play against GRIN Bot, or create an online room to challenge another player.'}</p></div><Trophy size={25}/></div>
      {!gameRoomCode&&<div className="grin-bot-difficulty"><label htmlFor="grin-bot-level">GRIN Bot difficulty</label><select id="grin-bot-level" value={grinBotDifficulty} onChange={e=>setGrinBotDifficulty(e.target.value)}><option value="easy">Easy · Friendly</option><option value="normal">Normal · Fair challenge</option><option value="hard">Hard · Unbeatable strategy</option></select><small>{grinBotDifficulty==='easy'?'A relaxed game with plenty of room to win.':grinBotDifficulty==='normal'?'A fair challenge with occasional imperfect moves.':'The strongest strategy — prepare for a tough match!'}</small></div>}
      <div className="grin-tictactoe-board" role="group" aria-label="Tic-Tac-Toe board">{gameBoard.map((cell,index)=><button type="button" key={index} className="grin-game-cell" aria-label={'Square '+(index+1)+(cell?', '+cell:' empty')} onClick={()=>playGrinGameCell(index)} disabled={!!cell||!!grinGameWinner(gameBoard)||(!!gameRoomCode&&gameTurn!==gameMark)}>{cell||' '}</button>)}</div>
      <p className="game-turn-status" aria-live="polite">{gameNotice||('Turn: '+gameTurn)}</p>
      <div className="card-actions"><button type="button" className="primary" onClick={resetGrinGame}>Play again</button><button type="button" className="secondary-btn" onClick={startGrinGameRoom}>Create online room</button>{gameRoomCode&&<button type="button" className="secondary-btn" onClick={exitGrinGameRoom}>Exit room</button>}</div>
      <form className="profile-form" onSubmit={e=>{e.preventDefault();joinGrinGameRoom();}}><label>Join a room</label><input value={gameJoinCode} onChange={e=>setGameJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code" maxLength={12}/><button type="submit" className="secondary-btn">Join room as O</button></form>
    </> : selectedGrinGame === 'snake' ? <>
      <div className="feed-head"><div><h2>Snake</h2><p>{snakeRoomCode ? 'Snake Arena · Room '+snakeRoomCode+' · '+(snakeRoomRole==='host'?'You are hosting':'You are a challenger') : 'Eat the glowing fruit, grow longer, and avoid the walls and your own tail.'}</p></div><Trophy size={25}/></div>
      <div className="snake-score">{snakeRoomCode ? <><span>You <strong>{snakeScore}</strong></span><span> · Opponent <strong>{snakeOpponentScore}</strong></span><span> · {snakeRoomRole==='host'?'Host':'Challenger'}</span></> : <>Score <strong>{snakeScore}</strong></>}</div>
      {!snakeRoomCode&&<div className="grin-bot-difficulty grin-snake-speed"><label htmlFor="grin-snake-speed">Snake speed</label><select id="grin-snake-speed" value={snakeSpeed} disabled={snakeRunning} onChange={e=>setSnakeSpeed(e.target.value)}><option value="slow">Slow · Relaxed</option><option value="normal">Normal · Classic</option><option value="fast">Fast · Reflex challenge</option></select><small>{snakeRunning?'Pause or finish the current run to change speed.':snakeSpeed==='slow'?'More time to react and plan your turns.':snakeSpeed==='normal'?'The classic pace for a balanced game.':'Quick movement for players who like a challenge.'}</small></div>}
      <div className="profile-form">
        {!snakeRoomCode ? <>
          <button type="button" className="primary" onClick={createSnakeRoom}>Create Snake Arena</button>
          <form onSubmit={e=>{e.preventDefault();joinSnakeRoom();}}><label>Join a Snake Arena</label><input value={snakeJoinCode} onChange={e=>setSnakeJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code" maxLength={12}/><button type="submit" className="secondary-btn">Join Arena</button></form>
        </> : <>
          <p>Room code: <strong>{snakeRoomCode}</strong></p>
          <div className="card-actions"><button type="button" className="secondary-btn" onClick={copySnakeRoomLink}>Copy Arena link</button><button type="button" className="secondary-btn" onClick={exitSnakeRoom}>Exit room</button></div>
          {snakeRoomRole==='host'&&<button type="button" className="primary" onClick={startGrinSnake}>{snakeRunning?'Restart Arena':'Start Arena'}</button>}
        </>}
      </div>
      <div className="grin-snake-board" role="img" aria-label={'Snake game board. Your score '+snakeScore+'. Swipe in a direction to steer.'} onTouchStart={handleSnakeSwipeStart} onTouchEnd={handleSnakeSwipeEnd}>
        {Array.from({length:192},(_,index)=><span key={index} className={'snake-cell'+(snakeBody.includes(index)?' snake-body':'')+(snakeBody[0]===index?' snake-head':'')+(snakeRoomCode&&snakeOpponentBody.includes(index)?' snake-rival-body':'')+(snakeRoomCode&&snakeOpponentBody[0]===index?' snake-rival-head':'')+(snakeFood===index?' snake-food':'')} />)}
      </div>
      <p className="game-turn-status" aria-live="polite">{snakeNotice}</p>
      <div className="card-actions">{!snakeRoomCode&&<button type="button" className="primary" onClick={startGrinSnake}>{snakeRunning?'Restart Snake':'Start Snake / Play again'}</button>}{(!snakeRoomCode||snakeRoomRole==='host')&&<button type="button" className="secondary-btn" onClick={()=>{setSnakeRunning(false);setSnakeNotice('Game paused.');if(snakeRoomCode&&snakeChannelRef.current)snakeChannelRef.current.send({type:'broadcast',event:'snake-state',payload:{room:snakeRoomCode,body:snakeBodyRef.current,food:snakeFoodRef.current,direction:snakeDirectionRef.current,running:false,score:snakeScoreRef.current,notice:'Host paused the arena.'}});}}>Pause</button>}</div>
      <p className="snake-control-hint">Mobile: swipe on the board to steer. Desktop: use arrow keys or W, A, S, D.</p>
    </> : selectedGrinGame === 'memory' ? <>
      <div className="feed-head"><div><h2>Memory Match</h2><p>{memoryRoomCode?'Online match · Room '+memoryRoomCode+' · '+(memoryRoomRole==='host'?'Host':'Challenger'):'Find pairs solo or take turns with a friend.'}</p></div><Trophy size={25}/></div>
      {memoryRoomCode?<div className="profile-form"><p>Room code: <strong>{memoryRoomCode}</strong></p><p>Turn: <strong>{memoryTurn===memoryRoomRole?'Your turn':"Opponent's turn"}</strong> · You <strong>{memoryScores[memoryRoomRole]||0}</strong> pairs · Opponent <strong>{memoryScores[memoryRoomRole==='host'?'guest':'host']||0}</strong> pairs</p><div className="card-actions"><button type="button" className="secondary-btn" onClick={copyMemoryRoomLink}>Copy match link</button><button type="button" className="secondary-btn" onClick={exitMemoryRoom}>Exit room</button></div></div>:<div className="profile-form"><button type="button" className="primary" onClick={createMemoryRoom}>Create online match</button><form onSubmit={e=>{e.preventDefault();joinMemoryRoom();}}><label>Join a match</label><input value={memoryJoinCode} onChange={e=>setMemoryJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code" maxLength={12}/><button type="submit" className="secondary-btn">Join match</button></form></div>}
      {!memoryRoomCode&&<div className="grin-bot-difficulty grin-memory-difficulty"><label htmlFor="grin-memory-level">Memory Match difficulty</label><select id="grin-memory-level" value={memoryDifficulty} onChange={e=>{const difficulty=e.target.value;setMemoryDifficulty(difficulty);startMemoryGame(difficulty);}}><option value="easy">Easy · 6 pairs</option><option value="normal">Normal · 10 pairs</option><option value="hard">Hard · 16 pairs</option></select><small>{memoryDifficulty==='easy'?'Six pairs for a relaxed warm-up.':memoryDifficulty==='normal'?'Ten pairs for a balanced memory challenge.':'Sixteen pairs for a serious test of focus and recall.'}</small></div>}
      <div className="memory-game-board" role="group" aria-label="Memory match cards">{memoryCards.map((card,index)=><button type="button" key={card.id} className={'memory-card'+(memoryFlipped.includes(index)||memoryMatched.includes(index)?' revealed':'')+(memoryMatched.includes(index)?' matched':'')} onClick={()=>flipMemoryCard(index)} disabled={memoryMatched.includes(index)||memoryFlipped.includes(index)||memoryFlipped.length>=2||(!!memoryRoomCode&&memoryTurn!==memoryRoomRole)}>{memoryFlipped.includes(index)||memoryMatched.includes(index)?card.emoji:'?'}</button>)}</div>
      <p className="game-turn-status" aria-live="polite">{memoryNotice}</p><p className="snake-score">Moves <strong>{memoryMoves}</strong> · Pairs <strong>{memoryMatched.length/2}/{memoryCards.length/2}</strong>{memoryRoomCode?' · '+(memoryScores[memoryRoomRole]||0)+' points':''}</p>
      <div className="card-actions"><button type="button" className="primary" onClick={startMemoryGame} disabled={!!memoryRoomCode&&memoryRoomRole!=='host'}>Restart Memory Match</button></div>
    </> : <>
      <div className="feed-head"><div><h2>Rock Paper Scissors</h2><p>{rpsRoomCode?'Online match · Room '+rpsRoomCode+' · '+(rpsRoomRole==='host'?'Host':'Challenger'):'Play quick rounds against GRIN Bot or challenge a friend.'}</p></div><Trophy size={25}/></div>
      {rpsRoomCode?<div className="profile-form"><p>Room code: <strong>{rpsRoomCode}</strong></p><div className="card-actions"><button type="button" className="secondary-btn" onClick={copyRpsRoomLink}>Copy match link</button><button type="button" className="secondary-btn" onClick={exitRpsRoom}>Exit room</button></div><p>Best of five: first to three wins takes the match.</p></div>:<div className="profile-form"><button type="button" className="primary" onClick={createRpsRoom}>Create online match</button><form onSubmit={e=>{e.preventDefault();joinRpsRoom();}}><label>Join a match</label><input value={rpsJoinCode} onChange={e=>setRpsJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code" maxLength={12}/><button type="submit" className="secondary-btn">Join match</button></form></div>}
      <div className="rps-choices">{[{id:'rock',emoji:'✊',label:'Rock'},{id:'paper',emoji:'✋',label:'Paper'},{id:'scissors',emoji:'✌️',label:'Scissors'}].map(item=><button type="button" key={item.id} disabled={!!rpsRoomCode&&(!!rpsChoice||rpsRoundResolved||rpsRoundWins.you>=3||rpsRoundWins.opponent>=3)} className={'rps-choice'+(rpsChoice===item.id?' selected':'')} onClick={()=>playRockPaperScissors(item.id)}><span>{item.emoji}</span><strong>{item.label}</strong></button>)}</div>
      <p className="game-turn-status" aria-live="polite">{rpsResult}</p>{rpsRoomCode?<div className="rps-score"><span>Your wins <strong>{rpsRoundWins.you}</strong></span><span>Opponent <strong>{rpsRoundWins.opponent}</strong></span></div>:<div className="rps-score"><span>Wins <strong>{rpsScore.wins}</strong></span><span>Draws <strong>{rpsScore.draws}</strong></span><span>Losses <strong>{rpsScore.losses}</strong></span></div>}
      <div className="card-actions">{rpsRoomCode?<button type="button" className="secondary-btn" onClick={resetRpsMatch}>Restart match</button>:<button type="button" className="secondary-btn" onClick={resetRockPaperScissors}>Reset score</button>}</div>
    </>}
  </section>
  <section className="profile-card grin-game-invite-card"><h2>Invite people to play</h2><p>Create a room in Tic-Tac-Toe, Snake, Memory Match or Rock Paper Scissors, then share its invitation link with friends.</p>{gameRoomCode&&<><label>Game link</label><input aria-label="Game invitation link" readOnly value={window.location.origin+window.location.pathname+"?game=ttt&room="+encodeURIComponent(gameRoomCode)}/><div className="card-actions"><button type="button" className="primary" onClick={copyGrinGameLink}>Copy game link</button><button type="button" className="secondary-btn" onClick={shareGrinGameLink}>Share link…</button></div></>}
    <label>Invite through a conversation</label><select value={gameInviteTarget} onChange={e=>{setGameInviteTarget(e.target.value);if(e.target.value)setGameInviteCommunity('');}}><option value="">Choose a chat or group…</option>{chats.filter(chat=>chat.id!=='welcome').map(chat=><option key={chat.id} value={chat.id}>{chat.name}</option>)}</select>
    <label>Or invite a community</label><select value={gameInviteCommunity} onChange={e=>{setGameInviteCommunity(e.target.value);if(e.target.value)setGameInviteTarget('');}}><option value="">Choose a community…</option>{communities.filter(item=>communityMembers[item.id]?.joined).map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
    <button type="button" className="primary" onClick={sendGrinGameInvite}>Send game invitation</button>
    {gameNotice&&<div className="profile-notice" role="status">{gameNotice}</div>}
  </section>
  <section className="profile-card"><h2>Coming next</h2><p>More games, friend challenges, and shared leaderboards will fit here as GRIN Games grows.</p></section>
</div> : active === 'communities' ? <div className="explore-page"><div className="feed-head"><div><h1>Communities</h1><p>Find your people, interests, industries and conversations.</p></div></div><form className="profile-card explore-form" onSubmit={createCommunity}><h2>Create a community</h2><input value={communityForm.name} onChange={e=>setCommunityForm({...communityForm,name:e.target.value})} placeholder="Community name" required maxLength={80}/><textarea value={communityForm.description} onChange={e=>setCommunityForm({...communityForm,description:e.target.value})} placeholder="What is this community about?"/><input value={communityForm.category} onChange={e=>setCommunityForm({...communityForm,category:e.target.value})} placeholder="Category"/>{communityNotice&&<div className="profile-notice">{communityNotice}</div>}<button className="primary">Create community</button></form><div className="profile-card community-filters"><input value={communitySearch} onChange={e=>setCommunitySearch(e.target.value)} placeholder="Search communities..."/><select value={communityCategory} onChange={e=>setCommunityCategory(e.target.value)}><option>All</option>{[...new Set(communities.map(x=>x.category).filter(Boolean))].map(c=><option key={c}>{c}</option>)}</select></div><div className="explore-grid">{communities.filter(x=>(!communitySearch.trim()||[x.name,x.description,x.category].join(' ').toLowerCase().includes(communitySearch.trim().toLowerCase()))&&(communityCategory==='All'||x.category===communityCategory)).map(x=><article className="explore-card" key={x.id||x.user_id||x.community_id||x.title||x.body?.slice(0,30)}><strong>{x.name}</strong><span>{x.category}</span><p>{x.description||'A GRIN community.'}</p><small>{communityMembers[x.id]?.count||0} member{(communityMembers[x.id]?.count||0)===1?'':'s'}</small><div className="card-actions"><button className="secondary-btn" onClick={()=>toggleCommunityMembership(x.id)}>{communityMembers[x.id]?.joined?'Leave':'Join'}</button><button className="secondary-btn" onClick={async()=>{setSelectedCommunity(x);setCommunityNotice('');await loadCommunityPosts(x.id);}}>Open community</button></div></article>)}</div>{selectedCommunity&&<section className="profile-card community-room"><div className="feed-head"><div><h2>{selectedCommunity.name}</h2><p>{selectedCommunity.description||'Community discussion'}</p></div><button className="secondary-btn" onClick={()=>setSelectedCommunity(null)}>Close</button></div><form onSubmit={publishCommunityPost} className="composer"><textarea value={communityPost} onChange={e=>setCommunityPost(e.target.value)} placeholder="Share something with this community..." maxLength={5000}/><button className="primary">Post</button></form><div className="feed-list">{communityPosts.length?communityPosts.map(p=><article className="post-card" id={'grin-post-' + p.id} key={p.id}><div className="post-meta"><strong>{p.author_id===session.user.id?'You':'GRIN member'}</strong><span>{new Date(p.created_at).toLocaleString()}</span></div><p>{p.body}</p><button className="secondary-btn" onClick={()=>setSharePostTarget({...p,community_id:selectedCommunity.id})}>↗ Share to chat</button></article>):<div className="empty-state">No posts yet. Start the conversation.</div>}</div></section>}</div> : active === 'business' ? <div className="business-page"><div className="feed-head"><div><h1>Business & Professional</h1><p>Build a presence for your business, brand or professional identity on GRIN.</p></div></div><div className="business-grid"><form className="profile-card business-form" onSubmit={createBusiness}><h2>Create a business profile</h2><label>Business name<input value={businessForm.name} onChange={e=>setBusinessForm({...businessForm,name:e.target.value})} required maxLength={100}/></label><label>Handle<input value={businessForm.handle} onChange={e=>setBusinessForm({...businessForm,handle:e.target.value})} placeholder="yourbrand" required minLength={3} maxLength={40}/></label><label>Category<input value={businessForm.category} onChange={e=>setBusinessForm({...businessForm,category:e.target.value})}/></label><label>Description<textarea value={businessForm.description} onChange={e=>setBusinessForm({...businessForm,description:e.target.value})} maxLength={500}/></label><label>Website<input value={businessForm.website} onChange={e=>setBusinessForm({...businessForm,website:e.target.value})} placeholder="https://..."/></label><label>Location<input value={businessForm.location} onChange={e=>setBusinessForm({...businessForm,location:e.target.value})}/></label>{businessNotice&&<div className="profile-notice">{businessNotice}</div>}<button className="primary" type="submit">Create business profile</button></form><div><div className="pro-dashboard"><div><h2>Professional dashboard</h2><p>Turn your GRIN presence into a portfolio, storefront and client channel.</p></div><div className="stats-grid"><div><b>{businessStats.views}</b><span>Views</span></div><div><b>{businessStats.followers}</b><span>Followers</span></div><div><b>{businessStats.contacts}</b><span>Enquiries</span></div><div><b>{businessStats.productViews}</b><span>Product views</span></div></div></div><form className="profile-card pro-form" onSubmit={saveProfessional}><h2>Professional profile</h2><input placeholder="Headline e.g. Creative Director" value={professional.headline} onChange={e=>setProfessional({...professional,headline:e.target.value})}/><input placeholder="Industry" value={professional.industry} onChange={e=>setProfessional({...professional,industry:e.target.value})}/><input placeholder="Location" value={professional.location} onChange={e=>setProfessional({...professional,location:e.target.value})}/><input placeholder="Website" value={professional.website} onChange={e=>setProfessional({...professional,website:e.target.value})}/><input placeholder="Skills, separated by commas" value={professional.skills} onChange={e=>setProfessional({...professional,skills:e.target.value})}/><input placeholder="Portfolio URL" value={professional.portfolio_url} onChange={e=>setProfessional({...professional,portfolio_url:e.target.value})}/><select value={professional.availability} onChange={e=>setProfessional({...professional,availability:e.target.value})}><option value="available">Available for work</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select><input type="number" placeholder="Hourly rate" value={professional.hourly_rate} onChange={e=>setProfessional({...professional,hourly_rate:e.target.value})}/>{proNotice&&<div className="profile-notice">{proNotice}</div>}<button className="primary">Save professional profile</button></form><h2 className="business-list-title">GRIN businesses</h2>{businesses.length===0?<div className="empty-state">No business profiles yet. Create the first one.</div>:<div className="business-list">{businesses.map(b=><article className="business-card" key={b.id}><div className="business-avatar">{b.name.slice(0,2).toUpperCase()}</div><div className="business-info"><strong>{b.name}{b.verified&&' ✓'}</strong><span>@{b.handle} · {b.category}</span><p>{b.description||'Business profile on GRIN.'}</p>{b.location&&<small>📍 {b.location}</small>}</div><div className="business-actions"><button className="secondary-btn" onClick={()=>openBusinessProfile(b)}>View profile</button>{b.owner_id!==session.user.id&&<button className="secondary-btn" onClick={()=>followBusiness(b.id)}>Follow</button>}<button className="primary small-btn" onClick={()=>createLead(b.id)}>Contact</button></div></article>)}</div>}</div></div></div> : active === 'creators' ? <div className="explore-page"><div className="feed-head"><div><h1>Creators</h1><p>Discover people building, making and creating on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={saveCreator}><h2>Your creator profile</h2><input placeholder="Headline" value={creatorForm.headline} onChange={e=>setCreatorForm({...creatorForm,headline:e.target.value})}/><input placeholder="Category" value={creatorForm.category} onChange={e=>setCreatorForm({...creatorForm,category:e.target.value})}/><textarea placeholder="Creator bio" value={creatorForm.bio} onChange={e=>setCreatorForm({...creatorForm,bio:e.target.value})}/><input placeholder="Location" value={creatorForm.location} onChange={e=>setCreatorForm({...creatorForm,location:e.target.value})}/><input placeholder="Website" value={creatorForm.website} onChange={e=>setCreatorForm({...creatorForm,website:e.target.value})}/><input type="number" placeholder="Rate" value={creatorForm.rate} onChange={e=>setCreatorForm({...creatorForm,rate:e.target.value})}/>{creatorNotice&&<div className="profile-notice">{creatorNotice}</div>}<button className="primary">Save creator profile</button></form><div className="explore-grid">{creators.map(x=><article className="explore-card" key={x.user_id}><div className="chat-avatar">{(x.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><strong>{x.grin_profiles?.display_name||'GRIN Creator'}</strong><span>{x.headline||x.category}</span><p>{x.bio}</p><small>{x.location}</small><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following':'Follow creator'}</button></article>)}</div></div>
 : active === 'marketplace' ? <div className="explore-page"><div className="feed-head"><div><h1>Marketplace</h1><p>Buy, sell and discover things through GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createListing}><h2>Publish a listing</h2><input placeholder="Title" value={listingForm.title} onChange={e=>setListingForm({...listingForm,title:e.target.value})} required/><textarea placeholder="Description" value={listingForm.description} onChange={e=>setListingForm({...listingForm,description:e.target.value})}/><input placeholder="Category" value={listingForm.category} onChange={e=>setListingForm({...listingForm,category:e.target.value})}/><input type="number" placeholder="Price" value={listingForm.price} onChange={e=>setListingForm({...listingForm,price:e.target.value})}/><input placeholder="External purchase/contact URL" value={listingForm.external_url} onChange={e=>setListingForm({...listingForm,external_url:e.target.value})}/>{listingNotice&&<div className="profile-notice">{listingNotice}</div>}<button className="primary">Publish listing</button></form><div className="explore-grid">{listings.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.price!=null?x.currency+' '+Number(x.price).toLocaleString():'Contact seller'}</b>{x.external_url&&<a href={x.external_url} target="_blank" rel="noreferrer">View / buy</a>}<button className="secondary-btn" onClick={()=>setShareListingTarget(x)}>Share to chat</button></article>)}</div></div>
 : active === 'jobs' ? <div className="explore-page"><div className="feed-head"><div><h1>Jobs & Gigs</h1><p>Find work, clients and collaborators on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createJob}><h2>Post a job or gig</h2><input placeholder="Title" value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} required/><textarea placeholder="Describe the work" value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} required/><input placeholder="Category" value={jobForm.category} onChange={e=>setJobForm({...jobForm,category:e.target.value})}/><input type="number" placeholder="Budget" value={jobForm.budget} onChange={e=>setJobForm({...jobForm,budget:e.target.value})}/>{jobNotice&&<div className="profile-notice">{jobNotice}</div>}<button className="primary">Post job</button></form><div className="explore-grid">{jobs.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.budget!=null?x.currency+' '+Number(x.budget).toLocaleString():'Budget open'}</b>{x.poster_id!==session.user.id&&<button className="secondary-btn" onClick={()=>applyJob(x)}>Apply</button>}</article>)}</div></div> : active === 'notifications' ? <div className="notifications-page"><div className="feed-head"><div><h1>Notifications {notifications.some(n=>!n.read_at)&&<span className="nav-badge">{notifications.filter(n=>!n.read_at).length}</span>}</h1><p>Stay in the loop with what happens around you.</p></div><div className="notification-actions"><button className="secondary-btn" onClick={async()=>{if(typeof Notification==='undefined'){setSearchNotice('This browser does not support system notifications.');return;}const permission=await Notification.requestPermission();setSearchNotice(permission==='granted'?'System notifications enabled.':permission==='denied'?'Notifications are blocked in browser settings.':'Notification permission was not granted.');}}>Enable notifications</button><button className="secondary-btn" onClick={markNotificationsRead}>Mark all read</button></div></div>{searchNotice&&<div className="search-feedback" role="status">{searchNotice}</div>}<div className="notification-list">{notifications.length===0&&<div className="empty-state">No notifications yet.</div>}{notifications.map(n=><button key={n.id} className={n.read_at?'notification-row':'notification-row unread'} onClick={()=>openNotification(n)}><span className="chat-avatar" aria-label={"Open "+(n.grin_profiles?.display_name||'GRIN User')+"'s profile"} onClick={event=>{event.stopPropagation();openPersonProfile({id:n.actor_id,...n.grin_profiles});}} style={{cursor:'pointer'}}>{n.grin_profiles?.avatar_url?<img src={n.grin_profiles.avatar_url} alt=""/>:(n.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</span><span><span onClick={event=>{event.stopPropagation();openPersonProfile({id:n.actor_id,...n.grin_profiles});}} style={{fontWeight:650,cursor:'pointer'}}>{n.grin_profiles?.display_name||'GRIN User'}</span><span>{n.body}</span><small>{new Date(n.created_at).toLocaleString()}</small></span></button>)}</div></div> : active === 'status' ? <div className="feed-page"><div className="feed-head"><div><h1>Status</h1><p>Share a moment. Catch up with your people.</p></div></div><section className="grin-status-section" aria-label="Status updates"><div className="grin-status-heading"><div><h2>Status</h2><p>Everyday moments from your people · lasts 48 hours</p></div><button type="button" className="grin-add-status" onClick={()=>setShowStoryComposer(value=>!value)}><Plus size={16}/>{showStoryComposer?'Close':'Add status'}</button></div><div className="grin-stories-strip"><button type="button" className="grin-story-add" onClick={()=>{const mine=stories.filter(item=>item.author_id===session.user.id);if(mine.length)openStatusGroup(session.user.id);else setShowStoryComposer(true);}} aria-label="Open your status"><span className="grin-story-ring add">{profile?.avatar_url?<img src={profile.avatar_url} alt=""/>:<span>{(profile?.display_name||profile?.username||'G').slice(0,1).toUpperCase()}</span>}<i className="grin-status-plus"><Plus size={13}/></i></span><small>My status</small><em>{stories.some(item=>item.author_id===session.user.id)?'View update':'Tap to add'}</em></button>{storyGroups.filter(group=>group.authorId!==session.user.id).slice(0,20).map(group=><button type="button" className="grin-story-item" key={group.authorId} onClick={()=>openStatusGroup(group.authorId)} aria-label={'View status from '+(group.profile?.display_name||group.profile?.username||'GRIN user')}><span className="grin-story-ring"><span className="grin-status-avatar">{group.profile?.avatar_url?<img src={group.profile.avatar_url} alt=""/>:<span>{(group.profile?.display_name||group.profile?.username||'G').slice(0,1).toUpperCase()}</span>}</span></span><small>{group.profile?.display_name||group.profile?.username||'GRIN user'}</small><em>{group.items.length} update{group.items.length===1?'':'s'}</em></button>)}</div>{showStoryComposer&&<form className="grin-status-composer" onSubmit={createStory}><div className="grin-status-composer-title"><strong>Share a status</strong><span>Visible for 48 hours</span></div><textarea value={storyCaption} onChange={e=>setStoryCaption(e.target.value)} placeholder="What’s happening? Add a photo, video or a thought…" maxLength={500}/><div className="grin-status-composer-actions"><label className="media-pick">📷 Photo / Video<input id="grin-story-input" type="file" accept="image/*,video/*" onChange={e=>setStoryFile(e.target.files?.[0]||null)}/></label>{storyFile&&<span className="grin-status-file">{storyFile.name}</span>}<span className="grin-status-spacer"/><span className="grin-status-count">{storyCaption.length}/500</span><button className="primary" type="submit" disabled={(!storyCaption.trim()&&!storyFile)}>Share status</button></div>{storyNotice&&<div className="profile-notice">{storyNotice}</div>}</form>}</section></div> : active === 'discover' ? <div className="feed-page">
<div className="feed-head"><div><h1>Home</h1><p>Your people. Your interests. Your GRIN.</p></div><button className="mobile-create-shortcut" onClick={()=>document.getElementById('grin-post-composer')?.scrollIntoView({behavior:'smooth',block:'center'})}>＋ Post</button></div><div className="feed-tabs"><button className={feedMode==='for-you'?'active':''} onClick={()=>setFeedMode('for-you')}>For You</button><button className={feedMode==='following'?'active':''} onClick={()=>setFeedMode('following')}>Following</button><button className={feedMode==='trending'?'active':''} onClick={()=>setFeedMode('trending')}>Trending</button></div><div className="explore-search"><Search size={19}/><input type="search" value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchExplore(exploreQuery)} placeholder="Search people, businesses, creators, listings and jobs…" aria-label="Search all of GRIN"/><button className="primary" type="button" disabled={exploreLoading||!exploreQuery.trim()} onClick={()=>searchExplore(exploreQuery)}>{exploreLoading?'Searching…':'Search GRIN'}</button></div>{(exploreQuery.trim()||searchNotice)&&<div className="search-feedback" aria-live="polite">{exploreLoading?'Looking across people, businesses, creators, listings and jobs…':searchNotice||(()=>{const total=Object.values(exploreResults).reduce((n,rows)=>n+rows.length,0);return total?total+' result'+(total===1?'':'s')+' found across GRIN':'No matches yet. Try a different name or keyword.'})()}</div>}<div className="suggestions-card"><div className="feed-head"><div><h2>Discover on GRIN</h2><p>People, creators and businesses worth connecting with.</p></div></div><div className="suggestions-section"><h3>People you may know</h3><div className="suggestions-row">{suggestedPeople.map(p=><article className="suggestion" key={p.id}><div className="chat-avatar">{(p.display_name||'G').slice(0,2).toUpperCase()}</div><button className="suggestion-person-link" onClick={()=>openPersonProfile(p)}><strong>{p.display_name||'GRIN User'}</strong><span>@{p.username||'user'}{p.mutualCount?' · '+p.mutualCount+' mutual':''}</span></button><button className="secondary-btn" onClick={async()=>{if(await togglePersonFollow(p))setSuggestedPeople(x=>x.filter(v=>v.id!==p.id));}}>{followedIds.has(p.id)?'Following':'Follow'}</button></article>)}</div></div><div className="suggestions-section"><h3>Creators to discover</h3><div className="suggestions-row">{suggestedCreators.map(x=><article className="suggestion" key={x.user_id}><div className="chat-avatar">{(x.grin_profiles?.display_name||'C').slice(0,2).toUpperCase()}</div><strong>{x.grin_profiles?.display_name||'Creator'}</strong><span>{x.category||x.headline||'Creator'}</span><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following':'Follow creator'}</button></article>)}</div></div><div className="suggestions-section"><h3>Businesses to discover</h3><div className="suggestions-row">{suggestedBusinesses.map(x=><article className="suggestion" key={x.id}><div className="chat-avatar">{(x.name||'B').slice(0,2).toUpperCase()}</div><strong>{x.name}</strong><span>{x.category||'Business'}{x.verified?' · ✓':''}</span><button className="secondary-btn" onClick={()=>openBusinessProfile(x)}>View business</button></article>)}</div></div></div>{businessView && (
  <div className="profile-modal">
    <div className="profile-card">
      <button className="secondary-btn" onClick={()=>setBusinessView(null)}>Close</button>
      {businessView.cover_url&&<img className="business-cover" src={businessView.cover_url} alt=""/>}
      <div className="profile-avatar-large">{businessView.logo_url?<img src={businessView.logo_url} alt=""/>:businessView.name.slice(0,2).toUpperCase()}</div>
      <h2>{businessView.name}{businessView.verified&&' ✓'}</h2>
      <p>@{businessView.handle} · {businessView.category}</p>
      <p>{businessView.description||'Business profile on GRIN.'}</p>
      {businessView.location&&<p>📍 {businessView.location}</p>}
      <div className="profile-stats"><span><b>{businessFollowerCount}</b> followers</span><span><b>{businessView.services.length}</b> services</span><span><b>{businessView.products.length}</b> products</span></div>
      {businessView.owner_id!==session.user.id&&<><button className="primary" onClick={toggleBusinessFollow}>{businessFollowed?'Following':'Follow business'}</button><button className="secondary-btn" onClick={()=>{const b=businessView;setBusinessView(null);setShareProfileTarget({type:'business',...b});}}>Share to chat</button><button className="secondary-btn" onClick={async()=>{const {data,error}=await supabase.rpc('grin_create_direct_conversation',{other_user:businessView.owner_id});if(!error&&data){const chat={id:data,name:businessView.name,preview:'@'+businessView.handle,initials:businessView.name.slice(0,2).toUpperCase()};setChats(x=>x.some(v=>v.id===data)?x:[chat,...x.filter(v=>v.id!=='welcome')]);setSelected(chat);setBusinessView(null);setActive('chats');}}}>Message</button></>}
      <button className="secondary-btn" onClick={()=>{setBusinessView(null);setActive('business')}}>Open business tools</button>
      <h3>Services</h3>
      {businessView.services.length ? businessView.services.map(s=><div className="profile-post" key={s.id}><strong>{s.name}</strong><p>{s.description}</p>{s.price!=null&&<b>{s.currency} {Number(s.price).toLocaleString()}</b>}</div>) : <p>No services listed yet.</p>}
      <h3>Products</h3>
      {businessView.products.length ? businessView.products.map(item=><div className="profile-post" key={item.id}><strong>{item.name}</strong><p>{item.description}</p>{item.price!=null&&<b>{item.currency} {Number(item.price).toLocaleString()}</b>}{item.product_url&&<a href={item.product_url} target="_blank" rel="noreferrer">View product</a>}</div>) : <p>No products listed yet.</p>}
    </div>
  </div>
)}

{shareListingTarget&&<div className="profile-modal"><div className="profile-card share-card"><button className="secondary-btn" onClick={()=>setShareListingTarget(null)}>Close</button><h2>Share listing to…</h2><p>{shareListingTarget.title}</p><div className="share-chat-list">{chats.filter(x=>x.id!=='welcome').map(chat=><button className="secondary-btn share-chat-item" key={chat.id} onClick={()=>shareListingToChat(chat)}><span className="chat-avatar">🛍️</span><span><strong>{chat.name}</strong><small>{chat.preview||'GRIN chat'}</small></span></button>)}</div></div></div>}{shareProfileTarget&&<div className="profile-modal"><div className="profile-card share-card"><button className="secondary-btn" onClick={()=>setShareProfileTarget(null)}>Close</button><h2>Share {shareProfileTarget.type==='creator'?'creator':'business'} to…</h2><p>Choose a GRIN chat.</p><div className="share-chat-list">{chats.filter(x=>x.id!=='welcome').map(chat=><button className="secondary-btn share-chat-item" key={chat.id} onClick={()=>shareProfileToChat(chat)}><span className="chat-avatar">{(shareProfileTarget.display_name||shareProfileTarget.name||'G').slice(0,2).toUpperCase()}</span><span><strong>{shareProfileTarget.display_name||shareProfileTarget.name}</strong><small>{shareProfileTarget.type==='creator'?'Creator profile':'Business profile'}</small></span></button>)}</div></div></div>}
{exploreQuery&&!exploreLoading&&!profileView&&<div className="explore-results">{[['People',exploreResults.people],['Posts',exploreResults.posts],['Community posts',exploreResults.communityPosts],['Communities',exploreResults.communities],['Businesses',exploreResults.businesses],['Creators',exploreResults.creators],['Marketplace',exploreResults.listings],['Jobs',exploreResults.jobs]].map(([title,rows])=><section key={title}><h2>{title}</h2><div className="explore-grid">{rows.length?rows.map(x=><article className="explore-card" key={x.id}><strong>{x.display_name||x.name||x.title||x.headline||(x.body?x.body.slice(0,90):'GRIN post')}</strong><span>{x.username?'@'+x.username:x.community_id?'Community post':x.author_id?'Post':x.category||x.location||''}</span><p>{x.bio||x.description||x.headline||(x.body?x.body.slice(0,220):'')}</p>{x.username&&<><button className="secondary-btn" onClick={()=>openPersonProfile(x)}>View profile</button>{x.id!==session.user.id&&<button className="secondary-btn" onClick={async()=>{await togglePersonFollow(x);}}>{followedIds.has(x.id)?'Following':'Follow'}</button>}</>}{x.user_id&&<><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following creator':'Follow creator'}</button></>}{x.name&&x.handle&&<button className="secondary-btn" onClick={()=>openBusinessProfile(x)}>View business</button>}{x.body&&x.author_id&&!x.community_id&&<button className="secondary-btn" onClick={()=>{setSharedPostId(x.id);setActive('discover');}}>Open post</button>}{x.body&&x.community_id&&<button className="secondary-btn" onClick={async()=>{const community=communities.find(item=>item.id===x.community_id)||{id:x.community_id,name:x.grin_communities?.name||'Community'};setSelectedCommunity(community);setActive('communities');await loadCommunityPosts(x.community_id);}}>Open community post</button>}{x.description&&x.name&&!x.handle&&<button className="secondary-btn" onClick={()=>{setCommunitySearch(x.name);setActive('communities');}}>Find community</button>}{x.price!=null&&<><b>{x.currency} {Number(x.price).toLocaleString()}</b><button className="secondary-btn" onClick={()=>toggleSavedListing(x.id)}>{savedListings.has(x.id)?'Saved':'Save listing'}</button></>}{x.budget!=null&&<b>{x.currency} {Number(x.budget).toLocaleString()}</b>}</article>):<div className="empty-state">No {title.toLowerCase()} found.</div>}</div></section>)}</div>}
<form id="grin-post-composer" className="post-composer" onSubmit={createPost}>
  <textarea value={postBody} onChange={e=>setPostBody(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/>
  {postFile&&<div className="file-chip">📎 {postFile.name} <button type="button" onClick={()=>{setPostFile(null);const x=document.getElementById('grin-media-input');if(x)x.value='';}}>×</button></div>}
  <div className="post-actions"><label className="media-pick">📷 Photo / Video<input id="grin-media-input" type="file" accept="image/*,video/*" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><span>{postBody.length}/5000</span><button className="primary" type="submit" disabled={(!postBody.trim()&&!postFile)||postLoading}>{postLoading?'Posting...':'Post to GRIN'}</button></div>
  {postNotice&&<div className="profile-notice">{postNotice}</div>}
  {externalShareNotice&&<div className="profile-notice">{externalShareNotice}<button type="button" className="secondary-btn" onClick={()=>setExternalShareNotice('')}>Dismiss</button></div>}
  <button type="button" className="secondary-btn" onClick={()=>setShowPollComposer(x=>!x)}>{showPollComposer?'Remove poll':'Add poll'}</button>
  {showPollComposer&&<div className="poll-composer"><input value={pollQuestion} onChange={e=>setPollQuestion(e.target.value)} placeholder="Ask a question..." maxLength={300}/>{pollOptions.map((o,i)=><div className="poll-option-row" key={i}><input value={o} onChange={e=>setPollOptions(x=>x.map((v,j)=>j===i?e.target.value:v))} placeholder={'Option '+(i+1)} maxLength={100}/>{pollOptions.length>2&&<button type="button" onClick={()=>setPollOptions(x=>x.filter((_,j)=>j!==i))}>×</button>}</div>)}<button type="button" className="secondary-btn" onClick={()=>setPollOptions(x=>[...x,''])}>+ Add option</button></div>}
</form>
{(feedMode==='following'?posts.filter(p=>followedIds.has(p.author_id)||p.author_id===session.user.id):feedMode==='trending'?[...posts].sort((a,b)=>((reactionCounts[b.id]||0)+(commentCounts[b.id]||0))-((reactionCounts[a.id]||0)+(commentCounts[a.id]||0))):posts).length===0 ? <div className="feed-empty-state" role="status"><strong>{feedMode==='following'?'Your Following feed is quiet': 'It’s early days on GRIN'}</strong><p>{feedMode==='following'&&posts.length>0?'Posts from people you follow will appear here. Follow a few people to build your feed.':'There are no posts to show yet. Share something with the community to get things started.'}</p>{feedMode==='following'&&posts.length>0 ? <button type="button" className="secondary-btn" onClick={()=>setActive('explore')}>Discover people</button> : <button type="button" className="secondary-btn" onClick={()=>document.getElementById('grin-post-composer')?.scrollIntoView({behavior:'smooth',block:'center'})}>Create a post</button>}</div> : (feedMode==='following'?posts.filter(p=>followedIds.has(p.author_id)||p.author_id===session.user.id):feedMode==='trending'?[...posts].sort((a,b)=>((reactionCounts[b.id]||0)+(commentCounts[b.id]||0))-((reactionCounts[a.id]||0)+(commentCounts[a.id]||0))):posts).map(p=><article className="post-card" key={p.id}>
  <div className="post-author"><button type="button" className="chat-avatar" aria-label={"Open "+(p.grin_profiles?.display_name||'GRIN User')+"'s profile"} onClick={()=>openPersonProfile({id:p.author_id,...p.grin_profiles})} style={{border:0,cursor:'pointer'}}>{p.grin_profiles?.avatar_url?<img src={p.grin_profiles.avatar_url} alt=""/>:(p.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</button><div><button type="button" onClick={()=>openPersonProfile({id:p.author_id,...p.grin_profiles})} style={{border:0,padding:0,background:'transparent',color:'inherit',font:'inherit',fontWeight:650,cursor:'pointer',textAlign:'left'}}>{p.grin_profiles?.display_name||'GRIN User'}</button><span>@{p.grin_profiles?.username||'user'} · {new Date(p.created_at).toLocaleString()}</span></div></div>
  {p.repost_of_id&&<div className="repost-label">🔁 Reposted post</div>}
  {p.author_id===session.user.id&&<div className="own-post-tools"><span>Your post</span><button type="button" className="own-post-menu-trigger" aria-label="Post options" title="Post options" aria-expanded={ownPostMenuId===p.id} onClick={()=>setOwnPostMenuId(ownPostMenuId===p.id?null:p.id)}><MoreHorizontal size={20}/></button>{ownPostMenuId===p.id&&<div className="own-post-menu"><button type="button" onClick={()=>{setEditingPostId(editingPostId===p.id?null:p.id);setEditingPostBody(p.body||'');setPostNotice('');setOwnPostMenuId(null);}}><Pencil size={15}/>{editingPostId===p.id?'Cancel edit':'Edit post'}</button><button type="button" className="danger-option" disabled={postMutationBusy} onClick={()=>{setOwnPostMenuId(null);deleteOwnPost(p);}}><Trash2 size={15}/>Delete post</button></div>}</div>}
  {editingPostId===p.id?<div className="post-edit-box"><textarea aria-label="Edit your post" value={editingPostBody} onChange={e=>setEditingPostBody(e.target.value)} maxLength={5000} rows={4}/><div className="post-edit-actions"><span>{editingPostBody.length}/5000</span><button type="button" className="primary" disabled={postMutationBusy||!editingPostBody.trim()} onClick={()=>savePostEdit(p)}>{postMutationBusy?'Saving…':'Save changes'}</button></div></div>:<p className="post-body">{p.body}</p>}
  {p.media_url&&p.media_type==='image'&&<img className="post-media" src={p.media_url} alt=""/>}{p.media_url&&p.media_type==='video'&&<video className="post-media" src={p.media_url} controls/>}
  {polls[p.id]&&<div className="poll-card"><strong>{polls[p.id].question}</strong>{polls[p.id].grin_poll_options?.map(o=>{const count=pollVoteCounts[polls[p.id].id]?.[o.id]||0;const total=Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0);const pct=total?Math.round(count*100/total):0;return <button type="button" className={pollVotes[polls[p.id].id]===o.id?'poll-choice selected':'poll-choice'} key={o.id} onClick={()=>votePoll(polls[p.id],o.id)}><span>{o.option_text}</span><b>{pct}%</b></button>})}<small>{Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0)} vote{Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0)===1?'':'s'} · {pollVotes[polls[p.id].id]?'Your vote is recorded':'Choose an option'} · {polls[p.id].expires_at&&new Date(polls[p.id].expires_at)>new Date()?'Open':'Closed'}</small></div>}
  <div className="post-footer"><div className="reaction-wrap"><button type="button" aria-expanded={reactionMenu===p.id} aria-label="Choose a reaction" onClick={()=>setReactionMenu(reactionMenu===p.id?null:p.id)}>{({like:'👍',love:'❤️',laugh:'😂',wow:'😮',sad:'😢',angry:'😡'})[reactionMine[p.id]]||'👍'} React <span>{reactionCounts[p.id]||0}</span></button>{reactionMenu===p.id&&<div className="reaction-menu" role="group" aria-label="Post reactions">{[{value:'like',emoji:'👍',label:'Like'},{value:'love',emoji:'❤️',label:'Love'},{value:'laugh',emoji:'😂',label:'Laugh'},{value:'wow',emoji:'😮',label:'Wow'},{value:'sad',emoji:'😢',label:'Sad'},{value:'angry',emoji:'😡',label:'Angry'}].map(r=><button key={r.value} type="button" aria-label={r.label} title={r.label} onClick={()=>reactToPost(p.id,r.value)}>{r.emoji}</button>)}</div>}</div><button type="button" onClick={()=>toggleComments(p.id)}>💬 Comment <span>{commentCounts[p.id]||0}</span></button><button onClick={()=>repostPost(p)}>🔁 Repost</button><button onClick={()=>toggleBookmark(p.id)}>🔖 {bookmarks.has(p.id)?'Saved':'Save'}</button><button onClick={()=>{setExternalShareNotice('');sharePostExternally(p);}}>↗ Share link</button><button onClick={()=>setSharePostTarget(p)}>✉ Send in GRIN</button></div>
  {openComments===p.id&&<div className="comments">{commentNotice&&<p className="profile-notice" role="alert">{commentNotice}</p>}<div className="comment-list">{(comments[p.id]||[]).map(c=><div className="comment" key={c.id}><button type="button" className="chat-avatar" aria-label={"Open "+(c.grin_profiles?.display_name||'GRIN User')+"'s profile"} onClick={()=>openPersonProfile({id:c.author_id,...c.grin_profiles})} style={{border:0,cursor:'pointer'}}>{c.grin_profiles?.avatar_url?<img src={c.grin_profiles.avatar_url} alt=""/>:(c.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</button><div><button type="button" onClick={()=>openPersonProfile({id:c.author_id,...c.grin_profiles})} style={{border:0,padding:0,background:'transparent',color:'inherit',font:'inherit',fontWeight:650,cursor:'pointer',textAlign:'left'}}>{c.grin_profiles?.display_name||'GRIN User'}</button><p>{c.body}</p></div></div>)}</div><div className="comment-compose"><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} placeholder="Write a comment..."/><button className="send" onClick={()=>addComment(p.id)}><Send size={16}/></button></div></div>}
</article>)}
</div> : active === 'profile' ? <div className="profile-page"><div className="profile-cover"><div className="profile-avatar-large">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.display_name || 'G').slice(0,2).toUpperCase()}</div><div><h1>{profile?.display_name || 'GRIN User'}</h1><p>@{profile?.username || 'user'}</p><p className="profile-bio">{profile?.bio || 'Add a little about yourself so people know you.'}</p><div className="profile-cover-actions"><span className="profile-post-count">{posts.filter(p=>p.author_id===session.user.id).length} posts</span><button type="button" className="secondary-btn" onClick={()=>shareProfileExternally(profile)}>↗ Share profile link</button>{externalProfileShareNotice&&<small className="profile-notice">{externalProfileShareNotice}</small>}</div></div></div><form className="profile-card" onSubmit={saveProfile}><h2>Edit profile</h2><label>Username<input value={profileForm.username} onChange={e=>setProfileForm({...profileForm,username:e.target.value})} minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" required /></label><label>Display name<input value={profileForm.display_name} onChange={e=>setProfileForm({...profileForm,display_name:e.target.value})} maxLength={60} required /></label><label>Bio<textarea value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} maxLength={160} placeholder="Tell people a little about you..." /></label><label>Phone number (optional)<input type="tel" inputMode="tel" autoComplete="tel" value={profileForm.phone_e164} onChange={e=>setProfileForm({...profileForm,phone_e164:e.target.value})} placeholder="+2348012345678" /></label><small className="profile-private-note">Private — saved separately from your public profile and visible only to you. Contact matching will remain off until phone verification is safely implemented.</small><label>Profile photo<div className="avatar-upload-row">{(avatarPreview || profile?.avatar_url) && <img className="avatar-upload-preview" src={avatarPreview || profile.avatar_url} alt="Profile photo preview" />}<input id="grin-avatar-input" type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0]||null;setAvatarFile(file);setAvatarPreview(file?URL.createObjectURL(file):'');}} /></div><small>Choose a photo from your device. JPG, PNG or another image format, up to 5 MB.</small></label>{profileNotice && <div className="profile-notice">{profileNotice}</div>}<button className="primary" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button></form></div> : <><div className="chat-list"><div className="section-head"><div><h1>Messages {Object.values(unreadCounts).reduce((a,b)=>a+b,0)>0&&<span className="nav-badge">{Object.values(unreadCounts).reduce((a,b)=>a+b,0)}</span>}</h1><p>Your conversations, all in one place.</p></div><button className="icon-btn" onClick={()=>{setGroupMode(x=>!x);setGroupSelected([]);setGroupName('');setAuthError('');}} title="Create a group conversation" aria-label="Create a group conversation"><Plus size={20}/></button></div><input className="chat-search" value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search messages or people..." aria-label="Search your conversations"/>{groupMode&&<div className="group-builder"><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Group name" maxLength={80}/><p>{groupSelected.length} member{groupSelected.length===1?'':'s'} selected</p><div className="group-chips">{groupSelected.map(p=><button type="button" key={p.id} onClick={()=>setGroupSelected(x=>x.filter(v=>v.id!==p.id))}>{p.display_name||p.username} ×</button>)}</div><button className="primary" onClick={createGroup}>Create group</button></div>}<div className="chat-folder-toggle"><button type="button" className={!showArchivedChats?'active':''} onClick={()=>setShowArchivedChats(false)}>All chats</button><button type="button" className={showArchivedChats?'active':''} onClick={()=>setShowArchivedChats(true)}>Archived {archivedChatIds.length>0&&<span>{archivedChatIds.length}</span>}</button></div>{chats.filter(c=>(showArchivedChats?archivedChatIds.includes(c.id):!archivedChatIds.includes(c.id))&&(c.name+' '+c.preview).toLowerCase().includes(chatSearch.toLowerCase())).sort((a,b)=>Number(pinnedChatIds.includes(b.id))-Number(pinnedChatIds.includes(a.id))).map(c=><div className="chat-row-wrap" key={c.id}><button onClick={()=>{setSelected(c);setChatOpen(true);setAuthError('');}} className={selected.id===c.id?'chat-row selected':'chat-row'}><div className="chat-avatar">{c.avatar_url?<img src={c.avatar_url} alt=""/>:c.initials}</div><div className="chat-meta"><strong>{pinnedChatIds.includes(c.id)&&<Pin size={12} className="chat-pinned-indicator"/>}{c.name}{mutedChatIds.includes(c.id)&&<BellOff size={12} className="chat-muted-indicator"/>}</strong><span>{c.preview}</span>{unreadCounts[c.id]>0&&<b className="unread-badge">{unreadCounts[c.id]}</b>}</div></button><button type="button" className={pinnedChatIds.includes(c.id)?'chat-pin-btn is-pinned':'chat-pin-btn'} onClick={event=>{event.stopPropagation();togglePinnedChat(c.id);}} aria-label={pinnedChatIds.includes(c.id)?'Unpin '+c.name:'Pin '+c.name} title={pinnedChatIds.includes(c.id)?'Unpin conversation':'Pin conversation'}><Pin size={15}/></button><button type="button" className={mutedChatIds.includes(c.id)?'chat-action-btn is-muted':'chat-action-btn'} onClick={event=>{event.stopPropagation();toggleChatPreference(c.id,'mute');}} aria-label={mutedChatIds.includes(c.id)?'Unmute '+c.name:'Mute '+c.name} title={mutedChatIds.includes(c.id)?'Unmute conversation':'Mute notifications'}>{mutedChatIds.includes(c.id)?<Volume2 size={15}/>:<BellOff size={15}/>}</button><button type="button" className={archivedChatIds.includes(c.id)?'chat-action-btn is-archived':'chat-action-btn'} onClick={event=>{event.stopPropagation();toggleChatPreference(c.id,'archive');}} aria-label={archivedChatIds.includes(c.id)?'Unarchive '+c.name:'Archive '+c.name} title={archivedChatIds.includes(c.id)?'Unarchive conversation':'Archive conversation'}>{archivedChatIds.includes(c.id)?<MessageCircle size={15}/>:<Archive size={15}/>}</button></div>)}{chats.filter(c=>(showArchivedChats?archivedChatIds.includes(c.id):!archivedChatIds.includes(c.id))&&(c.name+' '+c.preview).toLowerCase().includes(chatSearch.toLowerCase())).length===0&&<div className="chat-empty-state"><MessageCircle size={24}/><strong>{showArchivedChats?'No archived conversations':chatSearch?'No chats match that search':'Your conversations start here'}</strong><span>{showArchivedChats?'Conversations you archive will appear here.':chatSearch?'Try another name or clear the search.':'Search for someone above to say hello.'}</span></div>}</div><div className={chatOpen?'conversation chat-open':'conversation'}><div className="conversation-head"><button type="button" className="chat-back-button" onClick={()=>setChatOpen(false)} aria-label="Back to chat list"><ChevronLeft size={20}/></button><button type="button" className="chat-avatar" aria-label={"Open "+selected.name+"'s profile"} onClick={()=>selected.peer_id&&openPersonProfile({id:selected.peer_id,username:selected.peer_username,display_name:selected.name,avatar_url:selected.avatar_url})} style={{border:0,cursor:selected.peer_id?'pointer':'default'}}>{selected.avatar_url?<img src={selected.avatar_url} alt=""/>:selected.initials}</button><div><strong>{selected.peer_id?<button type="button" className="chat-profile-link" onClick={()=>openPersonProfile({id:selected.peer_id,username:selected.peer_username,display_name:selected.name,avatar_url:selected.avatar_url})}>{selected.name}</button>:selected.name}</strong><span>{selected.id === 'welcome' ? 'GRIN' : (selected.peer_id&&onlineUsers[selected.peer_id] ? 'online' : 'offline')}{Object.values(typingUsers).some(Boolean) ? ' · typing…' : ''}</span></div></div><div className="messages">{selected.id !== "welcome" && <div className="message-search-wrap"><Search size={16}/><input className="message-search" value={messageSearch} onChange={e=>setMessageSearch(e.target.value)} placeholder="Search messages in this chat…" aria-label="Search messages in this conversation"/>{messageSearch&&<button type="button" onClick={()=>setMessageSearch('')} aria-label="Clear message search"><X size={15}/></button>}</div>}{messageSearch.trim()&&<div className="message-search-count" role="status">{messages.filter(m=>String(m.body||'').toLowerCase().includes(messageSearch.trim().toLowerCase())).length} matching message(s) in loaded history</div>}{selected.id !== "welcome" && hasMoreMessages && <button type="button" className="secondary-btn" onClick={loadOlderMessages} disabled={loadingOlderMessages}>{loadingOlderMessages ? "Loading older messages…" : "Load older messages"}</button>}{selected.id === 'welcome' && <div className="welcome"><div className="welcome-icon">☺</div><h2>Welcome to GRIN</h2><p>Your real account is connected. The next layer is finding people and starting conversations.</p></div>}{messages.filter(m=>!messageSearch.trim()||String(m.body||'').toLowerCase().includes(messageSearch.trim().toLowerCase())).map(m=><div className={m.sender_id===session.user.id?'bubble mine':'bubble'} key={m.id}>{m.deleted_at?<em>This message was deleted.</em>:<>{m.sender_id!==session.user.id&&<small className="message-sender-name">{m.sender_profile?.display_name||m.sender_profile?.username||'GRIN user'}</small>}<div>{m.reply_to_id&&<div className="reply-preview">Replying to a message</div>}{m.media_url&&(m.media_type==='audio'?<audio src={m.media_url} controls preload="metadata" className="message-audio" aria-label="Voice note"/>:(m.media_type==='video'?<video src={m.media_url} controls className="message-media"/>:<img src={m.media_url} className="message-media" alt=""/>))}{m.shared_post_id&&<div className="shared-post-card"><strong>Shared GRIN post</strong><span>{m.body}</span></div>}{m.shared_community_post_id&&<div className="shared-post-card"><strong>Shared community post</strong><span>{m.body}</span></div>}{m.shared_creator_id&&<div className="shared-post-card"><strong>🎨 {m.shared_creator?.grin_profiles?.display_name||'GRIN Creator'}</strong><span>{m.shared_creator?.headline||m.shared_creator?.category||'Creator profile'}</span><small>@{m.shared_creator?.grin_profiles?.username||'creator'} · {m.shared_creator?.location||'GRIN'}</small></div>}{m.shared_business_id&&<div className="shared-post-card"><strong>💼 {m.shared_business?.name||'GRIN Business'}</strong><span>{m.shared_business?.category||'Business profile'}</span><small>@{m.shared_business?.handle||'business'} · {m.shared_business?.location||'GRIN'}</small></div>}{m.shared_listing_id&&<div className="shared-post-card"><strong>🛍️ {m.shared_listing?.title||'GRIN Marketplace listing'}</strong><span>{m.shared_listing?.category||'Marketplace'}</span><small>{m.shared_listing?.price!=null?(m.shared_listing?.currency||'NGN')+' '+Number(m.shared_listing.price).toLocaleString():'Contact seller'}</small></div>}{m.body?.split(' ').map((part,index)=>part.startsWith('https://')||part.startsWith('http://')?<a key={index} href={part} target="_blank" rel="noreferrer">{part}</a>:part+' ')}</div>{m.edited_at&&<small>edited</small>}<div className="message-actions"><button onClick={()=>setReplyingTo(m)}>Reply</button><button onClick={()=>toggleMessageReaction(m,'❤️')}>❤️ {(messageReactions[m.id]||[]).filter(x=>x.reaction==='❤️').length||''}</button>{m.sender_id===session.user.id&&<><button onClick={()=>editMessage(m)}>Edit</button><button onClick={()=>deleteMessage(m)}>Delete</button></>}</div>{m.sender_id===session.user.id&&selected.kind==='direct'&&peerReadAt&&new Date(peerReadAt)>=new Date(m.created_at)&&<small className="message-read-receipt" title="The other person has opened this conversation">✓✓ Seen</small>}</>}</div>)}<div ref={messagesEndRef} aria-hidden="true" /></div>{sharePostTarget&&<div className="profile-modal"><div className="profile-card share-card"><button type="button" className="secondary-btn" disabled={sharePostSending} onClick={()=>setSharePostTarget(null)}>Close</button><h2>Send post to…</h2><p>Choose a GRIN chat.</p>{sharePostNotice&&<p className="profile-notice" role="alert">{sharePostNotice}</p>}<div className="share-chat-list">{chats.filter(x=>x.id!=='welcome').length?chats.filter(x=>x.id!=='welcome').map(chat=><button type="button" className="secondary-btn share-chat-item" key={chat.id} disabled={sharePostSending} onClick={()=>sharePostToChat(chat)}><span className="chat-avatar">{chat.initials||chat.name?.slice(0,2)||'G'}</span><span><strong>{sharePostSending?'Sending…':chat.name||'GRIN chat'}</strong><small>{chat.preview||'Conversation'}</small></span></button>):<div className="empty-state"><p>You don’t have a conversation to send this to yet.</p><button type="button" className="primary" onClick={()=>{setSharePostTarget(null);setActive('explore');}}>Find people to message</button></div>}</div></div></div>}<div className="composer">{replyingTo&&<div className="replying">Replying to: {replyingTo.body.slice(0,60)} <button onClick={()=>setReplyingTo(null)}>×</button></div>}<label className="icon-btn file-btn" title="Attach photo or video" aria-label="Attach photo or video">＋<input type="file" accept="image/*,video/*" hidden onChange={e=>setMessageFile(e.target.files?.[0]||null)}/></label><label className="icon-btn file-btn" title="Take a photo" aria-label="Take a photo"><Camera size={19}/><input type="file" accept="image/*" capture="environment" hidden onChange={e=>setMessageFile(e.target.files?.[0]||null)}/></label><button type="button" className="icon-btn" title={isRecordingVoice?'Stop voice note':'Record voice note'} aria-label={isRecordingVoice?'Stop voice note':'Record voice note'} onClick={toggleVoiceRecording} disabled={selected.id==='welcome'}>{isRecordingVoice?<Square size={18}/>:<Mic size={19}/>}</button><div className="chat-emoji-wrap" style={{position:'relative',display:'inline-flex',alignItems:'center'}}><button type="button" className="icon-btn" title="Choose an emoji" aria-label="Choose an emoji" aria-expanded={emojiPickerOpen} onClick={()=>setEmojiPickerOpen(open=>!open)}><Smile size={20}/></button>{emojiPickerOpen&&<div className="chat-emoji-picker" role="group" aria-label="Choose an emoji" style={{position:'absolute',bottom:'calc(100% + 10px)',left:0,zIndex:30,display:'grid',gridTemplateColumns:'repeat(6,minmax(32px,1fr))',gap:4,padding:8,width:240,maxWidth:'80vw',maxHeight:210,overflowY:'auto',background:'var(--card, #fff)',border:'1px solid var(--border, #ddd)',borderRadius:14,boxShadow:'0 8px 28px rgba(0,0,0,.18)'}}>{['😀','😃','😄','😁','😆','😅','😂','🤣','🥹','😊','😇','🙂','🙃','😉','😍','🥰','😘','😋','😎','🤩','🥳','😭','😢','😡','🤬','😤','😱','😮','😴','🤔','🤗','🫡','🙏','👏','👍','👎','❤️','🧡','💛','💚','💙','💜','🖤','💔','🔥','✨','🎉','💯','🤝','💪','🙌','👀'].map(emoji=><button key={emoji} type="button" onClick={()=>{setMessage(current=>current+emoji);setEmojiPickerOpen(false);}} style={{fontSize:22,padding:'5px 0',border:0,borderRadius:8,background:'transparent',cursor:'pointer'}} aria-label={'Insert '+emoji}>{emoji}</button>)}</div>}</div><textarea rows={1} value={message} onChange={e=>{setMessage(e.target.value);broadcastTyping(Boolean(e.target.value.trim()));}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder={selected.id === 'welcome' ? 'Select a chat to start…' : 'Write a message… (Shift+Enter for new line)'} aria-label="Write a message"/>{isRecordingVoice&&<small className="attachment-name" role="status">Recording voice note… tap stop when finished</small>}{messageFile&&<div className="message-attachment-preview">{messageFile.type.startsWith('image/')?<img src={URL.createObjectURL(messageFile)} alt="Attachment preview"/>:<span>{messageFile.type.startsWith('audio/')?'🎙 Voice note':messageFile.type.startsWith('video/')?'🎥 Video':'📎'} {messageFile.name}</span>}<button type="button" onClick={()=>{setMessageFile(null);document.querySelectorAll('.composer input[type=file]').forEach(input=>{input.value='';});}} aria-label="Remove attachment"><X size={15}/></button></div>}<button className="send" onClick={send} disabled={isRecordingVoice||sendingMessage||selected.id==='welcome'} aria-label={sendingMessage?'Sending message':'Send message'}><Send size={18}/></button></div></div></>}</section></main><nav className="mobile-bottom-nav" aria-label="Main navigation"><button className={active==='discover'?'active':''} onClick={()=>setActive('discover')}><House size={20}/><span>Home</span></button><button className={active==='games'?'active':''} onClick={()=>setActive('games')}><Gamepad2 size={20}/><span>Games</span></button><button className={active==='chats'?'active':''} onClick={()=>{setChatOpen(false);setActive('chats');}}><MessageCircle size={20}/><span>Chat</span></button><button className={active==='status'?'active':''} onClick={()=>{setActive('status');setShowMoreMenu(false);}}><Eye size={22}/><span>Status</span></button><button className={active==='directory'?'active':''} onClick={()=>{setActive('directory');setShowMoreMenu(false);}}><MoreHorizontal size={20}/><span>More</span></button><button className={active==='explore'?'active':''} onClick={()=>setActive('explore')}><Search size={20}/><span>Explore</span></button></nav>{profileView && createPortal((
  <div className="profile-modal" onClick={event=>{if(event.target===event.currentTarget)setProfileView(null);}}>
    <div className="profile-card person-profile-card">
      <button className="secondary-btn" onClick={()=>setProfileView(null)}>Close</button>
      <div className="profile-avatar-large">{profileView.avatar_url?<img src={profileView.avatar_url} alt=""/>:(profileView.display_name||'G').slice(0,2).toUpperCase()}</div>
      <h2>{profileView.display_name||'GRIN User'}</h2>
      <p>@{profileView.username||'user'}</p>
      <p>{profileView.bio||'No bio yet.'}</p>
      <div className="profile-stats"><span><b>{profileFollowers}</b> followers</span><span><b>{profileFollowing}</b> following</span><span><b>{profilePosts.length}</b> recent posts</span></div>
      {profileView.type==='person'&&profileView.id!==session.user.id&&<div className="profile-safety-actions"><button type="button" className="secondary-btn" onClick={()=>blockPerson(profileView)}><Ban size={16}/> Block account</button><button type="button" className="secondary-btn" onClick={()=>reportPerson(profileView)}><ShieldAlert size={16}/> Report account</button></div>}
      {profileView.type==='creator' ? <>
        <p>{profileView.headline||'GRIN Creator'} · {profileView.category||'Creator'}</p>
        {profileView.location&&<p>📍 {profileView.location}</p>}
        <div className="profile-stats"><span><b>{profileView.creatorFollowerCount||0}</b> followers</span>{profileView.rate!=null&&<span><b>{profileView.currency||'NGN'} {Number(profileView.rate).toLocaleString()}</b> rate</span>}</div>
        {profileView.creator_id!==session.user.id&&<><button className="primary" onClick={()=>toggleCreatorFollow(profileView.creator_id)}>{profileFollowed?'Following':'Follow creator'}</button><button className="secondary-btn" onClick={()=>messagePerson({id:profileView.creator_id,display_name:profileView.display_name,username:profileView.username,avatar_url:profileView.avatar_url})}>Message creator</button><button className="secondary-btn" onClick={()=>{const p=profileView;setProfileView(null);setShareProfileTarget(p);}}>Share to chat</button><button className="secondary-btn" onClick={()=>shareProfileExternally({username:profileView.username,display_name:profileView.display_name})}>↗ Share profile link</button></>}
      </> : <>
        <div className="profile-stats"><span><b>{profileFollowers}</b> followers</span><span><b>{profileFollowing}</b> following</span><span><b>{profilePosts.length}</b> recent posts</span></div>
        {profileView.id!==session.user.id&&<button className="primary" onClick={togglePersonFollow}>{profileFollowed?'Following':'Follow'}</button>}
        <button className="secondary-btn" onClick={()=>messagePerson(profileView)}>Message</button><button className="secondary-btn" onClick={()=>shareProfileExternally(profileView)}>↗ Share profile link</button>
      </>}
      {profileView.type!=='creator'&&<div className="profile-posts">
        <h3>Recent posts</h3>
        {profilePosts.length > 0 ? (
          profilePosts.map(item => (
            <div className="profile-post" key={item.id}>
              <p>{item.body}</p>
              {item.media_url ? (item.media_type==='video' ? <video src={item.media_url} controls /> : <img src={item.media_url} alt="Post attachment" />) : null}
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>}
    </div>
  </div>
), document.body)}
</div>;
}
