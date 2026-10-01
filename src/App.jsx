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
  const [storyCaption,setStoryCaption]=useState('');
  const [storyNotice,setStoryNotice]=useState('');
  const [pollQuestion,setPollQuestion]=useState('');
  const [pollOptions,setPollOptions]=useState(['','']);
  const [pollNotice,setPollNotice]=useState('');
  const [bookmarks,setBookmarks]=useState(new Set());

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
    loadBusinesses();
    loadBusinessData();
    loadProfessional();
    loadCreators();
    loadListings();
    loadJobs();
    loadStories();
    loadBookmarks();
  }, [session]);

  async function loadCreators(){const {data}=await supabase.from('grin_creator_profiles').select('*,grin_profiles(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(30);setCreators(data||[]);}
  async function saveCreator(e){e.preventDefault();setCreatorNotice('');const payload={user_id:session.user.id,...creatorForm,rate:creatorForm.rate?Number(creatorForm.rate):null};const {error}=await supabase.from('grin_creator_profiles').upsert(payload);setCreatorNotice(error?.message||'Creator profile saved.');if(!error)loadCreators();}
  async function loadListings(){const {data}=await supabase.from('grin_marketplace_listings').select('*').order('created_at',{ascending:false}).limit(50);setListings(data||[]);}
  async function createListing(e){e.preventDefault();const payload={...listingForm,seller_id:session.user.id,price:listingForm.price?Number(listingForm.price):null};const {error}=await supabase.from('grin_marketplace_listings').insert(payload);setListingNotice(error?.message||'Listing published.');if(!error){setListingForm({title:'',description:'',category:'Other',price:'',currency:'NGN',external_url:''});loadListings();}}
  async function loadJobs(){const {data}=await supabase.from('grin_jobs').select('*').order('created_at',{ascending:false}).limit(50);setJobs(data||[]);}
  async function createJob(e){e.preventDefault();const payload={...jobForm,poster_id:session.user.id,budget:jobForm.budget?Number(jobForm.budget):null};const {error}=await supabase.from('grin_jobs').insert(payload);setJobNotice(error?.message||'Job posted.');if(!error){setJobForm({title:'',description:'',category:'Other',budget:'',currency:'NGN'});loadJobs();}}
  async function applyJob(job){const message=window.prompt('Tell the poster why you are a good fit:');if(!message?.trim())return;const {error}=await supabase.from('grin_job_applications').insert({job_id:job.id,applicant_id:session.user.id,message:message.trim()});setJobNotice(error?.message||'Application sent.');}

  async function loadStories(){
    const {data}=await supabase.from('grin_stories').select('*,grin_profiles(username,display_name,avatar_url)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(30);
    setStories(data||[]);
  }
  async function createStory(e){
    e.preventDefault();
    const caption=storyCaption.trim();
    if(!caption)return;
    const {error}=await supabase.from('grin_stories').insert({author_id:session.user.id,caption,media_url:null,media_type:null,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()});
    setStoryNotice(error?.message||'Story posted for 24 hours.');
    if(!error){setStoryCaption('');loadStories();}
  }
  async function loadBookmarks(){
    const {data}=await supabase.from('grin_bookmarks').select('post_id').eq('user_id',session.user.id);
    setBookmarks(new Set((data||[]).map(x=>x.post_id)));
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

  return <div className="app"><header className="topbar"><div className="brand"><span className="brand-mark">☺</span><span>GRIN</span></div><div className="search people-search"><Search size={18}/><input value={personSearch} onChange={e=>searchPeople(e.target.value)} placeholder="Search people, chats and posts"/>{people.length>0 && <div className="people-results">{people.map(p=><button key={p.id} onClick={()=>startChat(p)}><div className="chat-avatar">{(p.display_name||p.username).slice(0,2).toUpperCase()}</div><div><strong>{p.display_name}</strong><span>@{p.username}</span></div></button>)}</div>}</div><div className="top-actions"><button className="avatar">{(session.user.email || 'G')[0].toUpperCase()}</button><button className="logout" onClick={()=>supabase.auth.signOut()} title="Sign out"><LogOut size={18}/></button></div></header><main className="layout"><aside className="sidebar"><nav>{[[MessageCircle,'Chats','chats'],[Users,'Communities','communities'],[Compass,'Home','discover'],[UserRound,'Creators','creators'],[UserRound,'Marketplace','marketplace'],[UserRound,'Jobs','jobs'],[UserRound,'Business & Pro','business'],[Bell,'Notifications','notifications'],[UserRound,'Profile','profile']].map(([Icon,label,key])=><button className={active===key?'nav active':'nav'} onClick={()=>setActive(key)} key={key}><Icon size={20}/><span>{label}</span></button>)}</nav><button className="new-chat" onClick={()=>document.querySelector(".people-search input")?.focus()}><Plus size={19}/> New chat</button><div className="side-foot">GRIN <span>v0.2</span></div></aside><section className="content">{active === 'business' ? <div className="business-page"><div className="feed-head"><div><h1>Business & Professional</h1><p>Build a presence for your business, brand or professional identity on GRIN.</p></div></div><div className="business-grid"><form className="profile-card business-form" onSubmit={createBusiness}><h2>Create a business profile</h2><label>Business name<input value={businessForm.name} onChange={e=>setBusinessForm({...businessForm,name:e.target.value})} required maxLength={100}/></label><label>Handle<input value={businessForm.handle} onChange={e=>setBusinessForm({...businessForm,handle:e.target.value})} placeholder="yourbrand" required minLength={3} maxLength={40}/></label><label>Category<input value={businessForm.category} onChange={e=>setBusinessForm({...businessForm,category:e.target.value})}/></label><label>Description<textarea value={businessForm.description} onChange={e=>setBusinessForm({...businessForm,description:e.target.value})} maxLength={500}/></label><label>Website<input value={businessForm.website} onChange={e=>setBusinessForm({...businessForm,website:e.target.value})} placeholder="https://..."/></label><label>Location<input value={businessForm.location} onChange={e=>setBusinessForm({...businessForm,location:e.target.value})}/></label>{businessNotice&&<div className="profile-notice">{businessNotice}</div>}<button className="primary" type="submit">Create business profile</button></form><div><div className="pro-dashboard"><div><h2>Professional dashboard</h2><p>Turn your GRIN presence into a portfolio, storefront and client channel.</p></div><div className="stats-grid"><div><b>{businessStats.views}</b><span>Views</span></div><div><b>{businessStats.followers}</b><span>Followers</span></div><div><b>{businessStats.contacts}</b><span>Enquiries</span></div><div><b>{businessStats.productViews}</b><span>Product views</span></div></div></div><form className="profile-card pro-form" onSubmit={saveProfessional}><h2>Professional profile</h2><input placeholder="Headline e.g. Creative Director" value={professional.headline} onChange={e=>setProfessional({...professional,headline:e.target.value})}/><input placeholder="Industry" value={professional.industry} onChange={e=>setProfessional({...professional,industry:e.target.value})}/><input placeholder="Location" value={professional.location} onChange={e=>setProfessional({...professional,location:e.target.value})}/><input placeholder="Website" value={professional.website} onChange={e=>setProfessional({...professional,website:e.target.value})}/><input placeholder="Skills, separated by commas" value={professional.skills} onChange={e=>setProfessional({...professional,skills:e.target.value})}/><input placeholder="Portfolio URL" value={professional.portfolio_url} onChange={e=>setProfessional({...professional,portfolio_url:e.target.value})}/><select value={professional.availability} onChange={e=>setProfessional({...professional,availability:e.target.value})}><option value="available">Available for work</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select><input type="number" placeholder="Hourly rate" value={professional.hourly_rate} onChange={e=>setProfessional({...professional,hourly_rate:e.target.value})}/>{proNotice&&<div className="profile-notice">{proNotice}</div>}<button className="primary">Save professional profile</button></form><h2 className="business-list-title">GRIN businesses</h2>{businesses.length===0?<div className="empty-state">No business profiles yet. Create the first one.</div>:<div className="business-list">{businesses.map(b=><article className="business-card" key={b.id}><div className="business-avatar">{b.name.slice(0,2).toUpperCase()}</div><div className="business-info"><strong>{b.name}{b.verified&&' ✓'}</strong><span>@{b.handle} · {b.category}</span><p>{b.description||'Business profile on GRIN.'}</p>{b.location&&<small>📍 {b.location}</small>}</div><div className="business-actions">{b.owner_id!==session.user.id&&<button className="secondary-btn" onClick={()=>followBusiness(b.id)}>Follow</button>}<button className="primary small-btn" onClick={()=>createLead(b.id)}>Contact</button></div></article>)}</div>}</div></div></div> : active === 'creators' ? <div className="explore-page"><div className="feed-head"><div><h1>Creators</h1><p>Discover people building, making and creating on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={saveCreator}><h2>Your creator profile</h2><input placeholder="Headline" value={creatorForm.headline} onChange={e=>setCreatorForm({...creatorForm,headline:e.target.value})}/><input placeholder="Category" value={creatorForm.category} onChange={e=>setCreatorForm({...creatorForm,category:e.target.value})}/><textarea placeholder="Creator bio" value={creatorForm.bio} onChange={e=>setCreatorForm({...creatorForm,bio:e.target.value})}/><input placeholder="Location" value={creatorForm.location} onChange={e=>setCreatorForm({...creatorForm,location:e.target.value})}/><input placeholder="Website" value={creatorForm.website} onChange={e=>setCreatorForm({...creatorForm,website:e.target.value})}/><input type="number" placeholder="Rate" value={creatorForm.rate} onChange={e=>setCreatorForm({...creatorForm,rate:e.target.value})}/>{creatorNotice&&<div className="profile-notice">{creatorNotice}</div>}<button className="primary">Save creator profile</button></form><div className="explore-grid">{creators.map(x=><article className="explore-card" key={x.user_id}><div className="chat-avatar">{(x.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><strong>{x.grin_profiles?.display_name||'GRIN Creator'}</strong><span>{x.headline||x.category}</span><p>{x.bio}</p><small>{x.location}</small></article>)}</div></div>
 : active === 'marketplace' ? <div className="explore-page"><div className="feed-head"><div><h1>Marketplace</h1><p>Buy, sell and discover things through GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createListing}><h2>Publish a listing</h2><input placeholder="Title" value={listingForm.title} onChange={e=>setListingForm({...listingForm,title:e.target.value})} required/><textarea placeholder="Description" value={listingForm.description} onChange={e=>setListingForm({...listingForm,description:e.target.value})}/><input placeholder="Category" value={listingForm.category} onChange={e=>setListingForm({...listingForm,category:e.target.value})}/><input type="number" placeholder="Price" value={listingForm.price} onChange={e=>setListingForm({...listingForm,price:e.target.value})}/><input placeholder="External purchase/contact URL" value={listingForm.external_url} onChange={e=>setListingForm({...listingForm,external_url:e.target.value})}/>{listingNotice&&<div className="profile-notice">{listingNotice}</div>}<button className="primary">Publish listing</button></form><div className="explore-grid">{listings.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.price!=null?x.currency+' '+Number(x.price).toLocaleString():'Contact seller'}</b>{x.external_url&&<a href={x.external_url} target="_blank" rel="noreferrer">View / buy</a>}</article>)}</div></div>
 : active === 'jobs' ? <div className="explore-page"><div className="feed-head"><div><h1>Jobs & Gigs</h1><p>Find work, clients and collaborators on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createJob}><h2>Post a job or gig</h2><input placeholder="Title" value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} required/><textarea placeholder="Describe the work" value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} required/><input placeholder="Category" value={jobForm.category} onChange={e=>setJobForm({...jobForm,category:e.target.value})}/><input type="number" placeholder="Budget" value={jobForm.budget} onChange={e=>setJobForm({...jobForm,budget:e.target.value})}/>{jobNotice&&<div className="profile-notice">{jobNotice}</div>}<button className="primary">Post job</button></form><div className="explore-grid">{jobs.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.budget!=null?x.currency+' '+Number(x.budget).toLocaleString():'Budget open'}</b>{x.poster_id!==session.user.id&&<button className="secondary-btn" onClick={()=>applyJob(x)}>Apply</button>}</article>)}</div></div> : active === 'notifications' ? <div className="notifications-page"><div className="feed-head"><div><h1>Notifications</h1><p>Stay in the loop with what happens around you.</p></div><button className="secondary-btn" onClick={markNotificationsRead}>Mark all read</button></div><div className="notification-list">{notifications.length===0&&<div className="empty-state">No notifications yet.</div>}{notifications.map(n=><button key={n.id} className={n.read_at?'notification-row':'notification-row unread'} onClick={async()=>{if(!n.read_at){const now=new Date().toISOString();await supabase.from('grin_notifications').update({read_at:now}).eq('id',n.id);setNotifications(x=>x.map(v=>v.id===n.id?{...v,read_at:now}:v));}}}><div className="chat-avatar">{(n.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{n.grin_profiles?.display_name||'GRIN User'}</strong><span>{n.body}</span><small>{new Date(n.created_at).toLocaleString()}</small></div></button>)}</div></div> : active === 'discover' ? <div className="feed-page">
<div className="feed-head"><div><h1>Discover</h1><p>People, stories, conversations and ideas — all moving in one place.</p></div></div>
<div className="profile-card">
  <h2>Stories</h2>
  <form onSubmit={createStory} className="post-composer">
    <textarea value={storyCaption} onChange={e=>setStoryCaption(e.target.value)} placeholder="Share a story — it disappears after 24 hours." maxLength={500}/>
    <div className="post-actions"><span>{storyCaption.length}/500</span><button className="primary" type="submit">Add story</button></div>
    {storyNotice&&<div className="profile-notice">{storyNotice}</div>}
  </form>
  <div className="explore-grid">{stories.length===0?<div className="empty-state">No active stories yet.</div>:stories.map(s=><article className="explore-card" key={s.id}><div className="chat-avatar">{(s.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><strong>{s.grin_profiles?.display_name||'GRIN User'}</strong><span>{new Date(s.created_at).toLocaleString()}</span><p>{s.caption}</p></article>)}</div>
</div>
<form className="post-composer" onSubmit={createPost}>
  <textarea value={postBody} onChange={e=>setPostBody(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/>
  {postFile&&<div className="file-chip">📎 {postFile.name} <button type="button" onClick={()=>{setPostFile(null);const x=document.getElementById('grin-media-input');if(x)x.value='';}}>×</button></div>}
  <div className="post-actions"><label className="media-pick">📷 Photo / Video<input id="grin-media-input" type="file" accept="image/*,video/*" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><span>{postBody.length}/5000</span><button className="primary" type="submit" disabled={(!postBody.trim()&&!postFile)||postLoading}>{postLoading?'Posting...':'Post to GRIN'}</button></div>
  {postNotice&&<div className="profile-notice">{postNotice}</div>}
</form>
{posts.map(p=><article className="post-card" key={p.id}>
  <div className="post-author"><div className="chat-avatar">{p.grin_profiles?.avatar_url?<img src={p.grin_profiles.avatar_url} alt=""/>:(p.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{p.grin_profiles?.display_name||'GRIN User'}</strong><span>@{p.grin_profiles?.username||'user'} · {new Date(p.created_at).toLocaleString()}</span></div></div>
  <p className="post-body">{p.body}</p>{p.media_url&&p.media_type==='image'&&<img className="post-media" src={p.media_url} alt=""/>}{p.media_url&&p.media_type==='video'&&<video className="post-media" src={p.media_url} controls/>}
  <div className="post-footer"><button onClick={()=>reactToPost(p.id)}>♥ Like <span>{reactionCounts[p.id]||0}</span></button><button onClick={()=>toggleComments(p.id)}>💬 Comment <span>{commentCounts[p.id]||0}</span></button><button onClick={()=>toggleBookmark(p.id)}>🔖 {bookmarks.has(p.id)?'Saved':'Save'}</button><button onClick={async()=>{const text=p.body||'GRIN post';if(navigator.share){try{await navigator.share({title:'GRIN post',text})}catch{}}else{await navigator.clipboard?.writeText(text);setPostNotice('Post text copied.')}}}>↗ Share</button></div>
  {openComments===p.id&&<div className="comments"><div className="comment-list">{(comments[p.id]||[]).map(c=><div className="comment" key={c.id}><div className="chat-avatar">{(c.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{c.grin_profiles?.display_name||'GRIN User'}</strong><p>{c.body}</p></div></div>)}</div><div className="comment-compose"><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} placeholder="Write a comment..."/><button className="send" onClick={()=>addComment(p.id)}><Send size={16}/></button></div></div>}
</article>)}
</div> : active === 'profile' ? <div className="profile-page"><div className="profile-cover"><div className="profile-avatar-large">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.display_name || 'G').slice(0,2).toUpperCase()}</div><div><h1>{profile?.display_name || 'GRIN User'}</h1><p>@{profile?.username || 'user'}</p></div></div><form className="profile-card" onSubmit={saveProfile}><h2>Edit profile</h2><label>Username<input value={profileForm.username} onChange={e=>setProfileForm({...profileForm,username:e.target.value})} minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" required /></label><label>Display name<input value={profileForm.display_name} onChange={e=>setProfileForm({...profileForm,display_name:e.target.value})} maxLength={60} required /></label><label>Bio<textarea value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} maxLength={160} placeholder="Tell people a little about you..." /></label><label>Avatar image URL<input value={profileForm.avatar_url} onChange={e=>setProfileForm({...profileForm,avatar_url:e.target.value})} placeholder="https://..." /></label>{profileNotice && <div className="profile-notice">{profileNotice}</div>}<button className="primary" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button></form></div> : <><div className="chat-list"><div className="section-head"><div><h1>Chats</h1><p>Conversations that come alive.</p></div><button className="icon-btn"><Plus size={20}/></button></div>{chats.map(c=><button key={c.id} onClick={()=>setSelected(c)} className={selected.id===c.id?'chat-row selected':'chat-row'}><div className="chat-avatar">{c.initials}</div><div className="chat-meta"><strong>{c.name}</strong><span>{c.preview}</span></div></button>)}</div><div className="conversation"><div className="conversation-head"><div className="chat-avatar">{selected.initials}</div><div><strong>{selected.name}</strong><span>{selected.id === 'welcome' ? 'GRIN' : 'connected'}</span></div></div><div className="messages">{selected.id === 'welcome' && <div className="welcome"><div className="welcome-icon">☺</div><h2>Welcome to GRIN</h2><p>Your real account is connected. The next layer is finding people and starting conversations.</p></div>}{messages.map(m=><div className={m.sender_id===session.user.id?'bubble mine':'bubble'} key={m.id}>{m.body}</div>)}</div><div className="composer"><button className="icon-btn"><Smile size={20}/></button><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={selected.id === 'welcome' ? 'Create or select a chat...' : 'Write a message...'}/><button className="send" onClick={send}><Send size={18}/></button></div></div></>}</section></main></div>;
}
