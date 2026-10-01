import { useEffect, useState } from 'react';
import { MessageCircle, Users, Compass, Bell, UserRound, Search, Plus, Send, Smile, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

const fallbackChats = [{ id: 'welcome', name: 'Welcome to GRIN', preview: 'This is where your conversations come alive.', initials: 'G' }];

export default function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('chats');
  const [chats, setChats] = useState(fallbackChats);
  const [selected, setSelected] = useState(fallbackChats[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [people, setPeople] = useState([]);
  const [personSearch, setPersonSearch] = useState('');
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ username:'', display_name:'', bio:'', avatar_url:'' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postNotice, setPostNotice] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [openComments, setOpenComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadChats();
    loadProfile();
    loadPosts();
    loadNotifications();
  }, [session]);

  async function loadNotifications() { const { data } = await supabase.from('grin_notifications').select('id,actor_id,kind,post_id,body,read_at,created_at,grin_profiles:actor_id(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(30); setNotifications(data || []); }
  async function markNotificationsRead() { await supabase.from('grin_notifications').update({read_at:new Date().toISOString()}).eq('user_id',session.user.id).is('read_at',null); setNotifications(x=>x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()}))); }

  async function loadPosts() {
    const { data } = await supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,created_at,grin_profiles(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(50);
    setPosts(data || []);
    if (data?.length) {
      const ids=data.map(p=>p.id);
      const [{data:rx},{data:cm}]=await Promise.all([
        supabase.from('grin_post_reactions').select('post_id').in('post_id',ids),
        supabase.from('grin_post_comments').select('post_id').in('post_id',ids)
      ]);
      const rc={},cc={}; (rx||[]).forEach(x=>rc[x.post_id]=(rc[x.post_id]||0)+1); (cm||[]).forEach(x=>cc[x.post_id]=(cc[x.post_id]||0)+1);
      setReactionCounts(rc); setCommentCounts(cc);
    }
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
      setPostBody(''); setPostFile(null);
      const input=document.getElementById('grin-media-input'); if(input) input.value='';
    }
    setPostLoading(false);
  }

  async function reactToPost(postId) {
    const { data: existing } = await supabase.from('grin_post_reactions').select('reaction').eq('post_id',postId).eq('user_id',session.user.id).maybeSingle();
    if (existing) {
      await supabase.from('grin_post_reactions').delete().eq('post_id',postId).eq('user_id',session.user.id);
      setReactionCounts(x=>({...x,[postId]:Math.max(0,(x[postId]||1)-1)}));
    } else {
      await supabase.from('grin_post_reactions').insert({post_id:postId,user_id:session.user.id,reaction:'like'});
      setReactionCounts(x=>({...x,[postId]:(x[postId]||0)+1}));
    }
  }

  async function loadComments(postId) {
    const { data } = await supabase.from('grin_post_comments').select('id,post_id,user_id,body,created_at,grin_profiles(username,display_name,avatar_url)').eq('post_id',postId).order('created_at');
    setComments(x=>({...x,[postId]:data||[]}));
  }

  async function addComment(postId) {
    const body=commentDraft.trim();
    if(!body) return;
    const {data,error}=await supabase.from('grin_post_comments').insert({post_id:postId,user_id:session.user.id,body}).select('id,post_id,user_id,body,created_at,grin_profiles(username,display_name,avatar_url)').single();
    if(!error&&data){setComments(x=>({...x,[postId]:[...(x[postId]||[]),data]}));setCommentCounts(x=>({...x,[postId]:(x[postId]||0)+1}));setCommentDraft('');}
  }

  async function toggleComments(postId) {
    if(openComments===postId){setOpenComments(null);return;}
    setOpenComments(postId); await loadComments(postId);
  }

  async function loadProfile() {
    const { data } = await supabase.from('grin_profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      setProfileForm({ username:data.username || '', display_name:data.display_name || '', bio:data.bio || '', avatar_url:data.avatar_url || '' });
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true); setProfileNotice('');
    const payload = {
      username: profileForm.username.trim().toLowerCase(),
      display_name: profileForm.display_name.trim() || 'GRIN User',
      bio: profileForm.bio.trim(),
      avatar_url: profileForm.avatar_url.trim() || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('grin_profiles').update(payload).eq('id', session.user.id).select().single();
    if (error) setProfileNotice(error.message);
    else { setProfile(data); setProfileNotice('Profile saved.'); }
    setProfileSaving(false);
  }

  useEffect(() => {
    if (!session || selected.id === 'welcome') return;
    loadMessages(selected.id);
    const channel = supabase.channel('grin:conversation:' + selected.id, { config: { private: false } })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grin_messages', filter: 'conversation_id=eq.' + selected.id }, payload => {
        setMessages(current => current.some(m => m.id === payload.new.id) ? current : [...current, payload.new]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
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
    const { data, error } = await supabase.rpc('grin_create_direct_conversation', { other_user: person.id });
    if (error) { setAuthError(error.message); return; }
    const chat = { id: data, name: person.display_name || person.username, preview: '@' + person.username, initials: (person.display_name || person.username).slice(0, 2).toUpperCase() };
    setChats(current => current.some(x => x.id === chat.id) ? current : [chat, ...current.filter(x => x.id !== 'welcome')]);
    setSelected(chat);
    setActive('chats');
    setPeople([]);
    setPersonSearch('');
  }

  async function loadChats() {
    const { data } = await supabase.from('grin_conversation_members').select('conversation_id, grin_conversations(id, title, kind)').eq('user_id', session.user.id);
    if (!data?.length) return;
    const rows = data.map(x => ({ id: x.conversation_id, name: x.grin_conversations?.title || 'GRIN Chat', preview: 'Start a conversation.', initials: (x.grin_conversations?.title || 'G').slice(0, 2).toUpperCase() }));
    setChats(rows);
    setSelected(rows[0]);
  }

  async function loadMessages(conversationId) {
    const { data } = await supabase.from('grin_messages').select('*').eq('conversation_id', conversationId).order('created_at');
    setMessages(data || []);
  }

  async function send() {
    const body = message.trim();
    if (!body || !session || selected.id === 'welcome') return;
    const { data, error } = await supabase.from('grin_messages').insert({ conversation_id: selected.id, sender_id: session.user.id, body }).select().single();
    if (!error && data) setMessages(current => current.some(m => m.id === data.id) ? current : [...current, data]);
    setMessage('');
  }

  async function authenticate(e) {
    e.preventDefault(); setAuthError('');
    const result = authMode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { username: username.trim() || email.split('@')[0] } } });
    if (result.error) setAuthError(result.error.message);
    else if (authMode === 'signup' && !result.data.session) setAuthError('Check your email to confirm your GRIN account.');
  }

  if (loading) return <div className="auth-screen"><div className="auth-card"><div className="brand large"><span className="brand-mark">☺</span><span>GRIN</span></div><p>Loading...</p></div></div>;

  if (!session) return <div className="auth-screen"><form className="auth-card" onSubmit={authenticate}><div className="brand large"><span className="brand-mark">☺</span><span>GRIN</span></div><h1>{authMode === 'signin' ? 'Welcome back' : 'Create your GRIN account'}</h1><p>People, ideas and moments — all in one place.</p>{authMode === 'signup' && <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required minLength={3}/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required minLength={6}/>{authError && <div className="auth-error">{authError}</div>}<button className="primary" type="submit">{authMode === 'signin' ? 'Sign in' : 'Create account'}</button><button className="switch" type="button" onClick={()=>{setAuthMode(authMode==='signin'?'signup':'signin');setAuthError('')}}>{authMode === 'signin' ? 'Create a new account' : 'I already have an account'}</button></form></div>;

  return <div className="app"><header className="topbar"><div className="brand"><span className="brand-mark">☺</span><span>GRIN</span></div><div className="search people-search"><Search size={18}/><input value={personSearch} onChange={e=>searchPeople(e.target.value)} placeholder="Search people, chats and posts"/>{people.length>0 && <div className="people-results">{people.map(p=><button key={p.id} onClick={()=>startChat(p)}><div className="chat-avatar">{(p.display_name||p.username).slice(0,2).toUpperCase()}</div><div><strong>{p.display_name}</strong><span>@{p.username}</span></div></button>)}</div>}</div><div className="top-actions"><button className="avatar">{(session.user.email || 'G')[0].toUpperCase()}</button><button className="logout" onClick={()=>supabase.auth.signOut()} title="Sign out"><LogOut size={18}/></button></div></header><main className="layout"><aside className="sidebar"><nav>{[[MessageCircle,'Chats','chats'],[Users,'Communities','communities'],[Compass,'Home','discover'],[Bell,'Notifications','notifications'],[UserRound,'Profile','profile']].map(([Icon,label,key])=><button className={active===key?'nav active':'nav'} onClick={()=>setActive(key)} key={key}><Icon size={20}/><span>{label}</span></button>)}</nav><button className="new-chat" onClick={()=>document.querySelector(".people-search input")?.focus()}><Plus size={19}/> New chat</button><div className="side-foot">GRIN <span>v0.2</span></div></aside><section className="content">{active === 'notifications' ? <div className="notifications-page"><div className="feed-head"><div><h1>Notifications</h1><p>Stay in the loop with what happens around you.</p></div><button className="secondary-btn" onClick={markNotificationsRead}>Mark all read</button></div><div className="notification-list">{notifications.length===0&&<div className="empty-state">No notifications yet.</div>}{notifications.map(n=><button key={n.id} className={n.read_at?'notification-row':'notification-row unread'} onClick={async()=>{if(!n.read_at){const now=new Date().toISOString();await supabase.from('grin_notifications').update({read_at:now}).eq('id',n.id);setNotifications(x=>x.map(v=>v.id===n.id?{...v,read_at:now}:v));}}}><div className="chat-avatar">{(n.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{n.grin_profiles?.display_name||'GRIN User'}</strong><span>{n.body}</span><small>{new Date(n.created_at).toLocaleString()}</small></div></button>)}</div></div> : active === 'discover' ? <div className="feed-page"><div className="feed-head"><div><h1>Discover</h1><p>See what people are saying on GRIN.</p></div></div><form className="post-composer" onSubmit={createPost}><textarea value={postBody} onChange={e=>setPostBody(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/>{postFile&&<div className="file-chip">📎 {postFile.name} <button type="button" onClick={()=>{setPostFile(null);const x=document.getElementById('grin-media-input');if(x)x.value='';}}>×</button></div>}<div className="post-actions"><label className="media-pick">📷 Photo / Video<input id="grin-media-input" type="file" accept="image/*,video/*" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><span>{postBody.length}/5000</span><button className="primary" type="submit" disabled={(!postBody.trim()&&!postFile)||postLoading}>{postLoading?'Posting...':'Post to GRIN'}</button></div>{postNotice&&<div className="profile-notice">{postNotice}</div>}</form>{posts.map(p=><article className="post-card" key={p.id}><div className="post-author"><div className="chat-avatar">{p.grin_profiles?.avatar_url?<img src={p.grin_profiles.avatar_url} alt=""/>:(p.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{p.grin_profiles?.display_name||'GRIN User'}</strong><span>@{p.grin_profiles?.username||'user'} · {new Date(p.created_at).toLocaleString()}</span></div></div><p className="post-body">{p.body}</p>{p.media_url&&p.media_type==='image'&&<img className="post-media" src={p.media_url} alt=""/>}{p.media_url&&p.media_type==='video'&&<video className="post-media" src={p.media_url} controls/>}<div className="post-footer"><button onClick={()=>reactToPost(p.id)}>♥ Like <span>{reactionCounts[p.id]||0}</span></button><button onClick={()=>toggleComments(p.id)}>💬 Comment <span>{commentCounts[p.id]||0}</span></button><button onClick={async()=>{const text=p.body||'GRIN post';if(navigator.share){try{await navigator.share({title:'GRIN post',text})}catch{}}else{await navigator.clipboard?.writeText(text);setPostNotice('Post text copied.')}}}>↗ Share</button></div>{openComments===p.id&&<div className="comments"><div className="comment-list">{(comments[p.id]||[]).map(c=><div className="comment" key={c.id}><div className="chat-avatar">{(c.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{c.grin_profiles?.display_name||'GRIN User'}</strong><p>{c.body}</p></div></div>)}</div><div className="comment-compose"><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} placeholder="Write a comment..."/><button className="send" onClick={()=>addComment(p.id)}><Send size={16}/></button></div></div></div></article>)}</div> : active === 'profile' ? <div className="profile-page"><div className="profile-cover"><div className="profile-avatar-large">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.display_name || 'G').slice(0,2).toUpperCase()}</div><div><h1>{profile?.display_name || 'GRIN User'}</h1><p>@{profile?.username || 'user'}</p></div></div><form className="profile-card" onSubmit={saveProfile}><h2>Edit profile</h2><label>Username<input value={profileForm.username} onChange={e=>setProfileForm({...profileForm,username:e.target.value})} minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" required /></label><label>Display name<input value={profileForm.display_name} onChange={e=>setProfileForm({...profileForm,display_name:e.target.value})} maxLength={60} required /></label><label>Bio<textarea value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} maxLength={160} placeholder="Tell people a little about you..." /></label><label>Avatar image URL<input value={profileForm.avatar_url} onChange={e=>setProfileForm({...profileForm,avatar_url:e.target.value})} placeholder="https://..." /></label>{profileNotice && <div className="profile-notice">{profileNotice}</div>}<button className="primary" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button></form></div> : <><div className="chat-list"><div className="section-head"><div><h1>Chats</h1><p>Conversations that come alive.</p></div><button className="icon-btn"><Plus size={20}/></button></div>{chats.map(c=><button key={c.id} onClick={()=>setSelected(c)} className={selected.id===c.id?'chat-row selected':'chat-row'}><div className="chat-avatar">{c.initials}</div><div className="chat-meta"><strong>{c.name}</strong><span>{c.preview}</span></div></button>)}</div><div className="conversation"><div className="conversation-head"><div className="chat-avatar">{selected.initials}</div><div><strong>{selected.name}</strong><span>{selected.id === 'welcome' ? 'GRIN' : 'connected'}</span></div></div><div className="messages">{selected.id === 'welcome' && <div className="welcome"><div className="welcome-icon">☺</div><h2>Welcome to GRIN</h2><p>Your real account is connected. The next layer is finding people and starting conversations.</p></div>}{messages.map(m=><div className={m.sender_id===session.user.id?'bubble mine':'bubble'} key={m.id}>{m.body}</div>)}</div><div className="composer"><button className="icon-btn"><Smile size={20}/></button><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={selected.id === 'welcome' ? 'Create or select a chat...' : 'Write a message...'}/><button className="send" onClick={send}><Send size={18}/></button></div></div></>}</section></main></div>;
}
