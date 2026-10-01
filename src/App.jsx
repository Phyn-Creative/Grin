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
  const [feedMode, setFeedMode] = useState('for-you');
  const [followedIds, setFollowedIds] = useState(new Set());
  const [postBody, setPostBody] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postNotice, setPostNotice] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({});
  const [reactionMine, setReactionMine] = useState({});
  const [reactionMenu, setReactionMenu] = useState(null);
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
  const [storyFile,setStoryFile]=useState(null);
  const [storyNotice,setStoryNotice]=useState('');
  const [pollQuestion,setPollQuestion]=useState('');
  const [pollOptions,setPollOptions]=useState(['','']);
  const [pollNotice,setPollNotice]=useState('');
  const [showPollComposer,setShowPollComposer]=useState(false);
  const [polls,setPolls]=useState({});
  const [pollVotes,setPollVotes]=useState({});
  const [pollVoteCounts,setPollVoteCounts]=useState({});
  const [bookmarks,setBookmarks]=useState(new Set());
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
  const [editingMessage,setEditingMessage]=useState(null);
  const [messageReactions,setMessageReactions]=useState({});
  const [replyingTo,setReplyingTo]=useState(null);
  const [chatSearch,setChatSearch]=useState('');
  const [unreadCounts,setUnreadCounts]=useState({});
  const [onlineUsers,setOnlineUsers]=useState({});
  const [typingUsers,setTypingUsers]=useState({});
  const [exploreQuery,setExploreQuery]=useState('');
  const [exploreResults,setExploreResults]=useState({people:[],businesses:[],creators:[],listings:[],jobs:[]});
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
    loadSavedListings();
    loadFollowedCreators();
  }, [session]);

  async function openPersonProfile(person){setProfileView({type:'person',...person});const [{data:follow},{count:followers},{count:following},{data:personPosts}]=await Promise.all([supabase.from('grin_follows').select('following_id').eq('follower_id',session.user.id).eq('following_id',person.id).maybeSingle(),supabase.from('grin_follows').select('*',{count:'exact',head:true}).eq('following_id',person.id),supabase.from('grin_follows').select('*',{count:'exact',head:true}).eq('follower_id',person.id),supabase.from('grin_posts').select('id,body,media_url,media_type,created_at').eq('author_id',person.id).order('created_at',{ascending:false}).limit(12)]);setProfileFollowed(!!follow);setProfileFollowers(followers||0);setProfileFollowing(following||0);setProfilePosts(personPosts||[]);}
  async function togglePersonFollow(){if(!profileView||profileView.type!=='person'||profileView.id===session.user.id)return;if(profileFollowed){await supabase.from('grin_follows').delete().eq('follower_id',session.user.id).eq('following_id',profileView.id);setProfileFollowed(false);}else{await supabase.from('grin_follows').insert({follower_id:session.user.id,following_id:profileView.id});setProfileFollowed(true);}}

  async function searchExplore(){const q=exploreQuery.trim();if(!q){setExploreResults({people:[],businesses:[],creators:[],listings:[],jobs:[]});return;}setExploreLoading(true);const term='%'+q+'%';const [{data:pp},{data:bb},{data:cc},{data:ll},{data:jj}]=await Promise.all([supabase.from('grin_profiles').select('id,username,display_name,bio,avatar_url').or('username.ilike.'+term+',display_name.ilike.'+term+',bio.ilike.'+term).limit(20),supabase.from('grin_businesses').select('id,name,handle,category,description,location').or('name.ilike.'+term+',handle.ilike.'+term+',category.ilike.'+term).limit(20),supabase.from('grin_creator_profiles').select('id,user_id,category,headline,bio,location,rate,currency').or('category.ilike.'+term+',headline.ilike.'+term+',bio.ilike.'+term+',location.ilike.'+term).limit(20),supabase.from('grin_marketplace_listings').select('id,title,description,category,price,currency').or('title.ilike.'+term+',description.ilike.'+term+',category.ilike.'+term).limit(20),supabase.from('grin_jobs').select('id,title,description,category,budget,currency').or('title.ilike.'+term+',description.ilike.'+term+',category.ilike.'+term).limit(20)]);setExploreResults({people:pp||[],businesses:bb||[],creators:cc||[],listings:ll||[],jobs:jj||[]});setExploreLoading(false);}

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
  async function openCreatorProfile(creator){const [{count}]=await Promise.all([supabase.from('grin_creator_follows').select('*',{count:'exact',head:true}).eq('creator_id',creator.user_id)]);setProfileView({type:'creator',id:creator.user_id,display_name:creator.grin_profiles?.display_name||'GRIN Creator',username:creator.grin_profiles?.username,bio:creator.bio,avatar_url:creator.grin_profiles?.avatar_url,headline:creator.headline,category:creator.category,location:creator.location,rate:creator.rate,currency:creator.currency,creatorFollowerCount:count||0});setProfileFollowed(followedCreators.has(creator.user_id));}

  async function loadSavedListings(){const {data}=await supabase.from('grin_marketplace_saved').select('listing_id').eq('user_id',session.user.id);setSavedListings(new Set((data||[]).map(x=>x.listing_id)));}
  async function toggleSavedListing(id){if(savedListings.has(id)){await supabase.from('grin_marketplace_saved').delete().eq('listing_id',id).eq('user_id',session.user.id);setSavedListings(x=>{const n=new Set(x);n.delete(id);return n;});}else{await supabase.from('grin_marketplace_saved').insert({listing_id:id,user_id:session.user.id});setSavedListings(x=>new Set([...x,id]));}}
  async function loadFollowedCreators(){const {data}=await supabase.from('grin_creator_follows').select('creator_id').eq('follower_id',session.user.id);setFollowedCreators(new Set((data||[]).map(x=>x.creator_id)));}
  async function toggleCreatorFollow(id){if(followedCreators.has(id)){await supabase.from('grin_creator_follows').delete().eq('creator_id',id).eq('follower_id',session.user.id);setFollowedCreators(x=>{const n=new Set(x);n.delete(id);return n;});}else{await supabase.from('grin_creator_follows').insert({creator_id:id,follower_id:session.user.id});setFollowedCreators(x=>new Set([...x,id]));}}

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
    const { data, error } = await supabase.from('grin_notifications').select('id,actor_id,kind,post_id,body,read_at,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(30);
    if(error){ console.error('GRIN notifications load failed',error); setNotifications([]); return; }
    const rows=data||[]; const actorIds=[...new Set(rows.map(n=>n.actor_id).filter(Boolean))];
    let profiles=[];
    if(actorIds.length){ const {data:p,error:pe}=await supabase.from('grin_profiles').select('id,username,display_name,avatar_url').in('id',actorIds); if(!pe) profiles=p||[]; }
    const byId=Object.fromEntries(profiles.map(p=>[p.id,p]));
    setNotifications(rows.map(n=>({...n,grin_profiles:byId[n.actor_id]||null})));
  }
  async function markNotificationsRead() { await supabase.from('grin_notifications').update({read_at:new Date().toISOString()}).eq('user_id',session.user.id).is('read_at',null); setNotifications(x=>x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()}))); }

  async function loadPosts() {
    const { data: follows } = await supabase.from('grin_follows').select('following_id').eq('follower_id',session.user.id); setFollowedIds(new Set((follows||[]).map(x=>x.following_id)));
    const { data } = await supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,repost_of_id,created_at,grin_profiles(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(50);
    setPosts(data || []);
    if (data?.length) {
      const ids=data.map(p=>p.id);
      const [{data:rx},{data:mine},{data:cm},{data:pollRows}]=await Promise.all([
        supabase.from('grin_post_reactions').select('post_id').in('post_id',ids),
        supabase.from('grin_post_reactions').select('post_id,reaction').eq('user_id',session.user.id).in('post_id',ids),
        supabase.from('grin_post_comments').select('post_id').in('post_id',ids),
        supabase.from('grin_polls').select('id,post_id,question,expires_at,grin_poll_options(id,option_text,position)').in('post_id',ids)
      ]);
      const rc={},rm={},cc={},pm={}; (rx||[]).forEach(x=>rc[x.post_id]=(rc[x.post_id]||0)+1); (mine||[]).forEach(x=>rm[x.post_id]=x.reaction); (cm||[]).forEach(x=>cc[x.post_id]=(cc[x.post_id]||0)+1); (pollRows||[]).forEach(x=>pm[x.post_id]=x);
      setReactionCounts(rc); setReactionMine(rm); setCommentCounts(cc); setPolls(pm);
      const pollIds=(pollRows||[]).map(x=>x.id);
      if(pollIds.length){
        const [{data:votes},{data:allVotes}]=await Promise.all([
          supabase.from('grin_poll_votes').select('poll_id,option_id').eq('user_id',session.user.id).in('poll_id',pollIds),
          supabase.from('grin_poll_votes').select('poll_id,option_id').in('poll_id',pollIds)
        ]);
        const vm={},counts={}; (votes||[]).forEach(v=>vm[v.poll_id]=v.option_id); (allVotes||[]).forEach(v=>{if(!counts[v.poll_id])counts[v.poll_id]={};counts[v.poll_id][v.option_id]=(counts[v.poll_id][v.option_id]||0)+1;}); setPollVotes(vm); setPollVoteCounts(counts);
      } else { setPollVotes({}); setPollVoteCounts({}); }
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
    const { data: existing } = await supabase.from('grin_post_reactions').select('reaction').eq('post_id',postId).eq('user_id',session.user.id).maybeSingle();
    if (existing?.reaction===reaction) { await supabase.from('grin_post_reactions').delete().eq('post_id',postId).eq('user_id',session.user.id); setReactionCounts(x=>({...x,[postId]:Math.max(0,(x[postId]||1)-1)})); setReactionMine(x=>({...x,[postId]:null})); }
    else { if(existing) await supabase.from('grin_post_reactions').delete().eq('post_id',postId).eq('user_id',session.user.id); await supabase.from('grin_post_reactions').insert({post_id:postId,user_id:session.user.id,reaction}); setReactionCounts(x=>({...x,[postId]:(x[postId]||0)+(existing?0:1)})); setReactionMine(x=>({...x,[postId]:reaction})); } setReactionMenu(null);
  }


  async function repostPost(p){const {error}=await supabase.from('grin_posts').insert({author_id:session.user.id,body:'Reposted: '+(p.body||'GRIN post'),repost_of_id:p.id});if(!error){setPostNotice('Reposted to your GRIN profile.');loadPosts();}}

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
    loadMessages(selected.id); markChatRead(selected.id);
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
    if(groupMode){
      setGroupSelected(current=>current.some(x=>x.id===person.id)?current.filter(x=>x.id!==person.id):[...current,person]);
      return;
    }
    const { data, error } = await supabase.rpc('grin_create_direct_conversation', { other_user: person.id });
    if (error) { setAuthError(error.message); return; }
    const chat = { id: data, name: person.display_name || person.username, preview: '@' + person.username, initials: (person.display_name || person.username).slice(0, 2).toUpperCase() };
    setChats(current => current.some(x => x.id === chat.id) ? current : [chat, ...current.filter(x => x.id !== 'welcome')]);
    setSelected(chat);
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
    setSelected(chat);setActive('chats');setGroupMode(false);setGroupName('');setGroupSelected([]);setPeople([]);setPersonSearch('');setAuthError('');
  }

  async function loadUnreadCounts(rows){const ids=(rows||[]).filter(x=>x.id!=='welcome').map(x=>x.id);if(!ids.length)return;const {data:members}=await supabase.from('grin_conversation_members').select('conversation_id,last_read_at').eq('user_id',session.user.id).in('conversation_id',ids);const map={};for(const m of members||[]){let q=supabase.from('grin_messages').select('id',{count:'exact',head:true}).eq('conversation_id',m.conversation_id).neq('sender_id',session.user.id);if(m.last_read_at)q=q.gt('created_at',m.last_read_at);const {count}=await q;map[m.conversation_id]=count||0;}setUnreadCounts(map);}

  async function loadChats() {
    const { data } = await supabase.from('grin_conversation_members').select('conversation_id, grin_conversations(id, title, kind)').eq('user_id', session.user.id);
    if (!data?.length) return;
    const rows = data.map(x => ({ id: x.conversation_id, name: x.grin_conversations?.title || 'GRIN Chat', preview: 'Start a conversation.', initials: (x.grin_conversations?.title || 'G').slice(0, 2).toUpperCase() }));
    setChats(rows);
    setSelected(rows[0]);
    loadUnreadCounts(rows);
  }

  useEffect(() => { if (!session) return; const channel=supabase.channel('grin:presence',{config:{presence:{key:session.user.id}}}); channel.on('presence',{event:'sync'},()=>{const state=channel.presenceState();const map={};Object.entries(state).forEach(([id,rows])=>{if(id!==session.user.id)map[id]=rows[0]?.display_name||rows[0]?.username||'GRIN user';});setOnlineUsers(map);}).on('broadcast',{event:'typing'},({payload})=>{if(payload.user_id===session.user.id)return;setTypingUsers(x=>({...x,[payload.user_id]:payload.typing}));setTimeout(()=>setTypingUsers(x=>({...x,[payload.user_id]:false})),1800);}).subscribe(async status=>{if(status==='SUBSCRIBED')await channel.track({user_id:session.user.id,display_name:profile?.display_name||profile?.username||'GRIN user'});}); return ()=>{channel.untrack();supabase.removeChannel(channel);}; },[session,profile]);
  function broadcastTyping(value){if(!session)return;supabase.channel('grin:presence').send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:value}});}

  async function loadMessages(conversationId) {
    const { data } = await supabase.from('grin_messages').select('*').eq('conversation_id', conversationId).order('created_at');
    setMessages(data || []);
    const ids=(data||[]).map(m=>m.id);
    if(ids.length){const {data:r}=await supabase.from('grin_message_reactions').select('*').in('message_id',ids); const map={}; (r||[]).forEach(x=>{map[x.message_id]=[...(map[x.message_id]||[]),x]}); setMessageReactions(map);}
  }

  async function markChatRead(conversationId){ await supabase.from('grin_conversation_members').update({last_read_at:new Date().toISOString()}).eq('conversation_id',conversationId).eq('user_id',session.user.id); setUnreadCounts(x=>({...x,[conversationId]:0})); }
  async function send() {
    const body = message.trim();
    if ((!body && !messageFile) || !session || selected.id === 'welcome') return;
    let media_url=null, media_type=null;
    if(messageFile){
      if(messageFile.size>50*1024*1024){setAuthError('Media must be 50 MB or less.');return;}
      const safe=messageFile.name.replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=session.user.id+'/messages/'+crypto.randomUUID()+'-'+safe;
      const {error:uploadError}=await supabase.storage.from('grin-media').upload(path,messageFile,{contentType:messageFile.type,upsert:false});
      if(uploadError){setAuthError(uploadError.message);return;}
      media_url=supabase.storage.from('grin-media').getPublicUrl(path).data.publicUrl;
      media_type=messageFile.type.startsWith('video/')?'video':'image';
    }
    const { data, error } = await supabase.from('grin_messages').insert({ conversation_id:selected.id,sender_id:session.user.id,body:body||' ',media_url,media_type,reply_to_id:replyingTo?.id||null}).select().single();
    if (!error && data) setMessages(current => current.some(m => m.id === data.id) ? current : [...current, data]);
    setMessage('');setMessageFile(null);setReplyingTo(null);setAuthError(''); markChatRead(selected.id);
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

  if (loading) return <div className="auth-screen"><div className="auth-card"><div className="brand large"><span className="brand-mark">☺</span><span>GRIN</span></div><p>Loading...</p></div></div>;

  if (!session) return <div className="auth-screen"><form className="auth-card" onSubmit={authenticate}><div className="brand large"><span className="brand-mark">☺</span><span>GRIN</span></div><h1>{authMode === 'signin' ? 'Welcome back' : 'Create your GRIN account'}</h1><p>People, ideas and moments — all in one place.</p>{authMode === 'signup' && <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required minLength={3}/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required minLength={6}/>{authError && <div className="auth-error">{authError}</div>}<button className="primary" type="submit">{authMode === 'signin' ? 'Sign in' : 'Create account'}</button><button className="switch" type="button" onClick={()=>{setAuthMode(authMode==='signin'?'signup':'signin');setAuthError('')}}>{authMode === 'signin' ? 'Create a new account' : 'I already have an account'}</button></form></div>;

  return <div className="app"><header className="topbar"><div className="brand"><span className="brand-mark">☺</span><span>GRIN</span></div><div className="search people-search"><Search size={18}/><input value={personSearch} onChange={e=>searchPeople(e.target.value)} placeholder={groupMode?'Search people to add to group':'Search people, chats and posts'}/>{people.length>0 && <div className="people-results">{people.map(p=><button key={p.id} className={groupSelected.some(x=>x.id===p.id)?'selected-person':''} onClick={()=>startChat(p)}><div className="chat-avatar">{(p.display_name||p.username).slice(0,2).toUpperCase()}</div><div><strong>{p.display_name}</strong><span>@{p.username}{groupMode&&groupSelected.some(x=>x.id===p.id)?' · Selected':''}</span></div></button>)}</div>}</div><div className="top-actions"><button className="avatar">{(session.user.email || 'G')[0].toUpperCase()}</button><button className="logout" onClick={()=>supabase.auth.signOut()} title="Sign out"><LogOut size={18}/></button></div></header><main className="layout"><aside className="sidebar"><nav>{[[MessageCircle,'Chats','chats'],[Users,'Communities','communities'],[Compass,'Home','discover'],[UserRound,'Creators','creators'],[UserRound,'Marketplace','marketplace'],[UserRound,'Jobs','jobs'],[UserRound,'Business & Pro','business'],[Bell,'Notifications','notifications'],[UserRound,'Profile','profile']].map(([Icon,label,key])=><button className={active===key?'nav active':'nav'} onClick={()=>setActive(key)} key={key}><Icon size={20}/><span>{label}</span></button>)}</nav><button className="new-chat" onClick={()=>document.querySelector(".people-search input")?.focus()}><Plus size={19}/> New chat</button><div className="side-foot">GRIN <span>v0.2</span></div></aside><section className="content">{active === 'communities' ? <div className="explore-page"><div className="feed-head"><div><h1>Communities</h1><p>Find your people, interests, industries and conversations.</p></div></div><form className="profile-card explore-form" onSubmit={createCommunity}><h2>Create a community</h2><input value={communityForm.name} onChange={e=>setCommunityForm({...communityForm,name:e.target.value})} placeholder="Community name" required maxLength={80}/><textarea value={communityForm.description} onChange={e=>setCommunityForm({...communityForm,description:e.target.value})} placeholder="What is this community about?"/><input value={communityForm.category} onChange={e=>setCommunityForm({...communityForm,category:e.target.value})} placeholder="Category"/>{communityNotice&&<div className="profile-notice">{communityNotice}</div>}<button className="primary">Create community</button></form><div className="profile-card community-filters"><input value={communitySearch} onChange={e=>setCommunitySearch(e.target.value)} placeholder="Search communities..."/><select value={communityCategory} onChange={e=>setCommunityCategory(e.target.value)}><option>All</option>{[...new Set(communities.map(x=>x.category).filter(Boolean))].map(c=><option key={c}>{c}</option>)}</select></div><div className="explore-grid">{communities.filter(x=>(!communitySearch.trim()||[x.name,x.description,x.category].join(' ').toLowerCase().includes(communitySearch.trim().toLowerCase()))&&(communityCategory==='All'||x.category===communityCategory)).map(x=><article className="explore-card" key={x.id}><strong>{x.name}</strong><span>{x.category}</span><p>{x.description||'A GRIN community.'}</p><small>{communityMembers[x.id]?.count||0} member{(communityMembers[x.id]?.count||0)===1?'':'s'}</small><div className="card-actions"><button className="secondary-btn" onClick={()=>toggleCommunityMembership(x.id)}>{communityMembers[x.id]?.joined?'Leave':'Join'}</button><button className="secondary-btn" onClick={async()=>{setSelectedCommunity(x);setCommunityNotice('');await loadCommunityPosts(x.id);}}>Open community</button></div></article>)}</div>{selectedCommunity&&<section className="profile-card community-room"><div className="feed-head"><div><h2>{selectedCommunity.name}</h2><p>{selectedCommunity.description||'Community discussion'}</p></div><button className="secondary-btn" onClick={()=>setSelectedCommunity(null)}>Close</button></div><form onSubmit={publishCommunityPost} className="composer"><textarea value={communityPost} onChange={e=>setCommunityPost(e.target.value)} placeholder="Share something with this community..." maxLength={5000}/><button className="primary">Post</button></form><div className="feed-list">{communityPosts.length?communityPosts.map(p=><article className="post-card" key={p.id}><div className="post-meta"><strong>{p.author_id===session.user.id?'You':'GRIN member'}</strong><span>{new Date(p.created_at).toLocaleString()}</span></div><p>{p.body}</p></article>):<div className="empty-state">No posts yet. Start the conversation.</div>}</div></section>}</div> : active === 'business' ? <div className="business-page"><div className="feed-head"><div><h1>Business & Professional</h1><p>Build a presence for your business, brand or professional identity on GRIN.</p></div></div><div className="business-grid"><form className="profile-card business-form" onSubmit={createBusiness}><h2>Create a business profile</h2><label>Business name<input value={businessForm.name} onChange={e=>setBusinessForm({...businessForm,name:e.target.value})} required maxLength={100}/></label><label>Handle<input value={businessForm.handle} onChange={e=>setBusinessForm({...businessForm,handle:e.target.value})} placeholder="yourbrand" required minLength={3} maxLength={40}/></label><label>Category<input value={businessForm.category} onChange={e=>setBusinessForm({...businessForm,category:e.target.value})}/></label><label>Description<textarea value={businessForm.description} onChange={e=>setBusinessForm({...businessForm,description:e.target.value})} maxLength={500}/></label><label>Website<input value={businessForm.website} onChange={e=>setBusinessForm({...businessForm,website:e.target.value})} placeholder="https://..."/></label><label>Location<input value={businessForm.location} onChange={e=>setBusinessForm({...businessForm,location:e.target.value})}/></label>{businessNotice&&<div className="profile-notice">{businessNotice}</div>}<button className="primary" type="submit">Create business profile</button></form><div><div className="pro-dashboard"><div><h2>Professional dashboard</h2><p>Turn your GRIN presence into a portfolio, storefront and client channel.</p></div><div className="stats-grid"><div><b>{businessStats.views}</b><span>Views</span></div><div><b>{businessStats.followers}</b><span>Followers</span></div><div><b>{businessStats.contacts}</b><span>Enquiries</span></div><div><b>{businessStats.productViews}</b><span>Product views</span></div></div></div><form className="profile-card pro-form" onSubmit={saveProfessional}><h2>Professional profile</h2><input placeholder="Headline e.g. Creative Director" value={professional.headline} onChange={e=>setProfessional({...professional,headline:e.target.value})}/><input placeholder="Industry" value={professional.industry} onChange={e=>setProfessional({...professional,industry:e.target.value})}/><input placeholder="Location" value={professional.location} onChange={e=>setProfessional({...professional,location:e.target.value})}/><input placeholder="Website" value={professional.website} onChange={e=>setProfessional({...professional,website:e.target.value})}/><input placeholder="Skills, separated by commas" value={professional.skills} onChange={e=>setProfessional({...professional,skills:e.target.value})}/><input placeholder="Portfolio URL" value={professional.portfolio_url} onChange={e=>setProfessional({...professional,portfolio_url:e.target.value})}/><select value={professional.availability} onChange={e=>setProfessional({...professional,availability:e.target.value})}><option value="available">Available for work</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select><input type="number" placeholder="Hourly rate" value={professional.hourly_rate} onChange={e=>setProfessional({...professional,hourly_rate:e.target.value})}/>{proNotice&&<div className="profile-notice">{proNotice}</div>}<button className="primary">Save professional profile</button></form><h2 className="business-list-title">GRIN businesses</h2>{businesses.length===0?<div className="empty-state">No business profiles yet. Create the first one.</div>:<div className="business-list">{businesses.map(b=><article className="business-card" key={b.id}><div className="business-avatar">{b.name.slice(0,2).toUpperCase()}</div><div className="business-info"><strong>{b.name}{b.verified&&' ✓'}</strong><span>@{b.handle} · {b.category}</span><p>{b.description||'Business profile on GRIN.'}</p>{b.location&&<small>📍 {b.location}</small>}</div><div className="business-actions"><button className="secondary-btn" onClick={()=>openBusinessProfile(b)}>View profile</button>{b.owner_id!==session.user.id&&<button className="secondary-btn" onClick={()=>followBusiness(b.id)}>Follow</button>}<button className="primary small-btn" onClick={()=>createLead(b.id)}>Contact</button></div></article>)}</div>}</div></div></div> : active === 'creators' ? <div className="explore-page"><div className="feed-head"><div><h1>Creators</h1><p>Discover people building, making and creating on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={saveCreator}><h2>Your creator profile</h2><input placeholder="Headline" value={creatorForm.headline} onChange={e=>setCreatorForm({...creatorForm,headline:e.target.value})}/><input placeholder="Category" value={creatorForm.category} onChange={e=>setCreatorForm({...creatorForm,category:e.target.value})}/><textarea placeholder="Creator bio" value={creatorForm.bio} onChange={e=>setCreatorForm({...creatorForm,bio:e.target.value})}/><input placeholder="Location" value={creatorForm.location} onChange={e=>setCreatorForm({...creatorForm,location:e.target.value})}/><input placeholder="Website" value={creatorForm.website} onChange={e=>setCreatorForm({...creatorForm,website:e.target.value})}/><input type="number" placeholder="Rate" value={creatorForm.rate} onChange={e=>setCreatorForm({...creatorForm,rate:e.target.value})}/>{creatorNotice&&<div className="profile-notice">{creatorNotice}</div>}<button className="primary">Save creator profile</button></form><div className="explore-grid">{creators.map(x=><article className="explore-card" key={x.user_id}><div className="chat-avatar">{(x.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><strong>{x.grin_profiles?.display_name||'GRIN Creator'}</strong><span>{x.headline||x.category}</span><p>{x.bio}</p><small>{x.location}</small><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following':'Follow creator'}</button></article>)}</div></div>
 : active === 'marketplace' ? <div className="explore-page"><div className="feed-head"><div><h1>Marketplace</h1><p>Buy, sell and discover things through GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createListing}><h2>Publish a listing</h2><input placeholder="Title" value={listingForm.title} onChange={e=>setListingForm({...listingForm,title:e.target.value})} required/><textarea placeholder="Description" value={listingForm.description} onChange={e=>setListingForm({...listingForm,description:e.target.value})}/><input placeholder="Category" value={listingForm.category} onChange={e=>setListingForm({...listingForm,category:e.target.value})}/><input type="number" placeholder="Price" value={listingForm.price} onChange={e=>setListingForm({...listingForm,price:e.target.value})}/><input placeholder="External purchase/contact URL" value={listingForm.external_url} onChange={e=>setListingForm({...listingForm,external_url:e.target.value})}/>{listingNotice&&<div className="profile-notice">{listingNotice}</div>}<button className="primary">Publish listing</button></form><div className="explore-grid">{listings.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.price!=null?x.currency+' '+Number(x.price).toLocaleString():'Contact seller'}</b>{x.external_url&&<a href={x.external_url} target="_blank" rel="noreferrer">View / buy</a>}</article>)}</div></div>
 : active === 'jobs' ? <div className="explore-page"><div className="feed-head"><div><h1>Jobs & Gigs</h1><p>Find work, clients and collaborators on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createJob}><h2>Post a job or gig</h2><input placeholder="Title" value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} required/><textarea placeholder="Describe the work" value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} required/><input placeholder="Category" value={jobForm.category} onChange={e=>setJobForm({...jobForm,category:e.target.value})}/><input type="number" placeholder="Budget" value={jobForm.budget} onChange={e=>setJobForm({...jobForm,budget:e.target.value})}/>{jobNotice&&<div className="profile-notice">{jobNotice}</div>}<button className="primary">Post job</button></form><div className="explore-grid">{jobs.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.budget!=null?x.currency+' '+Number(x.budget).toLocaleString():'Budget open'}</b>{x.poster_id!==session.user.id&&<button className="secondary-btn" onClick={()=>applyJob(x)}>Apply</button>}</article>)}</div></div> : active === 'notifications' ? <div className="notifications-page"><div className="feed-head"><div><h1>Notifications {notifications.some(n=>!n.read_at)&&<span className="nav-badge">{notifications.filter(n=>!n.read_at).length}</span>}</h1><p>Stay in the loop with what happens around you.</p></div><button className="secondary-btn" onClick={markNotificationsRead}>Mark all read</button></div><div className="notification-list">{notifications.length===0&&<div className="empty-state">No notifications yet.</div>}{notifications.map(n=><button key={n.id} className={n.read_at?'notification-row':'notification-row unread'} onClick={async()=>{if(!n.read_at){const now=new Date().toISOString();await supabase.from('grin_notifications').update({read_at:now}).eq('id',n.id);setNotifications(x=>x.map(v=>v.id===n.id?{...v,read_at:now}:v));}}}><div className="chat-avatar">{(n.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{n.grin_profiles?.display_name||'GRIN User'}</strong><span>{n.body}</span><small>{new Date(n.created_at).toLocaleString()}</small></div></button>)}</div></div> : active === 'discover' ? <div className="feed-page">
<div className="feed-head"><div><h1>Discover</h1><p>People, creators, businesses, jobs and marketplace — all in one place.</p></div></div><div className="feed-tabs"><button className={feedMode==='for-you'?'active':''} onClick={()=>setFeedMode('for-you')}>For You</button><button className={feedMode==='following'?'active':''} onClick={()=>setFeedMode('following')}>Following</button><button className={feedMode==='trending'?'active':''} onClick={()=>setFeedMode('trending')}>Trending</button></div><div className="explore-search"><input value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchExplore()} placeholder="Search people, businesses, creators, jobs..." /><button className="primary" onClick={searchExplore}>{exploreLoading?'Searching...':'Search'}</button></div>{businessView&&<div className="profile-modal"><div className="profile-card"><button className="secondary-btn" onClick={()=>setBusinessView(null)}>Close</button>{businessView.cover_url&&<img className="business-cover" src={businessView.cover_url} alt=""/>}<div className="profile-avatar-large">{businessView.logo_url?<img src={businessView.logo_url} alt=""/>:businessView.name.slice(0,2).toUpperCase()}</div><h2>{businessView.name}{businessView.verified&&' ✓'}</h2><p>@{businessView.handle} · {businessView.category}</p><p>{businessView.description||'Business profile on GRIN.'}</p>{businessView.location&&<p>📍 {businessView.location}</p>}<div className="profile-stats"><span><b>{businessFollowerCount}</b> followers</span><span><b>{businessView.services.length}</b> services</span><span><b>{businessView.products.length}</b> products</span></div>{businessView.owner_id!==session.user.id&&<button className="primary" onClick={toggleBusinessFollow}>{businessFollowed?'Following':'Follow business'}</button>}<button className="secondary-btn" onClick={()=>{setBusinessView(null);setActive('business')}}>Open business tools</button><h3>Services</h3>{businessView.services.length?businessView.services.map(s=><div className="profile-post" key={s.id}><strong>{s.name}</strong><p>{s.description}</p>{s.price!=null&&<b>{s.currency} {Number(s.price).toLocaleString()}</b>}</div>):<p>No services listed yet.</p>}<h3>Products</h3>{businessView.products.length?businessView.products.map(p=><div className="profile-post" key={p.id}><strong>{p.name}</strong><p>{p.description}</p>{p.price!=null&&<b>{p.currency} {Number(p.price).toLocaleString()}</b>}{p.product_url&&<a href={p.product_url} target="_blank" rel="noreferrer">View product</a>}</div>):<p>No products listed yet.</p>}</div></div>}{profileView&&<div className="profile-modal"><div className="profile-card"><button className="secondary-btn" onClick={()=>setProfileView(null)}>Close</button><div className="profile-avatar-large">{profileView.avatar_url?<img src={profileView.avatar_url} alt=""/>:(profileView.display_name||'G').slice(0,2).toUpperCase()}</div><h2>{profileView.display_name||'GRIN User'}</h2><p>@{profileView.username||'user'}</p><p>{profileView.bio||'No bio yet.'}</p><div className="profile-stats"><span><b>{profileFollowers}</b> followers</span><span><b>{profileFollowing}</b> following</span><span><b>{profilePosts.length}</b> recent posts</span></div>{profileView.id!==session.user.id&&<button className="primary" onClick={togglePersonFollow}>{profileFollowed?'Following':'Follow'}</button>}<button className="secondary-btn" onClick={async()=>{const {data,error}=await supabase.rpc('grin_create_direct_conversation',{other_user:profileView.id});if(!error&&data){setProfileView(null);setActive('chats');}}}>Message</button><div className="profile-posts"><h3>Recent posts</h3>{profilePosts.length?profilePosts.map(p=><div className="profile-post" key={p.id}><p>{p.body}</p>{p.media_url&&<img src={p.media_url} alt=""/></div>):<p>No posts yet.</p>}</div></div></div>}{exploreQuery&&<div className="explore-results">{[['People',exploreResults.people],['Businesses',exploreResults.businesses],['Creators',exploreResults.creators],['Marketplace',exploreResults.listings],['Jobs',exploreResults.jobs]].map(([title,rows])=><section key={title}><h2>{title}</h2><div className="explore-grid">{rows.length?rows.map(x=><article className="explore-card" key={x.id}><strong>{x.display_name||x.name||x.title||x.headline}</strong><span>{x.username?'@'+x.username:x.category||x.location||''}</span><p>{x.bio||x.description||x.headline||''}</p>{x.username&&<button className="secondary-btn" onClick={()=>openPersonProfile(x)}>{x.id===session.user.id?'View profile':profileFollowed&&profileView?.id===x.id?'Following':'View profile'}</button>}{x.user_id&&<><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following creator':'Follow creator'}</button></>}{x.name&&x.handle&&<button className="secondary-btn" onClick={()=>openBusinessProfile(x)}>View business</button>}{x.price!=null&&<><b>{x.currency} {Number(x.price).toLocaleString()}</b><button className="secondary-btn" onClick={()=>toggleSavedListing(x.id)}>{savedListings.has(x.id)?'Saved':'Save listing'}</button></>}{x.budget!=null&&<b>{x.currency} {Number(x.budget).toLocaleString()}</b>}</article>):<div className="empty-state">No {title.toLowerCase()} found.</div>}</div></section>)}</div>}
<div className="profile-card">
  <h2>Stories</h2>
  <form onSubmit={createStory} className="post-composer">
    <textarea value={storyCaption} onChange={e=>setStoryCaption(e.target.value)} placeholder="Share a story — it disappears after 48 hours." maxLength={500}/>
    <div className="post-actions"><label className="media-pick">📷 Photo / Video<input id="grin-story-input" type="file" accept="image/*,video/*" onChange={e=>setStoryFile(e.target.files?.[0]||null)}/></label><span>{storyCaption.length}/500</span><button className="primary" type="submit">Add story</button></div>
    {storyFile&&<div className="file-chip">📎 {storyFile.name}</div>}
    {storyNotice&&<div className="profile-notice">{storyNotice}</div>}
  </form>
  <div className="explore-grid">{stories.length===0?<div className="empty-state">No active stories yet.</div>:stories.map(s=><article className="explore-card" key={s.id}><div className="chat-avatar">{(s.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><strong>{s.grin_profiles?.display_name||'GRIN User'}</strong><span>{new Date(s.created_at).toLocaleString()}</span><p>{s.caption}</p>{s.media_url&&(s.media_type==='video'?<video className="post-media" src={s.media_url} controls/>:<img className="post-media" src={s.media_url} alt="Story"/>)}{s.media_url&&<a className="secondary-btn" href={s.media_url} download target="_blank" rel="noreferrer">Download story</a>}</article>)}</div>
</div>
<form className="post-composer" onSubmit={createPost}>
  <textarea value={postBody} onChange={e=>setPostBody(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/>
  {postFile&&<div className="file-chip">📎 {postFile.name} <button type="button" onClick={()=>{setPostFile(null);const x=document.getElementById('grin-media-input');if(x)x.value='';}}>×</button></div>}
  <div className="post-actions"><label className="media-pick">📷 Photo / Video<input id="grin-media-input" type="file" accept="image/*,video/*" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><span>{postBody.length}/5000</span><button className="primary" type="submit" disabled={(!postBody.trim()&&!postFile)||postLoading}>{postLoading?'Posting...':'Post to GRIN'}</button></div>
  {postNotice&&<div className="profile-notice">{postNotice}</div>}
  <button type="button" className="secondary-btn" onClick={()=>setShowPollComposer(x=>!x)}>{showPollComposer?'Remove poll':'Add poll'}</button>
  {showPollComposer&&<div className="poll-composer"><input value={pollQuestion} onChange={e=>setPollQuestion(e.target.value)} placeholder="Ask a question..." maxLength={300}/>{pollOptions.map((o,i)=><div className="poll-option-row" key={i}><input value={o} onChange={e=>setPollOptions(x=>x.map((v,j)=>j===i?e.target.value:v))} placeholder={'Option '+(i+1)} maxLength={100}/>{pollOptions.length>2&&<button type="button" onClick={()=>setPollOptions(x=>x.filter((_,j)=>j!==i))}>×</button>}</div>)}<button type="button" className="secondary-btn" onClick={()=>setPollOptions(x=>[...x,''])}>+ Add option</button></div>}
</form>
{(feedMode==='following'?posts.filter(p=>followedIds.has(p.author_id)||p.author_id===session.user.id):feedMode==='trending'?[...posts].sort((a,b)=>((reactionCounts[b.id]||0)+(commentCounts[b.id]||0))-((reactionCounts[a.id]||0)+(commentCounts[a.id]||0))):posts).map(p=><article className="post-card" key={p.id}>
  <div className="post-author"><div className="chat-avatar">{p.grin_profiles?.avatar_url?<img src={p.grin_profiles.avatar_url} alt=""/>:(p.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{p.grin_profiles?.display_name||'GRIN User'}</strong><span>@{p.grin_profiles?.username||'user'} · {new Date(p.created_at).toLocaleString()}</span></div></div>
  {p.repost_of_id&&<div className="repost-label">🔁 Reposted post</div>}<p className="post-body">{p.body}</p>{p.media_url&&p.media_type==='image'&&<img className="post-media" src={p.media_url} alt=""/>}{p.media_url&&p.media_type==='video'&&<video className="post-media" src={p.media_url} controls/>}
  {polls[p.id]&&<div className="poll-card"><strong>{polls[p.id].question}</strong>{polls[p.id].grin_poll_options?.map(o=>{const count=pollVoteCounts[polls[p.id].id]?.[o.id]||0;const total=Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0);const pct=total?Math.round(count*100/total):0;return <button type="button" className={pollVotes[polls[p.id].id]===o.id?'poll-choice selected':'poll-choice'} key={o.id} onClick={()=>votePoll(polls[p.id],o.id)}><span>{o.option_text}</span><b>{pct}%</b></button>})}<small>{Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0)} vote{Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0)===1?'':'s'} · {pollVotes[polls[p.id].id]?'Your vote is recorded':'Choose an option'} · {polls[p.id].expires_at&&new Date(polls[p.id].expires_at)>new Date()?'Open':'Closed'}</small></div>}
  <div className="post-footer"><div className="reaction-wrap"><button onClick={()=>setReactionMenu(reactionMenu===p.id?null:p.id)}>{reactionMine[p.id]||'♥'} React <span>{reactionCounts[p.id]||0}</span></button>{reactionMenu===p.id&&<div className="reaction-menu">{['like','❤️','😂','😍','😮','😢','🔥'].map(r=><button key={r} type="button" onClick={()=>reactToPost(p.id,r)}>{r}</button>)}</div>}</div><button onClick={()=>toggleComments(p.id)}>💬 Comment <span>{commentCounts[p.id]||0}</span></button><button onClick={()=>repostPost(p)}>🔁 Repost</button><button onClick={()=>toggleBookmark(p.id)}>🔖 {bookmarks.has(p.id)?'Saved':'Save'}</button><button onClick={async()=>{const text=p.body||'GRIN post';if(navigator.share){try{await navigator.share({title:'GRIN post',text})}catch{}}else{await navigator.clipboard?.writeText(text);setPostNotice('Post text copied.')}}}>↗ Share</button></div>
  {openComments===p.id&&<div className="comments"><div className="comment-list">{(comments[p.id]||[]).map(c=><div className="comment" key={c.id}><div className="chat-avatar">{(c.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{c.grin_profiles?.display_name||'GRIN User'}</strong><p>{c.body}</p></div></div>)}</div><div className="comment-compose"><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} placeholder="Write a comment..."/><button className="send" onClick={()=>addComment(p.id)}><Send size={16}/></button></div></div>}
</article>)}
</div> : active === 'profile' ? <div className="profile-page"><div className="profile-cover"><div className="profile-avatar-large">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.display_name || 'G').slice(0,2).toUpperCase()}</div><div><h1>{profile?.display_name || 'GRIN User'}</h1><p>@{profile?.username || 'user'}</p></div></div><form className="profile-card" onSubmit={saveProfile}><h2>Edit profile</h2><label>Username<input value={profileForm.username} onChange={e=>setProfileForm({...profileForm,username:e.target.value})} minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" required /></label><label>Display name<input value={profileForm.display_name} onChange={e=>setProfileForm({...profileForm,display_name:e.target.value})} maxLength={60} required /></label><label>Bio<textarea value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} maxLength={160} placeholder="Tell people a little about you..." /></label><label>Avatar image URL<input value={profileForm.avatar_url} onChange={e=>setProfileForm({...profileForm,avatar_url:e.target.value})} placeholder="https://..." /></label>{profileNotice && <div className="profile-notice">{profileNotice}</div>}<button className="primary" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button></form></div> : <><div className="chat-list"><div className="section-head"><div><h1>Chats {Object.values(unreadCounts).reduce((a,b)=>a+b,0)>0&&<span className="nav-badge">{Object.values(unreadCounts).reduce((a,b)=>a+b,0)}</span>}</h1><p>Conversations that come alive.</p></div><button className="icon-btn" onClick={()=>{setGroupMode(x=>!x);setGroupSelected([]);setGroupName('');setAuthError('');}} title="Create group"><Plus size={20}/></button></div><input className="chat-search" value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search chats..."/>{groupMode&&<div className="group-builder"><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Group name" maxLength={80}/><p>{groupSelected.length} member{groupSelected.length===1?'':'s'} selected</p><div className="group-chips">{groupSelected.map(p=><button type="button" key={p.id} onClick={()=>setGroupSelected(x=>x.filter(v=>v.id!==p.id))}>{p.display_name||p.username} ×</button>)}</div><button className="primary" onClick={createGroup}>Create group</button></div>}{chats.filter(c=>(c.name+' '+c.preview).toLowerCase().includes(chatSearch.toLowerCase())).map(c=><button key={c.id} onClick={()=>setSelected(c)} className={selected.id===c.id?'chat-row selected':'chat-row'}><div className="chat-avatar">{c.initials}</div><div className="chat-meta"><strong>{c.name}</strong><span>{c.preview}</span>{unreadCounts[c.id]>0&&<b className="unread-badge">{unreadCounts[c.id]}</b>}</div></button>)}</div><div className="conversation"><div className="conversation-head"><div className="chat-avatar">{selected.initials}</div><div><strong>{selected.name}</strong><span>{selected.id === 'welcome' ? 'GRIN' : (Object.keys(onlineUsers).length ? 'online' : 'offline')}{Object.values(typingUsers).some(Boolean) ? ' · typing…' : ''}</span></div></div><div className="messages">{selected.id === 'welcome' && <div className="welcome"><div className="welcome-icon">☺</div><h2>Welcome to GRIN</h2><p>Your real account is connected. The next layer is finding people and starting conversations.</p></div>}{messages.map(m=><div className={m.sender_id===session.user.id?'bubble mine':'bubble'} key={m.id}>{m.deleted_at?<em>This message was deleted.</em>:<><div>{m.reply_to_id&&<div className="reply-preview">Replying to a message</div>}{m.media_url&&(m.media_type==='video'?<video src={m.media_url} controls className="message-media"/>:<img src={m.media_url} className="message-media" alt=""/>)}{m.body}</div>{m.edited_at&&<small>edited</small>}<div className="message-actions"><button onClick={()=>setReplyingTo(m)}>Reply</button><button onClick={()=>toggleMessageReaction(m,'❤️')}>❤️ {(messageReactions[m.id]||[]).filter(x=>x.reaction==='❤️').length||''}</button>{m.sender_id===session.user.id&&<><button onClick={()=>editMessage(m)}>Edit</button><button onClick={()=>deleteMessage(m)}>Delete</button></>}</div></>}</div>)}</div><div className="composer">{replyingTo&&<div className="replying">Replying to: {replyingTo.body.slice(0,60)} <button onClick={()=>setReplyingTo(null)}>×</button></div>}<label className="icon-btn file-btn" title="Attach photo/video">＋<input type="file" accept="image/*,video/*" hidden onChange={e=>setMessageFile(e.target.files?.[0]||null)}/></label><button className="icon-btn"><Smile size={20}/></button><input value={message} onChange={e=>{setMessage(e.target.value);broadcastTyping(Boolean(e.target.value.trim()));}} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={selected.id === 'welcome' ? 'Create or select a chat...' : 'Write a message...'}/>{messageFile&&<small className="attachment-name">{messageFile.name}</small>}<button className="send" onClick={send}><Send size={18}/></button></div></div></>}</section></main></div>;
}
