import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Users, Compass, Bell, UserRound, Search, Plus, Send, Smile, LogOut, House, Palette, ShoppingBag, BriefcaseBusiness, Store, MoreHorizontal, Pencil, Trash2, X, ChevronLeft, ChevronRight, Eye, Settings as SettingsIcon, Sun, Moon, Mic, Camera, Square, ShieldAlert, Ban } from 'lucide-react';
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
  const [active, setActive] = useState('discover');
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('grin-theme') || 'grin'; } catch { return 'grin'; } });
  const [notificationToast, setNotificationToast] = useState(null);
  const [toastEnabled, setToastEnabled] = useState(() => { try { return localStorage.getItem('grin-toasts') !== 'off'; } catch { return true; } });
  const swipeStart = useRef(null);
  const navigationHistoryReady = useRef(false);
  const skipNextHistoryPush = useRef(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [ownPostMenuId, setOwnPostMenuId] = useState(null);
  const [searchNotice, setSearchNotice] = useState('');
  const [chats, setChats] = useState(fallbackChats);
  const [selected, setSelected] = useState(fallbackChats[0]);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
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
  const [unreadCounts,setUnreadCounts]=useState({});
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

  // Keep swipe destinations in the same predictable order as the primary app areas.
  const swipePages = ['discover','chats','status','directory','explore'];
  const swipeExcluded = 'input,textarea,select,video,audio,[contenteditable="true"],.grin-status-viewer,.grin-stories-strip,.composer,[data-no-page-swipe="true"]';
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
    // Only a deliberate horizontal gesture changes sections; vertical scrolling stays native.
    if (Math.abs(dx) < 65 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
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
    if (active === 'communities') loadCommunities();
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
    const choice=window.prompt('Why are you reporting this account?\\n1. Harassment or bullying\\n2. Spam or scams\\n3. Impersonation\\n4. Inappropriate content\\n5. Other');
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
  async function messagePerson(person){if(!person?.id||person.id===session.user.id)return;const {data,error}=await supabase.rpc('grin_create_direct_conversation',{other_user:person.id});if(error||!data){setAuthError(error?.message||'Could not open this conversation. Please try again.');return;}const name=person.display_name||person.username||'GRIN user';const chat={id:data,name,preview:'Start a conversation.',initials:name.slice(0,2).toUpperCase(),avatar_url:person.avatar_url||null,peer_id:person.id,peer_username:person.username,kind:'direct'};setChats(current=>[chat,...current.filter(item=>item.id!==data)]);setSelected(chat);setChatOpen(true);setProfileView(null);setActive('chats');}
  async function togglePersonFollow(person){const target=person||profileView;if(!target||target.type==='creator'||target.id===session.user.id)return;const followed=person?followedIds.has(target.id):profileFollowed;if(followed){await supabase.from('grin_follows').delete().eq('follower_id',session.user.id).eq('following_id',target.id);if(person)setFollowedIds(x=>{const n=new Set(x);n.delete(target.id);return n;});else setProfileFollowed(false);}else{await supabase.from('grin_follows').insert({follower_id:session.user.id,following_id:target.id});if(person)setFollowedIds(x=>new Set([...x,target.id]));else setProfileFollowed(true);}}

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
    if (!session) return;
    const channel = supabase.channel('grin:notifications:' + session.user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grin_notifications', filter: 'user_id=eq.' + session.user.id }, async payload => {
        if (payload.new.actor_id === session.user.id) return;
        const updated = await loadNotifications();
        const item = updated?.find(n => n.id === payload.new.id) || payload.new;
        if (toastEnabled) setNotificationToast(item);
        if (document.visibilityState === 'hidden' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification('GRIN', { body: item.body || ('New ' + String(item.kind || 'activity').replaceAll('_',' ') + ' notification') }); } catch {}
        }
        window.setTimeout(() => setNotificationToast(current => current?.id === item.id ? null : current), 5500);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, toastEnabled]);

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
    if (notification.conversation_id) {const chat=chats.find(item=>item.id===notification.conversation_id);if(chat){setSelected(chat);setChatOpen(true);}setActive('chats');return;}
    if (notification.actor_id && notification.grin_profiles) {
      await openPersonProfile({id:notification.actor_id,...notification.grin_profiles});
      return;
    }
    if (notification.kind === 'message') setActive('chats');
  }

  async function loadPosts() {
    const { data: follows, error: followError } = await supabase.from('grin_follows').select('following_id').eq('follower_id',session.user.id);
    const nextFollowed=new Set((follows||[]).map(x=>x.following_id)); setFollowedIds(nextFollowed);
    const { data, error: postError } = await supabase.from('grin_posts').select('id,author_id,body,media_url,media_type,repost_of_id,created_at,grin_profiles(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(50);
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

  useEffect(() => {
    if (!session || selected.id === 'welcome') return;
    loadMessages(selected.id); markChatRead(selected.id);
    const channel = supabase.channel('grin:conversation:' + selected.id, { config: { private: false } })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grin_messages', filter: 'conversation_id=eq.' + selected.id }, payload => {
        setMessages(current => current.some(m => m.id === payload.new.id) ? current : [...current, payload.new]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'grin_messages', filter: 'conversation_id=eq.' + selected.id }, payload => {
        setMessages(current => current.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
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
    const chat = { id: data, name: person.display_name || person.username, preview: 'Start a conversation.', initials: (person.display_name || person.username).slice(0, 2).toUpperCase(), avatar_url:person.avatar_url||null, peer_id:person.id, peer_username:person.username, kind:'direct' };
    setChats(current => current.some(x => x.id === chat.id) ? current : [chat, ...current.filter(x => x.id !== 'welcome')]);
    setSelected(chat);
    setChatOpen(true);
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
    const {data,error}=await supabase.rpc('grin_get_my_conversation_list');
    if(error){console.error('GRIN chat list failed to load',error);return;}
    const rows=(data||[]).map(x=>{
      const name=x.conversation_title||x.peer_display_name||x.peer_username||'GRIN chat';
      const preview=x.last_message_at?(x.last_message_media_type==='audio'?'🎙 Voice note':x.last_message_media_type==='image'?'📷 Photo':x.last_message_media_type==='video'?'🎥 Video':x.last_message_body||'Message'):'Start a conversation.';
      return {id:x.conversation_id,name,preview,initials:name.slice(0,2).toUpperCase(),avatar_url:x.peer_avatar_url||null,peer_id:x.peer_id||null,peer_username:x.peer_username||null,kind:x.conversation_kind||'direct',lastMessageAt:x.last_message_at||x.joined_at};
    });
    if(!rows.length){setChats(fallbackChats);setUnreadCounts({});return;}
    setChats(rows);
    loadUnreadCounts(rows);
  }

  useEffect(() => { if (!session) return; const channel=supabase.channel('grin:presence',{config:{presence:{key:session.user.id}}}); channel.on('presence',{event:'sync'},()=>{const state=channel.presenceState();const map={};Object.entries(state).forEach(([id,rows])=>{if(id!==session.user.id)map[id]=rows[0]?.display_name||rows[0]?.username||'GRIN user';});setOnlineUsers(map);}).on('broadcast',{event:'typing'},({payload})=>{if(payload.user_id===session.user.id)return;setTypingUsers(x=>({...x,[payload.user_id]:payload.typing}));setTimeout(()=>setTypingUsers(x=>({...x,[payload.user_id]:false})),1800);}).subscribe(async status=>{if(status==='SUBSCRIBED')await channel.track({user_id:session.user.id,display_name:profile?.display_name||profile?.username||'GRIN user'});}); return ()=>{channel.untrack();supabase.removeChannel(channel);}; },[session,profile]);
  function broadcastTyping(value){if(!session)return;supabase.channel('grin:presence').send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:value}});}

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
      setMessages(current=>[...rows,...current.filter(m=>!rows.some(old=>old.id===m.id))]);
      setHasMoreMessages(fetched.length===50);
      const ids=fetched.map(m=>m.id);
      if(ids.length){const {data:r}=await supabase.from('grin_message_reactions').select('*').in('message_id',ids); const map={}; (r||[]).forEach(x=>{map[x.message_id]=[...(map[x.message_id]||[]),x]}); setMessageReactions(current=>({...current,...map}));}
    }
    setLoadingOlderMessages(false);
  }
  async function markChatRead(conversationId){ await supabase.from('grin_conversation_members').update({last_read_at:new Date().toISOString()}).eq('conversation_id',conversationId).eq('user_id',session.user.id); setUnreadCounts(x=>({...x,[conversationId]:0})); }
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
    if(!sharePostTarget||!chat?.id||chat.id==='welcome') return;
    const p=sharePostTarget;
    const payload=p.community_id
      ? {conversation_id:chat.id,sender_id:session.user.id,body:p.body?.trim()||'Shared a GRIN community post',shared_community_post_id:p.id}
      : {conversation_id:chat.id,sender_id:session.user.id,body:p.body?.trim()||'Shared a GRIN post',shared_post_id:p.id};
    const {data,error}=await supabase.from('grin_messages').insert(payload).select().single();
    if(error){setAuthError(error.message);return;}
    setSharePostTarget(null); setSelected(chat); setActive('chats');
    setMessages(current=>selected.id===chat.id?(current.some(m=>m.id===data.id)?current:[...current,data]):current);
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

  return <div className="app" data-grin-theme={theme}>{notificationToast&&<button type="button" className="grin-toast" onClick={()=>{const item=notificationToast;setNotificationToast(null);openNotification(item);}} aria-live="polite"><span className="grin-toast-icon"><Bell size={18}/></span><span><strong>GRIN notification</strong><small>{notificationToast.body || ('New ' + String(notificationToast.kind || 'activity').replaceAll('_',' ') + ' notification')}</small></span><X size={16} onClick={event=>{event.stopPropagation();setNotificationToast(null);}}/></button>}{activeStatus&&activeStatusGroup&&<div className="grin-status-viewer" role="dialog" aria-modal="true" aria-label="Status viewer" onClick={closeStatusViewer}><div className="grin-status-viewer-card" onClick={event=>event.stopPropagation()}><div className="grin-status-progress">{activeStatusGroup.items.map((item,index)=><span key={item.id} className={index<=activeStatusIndex?'complete':''}><i/></span>)}</div><header className="grin-status-viewer-head"><div className="grin-status-viewer-avatar">{activeStatusGroup.profile?.avatar_url?<img src={activeStatusGroup.profile.avatar_url} alt=""/>:(activeStatusGroup.profile?.display_name||activeStatusGroup.profile?.username||'G').slice(0,1).toUpperCase()}</div><div className="grin-status-viewer-person"><strong>{activeStatusGroup.profile?.display_name||activeStatusGroup.profile?.username||(activeStatus.author_id===session.user.id?'My status':'GRIN user')}</strong><small>{new Date(activeStatus.created_at).toLocaleString()}</small></div><button type="button" aria-label="Close status" onClick={closeStatusViewer}><X size={22}/></button></header><div className="grin-status-viewer-media">{activeStatus.media_url?(activeStatus.media_type==='video'?<video src={activeStatus.media_url} autoPlay playsInline controls/>:<img src={activeStatus.media_url} alt="Status update"/>):<div className="grin-status-text-card">{activeStatus.caption||'A moment shared on GRIN'}</div>}{activeStatus.media_url&&activeStatus.caption&&<div className="grin-status-caption">{activeStatus.caption}</div>}<button type="button" className="grin-status-tap grin-status-tap-left" aria-label="Previous status" onClick={()=>moveStatus(-1)}><ChevronLeft size={28}/></button><button type="button" className="grin-status-tap grin-status-tap-right" aria-label="Next status" onClick={()=>moveStatus(1)}><ChevronRight size={28}/></button></div><footer className="grin-status-viewer-foot"><span><Eye size={15}/> {activeStatus.author_id===session.user.id?statusViewCount+' viewer'+(statusViewCount===1?'':'s'):'Status · 48 hours'}</span>{activeStatus.media_url&&<a href={activeStatus.media_url} download target="_blank" rel="noreferrer">Download</a>}</footer>{activeStatus.author_id===session.user.id?<div className="grin-status-viewer-details"><strong>Seen by</strong>{statusViewers.length?statusViewers.map(row=><div className="grin-status-viewer-row" key={row.id}><span className="chat-avatar">{row.viewer?.avatar_url?<img src={row.viewer.avatar_url} alt=""/>:(row.viewer?.display_name||row.viewer?.username||'G').slice(0,1).toUpperCase()}</span><span>{row.viewer?.display_name||row.viewer?.username||'GRIN user'}</span><small>{new Date(row.viewed_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>):<small>No views yet.</small>}</div>:<div className="grin-status-reply"><div className="grin-status-replies">{statusReplies.map(reply=><div key={reply.id}><strong>{reply.grin_profiles?.display_name||reply.grin_profiles?.username||'GRIN user'}</strong><span>{reply.body}</span></div>)}</div><form onSubmit={event=>{event.preventDefault();replyToStatus();}}><input value={statusReplyDraft} onChange={event=>setStatusReplyDraft(event.target.value)} placeholder="Reply to this status…" maxLength={2000} aria-label="Reply to status"/><button type="submit" disabled={!statusReplyDraft.trim()}><Send size={16}/></button></form>{statusReplyNotice&&<small role="status">{statusReplyNotice}</small>}</div>}</div></div>}<header className="topbar"><div className="brand"><span className="brand-mark">☺</span><span>GRIN</span></div><div className="search people-search"><Search size={18}/><input value={personSearch} onChange={e=>searchPeople(e.target.value)} placeholder={groupMode?'Search people to add to group':'Find people on GRIN'} aria-label="Find people on GRIN"/>{personSearch.trim() && <div className="people-results" role="status" aria-live="polite">{peopleLoading ? <div className="people-search-status">Finding people…</div> : people.length ? people.map(p=><button key={p.id} className={groupSelected.some(x=>x.id===p.id)?'selected-person':''} onClick={()=>startChat(p)}><div className="chat-avatar">{(p.display_name||p.username).slice(0,2).toUpperCase()}</div><div><strong>{p.display_name||'GRIN User'}</strong><span>@{p.username}{groupMode&&groupSelected.some(x=>x.id===p.id)?' · Selected':''}</span></div><MessageCircle size={16}/></button>) : <div className="people-search-status">No people found. Try another name or username.</div>}</div>}</div><div className="top-actions"><button className="more-menu-toggle" type="button" aria-expanded={showMoreMenu} onClick={()=>setShowMoreMenu(x=>!x)}><Compass size={18}/><span>Explore GRIN</span></button><button className="avatar" type="button" onClick={()=>setActive('profile')} aria-label="Open your profile" title="Your profile">{(profile?.display_name||session.user.email||'G')[0].toUpperCase()}</button><button className="logout" onClick={()=>supabase.auth.signOut({ scope: 'local' })} title="Sign out"><LogOut size={18}/></button></div></header>{showMoreMenu&&<div className="more-menu-panel" role="navigation" aria-label="More GRIN functions">{[[House,'Home','discover'],[Compass,'Explore','explore'],[MessageCircle,'Messages','chats'],[Users,'Communities','communities'],[Palette,'Creators','creators'],[ShoppingBag,'Marketplace','marketplace'],[BriefcaseBusiness,'Jobs & Gigs','jobs'],[Store,'Business & Pro','business'],[Bell,'Notifications','notifications'],[SettingsIcon,'Settings','settings'],[UserRound,'Profile','profile'],[Compass,'Discover all','directory']].map(([Icon,label,key])=><button type="button" key={key} className={active===key?'more-menu-item active':'more-menu-item'} onClick={()=>{setActive(key);if(key==='explore')window.setTimeout(()=>document.querySelector('.explore-search input')?.focus(),120);setShowMoreMenu(false);}}><Icon size={18}/><span>{label}</span></button>)}</div>}<main className="layout" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}><nav className="desktop-sidebar" aria-label="Main navigation"><div className="desktop-nav-label">YOUR SPACE</div>{[[House,'Home','discover'],[Eye,'Status','status'],[Compass,'Explore','explore'],[Compass,'Discover all','directory'],[MessageCircle,'Messages','chats'],[Users,'Communities','communities'],[ShoppingBag,'Marketplace','marketplace'],[BriefcaseBusiness,'Jobs & Gigs','jobs'],[Store,'Business & Pro','business']].map(([Icon,label,key])=><button type="button" key={key} className={active===key?'desktop-nav-item active':'desktop-nav-item'} onClick={()=>{setActive(key);if(key==='chats')setChatOpen(false);setShowMoreMenu(false);}}><Icon size={19}/><span>{label}</span></button>)}<div className="desktop-nav-divider"/><div className="desktop-nav-label">ACCOUNT</div>{[[Bell,'Notifications','notifications'],[UserRound,'Profile','profile'],[SettingsIcon,'Settings','settings']].map(([Icon,label,key])=><button type="button" key={key} className={active===key?'desktop-nav-item active':'desktop-nav-item'} onClick={()=>{setActive(key);setShowMoreMenu(false);}}><Icon size={19}/><span>{label}</span></button>)}</nav><section className="content">{active === 'settings' ? <div className="settings-page"><div className="feed-head"><div><h1>Settings</h1><p>Make GRIN feel right for you.</p></div></div><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><Palette size={20}/></span><div><h2>Appearance</h2><p>Choose the look you want across GRIN.</p></div></div><div className="theme-options">{[{id:'light',name:'Light',detail:'Bright and clean',icon:Sun},{id:'dark',name:'Dark',detail:'Easy on the eyes',icon:Moon},{id:'grin',name:'GRIN',detail:'Forest green, cream and gold',icon:Palette}].map(option=>{const Icon=option.icon;return <button type="button" key={option.id} className={'theme-option '+(theme===option.id?'selected':'')} onClick={()=>setTheme(option.id)} aria-pressed={theme===option.id}><span className={'theme-swatch '+option.id}><Icon size={20}/></span><span><strong>{option.name}</strong><small>{option.detail}</small></span><span className="theme-check">{theme===option.id?'✓':''}</span></button>;})}</div></section><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><Bell size={20}/></span><div><h2>Notifications</h2><p>Control the alerts that appear while you use GRIN.</p></div></div><label className="settings-toggle"><span><strong>In-app pop-ups</strong><small>Show a small alert when new activity arrives.</small></span><input type="checkbox" checked={toastEnabled} onChange={e=>setToastEnabled(e.target.checked)}/></label><div className="settings-action-row"><div><strong>Browser notifications</strong><small>Allow GRIN to show alerts when this tab is in the background.</small></div><button type="button" className="secondary-btn" onClick={async()=>{if(typeof Notification==='undefined'){setSearchNotice('Browser notifications are not supported here.');return;}const permission=await Notification.requestPermission();setSearchNotice(permission==='granted'?'Browser notifications enabled for this browser session.':permission==='denied'?'Browser notifications are blocked in browser settings.':'Notification permission was not granted.');}}>{typeof Notification!=='undefined'&&Notification.permission==='granted'?'Enabled':'Enable'}</button></div>{searchNotice&&<p className="settings-note" role="status">{searchNotice}</p>}</section><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><UserRound size={20}/></span><div><h2>Account & safety</h2><p>Manage your account and personal space.</p></div></div><button type="button" className="settings-link" onClick={()=>setActive('profile')}>Edit profile <ChevronRight size={18}/></button><button type="button" className="settings-link" onClick={()=>setActive('notifications')}>Manage notifications <ChevronRight size={18}/></button><button type="button" className="settings-link" onClick={()=>supabase.auth.signOut({ scope: 'local' })}>Sign out <LogOut size={18}/></button></section><section className="settings-card"><div className="settings-card-heading"><span className="settings-symbol"><Ban size={20}/></span><div><h2>Blocked accounts</h2><p>People you have blocked are hidden from people search.</p></div></div>{safetyNotice&&<p className="settings-note" role="status">{safetyNotice}</p>}{blockedUsers.length?blockedUsers.map(person=><div className="settings-action-row" key={person.id}><div><strong>{person.display_name||person.username||'GRIN user'}</strong><small>@{person.username||'user'}</small></div><button type="button" className="secondary-btn" onClick={()=>unblockPerson(person)}>Unblock</button></div>):<p className="settings-note">You have not blocked anyone.</p>}</section></div> : active === 'directory' ? <div className="directory-page"><div className="feed-head"><div><h1>Discover GRIN</h1><p>Everything happening across your community, in one place.</p></div></div><div className="directory-search"><Search size={18}/><input value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} placeholder="Search people, products, jobs and more" aria-label="Search all of GRIN"/><button type="button" onClick={()=>searchExplore()}>Search</button></div><div className="directory-grid">{[{key:'explore',title:'Explore',desc:'Find people, ideas and fresh activity',icon:Compass,number:suggestedPeople.length},{key:'marketplace',title:'Marketplace',desc:'Products, services and sellers',icon:ShoppingBag,number:listings.length},{key:'communities',title:'Communities',desc:'Join groups and conversations',icon:Users,number:communities.length},{key:'jobs',title:'Jobs & Gigs',desc:'Work, freelance gigs and hiring',icon:BriefcaseBusiness,number:jobs.length},{key:'creators',title:'Creators',desc:'Discover talent and creative work',icon:Palette,number:creators.length},{key:'business',title:'Business & Pro',desc:'Businesses and professional profiles',icon:Store,number:businesses.length},{key:'chats',title:'Chat',desc:'Continue your conversations',icon:MessageCircle,number:Object.values(unreadCounts).reduce((a,b)=>a+b,0)},{key:'notifications',title:'Notifications',desc:'See replies, follows and activity',icon:Bell,number:notifications.filter(n=>!n.read_at).length},{key:'profile',title:'Your profile',desc:'Your identity and posts on GRIN',icon:UserRound,number:posts.filter(p=>p.author_id===session.user.id).length},{key:'settings',title:'Settings',desc:'Themes, alerts and account options',icon:SettingsIcon,number:null}].map(item=>{const Icon=item.icon;return <button type="button" className="directory-card" key={item.key} onClick={()=>setActive(item.key)}><span className="directory-card-icon"><Icon size={22}/></span><span className="directory-card-copy"><strong>{item.title}</strong><small>{item.desc}</small></span>{item.number!==null&&<span className="directory-count">{item.number}</span>}<ChevronRight size={18}/></button>;})}</div>{exploreQuery.trim()&&<div className="directory-results"><h2>Search results</h2>{exploreLoading?<p>Searching GRIN…</p>:searchNotice?<p>{searchNotice}</p>:<div className="directory-result-grid">{[['People',exploreResults.people,x=>x.display_name||x.username],['Posts',exploreResults.posts,x=>x.body?.slice(0,110)],['Community posts',exploreResults.communityPosts,x=>x.body?.slice(0,110)],['Communities',exploreResults.communities,x=>x.name],['Businesses',exploreResults.businesses,x=>x.name],['Creators',exploreResults.creators,x=>x.headline||x.category],['Marketplace',exploreResults.listings,x=>x.title],['Jobs & Gigs',exploreResults.jobs,x=>x.title]].map(([label,rows,getName])=><section key={label}><h3>{label}</h3>{rows.length?rows.slice(0,5).map((row,i)=>label==='People'?<div className="explore-person-result" key={row.id}><button type="button" className="suggestion-person-link" onClick={()=>openPersonProfile(row)}><span className="chat-avatar">{(row.display_name||row.username||'G').slice(0,2).toUpperCase()}</span><strong>{row.display_name||'GRIN User'}</strong><small>@{row.username||'user'}</small>{row.bio&&<small className="explore-person-bio">{row.bio}</small>}</button><button type="button" className="secondary-btn" onClick={()=>togglePersonFollow(row)}>{followedIds.has(row.id)?'Following':'Follow'}</button><button type="button" className="secondary-btn" onClick={()=>startChat(row)}><MessageCircle size={15}/> Message</button></div>:<p key={row.id||row.user_id||i}>{getName(row)||label}</p>):<small>No matches</small>}</section>)}</div>}</div>}</div> : active === 'explore' ? <div className="explore-page"><div className="feed-head"><div><h1>Explore</h1><p>Search across people, creators, businesses, listings and jobs.</p></div></div><section className="profile-card" aria-label="Find and invite friends"><div className="feed-head"><div><h2>Find your people</h2><p>Search for people by name or username, or invite friends to join GRIN. Your phone contacts stay on your device.</p></div><button type="button" className="primary" onClick={inviteFriends}>Invite friends</button></div>{inviteNotice&&<p className="profile-notice" role="status">{inviteNotice}</p>}</section><section className="profile-card people-directory" aria-label="People on GRIN"><div className="feed-head"><div><h2>People on GRIN</h2><p>Browse accounts and open a profile to follow, message, block or report.</p></div><span className="directory-count">{directoryPeople.length}</span></div>{directoryPeopleLoading ? <p className="settings-note">Loading people…</p> : directoryPeople.length ? <div className="people-directory-list">{directoryPeople.map(person=><div className="people-directory-row" key={person.id}><button type="button" className="suggestion-person-link" onClick={()=>openPersonProfile(person)}><span className="chat-avatar">{person.avatar_url?<img src={person.avatar_url} alt=""/>:(person.display_name||person.username||'G').slice(0,2).toUpperCase()}</span><span><strong>{person.display_name||'GRIN User'}</strong><small>@{person.username||'user'}</small></span></button><button type="button" className="secondary-btn" onClick={()=>openPersonProfile(person)}>View profile</button></div>)}</div> : <p className="settings-note">No other accounts are available to show yet.</p>}</section><div className="directory-search explore-search"><Search size={18}/><input value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} placeholder="What are you looking for?" aria-label="Search GRIN"/><button type="button" onClick={()=>searchExplore()}>Search</button></div>{exploreLoading?<div className="empty-state">Searching GRIN…</div>:<div className="directory-results"><div className="directory-result-grid">{[['People',exploreResults.people,x=>x.display_name||x.username],['Posts',exploreResults.posts,x=>x.body?.slice(0,110)],['Community posts',exploreResults.communityPosts,x=>x.body?.slice(0,110)],['Communities',exploreResults.communities,x=>x.name],['Businesses',exploreResults.businesses,x=>x.name],['Creators',exploreResults.creators,x=>x.headline||x.category],['Marketplace',exploreResults.listings,x=>x.title],['Jobs & Gigs',exploreResults.jobs,x=>x.title]].map(([label,rows,getName])=><section key={label}><h3>{label}</h3>{rows.length?rows.slice(0,8).map((row,i)=>label==='People'?<div className="explore-person-result" key={row.id}><button type="button" className="suggestion-person-link" onClick={()=>openPersonProfile(row)}><span className="chat-avatar">{(row.display_name||row.username||'G').slice(0,2).toUpperCase()}</span><strong>{row.display_name||'GRIN User'}</strong><small>@{row.username||'user'}</small>{row.bio&&<small className="explore-person-bio">{row.bio}</small>}</button><button type="button" className="secondary-btn" onClick={()=>togglePersonFollow(row)}>{followedIds.has(row.id)?'Following':'Follow'}</button><button type="button" className="secondary-btn" onClick={()=>startChat(row)}><MessageCircle size={15}/> Message</button></div>:<p key={row.id||row.user_id||i}>{getName(row)||label}</p>):<small>{exploreQuery?'No matches yet':'Start with a search above'}</small>}</section>)}</div></div>}</div> : active === 'communities' ? <div className="explore-page"><div className="feed-head"><div><h1>Communities</h1><p>Find your people, interests, industries and conversations.</p></div></div><form className="profile-card explore-form" onSubmit={createCommunity}><h2>Create a community</h2><input value={communityForm.name} onChange={e=>setCommunityForm({...communityForm,name:e.target.value})} placeholder="Community name" required maxLength={80}/><textarea value={communityForm.description} onChange={e=>setCommunityForm({...communityForm,description:e.target.value})} placeholder="What is this community about?"/><input value={communityForm.category} onChange={e=>setCommunityForm({...communityForm,category:e.target.value})} placeholder="Category"/>{communityNotice&&<div className="profile-notice">{communityNotice}</div>}<button className="primary">Create community</button></form><div className="profile-card community-filters"><input value={communitySearch} onChange={e=>setCommunitySearch(e.target.value)} placeholder="Search communities..."/><select value={communityCategory} onChange={e=>setCommunityCategory(e.target.value)}><option>All</option>{[...new Set(communities.map(x=>x.category).filter(Boolean))].map(c=><option key={c}>{c}</option>)}</select></div><div className="explore-grid">{communities.filter(x=>(!communitySearch.trim()||[x.name,x.description,x.category].join(' ').toLowerCase().includes(communitySearch.trim().toLowerCase()))&&(communityCategory==='All'||x.category===communityCategory)).map(x=><article className="explore-card" key={x.id||x.user_id||x.community_id||x.title||x.body?.slice(0,30)}><strong>{x.name}</strong><span>{x.category}</span><p>{x.description||'A GRIN community.'}</p><small>{communityMembers[x.id]?.count||0} member{(communityMembers[x.id]?.count||0)===1?'':'s'}</small><div className="card-actions"><button className="secondary-btn" onClick={()=>toggleCommunityMembership(x.id)}>{communityMembers[x.id]?.joined?'Leave':'Join'}</button><button className="secondary-btn" onClick={async()=>{setSelectedCommunity(x);setCommunityNotice('');await loadCommunityPosts(x.id);}}>Open community</button></div></article>)}</div>{selectedCommunity&&<section className="profile-card community-room"><div className="feed-head"><div><h2>{selectedCommunity.name}</h2><p>{selectedCommunity.description||'Community discussion'}</p></div><button className="secondary-btn" onClick={()=>setSelectedCommunity(null)}>Close</button></div><form onSubmit={publishCommunityPost} className="composer"><textarea value={communityPost} onChange={e=>setCommunityPost(e.target.value)} placeholder="Share something with this community..." maxLength={5000}/><button className="primary">Post</button></form><div className="feed-list">{communityPosts.length?communityPosts.map(p=><article className="post-card" id={'grin-post-' + p.id} key={p.id}><div className="post-meta"><strong>{p.author_id===session.user.id?'You':'GRIN member'}</strong><span>{new Date(p.created_at).toLocaleString()}</span></div><p>{p.body}</p><button className="secondary-btn" onClick={()=>setSharePostTarget({...p,community_id:selectedCommunity.id})}>↗ Share to chat</button></article>):<div className="empty-state">No posts yet. Start the conversation.</div>}</div></section>}</div> : active === 'business' ? <div className="business-page"><div className="feed-head"><div><h1>Business & Professional</h1><p>Build a presence for your business, brand or professional identity on GRIN.</p></div></div><div className="business-grid"><form className="profile-card business-form" onSubmit={createBusiness}><h2>Create a business profile</h2><label>Business name<input value={businessForm.name} onChange={e=>setBusinessForm({...businessForm,name:e.target.value})} required maxLength={100}/></label><label>Handle<input value={businessForm.handle} onChange={e=>setBusinessForm({...businessForm,handle:e.target.value})} placeholder="yourbrand" required minLength={3} maxLength={40}/></label><label>Category<input value={businessForm.category} onChange={e=>setBusinessForm({...businessForm,category:e.target.value})}/></label><label>Description<textarea value={businessForm.description} onChange={e=>setBusinessForm({...businessForm,description:e.target.value})} maxLength={500}/></label><label>Website<input value={businessForm.website} onChange={e=>setBusinessForm({...businessForm,website:e.target.value})} placeholder="https://..."/></label><label>Location<input value={businessForm.location} onChange={e=>setBusinessForm({...businessForm,location:e.target.value})}/></label>{businessNotice&&<div className="profile-notice">{businessNotice}</div>}<button className="primary" type="submit">Create business profile</button></form><div><div className="pro-dashboard"><div><h2>Professional dashboard</h2><p>Turn your GRIN presence into a portfolio, storefront and client channel.</p></div><div className="stats-grid"><div><b>{businessStats.views}</b><span>Views</span></div><div><b>{businessStats.followers}</b><span>Followers</span></div><div><b>{businessStats.contacts}</b><span>Enquiries</span></div><div><b>{businessStats.productViews}</b><span>Product views</span></div></div></div><form className="profile-card pro-form" onSubmit={saveProfessional}><h2>Professional profile</h2><input placeholder="Headline e.g. Creative Director" value={professional.headline} onChange={e=>setProfessional({...professional,headline:e.target.value})}/><input placeholder="Industry" value={professional.industry} onChange={e=>setProfessional({...professional,industry:e.target.value})}/><input placeholder="Location" value={professional.location} onChange={e=>setProfessional({...professional,location:e.target.value})}/><input placeholder="Website" value={professional.website} onChange={e=>setProfessional({...professional,website:e.target.value})}/><input placeholder="Skills, separated by commas" value={professional.skills} onChange={e=>setProfessional({...professional,skills:e.target.value})}/><input placeholder="Portfolio URL" value={professional.portfolio_url} onChange={e=>setProfessional({...professional,portfolio_url:e.target.value})}/><select value={professional.availability} onChange={e=>setProfessional({...professional,availability:e.target.value})}><option value="available">Available for work</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select><input type="number" placeholder="Hourly rate" value={professional.hourly_rate} onChange={e=>setProfessional({...professional,hourly_rate:e.target.value})}/>{proNotice&&<div className="profile-notice">{proNotice}</div>}<button className="primary">Save professional profile</button></form><h2 className="business-list-title">GRIN businesses</h2>{businesses.length===0?<div className="empty-state">No business profiles yet. Create the first one.</div>:<div className="business-list">{businesses.map(b=><article className="business-card" key={b.id}><div className="business-avatar">{b.name.slice(0,2).toUpperCase()}</div><div className="business-info"><strong>{b.name}{b.verified&&' ✓'}</strong><span>@{b.handle} · {b.category}</span><p>{b.description||'Business profile on GRIN.'}</p>{b.location&&<small>📍 {b.location}</small>}</div><div className="business-actions"><button className="secondary-btn" onClick={()=>openBusinessProfile(b)}>View profile</button>{b.owner_id!==session.user.id&&<button className="secondary-btn" onClick={()=>followBusiness(b.id)}>Follow</button>}<button className="primary small-btn" onClick={()=>createLead(b.id)}>Contact</button></div></article>)}</div>}</div></div></div> : active === 'creators' ? <div className="explore-page"><div className="feed-head"><div><h1>Creators</h1><p>Discover people building, making and creating on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={saveCreator}><h2>Your creator profile</h2><input placeholder="Headline" value={creatorForm.headline} onChange={e=>setCreatorForm({...creatorForm,headline:e.target.value})}/><input placeholder="Category" value={creatorForm.category} onChange={e=>setCreatorForm({...creatorForm,category:e.target.value})}/><textarea placeholder="Creator bio" value={creatorForm.bio} onChange={e=>setCreatorForm({...creatorForm,bio:e.target.value})}/><input placeholder="Location" value={creatorForm.location} onChange={e=>setCreatorForm({...creatorForm,location:e.target.value})}/><input placeholder="Website" value={creatorForm.website} onChange={e=>setCreatorForm({...creatorForm,website:e.target.value})}/><input type="number" placeholder="Rate" value={creatorForm.rate} onChange={e=>setCreatorForm({...creatorForm,rate:e.target.value})}/>{creatorNotice&&<div className="profile-notice">{creatorNotice}</div>}<button className="primary">Save creator profile</button></form><div className="explore-grid">{creators.map(x=><article className="explore-card" key={x.user_id}><div className="chat-avatar">{(x.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><strong>{x.grin_profiles?.display_name||'GRIN Creator'}</strong><span>{x.headline||x.category}</span><p>{x.bio}</p><small>{x.location}</small><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following':'Follow creator'}</button></article>)}</div></div>
 : active === 'marketplace' ? <div className="explore-page"><div className="feed-head"><div><h1>Marketplace</h1><p>Buy, sell and discover things through GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createListing}><h2>Publish a listing</h2><input placeholder="Title" value={listingForm.title} onChange={e=>setListingForm({...listingForm,title:e.target.value})} required/><textarea placeholder="Description" value={listingForm.description} onChange={e=>setListingForm({...listingForm,description:e.target.value})}/><input placeholder="Category" value={listingForm.category} onChange={e=>setListingForm({...listingForm,category:e.target.value})}/><input type="number" placeholder="Price" value={listingForm.price} onChange={e=>setListingForm({...listingForm,price:e.target.value})}/><input placeholder="External purchase/contact URL" value={listingForm.external_url} onChange={e=>setListingForm({...listingForm,external_url:e.target.value})}/>{listingNotice&&<div className="profile-notice">{listingNotice}</div>}<button className="primary">Publish listing</button></form><div className="explore-grid">{listings.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.price!=null?x.currency+' '+Number(x.price).toLocaleString():'Contact seller'}</b>{x.external_url&&<a href={x.external_url} target="_blank" rel="noreferrer">View / buy</a>}<button className="secondary-btn" onClick={()=>setShareListingTarget(x)}>Share to chat</button></article>)}</div></div>
 : active === 'jobs' ? <div className="explore-page"><div className="feed-head"><div><h1>Jobs & Gigs</h1><p>Find work, clients and collaborators on GRIN.</p></div></div><form className="profile-card explore-form" onSubmit={createJob}><h2>Post a job or gig</h2><input placeholder="Title" value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} required/><textarea placeholder="Describe the work" value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} required/><input placeholder="Category" value={jobForm.category} onChange={e=>setJobForm({...jobForm,category:e.target.value})}/><input type="number" placeholder="Budget" value={jobForm.budget} onChange={e=>setJobForm({...jobForm,budget:e.target.value})}/>{jobNotice&&<div className="profile-notice">{jobNotice}</div>}<button className="primary">Post job</button></form><div className="explore-grid">{jobs.map(x=><article className="explore-card" key={x.id}><strong>{x.title}</strong><span>{x.category}</span><p>{x.description}</p><b>{x.budget!=null?x.currency+' '+Number(x.budget).toLocaleString():'Budget open'}</b>{x.poster_id!==session.user.id&&<button className="secondary-btn" onClick={()=>applyJob(x)}>Apply</button>}</article>)}</div></div> : active === 'notifications' ? <div className="notifications-page"><div className="feed-head"><div><h1>Notifications {notifications.some(n=>!n.read_at)&&<span className="nav-badge">{notifications.filter(n=>!n.read_at).length}</span>}</h1><p>Stay in the loop with what happens around you.</p></div><div className="notification-actions"><button className="secondary-btn" onClick={async()=>{if(typeof Notification==='undefined'){setSearchNotice('This browser does not support system notifications.');return;}const permission=await Notification.requestPermission();setSearchNotice(permission==='granted'?'System notifications enabled.':permission==='denied'?'Notifications are blocked in browser settings.':'Notification permission was not granted.');}}>Enable notifications</button><button className="secondary-btn" onClick={markNotificationsRead}>Mark all read</button></div></div>{searchNotice&&<div className="search-feedback" role="status">{searchNotice}</div>}<div className="notification-list">{notifications.length===0&&<div className="empty-state">No notifications yet.</div>}{notifications.map(n=><button key={n.id} className={n.read_at?'notification-row':'notification-row unread'} onClick={()=>openNotification(n)}><div className="chat-avatar">{(n.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{n.grin_profiles?.display_name||'GRIN User'}</strong><span>{n.body}</span><small>{new Date(n.created_at).toLocaleString()}</small></div></button>)}</div></div> : active === 'status' ? <div className="feed-page"><div className="feed-head"><div><h1>Status</h1><p>Share a moment. Catch up with your people.</p></div></div><section className="grin-status-section" aria-label="Status updates"><div className="grin-status-heading"><div><h2>Status</h2><p>Everyday moments from your people · lasts 48 hours</p></div><button type="button" className="grin-add-status" onClick={()=>setShowStoryComposer(value=>!value)}><Plus size={16}/>{showStoryComposer?'Close':'Add status'}</button></div><div className="grin-stories-strip"><button type="button" className="grin-story-add" onClick={()=>{const mine=stories.filter(item=>item.author_id===session.user.id);if(mine.length)openStatusGroup(session.user.id);else setShowStoryComposer(true);}} aria-label="Open your status"><span className="grin-story-ring add">{profile?.avatar_url?<img src={profile.avatar_url} alt=""/>:<span>{(profile?.display_name||profile?.username||'G').slice(0,1).toUpperCase()}</span>}<i className="grin-status-plus"><Plus size={13}/></i></span><small>My status</small><em>{stories.some(item=>item.author_id===session.user.id)?'View update':'Tap to add'}</em></button>{storyGroups.filter(group=>group.authorId!==session.user.id).slice(0,20).map(group=><button type="button" className="grin-story-item" key={group.authorId} onClick={()=>openStatusGroup(group.authorId)} aria-label={'View status from '+(group.profile?.display_name||group.profile?.username||'GRIN user')}><span className="grin-story-ring"><span className="grin-status-avatar">{group.profile?.avatar_url?<img src={group.profile.avatar_url} alt=""/>:<span>{(group.profile?.display_name||group.profile?.username||'G').slice(0,1).toUpperCase()}</span>}</span></span><small>{group.profile?.display_name||group.profile?.username||'GRIN user'}</small><em>{group.items.length} update{group.items.length===1?'':'s'}</em></button>)}</div>{showStoryComposer&&<form className="grin-status-composer" onSubmit={createStory}><div className="grin-status-composer-title"><strong>Share a status</strong><span>Visible for 48 hours</span></div><textarea value={storyCaption} onChange={e=>setStoryCaption(e.target.value)} placeholder="What’s happening? Add a photo, video or a thought…" maxLength={500}/><div className="grin-status-composer-actions"><label className="media-pick">📷 Photo / Video<input id="grin-story-input" type="file" accept="image/*,video/*" onChange={e=>setStoryFile(e.target.files?.[0]||null)}/></label>{storyFile&&<span className="grin-status-file">{storyFile.name}</span>}<span className="grin-status-spacer"/><span className="grin-status-count">{storyCaption.length}/500</span><button className="primary" type="submit" disabled={(!storyCaption.trim()&&!storyFile)}>Share status</button></div>{storyNotice&&<div className="profile-notice">{storyNotice}</div>}</form>}</section></div> : active === 'discover' ? <div className="feed-page">
<div className="feed-head"><div><h1>Home</h1><p>Your people. Your interests. Your GRIN.</p></div><button className="mobile-create-shortcut" onClick={()=>document.getElementById('grin-post-composer')?.scrollIntoView({behavior:'smooth',block:'center'})}>＋ Post</button></div><div className="feed-tabs"><button className={feedMode==='for-you'?'active':''} onClick={()=>setFeedMode('for-you')}>For You</button><button className={feedMode==='following'?'active':''} onClick={()=>setFeedMode('following')}>Following</button><button className={feedMode==='trending'?'active':''} onClick={()=>setFeedMode('trending')}>Trending</button></div><div className="explore-search"><Search size={19}/><input type="search" value={exploreQuery} onChange={e=>setExploreQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchExplore(exploreQuery)} placeholder="Search people, businesses, creators, listings and jobs…" aria-label="Search all of GRIN"/><button className="primary" type="button" disabled={exploreLoading||!exploreQuery.trim()} onClick={()=>searchExplore(exploreQuery)}>{exploreLoading?'Searching…':'Search GRIN'}</button></div>{(exploreQuery.trim()||searchNotice)&&<div className="search-feedback" aria-live="polite">{exploreLoading?'Looking across people, businesses, creators, listings and jobs…':searchNotice||(()=>{const total=Object.values(exploreResults).reduce((n,rows)=>n+rows.length,0);return total?total+' result'+(total===1?'':'s')+' found across GRIN':'No matches yet. Try a different name or keyword.'})()}</div>}<div className="suggestions-card"><div className="feed-head"><div><h2>Discover on GRIN</h2><p>People, creators and businesses worth connecting with.</p></div></div><div className="suggestions-section"><h3>People you may know</h3><div className="suggestions-row">{suggestedPeople.map(p=><article className="suggestion" key={p.id}><div className="chat-avatar">{(p.display_name||'G').slice(0,2).toUpperCase()}</div><button className="suggestion-person-link" onClick={()=>openPersonProfile(p)}><strong>{p.display_name||'GRIN User'}</strong><span>@{p.username||'user'}{p.mutualCount?' · '+p.mutualCount+' mutual':''}</span></button><button className="secondary-btn" onClick={async()=>{await togglePersonFollow(p);setSuggestedPeople(x=>x.filter(v=>v.id!==p.id));}}>{followedIds.has(p.id)?'Following':'Follow'}</button></article>)}</div></div><div className="suggestions-section"><h3>Creators to discover</h3><div className="suggestions-row">{suggestedCreators.map(x=><article className="suggestion" key={x.user_id}><div className="chat-avatar">{(x.grin_profiles?.display_name||'C').slice(0,2).toUpperCase()}</div><strong>{x.grin_profiles?.display_name||'Creator'}</strong><span>{x.category||x.headline||'Creator'}</span><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following':'Follow creator'}</button></article>)}</div></div><div className="suggestions-section"><h3>Businesses to discover</h3><div className="suggestions-row">{suggestedBusinesses.map(x=><article className="suggestion" key={x.id}><div className="chat-avatar">{(x.name||'B').slice(0,2).toUpperCase()}</div><strong>{x.name}</strong><span>{x.category||'Business'}{x.verified?' · ✓':''}</span><button className="secondary-btn" onClick={()=>openBusinessProfile(x)}>View business</button></article>)}</div></div></div>{businessView && (
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
{profileView && createPortal((
  <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Person profile" style={{position:'fixed',inset:0,zIndex:2147483647,display:'flex',visibility:'visible',opacity:1,alignItems:'center',justifyContent:'center',overflowY:'auto',background:'rgba(0,0,0,.62)',padding:'20px',pointerEvents:'auto'}} onClick={event=>{if(event.target===event.currentTarget)setProfileView(null);}}>
    <div className="profile-card" style={{position:'relative',zIndex:1,maxHeight:'calc(100dvh - 40px)',overflowY:'auto',overscrollBehavior:'contain',width:'100%',maxWidth:420,margin:'auto'}}>
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
{shareListingTarget&&<div className="profile-modal"><div className="profile-card share-card"><button className="secondary-btn" onClick={()=>setShareListingTarget(null)}>Close</button><h2>Share listing to…</h2><p>{shareListingTarget.title}</p><div className="share-chat-list">{chats.filter(x=>x.id!=='welcome').map(chat=><button className="secondary-btn share-chat-item" key={chat.id} onClick={()=>shareListingToChat(chat)}><span className="chat-avatar">🛍️</span><span><strong>{chat.name}</strong><small>{chat.preview||'GRIN chat'}</small></span></button>)}</div></div></div>}{shareProfileTarget&&<div className="profile-modal"><div className="profile-card share-card"><button className="secondary-btn" onClick={()=>setShareProfileTarget(null)}>Close</button><h2>Share {shareProfileTarget.type==='creator'?'creator':'business'} to…</h2><p>Choose a GRIN chat.</p><div className="share-chat-list">{chats.filter(x=>x.id!=='welcome').map(chat=><button className="secondary-btn share-chat-item" key={chat.id} onClick={()=>shareProfileToChat(chat)}><span className="chat-avatar">{(shareProfileTarget.display_name||shareProfileTarget.name||'G').slice(0,2).toUpperCase()}</span><span><strong>{shareProfileTarget.display_name||shareProfileTarget.name}</strong><small>{shareProfileTarget.type==='creator'?'Creator profile':'Business profile'}</small></span></button>)}</div></div></div>}
{exploreQuery&&!exploreLoading&&<div className="explore-results">{[['People',exploreResults.people],['Posts',exploreResults.posts],['Community posts',exploreResults.communityPosts],['Communities',exploreResults.communities],['Businesses',exploreResults.businesses],['Creators',exploreResults.creators],['Marketplace',exploreResults.listings],['Jobs',exploreResults.jobs]].map(([title,rows])=><section key={title}><h2>{title}</h2><div className="explore-grid">{rows.length?rows.map(x=><article className="explore-card" key={x.id}><strong>{x.display_name||x.name||x.title||x.headline||(x.body?x.body.slice(0,90):'GRIN post')}</strong><span>{x.username?'@'+x.username:x.community_id?'Community post':x.author_id?'Post':x.category||x.location||''}</span><p>{x.bio||x.description||x.headline||(x.body?x.body.slice(0,220):'')}</p>{x.username&&<><button className="secondary-btn" onClick={()=>openPersonProfile(x)}>View profile</button>{x.id!==session.user.id&&<button className="secondary-btn" onClick={async()=>{await togglePersonFollow(x);}}>{followedIds.has(x.id)?'Following':'Follow'}</button>}</>}{x.user_id&&<><button className="secondary-btn" onClick={()=>openCreatorProfile(x)}>View creator</button><button className="secondary-btn" onClick={()=>toggleCreatorFollow(x.user_id)}>{followedCreators.has(x.user_id)?'Following creator':'Follow creator'}</button></>}{x.name&&x.handle&&<button className="secondary-btn" onClick={()=>openBusinessProfile(x)}>View business</button>}{x.body&&x.author_id&&!x.community_id&&<button className="secondary-btn" onClick={()=>{setSharedPostId(x.id);setActive('discover');}}>Open post</button>}{x.body&&x.community_id&&<button className="secondary-btn" onClick={async()=>{const community=communities.find(item=>item.id===x.community_id)||{id:x.community_id,name:x.grin_communities?.name||'Community'};setSelectedCommunity(community);setActive('communities');await loadCommunityPosts(x.community_id);}}>Open community post</button>}{x.description&&x.name&&!x.handle&&<button className="secondary-btn" onClick={()=>{setCommunitySearch(x.name);setActive('communities');}}>Find community</button>}{x.price!=null&&<><b>{x.currency} {Number(x.price).toLocaleString()}</b><button className="secondary-btn" onClick={()=>toggleSavedListing(x.id)}>{savedListings.has(x.id)?'Saved':'Save listing'}</button></>}{x.budget!=null&&<b>{x.currency} {Number(x.budget).toLocaleString()}</b>}</article>):<div className="empty-state">No {title.toLowerCase()} found.</div>}</div></section>)}</div>}
<form id="grin-post-composer" className="post-composer" onSubmit={createPost}>
  <textarea value={postBody} onChange={e=>setPostBody(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/>
  {postFile&&<div className="file-chip">📎 {postFile.name} <button type="button" onClick={()=>{setPostFile(null);const x=document.getElementById('grin-media-input');if(x)x.value='';}}>×</button></div>}
  <div className="post-actions"><label className="media-pick">📷 Photo / Video<input id="grin-media-input" type="file" accept="image/*,video/*" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><span>{postBody.length}/5000</span><button className="primary" type="submit" disabled={(!postBody.trim()&&!postFile)||postLoading}>{postLoading?'Posting...':'Post to GRIN'}</button></div>
  {postNotice&&<div className="profile-notice">{postNotice}</div>}
  {externalShareNotice&&<div className="profile-notice">{externalShareNotice}<button type="button" className="secondary-btn" onClick={()=>setExternalShareNotice('')}>Dismiss</button></div>}
  <button type="button" className="secondary-btn" onClick={()=>setShowPollComposer(x=>!x)}>{showPollComposer?'Remove poll':'Add poll'}</button>
  {showPollComposer&&<div className="poll-composer"><input value={pollQuestion} onChange={e=>setPollQuestion(e.target.value)} placeholder="Ask a question..." maxLength={300}/>{pollOptions.map((o,i)=><div className="poll-option-row" key={i}><input value={o} onChange={e=>setPollOptions(x=>x.map((v,j)=>j===i?e.target.value:v))} placeholder={'Option '+(i+1)} maxLength={100}/>{pollOptions.length>2&&<button type="button" onClick={()=>setPollOptions(x=>x.filter((_,j)=>j!==i))}>×</button>}</div>)}<button type="button" className="secondary-btn" onClick={()=>setPollOptions(x=>[...x,''])}>+ Add option</button></div>}
</form>
{(feedMode==='following'?posts.filter(p=>followedIds.has(p.author_id)||p.author_id===session.user.id):feedMode==='trending'?[...posts].sort((a,b)=>((reactionCounts[b.id]||0)+(commentCounts[b.id]||0))-((reactionCounts[a.id]||0)+(commentCounts[a.id]||0))):posts).map(p=><article className="post-card" key={p.id}>
  <div className="post-author"><div className="chat-avatar">{p.grin_profiles?.avatar_url?<img src={p.grin_profiles.avatar_url} alt=""/>:(p.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{p.grin_profiles?.display_name||'GRIN User'}</strong><span>@{p.grin_profiles?.username||'user'} · {new Date(p.created_at).toLocaleString()}</span></div></div>
  {p.repost_of_id&&<div className="repost-label">🔁 Reposted post</div>}
  {p.author_id===session.user.id&&<div className="own-post-tools"><span>Your post</span><button type="button" className="own-post-menu-trigger" aria-label="Post options" title="Post options" aria-expanded={ownPostMenuId===p.id} onClick={()=>setOwnPostMenuId(ownPostMenuId===p.id?null:p.id)}><MoreHorizontal size={20}/></button>{ownPostMenuId===p.id&&<div className="own-post-menu"><button type="button" onClick={()=>{setEditingPostId(editingPostId===p.id?null:p.id);setEditingPostBody(p.body||'');setPostNotice('');setOwnPostMenuId(null);}}><Pencil size={15}/>{editingPostId===p.id?'Cancel edit':'Edit post'}</button><button type="button" className="danger-option" disabled={postMutationBusy} onClick={()=>{setOwnPostMenuId(null);deleteOwnPost(p);}}><Trash2 size={15}/>Delete post</button></div>}</div>}
  {editingPostId===p.id?<div className="post-edit-box"><textarea aria-label="Edit your post" value={editingPostBody} onChange={e=>setEditingPostBody(e.target.value)} maxLength={5000} rows={4}/><div className="post-edit-actions"><span>{editingPostBody.length}/5000</span><button type="button" className="primary" disabled={postMutationBusy||!editingPostBody.trim()} onClick={()=>savePostEdit(p)}>{postMutationBusy?'Saving…':'Save changes'}</button></div></div>:<p className="post-body">{p.body}</p>}
  {p.media_url&&p.media_type==='image'&&<img className="post-media" src={p.media_url} alt=""/>}{p.media_url&&p.media_type==='video'&&<video className="post-media" src={p.media_url} controls/>}
  {polls[p.id]&&<div className="poll-card"><strong>{polls[p.id].question}</strong>{polls[p.id].grin_poll_options?.map(o=>{const count=pollVoteCounts[polls[p.id].id]?.[o.id]||0;const total=Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0);const pct=total?Math.round(count*100/total):0;return <button type="button" className={pollVotes[polls[p.id].id]===o.id?'poll-choice selected':'poll-choice'} key={o.id} onClick={()=>votePoll(polls[p.id],o.id)}><span>{o.option_text}</span><b>{pct}%</b></button>})}<small>{Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0)} vote{Object.values(pollVoteCounts[polls[p.id].id]||{}).reduce((a,b)=>a+b,0)===1?'':'s'} · {pollVotes[polls[p.id].id]?'Your vote is recorded':'Choose an option'} · {polls[p.id].expires_at&&new Date(polls[p.id].expires_at)>new Date()?'Open':'Closed'}</small></div>}
  <div className="post-footer"><div className="reaction-wrap"><button onClick={()=>setReactionMenu(reactionMenu===p.id?null:p.id)}>{reactionMine[p.id]||'♥'} React <span>{reactionCounts[p.id]||0}</span></button>{reactionMenu===p.id&&<div className="reaction-menu">{['like','❤️','😂','😍','😮','😢','🔥'].map(r=><button key={r} type="button" onClick={()=>reactToPost(p.id,r)}>{r}</button>)}</div>}</div><button onClick={()=>toggleComments(p.id)}>💬 Comment <span>{commentCounts[p.id]||0}</span></button><button onClick={()=>repostPost(p)}>🔁 Repost</button><button onClick={()=>toggleBookmark(p.id)}>🔖 {bookmarks.has(p.id)?'Saved':'Save'}</button><button onClick={()=>{setExternalShareNotice('');sharePostExternally(p);}}>↗ Share link</button><button onClick={()=>setSharePostTarget(p)}>✉ Send in GRIN</button></div>
  {openComments===p.id&&<div className="comments"><div className="comment-list">{(comments[p.id]||[]).map(c=><div className="comment" key={c.id}><div className="chat-avatar">{(c.grin_profiles?.display_name||'G').slice(0,2).toUpperCase()}</div><div><strong>{c.grin_profiles?.display_name||'GRIN User'}</strong><p>{c.body}</p></div></div>)}</div><div className="comment-compose"><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} placeholder="Write a comment..."/><button className="send" onClick={()=>addComment(p.id)}><Send size={16}/></button></div></div>}
</article>)}
</div> : active === 'profile' ? <div className="profile-page"><div className="profile-cover"><div className="profile-avatar-large">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.display_name || 'G').slice(0,2).toUpperCase()}</div><div><h1>{profile?.display_name || 'GRIN User'}</h1><p>@{profile?.username || 'user'}</p><p className="profile-bio">{profile?.bio || 'Add a little about yourself so people know you.'}</p><div className="profile-cover-actions"><span className="profile-post-count">{posts.filter(p=>p.author_id===session.user.id).length} posts</span><button type="button" className="secondary-btn" onClick={()=>shareProfileExternally(profile)}>↗ Share profile link</button>{externalProfileShareNotice&&<small className="profile-notice">{externalProfileShareNotice}</small>}</div></div></div><form className="profile-card" onSubmit={saveProfile}><h2>Edit profile</h2><label>Username<input value={profileForm.username} onChange={e=>setProfileForm({...profileForm,username:e.target.value})} minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" required /></label><label>Display name<input value={profileForm.display_name} onChange={e=>setProfileForm({...profileForm,display_name:e.target.value})} maxLength={60} required /></label><label>Bio<textarea value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} maxLength={160} placeholder="Tell people a little about you..." /></label><label>Phone number (optional)<input type="tel" inputMode="tel" autoComplete="tel" value={profileForm.phone_e164} onChange={e=>setProfileForm({...profileForm,phone_e164:e.target.value})} placeholder="+2348012345678" /></label><small className="profile-private-note">Private — saved separately from your public profile and visible only to you. Contact matching will remain off until phone verification is safely implemented.</small><label>Profile photo<div className="avatar-upload-row">{(avatarPreview || profile?.avatar_url) && <img className="avatar-upload-preview" src={avatarPreview || profile.avatar_url} alt="Profile photo preview" />}<input id="grin-avatar-input" type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0]||null;setAvatarFile(file);setAvatarPreview(file?URL.createObjectURL(file):'');}} /></div><small>Choose a photo from your device. JPG, PNG or another image format, up to 5 MB.</small></label>{profileNotice && <div className="profile-notice">{profileNotice}</div>}<button className="primary" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button></form></div> : <><div className="chat-list"><div className="section-head"><div><h1>Chats {Object.values(unreadCounts).reduce((a,b)=>a+b,0)>0&&<span className="nav-badge">{Object.values(unreadCounts).reduce((a,b)=>a+b,0)}</span>}</h1><p>Conversations that come alive.</p></div><button className="icon-btn" onClick={()=>{setGroupMode(x=>!x);setGroupSelected([]);setGroupName('');setAuthError('');}} title="Create group"><Plus size={20}/></button></div><input className="chat-search" value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search your conversations..." aria-label="Search your conversations"/>{groupMode&&<div className="group-builder"><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Group name" maxLength={80}/><p>{groupSelected.length} member{groupSelected.length===1?'':'s'} selected</p><div className="group-chips">{groupSelected.map(p=><button type="button" key={p.id} onClick={()=>setGroupSelected(x=>x.filter(v=>v.id!==p.id))}>{p.display_name||p.username} ×</button>)}</div><button className="primary" onClick={createGroup}>Create group</button></div>}{chats.filter(c=>(c.name+' '+c.preview).toLowerCase().includes(chatSearch.toLowerCase())).map(c=><button key={c.id} onClick={()=>{setSelected(c);setChatOpen(true);setAuthError('');}} className={selected.id===c.id?'chat-row selected':'chat-row'}><div className="chat-avatar">{c.avatar_url?<img src={c.avatar_url} alt=""/>:c.initials}</div><div className="chat-meta"><strong>{c.name}</strong><span>{c.preview}</span>{unreadCounts[c.id]>0&&<b className="unread-badge">{unreadCounts[c.id]}</b>}</div></button>)}{chats.filter(c=>(c.name+' '+c.preview).toLowerCase().includes(chatSearch.toLowerCase())).length===0&&<div className="chat-empty-state"><MessageCircle size={24}/><strong>{chatSearch?'No chats match that search':'Your conversations start here'}</strong><span>{chatSearch?'Try another name or clear the search.':'Search for someone above to say hello.'}</span></div>}</div><div className={chatOpen?'conversation chat-open':'conversation'}><div className="conversation-head"><button type="button" className="chat-back-button" onClick={()=>setChatOpen(false)} aria-label="Back to chat list"><ChevronLeft size={20}/></button><div className="chat-avatar">{selected.avatar_url?<img src={selected.avatar_url} alt=""/>:selected.initials}</div><div><strong>{selected.peer_id?<button type="button" className="chat-profile-link" onClick={()=>openPersonProfile({id:selected.peer_id,username:selected.peer_username,display_name:selected.name,avatar_url:selected.avatar_url})}>{selected.name}</button>:selected.name}</strong><span>{selected.id === 'welcome' ? 'GRIN' : (selected.peer_id&&onlineUsers[selected.peer_id] ? 'online' : 'offline')}{Object.values(typingUsers).some(Boolean) ? ' · typing…' : ''}</span></div></div><div className="messages">{selected.id !== "welcome" && hasMoreMessages && <button type="button" className="secondary-btn" onClick={loadOlderMessages} disabled={loadingOlderMessages}>{loadingOlderMessages ? "Loading older messages…" : "Load older messages"}</button>}{selected.id === 'welcome' && <div className="welcome"><div className="welcome-icon">☺</div><h2>Welcome to GRIN</h2><p>Your real account is connected. The next layer is finding people and starting conversations.</p></div>}{messages.map(m=><div className={m.sender_id===session.user.id?'bubble mine':'bubble'} key={m.id}>{m.deleted_at?<em>This message was deleted.</em>:<>{m.sender_id!==session.user.id&&<small className="message-sender-name">{m.sender_profile?.display_name||m.sender_profile?.username||'GRIN user'}</small>}<div>{m.reply_to_id&&<div className="reply-preview">Replying to a message</div>}{m.media_url&&(m.media_type==='audio'?<audio src={m.media_url} controls preload="metadata" className="message-audio" aria-label="Voice note"/>:(m.media_type==='video'?<video src={m.media_url} controls className="message-media"/>:<img src={m.media_url} className="message-media" alt=""/>))}{m.shared_post_id&&<div className="shared-post-card"><strong>Shared GRIN post</strong><span>{m.body}</span></div>}{m.shared_community_post_id&&<div className="shared-post-card"><strong>Shared community post</strong><span>{m.body}</span></div>}{m.shared_creator_id&&<div className="shared-post-card"><strong>🎨 {m.shared_creator?.grin_profiles?.display_name||'GRIN Creator'}</strong><span>{m.shared_creator?.headline||m.shared_creator?.category||'Creator profile'}</span><small>@{m.shared_creator?.grin_profiles?.username||'creator'} · {m.shared_creator?.location||'GRIN'}</small></div>}{m.shared_business_id&&<div className="shared-post-card"><strong>💼 {m.shared_business?.name||'GRIN Business'}</strong><span>{m.shared_business?.category||'Business profile'}</span><small>@{m.shared_business?.handle||'business'} · {m.shared_business?.location||'GRIN'}</small></div>}{m.shared_listing_id&&<div className="shared-post-card"><strong>🛍️ {m.shared_listing?.title||'GRIN Marketplace listing'}</strong><span>{m.shared_listing?.category||'Marketplace'}</span><small>{m.shared_listing?.price!=null?(m.shared_listing?.currency||'NGN')+' '+Number(m.shared_listing.price).toLocaleString():'Contact seller'}</small></div>}{m.body}</div>{m.edited_at&&<small>edited</small>}<div className="message-actions"><button onClick={()=>setReplyingTo(m)}>Reply</button><button onClick={()=>toggleMessageReaction(m,'❤️')}>❤️ {(messageReactions[m.id]||[]).filter(x=>x.reaction==='❤️').length||''}</button>{m.sender_id===session.user.id&&<><button onClick={()=>editMessage(m)}>Edit</button><button onClick={()=>deleteMessage(m)}>Delete</button></>}</div></>}</div>)}</div>{sharePostTarget&&<div className="profile-modal"><div className="profile-card share-card"><button className="secondary-btn" onClick={()=>setSharePostTarget(null)}>Close</button><h2>Send post to…</h2><p>Choose a GRIN chat.</p><div className="share-chat-list">{chats.filter(x=>x.id!=='welcome').map(chat=><button className="secondary-btn share-chat-item" key={chat.id} onClick={()=>sharePostToChat(chat)}><span className="chat-avatar">{chat.initials}</span><span><strong>{chat.name}</strong><small>{chat.preview||'Conversation'}</small></span></button>)}</div></div></div>}<div className="composer">{replyingTo&&<div className="replying">Replying to: {replyingTo.body.slice(0,60)} <button onClick={()=>setReplyingTo(null)}>×</button></div>}<label className="icon-btn file-btn" title="Attach photo or video" aria-label="Attach photo or video">＋<input type="file" accept="image/*,video/*" hidden onChange={e=>setMessageFile(e.target.files?.[0]||null)}/></label><label className="icon-btn file-btn" title="Take a photo" aria-label="Take a photo"><Camera size={19}/><input type="file" accept="image/*" capture="environment" hidden onChange={e=>setMessageFile(e.target.files?.[0]||null)}/></label><button type="button" className="icon-btn" title={isRecordingVoice?'Stop voice note':'Record voice note'} aria-label={isRecordingVoice?'Stop voice note':'Record voice note'} onClick={toggleVoiceRecording} disabled={selected.id==='welcome'}>{isRecordingVoice?<Square size={18}/>:<Mic size={19}/>}</button><button type="button" className="icon-btn" title="Add a smile" aria-label="Add a smile" onClick={()=>setMessage(current=>current+' 😊')}><Smile size={20}/></button><textarea rows={1} value={message} onChange={e=>{setMessage(e.target.value);broadcastTyping(Boolean(e.target.value.trim()));}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder={selected.id === 'welcome' ? 'Select a chat to start…' : 'Write a message… (Shift+Enter for new line)'} aria-label="Write a message"/>{isRecordingVoice&&<small className="attachment-name" role="status">Recording voice note… tap stop when finished</small>}{messageFile&&<div className="message-attachment-preview">{messageFile.type.startsWith('image/')?<img src={URL.createObjectURL(messageFile)} alt="Attachment preview"/>:<span>{messageFile.type.startsWith('audio/')?'🎙 Voice note':messageFile.type.startsWith('video/')?'🎥 Video':'📎'} {messageFile.name}</span>}<button type="button" onClick={()=>{setMessageFile(null);document.querySelectorAll('.composer input[type=file]').forEach(input=>{input.value='';});}} aria-label="Remove attachment"><X size={15}/></button></div>}<button className="send" onClick={send} disabled={isRecordingVoice||sendingMessage||selected.id==='welcome'} aria-label={sendingMessage?'Sending message':'Send message'}><Send size={18}/></button></div></div></>}</section></main><nav className="mobile-bottom-nav" aria-label="Main navigation"><button className={active==='discover'?'active':''} onClick={()=>setActive('discover')}><House size={20}/><span>Home</span></button><button className={active==='chats'?'active':''} onClick={()=>{setChatOpen(false);setActive('chats');}}><MessageCircle size={20}/><span>Chat</span></button><button className={active==='status'?'active':''} onClick={()=>{setActive('status');setShowMoreMenu(false);}}><Eye size={22}/><span>Status</span></button><button className={active==='directory'?'active':''} onClick={()=>{setActive('directory');setShowMoreMenu(false);}}><MoreHorizontal size={20}/><span>More</span></button><button className={active==='explore'?'active':''} onClick={()=>setActive('explore')}><Search size={20}/><span>Explore</span></button></nav></div>;
}
