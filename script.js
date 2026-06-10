// ════════════════════════════════════════
// CHATFIC - Virtual Dating Content Creator
// Exact Design Implementation
// ════════════════════════════════════════

class ChatficApp {
  constructor() {
    this.currentSection = 'hero';
    this.selectedTemplate = 'story'; // Default selection (center template)
    this.currentTemplateIndex = 1; // Start with middle template
    this.uploadedProfileImage = null; // Store uploaded profile image
    this.uploadedBackgroundImage = null; // Store uploaded background image
    this.shareMenuVisible = false; // Track share menu visibility
    this.messages = []; // Store chat messages
    this.notifications = []; // Store lock screen notifications
    this.messageIdCounter = 0; // Counter for unique message IDs
    this.notificationIdCounter = 0; // Counter for unique notification IDs
    this.lockScreenDark = false; // Dark mode state for lock screen
    this.series = this.loadSeriesFromStorage(); // Series list
    this.currentSeriesId = null; // Currently open series
    this.mainTab = 'create'; // Current main tab
    this.feedFilter = 'popular'; // Feed filter
    this.currentPostId = null; // Currently open post
    this.likedPosts = new Set(JSON.parse(localStorage.getItem('chatfic_liked') || '[]'));
    this.dummyFeed = this.buildDummyFeed();
    this.recentSearches = JSON.parse(localStorage.getItem('chatfic_recent_searches') || '[]');
    this.profileData = JSON.parse(localStorage.getItem('chatfic_profile') || 'null') || { nickname: 'nickname', bio: '당신의 AU를 만들어보세요 ✨', avatar: null };
    this.favData = JSON.parse(localStorage.getItem('chatfic_fav') || 'null');
    this.currentProfileTab = 'works';
    this.savedPosts = new Set(JSON.parse(localStorage.getItem('chatfic_saved') || '[]'));
    this.followingData = this.buildDummyFollowing();
    this.userPosts = JSON.parse(localStorage.getItem('chatfic_user_posts') || '[]');
    this.init();
  }

  init() {
    this.bindEvents();
    this.initTemplateSelection();
    this.setInitialTemplate();
    this.showSection('hero');
    // 하단 nav 항상 표시
    const nav = document.getElementById('bottomNav');
    if (nav) nav.style.display = 'flex';
    document.getElementById('bnHome')?.classList.add('active');
  }

  bindEvents() {
    // Template preview cards
    document.querySelectorAll('.template-preview-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        this.scrollToTemplate(index);
      });
    });

    // Template selection options
    document.querySelectorAll('.template-option').forEach(option => {
      option.addEventListener('click', () => {
        const templateType = option.getAttribute('onclick').match(/'(.*)'/)?.[1];
        if (templateType) {
          this.selectTemplate(templateType);
        }
      });
    });

    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.getAttribute('onclick').match(/'(.*)'/)?.[1];
        if (page) {
          this.navigateTo(page);
        }
      });
    });
  }

  initTemplateSelection() {
    const container = document.querySelector('.template-preview-container');
    if (!container) return;

    // Set up scroll-based template selection
    this.setupScrollSelection(container);
    
    // Set up touch/mouse interaction for template cards
    const cards = document.querySelectorAll('.template-preview-card');
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        this.scrollToTemplate(index);
      });
    });
  }

  setupScrollSelection(container) {
    let isScrolling = false;
    
    container.addEventListener('scroll', () => {
      if (isScrolling) return;
      
      isScrolling = true;
      requestAnimationFrame(() => {
        this.updateActiveTemplate();
        isScrolling = false;
      });
    });
  }

  updateActiveTemplate() {
    const container = document.querySelector('.template-preview-container');
    const cards = document.querySelectorAll('.template-preview-card');
    
    if (!container || !cards.length) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex !== this.currentTemplateIndex) {
      this.currentTemplateIndex = closestIndex;
      this.updateTemplateStates();
    }
  }

  scrollToTemplate(index) {
    const container = document.querySelector('.template-preview-container');
    const cards = document.querySelectorAll('.template-preview-card');
    
    if (!container || !cards[index]) return;
    
    const card = cards[index];
    const containerWidth = container.offsetWidth;
    const cardOffsetLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    
    // Calculate scroll position to center the card
    const scrollLeft = cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2);
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
    
    this.currentTemplateIndex = index;
    this.updateTemplateStates();
  }
  
  setInitialTemplate() {
    // Set the middle template as active initially and scroll to it
    setTimeout(() => {
      this.scrollToTemplate(this.currentTemplateIndex);
    }, 100); // Small delay to ensure DOM is ready
  }

  updateTemplateStates() {
    const cards = document.querySelectorAll('.template-preview-card');
    const templates = ['message', 'story', 'notification'];
    const templateNames = ['Message Chat', 'Instagram Story', 'Lock Screen'];
    
    // Update active states
    cards.forEach((card, index) => {
      if (index === this.currentTemplateIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
    
    this.selectedTemplate = templates[this.currentTemplateIndex] || 'story';
    
    // Log for debugging
    console.log(`Selected template: ${templateNames[this.currentTemplateIndex]} (${templates[this.currentTemplateIndex]})`);
  }

  showSection(sectionId) {
    const sections = ['hero', 'templates', 'editor', 'series', 'seriesDetail', 'explore', 'search', 'profile'];
    const flexSections = new Set(['series', 'seriesDetail', 'search', 'profile']);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const target = document.getElementById(sectionId);
    if (target) target.style.display = flexSections.has(sectionId) ? 'flex' : 'block';
    // hero로 돌아올 때 패널 상태 복원
    if (sectionId === 'hero') {
      const panelCreate = document.getElementById('panelCreate');
      const panelFeed = document.getElementById('panelFeed');
      if (panelCreate) panelCreate.style.display = this.mainTab === 'feed' ? 'none' : 'block';
      if (panelFeed) panelFeed.style.display = this.mainTab === 'feed' ? 'block' : 'none';
    }
    this.currentSection = sectionId;
  }

  navigateTo(page) {
    ['bnHome','bnSearch','bnSeries','bnProfile'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    const map = { home: 'bnHome', search: 'bnSearch', series: 'bnSeries', profile: 'bnProfile' };
    const activeId = map[page];
    if (activeId) document.getElementById(activeId)?.classList.add('active');

    switch(page) {
      case 'home':
        this.showSection('hero');
        break;
      case 'create':
        this.showSection('hero');
        document.getElementById('bnHome')?.classList.add('active');
        break;
      case 'search':
        this.showSection('search');
        this.renderSearchDefault();
        break;
      case 'series':
        this.showSection('series');
        this.renderSeriesList();
        break;
      case 'profile':
        this.showSection('profile');
        this.renderProfile();
        break;
    }
  }

  // ════════════════════════════════════════
  // MAIN TAB SWITCHING
  // ════════════════════════════════════════

  switchMainTab(tab) {
    this.mainTab = tab;
    document.getElementById('tabCreate').classList.toggle('active', tab === 'create');
    document.getElementById('tabFeed').classList.toggle('active', tab === 'feed');
    document.getElementById('panelCreate').style.display = tab === 'create' ? 'block' : 'none';
    document.getElementById('panelFeed').style.display = tab === 'feed' ? 'block' : 'none';
    if (tab === 'feed') this.renderFeed();
    // 만들기로 돌아올 때 템플릿 선택 재초기화
    if (tab === 'create') {
      setTimeout(() => {
        this.initTemplateSelection();
        this.scrollToTemplate(this.currentTemplateIndex);
      }, 50);
    }
  }

  setFeedFilter(filter) {
    this.feedFilter = filter;
    this.renderFeed();
  }

  buildDummyFeed() {
    return [
      {
        id: 1,
        username: 'jungkook_au',
        avatar: 'https://i.pravatar.cc/150?img=11',
        image: 'Images/Stories.png',
        type: 'story',
        series: 'Love on Tour AU',
        desc: '공항에서 우연히 눈이 마주쳤을 때... 🌸 #BTS #정국 #AU',
        likes: 2847,
        comments: [
          { id: 1, username: 'army_hana', avatar: 'https://i.pravatar.cc/150?img=47', text: '이거 완전 내 취향ㅠㅠ 다음화 언제 나와요?', time: '2시간 전', likes: 34, liked: false },
          { id: 2, username: 'taekook_shipper', avatar: 'https://i.pravatar.cc/150?img=23', text: '눈빛 묘사가 너무 좋다 진짜 소름', time: '1시간 전', likes: 21, liked: false },
          { id: 3, username: 'bts_fantasy', avatar: 'https://i.pravatar.cc/150?img=31', text: '작가님 제발 빨리 업로드해주세요 ㅠㅠ 기다리다 죽겠어요', time: '45분 전', likes: 18, liked: false },
          { id: 4, username: 'jk_universe', avatar: 'https://i.pravatar.cc/150?img=56', text: '이 장면 읽으면서 심장 내려앉음', time: '20분 전', likes: 9, liked: false },
        ],
        createdAt: Date.now() - 1000 * 60 * 120,
        reported: false,
      },
      {
        id: 2,
        username: 'soobin_world',
        avatar: 'https://i.pravatar.cc/150?img=15',
        image: 'Images/iOS 15 Push Notifications.png',
        type: 'notification',
        series: '새벽 세 시의 문자 AU',
        desc: '새벽 3시에 갑자기 울린 알림... 💬 심장이 멎는 줄 #TOMORROW_X_TOGETHER',
        likes: 1563,
        comments: [
          { id: 1, username: 'txt_lover99', avatar: 'https://i.pravatar.cc/150?img=44', text: '이 설정 진짜 너무 좋아 작가님 천재세요', time: '3시간 전', likes: 57, liked: false },
          { id: 2, username: 'hueningkai_au', avatar: 'https://i.pravatar.cc/150?img=28', text: '캡처해서 친구한테 보냄 ㅋㅋㅋㅋ', time: '2시간 전', likes: 33, liked: false },
          { id: 3, username: 'moaforever', avatar: 'https://i.pravatar.cc/150?img=60', text: '이거 몇 화예요? 처음부터 읽고 싶어요', time: '1시간 전', likes: 12, liked: false },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        reported: false,
      },
      {
        id: 3,
        username: 'enhypen_fic',
        avatar: 'https://i.pravatar.cc/150?img=8',
        image: 'Images/Frame 31.png',
        type: 'message',
        series: '학교 전학생 AU',
        desc: '처음으로 말 걸어온 날의 문자 💌 #ENHYPEN #이희승',
        likes: 3291,
        comments: [
          { id: 1, username: 'engene_2023', avatar: 'https://i.pravatar.cc/150?img=52', text: '이 톤앤매너 너무 귀여워ㅠㅠ', time: '5시간 전', likes: 88, liked: false },
          { id: 2, username: 'sunghoon_au', avatar: 'https://i.pravatar.cc/150?img=19', text: '작가님 혹시 다음 화 예고 있나요??', time: '4시간 전', likes: 41, liked: false },
          { id: 3, username: 'jungwon_fan', avatar: 'https://i.pravatar.cc/150?img=37', text: '문자체 선택이 진짜 완벽함', time: '3시간 전', likes: 29, liked: false },
          { id: 4, username: 'ni_ki_lover', avatar: 'https://i.pravatar.cc/150?img=63', text: '소름 돋아서 댓글 안 달 수가 없음', time: '2시간 전', likes: 17, liked: false },
          { id: 5, username: 'ot7_army', avatar: 'https://i.pravatar.cc/150?img=41', text: '이거 보고 잠 못 잘 것 같아요', time: '30분 전', likes: 6, liked: false },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        reported: false,
      },
      {
        id: 4,
        username: 'seventeen_au',
        avatar: 'https://i.pravatar.cc/150?img=5',
        image: 'Images/Stories.png',
        type: 'story',
        series: '콘서트 백스테이지 AU',
        desc: '무대 끝나고 눈이 마주친 그 순간 ✨ #SEVENTEEN #에스쿱스',
        likes: 982,
        comments: [
          { id: 1, username: 'carat_haru', avatar: 'https://i.pravatar.cc/150?img=25', text: '이런 설정 왜 이렇게 좋냐고ㅠ', time: '6시간 전', likes: 22, liked: false },
          { id: 2, username: 'svt_forever', avatar: 'https://i.pravatar.cc/150?img=48', text: '다음화 기다릴게요!', time: '4시간 전', likes: 11, liked: false },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
        reported: false,
      },
      {
        id: 5,
        username: 'straykids_fic',
        avatar: 'https://i.pravatar.cc/150?img=13',
        image: 'Images/iOS 15 Push Notifications.png',
        type: 'notification',
        series: '비 오는 날 AU',
        desc: '비 오는 날 갑자기 온 알림 하나가 모든 걸 바꿔놨어 ☔ #StrayKids #방찬',
        likes: 2104,
        comments: [
          { id: 1, username: 'stay_minjung', avatar: 'https://i.pravatar.cc/150?img=32', text: '작가님 이거 연재 계속 하시는 거죠??', time: '7시간 전', likes: 45, liked: false },
          { id: 2, username: 'skz_shipper', avatar: 'https://i.pravatar.cc/150?img=57', text: '비 오는 날 설정이 너무 취향이에요', time: '5시간 전', likes: 30, liked: false },
          { id: 3, username: 'hyunjin_au', avatar: 'https://i.pravatar.cc/150?img=20', text: '심장 쫄깃해지는 장면이다', time: '3시간 전', likes: 19, liked: false },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 10,
        reported: false,
      },
      {
        id: 6,
        username: 'ateez_writer',
        avatar: 'https://i.pravatar.cc/150?img=3',
        image: 'Images/Frame 31.png',
        type: 'message',
        series: '데뷔 전날 밤 AU',
        desc: '데뷔 전날 밤, 멤버에게 온 문자 한 통 🌙 #ATEEZ #홍중',
        likes: 1788,
        comments: [
          { id: 1, username: 'atiny_sora', avatar: 'https://i.pravatar.cc/150?img=65', text: '이 설정이 왜 이렇게 슬프냐ㅠㅠ', time: '9시간 전', likes: 61, liked: false },
          { id: 2, username: 'ateez_lore', avatar: 'https://i.pravatar.cc/150?img=42', text: '작가님 글 읽을 때마다 눈물 남', time: '8시간 전', likes: 38, liked: false },
          { id: 3, username: 'wooyoung_fan', avatar: 'https://i.pravatar.cc/150?img=16', text: '이거 보고 덕질 다시 시작함', time: '6시간 전', likes: 24, liked: false },
          { id: 4, username: 'san_universe', avatar: 'https://i.pravatar.cc/150?img=55', text: '문자 말투가 진짜 캐릭터 살아있음', time: '2시간 전', likes: 13, liked: false },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        reported: false,
      },
    ];
  }

  renderFeed() {
    const feedGrid = document.getElementById('feedGrid');
    const feedEmpty = document.getElementById('feedEmpty');
    if (!feedGrid) return;

    let items = [...this.dummyFeed].filter(p => !p.reported);

    if (this.feedFilter === 'latest') {
      items.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      items.sort((a, b) => b.likes - a.likes);
    }

    feedGrid.innerHTML = '';
    feedGrid.style.display = 'grid';
    if (feedEmpty) feedEmpty.classList.remove('visible');

    items.forEach(post => {
      const isLiked = this.likedPosts.has(post.id);
      const card = document.createElement('div');
      card.className = 'feed-card';
      card.onclick = () => this.openPost(post.id);
      card.innerHTML = `
        <div class="feed-card-thumb">
          <img src="${post.image}" alt="" style="width:100%;height:100%;object-fit:cover;">
          <div class="feed-card-likes">
            <i class="fas fa-heart" style="color:${isLiked ? '#FF3B5C' : 'white'};font-size:10px;"></i>
            ${this.formatCount(post.likes + (isLiked ? 1 : 0))}
          </div>
        </div>
        <div class="feed-card-info">
          <div class="feed-card-title">${post.series}</div>
          <div class="feed-card-meta">@${post.username} · ${post.type === 'message' ? '채팅' : post.type === 'story' ? '스토리' : '잠금화면'}</div>
        </div>
      `;
      feedGrid.appendChild(card);
    });
  }

  formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n;
  }

  openPost(postId) {
    const post = this.dummyFeed.find(p => p.id === postId);
    if (!post) return;
    this.currentPostId = postId;

    document.getElementById('postModalAvatar').src = post.avatar;
    document.getElementById('postModalUsername').textContent = '@' + post.username;
    document.getElementById('postModalSeries').textContent = post.series;
    document.getElementById('postModalImage').src = post.image;
    document.getElementById('postModalDesc').textContent = post.desc;

    const isLiked = this.likedPosts.has(post.id);
    const likeBtn = document.getElementById('postLikeBtn');
    likeBtn.classList.toggle('liked', isLiked);
    likeBtn.querySelector('i').className = isLiked ? 'fas fa-heart' : 'far fa-heart';
    document.getElementById('postLikeCount').textContent = this.formatCount(post.likes + (isLiked ? 1 : 0));
    document.getElementById('postCommentCount').textContent = post.comments.length;

    this.renderComments(post);

    document.getElementById('commentInput').value = '';
    document.getElementById('postModal').style.display = 'flex';
  }

  renderComments(post) {
    const container = document.getElementById('postModalComments');
    container.innerHTML = '';
    post.comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <div class="comment-avatar"><img src="${c.avatar}" alt=""></div>
        <div class="comment-body">
          <div class="comment-username">${c.username}</div>
          <div class="comment-text">${c.text}</div>
          <div class="comment-time">${c.time}</div>
        </div>
        <button class="comment-like ${c.liked ? 'liked' : ''}" onclick="app.toggleCommentLike(${post.id}, ${c.id}, this)">
          <i class="${c.liked ? 'fas' : 'far'} fa-heart"></i>
          <span>${c.likes}</span>
        </button>
      `;
      container.appendChild(item);
    });
  }

  toggleLike() {
    const post = this.dummyFeed.find(p => p.id === this.currentPostId);
    if (!post) return;

    const isLiked = this.likedPosts.has(post.id);
    if (isLiked) {
      this.likedPosts.delete(post.id);
    } else {
      this.likedPosts.add(post.id);
    }
    localStorage.setItem('chatfic_liked', JSON.stringify([...this.likedPosts]));

    const newLiked = !isLiked;
    const likeBtn = document.getElementById('postLikeBtn');
    likeBtn.classList.toggle('liked', newLiked);
    likeBtn.querySelector('i').className = newLiked ? 'fas fa-heart' : 'far fa-heart';
    document.getElementById('postLikeCount').textContent = this.formatCount(post.likes + (newLiked ? 1 : 0));

    // 애니메이션
    likeBtn.style.transform = 'scale(1.3)';
    setTimeout(() => { likeBtn.style.transform = 'scale(1)'; }, 150);

    this.renderFeed();
  }

  toggleCommentLike(postId, commentId, btn) {
    const post = this.dummyFeed.find(p => p.id === postId);
    if (!post) return;
    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return;
    comment.liked = !comment.liked;
    comment.likes += comment.liked ? 1 : -1;
    btn.classList.toggle('liked', comment.liked);
    btn.querySelector('i').className = comment.liked ? 'fas fa-heart' : 'far fa-heart';
    btn.querySelector('span').textContent = comment.likes;
  }

  submitComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text) return;
    const post = this.dummyFeed.find(p => p.id === this.currentPostId);
    if (!post) return;
    post.comments.push({
      id: Date.now(),
      username: 'me',
      avatar: '',
      text,
      time: '방금',
      likes: 0,
      liked: false,
    });
    input.value = '';
    this.renderComments(post);
    document.getElementById('postCommentCount').textContent = post.comments.length;
    document.getElementById('postModalComments').scrollTop = 9999;
  }

  focusCommentInput() {
    document.getElementById('commentInput').focus();
  }

  openReportMenu() {
    document.getElementById('reportMenu').style.display = 'flex';
  }

  closeReportMenu(event) {
    if (event && event.target !== document.getElementById('reportMenu')) return;
    document.getElementById('reportMenu').style.display = 'none';
  }

  reportPost(reason) {
    const post = this.dummyFeed.find(p => p.id === this.currentPostId);
    if (post) post.reported = true;
    document.getElementById('reportMenu').style.display = 'none';
    document.getElementById('postModal').style.display = 'none';
    this.showNotification('신고가 접수되었습니다.', 'success');
    this.renderFeed();
  }

  closePostModal(event) {
    if (event && event.target !== document.getElementById('postModal')) return;
    document.getElementById('postModal').style.display = 'none';
    this.currentPostId = null;
  }

  getSharedItems() {
    const items = [];
    this.series.forEach(s => {
      (s.episodes || []).forEach(ep => {
        if (ep.shared) {
          items.push({ ...ep, seriesTitle: s.title });
        }
      });
    });
    if (this.feedFilter === 'latest') {
      items.sort((a, b) => b.createdAt - a.createdAt);
    }
    return items;
  }

  // ════════════════════════════════════════
  // SERIES MANAGEMENT
  // ════════════════════════════════════════

  loadSeriesFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('chatfic_series') || '[]');
    } catch {
      return [];
    }
  }

  saveSeriestoStorage() {
    localStorage.setItem('chatfic_series', JSON.stringify(this.series));
  }

  openCreateSeriesModal() {
    document.getElementById('seriesTitleInput').value = '';
    document.getElementById('seriesDescInput').value = '';
    document.getElementById('createSeriesModal').style.display = 'flex';
    setTimeout(() => document.getElementById('seriesTitleInput').focus(), 100);
  }

  closeCreateSeriesModal(event) {
    if (event && event.target !== document.getElementById('createSeriesModal')) return;
    document.getElementById('createSeriesModal').style.display = 'none';
  }

  confirmCreateSeries() {
    const title = document.getElementById('seriesTitleInput').value.trim();
    if (!title) return;
    const desc = document.getElementById('seriesDescInput').value.trim();
    const newSeries = {
      id: Date.now(),
      title,
      desc,
      createdAt: Date.now(),
      episodes: []
    };
    this.series.unshift(newSeries);
    this.saveSeriestoStorage();
    document.getElementById('createSeriesModal').style.display = 'none';
    this.renderSeriesList();
  }

  deleteSeries(id, event) {
    event.stopPropagation();
    this.series = this.series.filter(s => s.id !== id);
    this.saveSeriestoStorage();
    this.renderSeriesList();
  }

  renderSeriesList() {
    const list = document.getElementById('seriesList');
    const empty = document.getElementById('seriesEmpty');
    if (!list) return;

    list.innerHTML = '';
    if (this.series.length === 0) {
      list.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    list.style.display = 'flex';
    if (empty) empty.style.display = 'none';

    this.series.forEach(s => {
      const card = document.createElement('div');
      card.className = 'series-card';
      card.onclick = () => this.openSeriesDetail(s.id);
      card.innerHTML = `
        <div class="series-card-cover">
          ${s.coverImage ? `<img src="${s.coverImage}" alt="">` : '📖'}
        </div>
        <div class="series-card-info">
          <div class="series-card-title">${s.title}</div>
          <div class="series-card-meta">에피소드 ${(s.episodes || []).length}개 · ${this.formatDate(s.createdAt)}</div>
        </div>
        <div class="series-card-actions">
          <button class="series-action-btn danger" onclick="app.deleteSeries(${s.id}, event)" title="삭제">
            <i class="fas fa-trash-alt"></i>
          </button>
          <i class="fas fa-chevron-right series-card-arrow"></i>
        </div>
      `;
      list.appendChild(card);
    });
  }

  openSeriesDetail(seriesId) {
    this.currentSeriesId = seriesId;
    const s = this.series.find(x => x.id === seriesId);
    if (!s) return;

    document.getElementById('seriesDetailTitle').textContent = s.title;

    const infoEl = document.getElementById('seriesDetailInfo');
    infoEl.innerHTML = `
      ${s.desc ? `<div class="series-detail-desc">${s.desc}</div>` : ''}
      <div class="series-detail-stats">
        <div class="series-stat"><strong>${(s.episodes || []).length}</strong> 에피소드</div>
        <div class="series-stat">생성일 <strong>${this.formatDate(s.createdAt)}</strong></div>
      </div>
    `;

    this.showSection('seriesDetail');
    this.renderEpisodeList(s);
  }

  closeSeriesDetail() {
    this.currentSeriesId = null;
    this.showSection('series');
    this.renderSeriesList();
  }

  addEpisodeToSeries() {
    const s = this.series.find(x => x.id === this.currentSeriesId);
    if (!s) return;
    // 템플릿 선택 후 에디터로 이동, 완료 시 시리즈에 저장
    this._pendingEpisodeSave = true;
    this.showSection('hero');
    this.switchMainTab('create');
  }

  renderEpisodeList(s) {
    const list = document.getElementById('episodeList');
    const empty = document.getElementById('episodeEmpty');
    if (!list) return;

    list.innerHTML = '';
    const episodes = s.episodes || [];

    if (episodes.length === 0) {
      list.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    list.style.display = 'flex';
    if (empty) empty.style.display = 'none';

    episodes.forEach((ep, idx) => {
      const item = document.createElement('div');
      item.className = 'episode-item';
      item.innerHTML = `
        <div class="episode-num">${idx + 1}</div>
        <div class="episode-info">
          <div class="episode-title">${ep.title || `에피소드 ${idx + 1}`}</div>
          <div class="episode-meta">${this.formatDate(ep.createdAt)}</div>
        </div>
        <span class="episode-type-badge">${ep.type === 'message' ? '채팅' : ep.type === 'story' ? '스토리' : '잠금화면'}</span>
        <button class="series-action-btn danger" onclick="app.deleteEpisode(${s.id}, ${ep.id}, event)">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      list.appendChild(item);
    });
  }

  deleteEpisode(seriesId, episodeId, event) {
    event.stopPropagation();
    const s = this.series.find(x => x.id === seriesId);
    if (!s) return;
    s.episodes = s.episodes.filter(ep => ep.id !== episodeId);
    this.saveSeriestoStorage();
    this.renderEpisodeList(s);
    document.getElementById('seriesDetailInfo').querySelector('.series-stat strong').textContent = s.episodes.length;
  }

  saveCurrentAsEpisode() {
    if (!this._pendingEpisodeSave || !this.currentSeriesId) return;
    const s = this.series.find(x => x.id === this.currentSeriesId);
    if (!s) return;
    const ep = {
      id: Date.now(),
      title: `에피소드 ${(s.episodes.length) + 1}`,
      type: this.selectedTemplate,
      createdAt: Date.now(),
      shared: false
    };
    s.episodes.push(ep);
    this.saveSeriestoStorage();
    this._pendingEpisodeSave = false;
  }

  // ════════════════════════════════════════
  // SEARCH
  // ════════════════════════════════════════

  popularGroups = ['BTS', 'SEVENTEEN', 'ENHYPEN', 'Stray Kids', 'ATEEZ', 'TXT', 'aespa', 'NewJeans', 'IVE', 'BLACKPINK', 'EXO', 'NCT'];

  renderSearchDefault() {
    const tagsEl = document.getElementById('popularTags');
    const recentEl = document.getElementById('recentSearches');
    if (tagsEl) {
      tagsEl.innerHTML = this.popularGroups.map(g =>
        `<button class="search-tag" onclick="app.doSearch('${g}')">${g}</button>`
      ).join('');
    }
    if (recentEl) {
      if (this.recentSearches.length === 0) {
        recentEl.innerHTML = '<div style="padding:12px 0;font-size:13px;color:rgba(255,255,255,0.25);">최근 검색 없음</div>';
      } else {
        recentEl.innerHTML = this.recentSearches.slice(0, 5).map(q => `
          <div class="recent-item" onclick="app.doSearch('${q}')">
            <i class="fas fa-clock"></i>
            <span>${q}</span>
            <button class="recent-delete" onclick="app.deleteRecent('${q}', event)"><i class="fas fa-times"></i></button>
          </div>
        `).join('');
      }
    }
  }

  doSearch(query) {
    const input = document.getElementById('searchInput');
    if (input) input.value = query;
    document.getElementById('searchClear').style.display = 'flex';
    document.getElementById('searchDefault').style.display = 'none';
    document.getElementById('searchResults').style.display = 'block';

    if (!this.recentSearches.includes(query)) {
      this.recentSearches.unshift(query);
      if (this.recentSearches.length > 10) this.recentSearches.pop();
      localStorage.setItem('chatfic_recent_searches', JSON.stringify(this.recentSearches));
    }

    const results = this.dummyFeed.filter(p =>
      !p.reported && (
        p.desc.toLowerCase().includes(query.toLowerCase()) ||
        p.series.toLowerCase().includes(query.toLowerCase()) ||
        p.username.toLowerCase().includes(query.toLowerCase()) ||
        this.getPostTags(p).some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    );

    const label = document.getElementById('searchResultsLabel');
    if (label) label.textContent = `"${query}" 검색 결과 ${results.length}개`;

    const grid = document.getElementById('searchFeedGrid');
    const empty = document.getElementById('searchEmpty');
    grid.innerHTML = '';

    if (results.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'flex';
    } else {
      grid.style.display = 'grid';
      empty.style.display = 'none';
      results.forEach(post => {
        const isLiked = this.likedPosts.has(post.id);
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.onclick = () => this.openPost(post.id);
        card.innerHTML = `
          <div class="feed-card-thumb">
            <img src="${post.image}" alt="" style="width:100%;height:100%;object-fit:cover;">
            <div class="feed-card-likes">
              <i class="fas fa-heart" style="color:${isLiked ? '#FF3B5C' : 'white'};font-size:10px;"></i>
              ${this.formatCount(post.likes)}
            </div>
          </div>
          <div class="feed-card-info">
            <div class="feed-card-title">${post.series}</div>
            <div class="feed-card-meta">@${post.username}</div>
          </div>
        `;
        grid.appendChild(card);
      });
    }
  }

  getPostTags(post) {
    const tagMap = {
      1: ['BTS','정국','방탄소년단'],
      2: ['TXT','수빈','TOMORROW_X_TOGETHER'],
      3: ['ENHYPEN','이희승'],
      4: ['SEVENTEEN','세븐틴','에스쿱스'],
      5: ['Stray Kids','스트레이키즈','방찬'],
      6: ['ATEEZ','에이티즈','홍중'],
    };
    return tagMap[post.id] || [];
  }

  onSearchInput(value) {
    const clearBtn = document.getElementById('searchClear');
    if (!value.trim()) {
      clearBtn.style.display = 'none';
      document.getElementById('searchDefault').style.display = 'block';
      document.getElementById('searchResults').style.display = 'none';
    } else {
      clearBtn.style.display = 'flex';
      this.doSearch(value.trim());
    }
  }

  clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').style.display = 'none';
    document.getElementById('searchDefault').style.display = 'block';
    document.getElementById('searchResults').style.display = 'none';
    this.renderSearchDefault();
  }

  deleteRecent(query, event) {
    event.stopPropagation();
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    localStorage.setItem('chatfic_recent_searches', JSON.stringify(this.recentSearches));
    this.renderSearchDefault();
  }

  // ════════════════════════════════════════
  // PROFILE
  // ════════════════════════════════════════

  buildDummyFollowing() {
    return [
      { id: 1, username: 'jungkook_au', name: 'JK AU 작가', avatar: 'https://i.pravatar.cc/150?img=11', works: 24 },
      { id: 2, username: 'enhypen_fic', name: 'ENHYPEN FIC', avatar: 'https://i.pravatar.cc/150?img=8', works: 17 },
      { id: 3, username: 'txt_lover99', name: 'TXT 러버', avatar: 'https://i.pravatar.cc/150?img=44', works: 9 },
    ];
  }

  renderProfile() {
    // 닉네임/바이오
    const el = id => document.getElementById(id);
    el('profileNickname').textContent = this.profileData.nickname;
    el('profileBio').textContent = this.profileData.bio;
    el('statWorks').textContent = this.userPosts.length;
    el('statSeries').textContent = this.series.length;
    el('statFollowing').textContent = this.followingData.length;

    // 아바타
    const avatarEl = el('profileAvatarDisp');
    if (this.profileData.avatar) {
      avatarEl.innerHTML = `<img src="${this.profileData.avatar}" alt="">`;
    } else {
      avatarEl.innerHTML = '<i class="fas fa-user"></i>';
    }

    // 최애 & D-day
    this.renderFavDday();

    // 탭 콘텐츠
    this.switchProfileTab(this.currentProfileTab);
  }

  renderFavDday() {
    const el = id => document.getElementById(id);
    if (this.favData) {
      el('favEmpty').style.display = 'none';
      el('favSet').style.display = 'flex';
      el('favGroupName').textContent = this.favData.group;
      el('favMemberName').textContent = this.favData.member;

      const since = new Date(this.favData.date);
      const now = new Date();
      const days = Math.floor((now - since) / (1000 * 60 * 60 * 24));
      el('ddayInfo').style.display = 'block';
      el('ddayCount').textContent = `D+${days}`;
      el('ddaySince').textContent = `${since.getFullYear()}.${String(since.getMonth()+1).padStart(2,'0')}.${String(since.getDate()).padStart(2,'0')} ~`;
    } else {
      el('favEmpty').style.display = 'flex';
      el('favSet').style.display = 'none';
      el('ddayInfo').style.display = 'none';
    }
  }

  switchProfileTab(tab) {
    this.currentProfileTab = tab;
    ['works','series','saved','following'].forEach(t => {
      document.getElementById(`ptab${t.charAt(0).toUpperCase()+t.slice(1)}`)?.classList.toggle('active', t === tab);
    });
    const content = document.getElementById('profileTabContent');
    if (!content) return;

    switch(tab) {
      case 'works':
        content.innerHTML = `<div class="profile-works-grid">${this.buildDummyWorks()}</div>`;
        break;
      case 'series':
        content.innerHTML = `<div class="profile-series-list">${this.buildProfileSeriesList()}</div>`;
        break;
      case 'saved':
        content.innerHTML = `<div class="profile-works-grid">${this.buildSavedWorks()}</div>`;
        break;
      case 'following':
        content.innerHTML = `<div class="following-list">${this.buildFollowingList()}</div>`;
        break;
    }
  }

  buildDummyWorks() {
    if (this.userPosts.length === 0) {
      return `<div style="grid-column:1/-1;padding:40px 0;text-align:center;color:rgba(255,255,255,0.3);font-size:14px;">
        아직 작업물이 없어요.<br><span style="font-size:12px;margin-top:4px;display:block;">에디터에서 Save하면 여기 쌓여요.</span>
      </div>`;
    }
    const typeLabel = { message: '채팅', story: '스토리', notification: '잠금화면' };
    return this.userPosts.map(p => `
      <div class="profile-work-thumb" onclick="app.openPost(${p.id})">
        <img src="${p.image}" alt="">
        <span class="work-type">${typeLabel[p.type] || p.type}</span>
      </div>
    `).join('');
  }

  buildProfileSeriesList() {
    if (this.series.length === 0) {
      return '<div style="padding:24px 0;text-align:center;color:rgba(255,255,255,0.3);font-size:14px;">시리즈가 없어요.</div>';
    }
    return this.series.map(s => `
      <div class="series-card" onclick="app.openSeriesFromProfile(${s.id})">
        <div class="series-card-cover">📖</div>
        <div class="series-card-info">
          <div class="series-card-title">${s.title}</div>
          <div class="series-card-meta">에피소드 ${(s.episodes||[]).length}개</div>
        </div>
        <i class="fas fa-chevron-right series-card-arrow"></i>
      </div>
    `).join('');
  }

  openSeriesFromProfile(id) {
    this.navigateTo('series');
    setTimeout(() => this.openSeriesDetail(id), 50);
  }

  buildSavedWorks() {
    const saved = this.dummyFeed.filter(p => this.savedPosts.has(p.id));
    if (saved.length === 0) {
      return '<div style="grid-column:1/-1;padding:40px 0;text-align:center;color:rgba(255,255,255,0.3);font-size:14px;">저장된 작업물이 없어요.</div>';
    }
    return saved.map(p => `
      <div class="profile-work-thumb" onclick="app.openPost(${p.id})">
        <img src="${p.image}" alt="">
        <span class="work-type">${p.type === 'message' ? '채팅' : p.type === 'story' ? '스토리' : '잠금화면'}</span>
      </div>
    `).join('');
  }

  buildFollowingList() {
    return this.followingData.map(f => `
      <div class="following-item">
        <img class="following-avatar" src="${f.avatar}" alt="">
        <div class="following-info">
          <div class="following-name">@${f.username}</div>
          <div class="following-meta">작업물 ${f.works}개</div>
        </div>
        <button class="unfollow-btn" onclick="app.unfollow(${f.id}, this)">팔로잉</button>
      </div>
    `).join('');
  }

  unfollow(id, btn) {
    this.followingData = this.followingData.filter(f => f.id !== id);
    btn.closest('.following-item').remove();
    document.getElementById('statFollowing').textContent = this.followingData.length;
  }

  openFavModal() {
    const el = id => document.getElementById(id);
    el('favGroupInput').value = this.favData?.group || '';
    el('favMemberInput').value = this.favData?.member || '';
    el('favDateInput').value = this.favData?.date || '';
    el('favModal').style.display = 'flex';
  }

  closeFavModal(event) {
    if (event && event.target !== document.getElementById('favModal')) return;
    document.getElementById('favModal').style.display = 'none';
  }

  saveFavSetting() {
    const group = document.getElementById('favGroupInput').value.trim();
    const member = document.getElementById('favMemberInput').value.trim();
    const date = document.getElementById('favDateInput').value;
    if (!group) return;
    this.favData = { group, member, date };
    localStorage.setItem('chatfic_fav', JSON.stringify(this.favData));
    document.getElementById('favModal').style.display = 'none';
    this.renderFavDday();
  }

  openProfileSettings() {
    document.getElementById('editNickname').value = this.profileData.nickname;
    document.getElementById('editBio').value = this.profileData.bio;
    document.getElementById('profileSettingsModal').style.display = 'flex';
  }

  closeProfileSettings(event) {
    if (event && event.target !== document.getElementById('profileSettingsModal')) return;
    document.getElementById('profileSettingsModal').style.display = 'none';
  }

  saveProfileSettings() {
    const nickname = document.getElementById('editNickname').value.trim() || 'nickname';
    const bio = document.getElementById('editBio').value.trim();
    this.profileData.nickname = nickname;
    this.profileData.bio = bio;
    localStorage.setItem('chatfic_profile', JSON.stringify(this.profileData));
    document.getElementById('profileSettingsModal').style.display = 'none';
    this.renderProfile();
  }

  updateProfileAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.profileData.avatar = e.target.result;
      localStorage.setItem('chatfic_profile', JSON.stringify(this.profileData));
      const avatarEl = document.getElementById('profileAvatarDisp');
      avatarEl.innerHTML = `<img src="${e.target.result}" alt="">`;
    };
    reader.readAsDataURL(file);
  }

  formatDate(ts) {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  selectTemplate(templateType) {
    this.selectedTemplate = templateType;
    this.showSection('editor');
    // 에디터에선 하단 nav 숨김
    document.getElementById('bottomNav').style.display = 'none';
    this.loadEditor(templateType);
  }

  loadEditor(templateType) {
    const phoneScreen = document.getElementById('phoneScreen');
    if (!phoneScreen) return;

    // Show/hide template-specific controls
    this.showTemplateControls(templateType);
    
    // Load template-specific content
    switch(templateType) {
      case 'message':
        this.loadMessageEditor(phoneScreen);
        this.initializeDefaultMessages();
        break;
      case 'story':
        this.loadStoryEditor(phoneScreen);
        break;
      case 'notification':
        this.loadNotificationEditor(phoneScreen);
        this.initializeDefaultNotifications();
        this.lockScreenDark = false;
        break;
    }
    
    // Set up live preview bindings
    this.setupEditorBindings(templateType);
    this.updatePreview(templateType);
  }

  showTemplateControls(templateType) {
    // Hide all template-specific controls
    const messageControls = document.getElementById('messageControls');
    const lockControls = document.getElementById('lockControls');
    const storyControls = document.getElementById('storyControls');
    
    if (messageControls) messageControls.style.display = 'none';
    if (lockControls) lockControls.style.display = 'none';
    if (storyControls) storyControls.style.display = 'none';
    
    // Show relevant controls
    switch(templateType) {
      case 'message':
        if (messageControls) messageControls.style.display = 'block';
        break;
      case 'story':
        if (storyControls) storyControls.style.display = 'block';
        break;
      case 'notification':
        if (lockControls) lockControls.style.display = 'block';
        break;
    }
  }

  initializeDefaultMessages() {
    this.messages = [
      { id: this.messageIdCounter++, type: 'received', text: 'Hey! How are you?', time: new Date() },
      { id: this.messageIdCounter++, type: 'sent', text: "I'm good! How about you?", time: new Date(Date.now() + 60000) }
    ];
    this.renderMessages();
  }

  initializeDefaultNotifications() {
    this.notifications = [
      { id: this.notificationIdCounter++, sender: 'Contact Name', text: 'Your notification message here', time: new Date() }
    ];
    this.renderNotifications();
  }

  setupEditorBindings(templateType) {
    const usernameInput = document.getElementById('usernameInput');
    const textInput = document.getElementById('textInput');
    const profileImageInput = document.getElementById('profileImageInput');
    const backgroundImageInput = document.getElementById('backgroundImageInput');
    const timeInput = document.getElementById('timeInput');
    
    if (usernameInput) {
      usernameInput.oninput = () => this.updatePreview(this.selectedTemplate);
    }
    
    if (textInput) {
      textInput.oninput = () => this.updatePreview(this.selectedTemplate);
    }
    
    if (profileImageInput) {
      profileImageInput.onchange = (event) => {
        this.handleProfileImageUpload(event, this.selectedTemplate);
      };
    }
    
    if (backgroundImageInput) {
      backgroundImageInput.onchange = (event) => {
        this.handleBackgroundImageUpload(event, this.selectedTemplate);
      };
    }
    
    if (timeInput) {
      timeInput.onchange = () => this.updatePreview(this.selectedTemplate);
    }
  }

  handleProfileImageUpload(event, templateType) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedProfileImage = e.target.result;
      this.updatePreview(templateType);
    };
    reader.readAsDataURL(file);
  }

  handleBackgroundImageUpload(event, templateType) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedBackgroundImage = e.target.result;
      this.updatePreview(templateType);
    };
    reader.readAsDataURL(file);
  }

  updatePreview(templateType) {
    const usernameInput = document.getElementById('usernameInput');
    const textInput = document.getElementById('textInput');
    const timeInput = document.getElementById('timeInput');
    
    const username = usernameInput ? usernameInput.value : '';
    const text = textInput ? textInput.value : '';
    const time = timeInput ? timeInput.value : '';
    
    switch(templateType) {
      case 'message':
        this.updateMessagePreview(username, text, time);
        break;
      case 'story':
        this.updateStoryPreview(username, text, time);
        break;
      case 'notification':
        this.updateNotificationPreview(username, text, time);
        break;
    }
  }

  loadMessageEditor(container) {
    container.innerHTML = `
      <div class="message-template">
        <div class="message-header">
          <span class="message-back">← Messages</span>
          <div class="contact-info">
            <img src="https://via.placeholder.com/32" alt="Contact" class="contact-avatar" id="messageAvatar">
            <span class="contact-name" id="messageContactName">Contact</span>
          </div>
        </div>
        <div class="message-content">
          <div class="message-list" id="messageList">
            <div class="message received">Hey! How are you?</div>
            <div class="message sent" id="userMessage">Type your message...</div>
          </div>
        </div>
      </div>
    `;
    this.addMessageEditorStyles();
  }

  loadStoryEditor(container) {
    container.innerHTML = `
      <div class="story-template">
        <div class="story-header">
          <div class="story-profile">
            <img src="https://via.placeholder.com/32" alt="Profile" class="story-avatar" id="storyAvatar">
            <span class="story-username" id="storyUsername">username</span>
          </div>
          <span class="story-time" id="storyTime">2h</span>
        </div>
        <div class="story-content">
          <img src="https://via.placeholder.com/280x500" alt="Story" class="story-image" id="storyImage">
          <div class="story-text" id="storyText">Your story text here...</div>
        </div>
      </div>
    `;
    this.addStoryEditorStyles();
  }

  updateStoryPreview(username, text, time) {
    const storyText = document.getElementById('storyText');
    const storyTime = document.getElementById('storyTime');
    const storyImage = document.getElementById('storyImage');
    const storyAvatar = document.getElementById('storyAvatar');
    const storyUsername = document.getElementById('storyUsername');
    
    if (storyText) {
      storyText.textContent = text || 'Your story text here...';
    }
    
    if (storyUsername) {
      storyUsername.textContent = username || 'username';
    }
    
    // Use background image for main story image, profile image for avatar
    if (this.uploadedBackgroundImage && storyImage) {
      storyImage.src = this.uploadedBackgroundImage;
    }
    
    if (this.uploadedProfileImage && storyAvatar) {
      storyAvatar.src = this.uploadedProfileImage;
    }
    
    if (time && storyTime) {
      const timeObj = new Date(time);
      const now = new Date();
      const diffMs = now - timeObj;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        storyTime.textContent = 'now';
      } else if (diffHours < 24) {
        storyTime.textContent = `${diffHours}h`;
      } else {
        storyTime.textContent = `${Math.floor(diffHours / 24)}d`;
      }
    }
  }

  loadNotificationEditor(container) {
    container.innerHTML = `
      <div class="notification-template">
        <div class="lock-screen" id="lockScreenBackground">
          <div class="lock-time" id="lockTime">9:41</div>
          <div class="lock-date" id="lockDate">Monday, June 9</div>
          <div class="notifications">
            <div class="notification">
              <img src="https://via.placeholder.com/40" alt="Avatar" class="notif-avatar" id="notifAvatar">
              <div class="notif-content">
                <span class="notif-name" id="notifName">Contact Name</span>
                <span class="notif-message" id="notifMessage">Your notification message here</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.addNotificationEditorStyles();
  }

  addMessageEditorStyles() {
    if (document.getElementById('message-editor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'message-editor-styles';
    style.textContent = `
      .message-template {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #f5f5f5;
      }
      .message-header {
        position: relative;
        min-height: 76px;
        padding: 8px 16px;
        background: #fff;
        border-bottom: 1px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
      }
      .message-back {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #000;
        font-size: 12px;
      }
      .contact-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        justify-content: center;
        width: 140px;
        min-width: 0;
        text-align: center;
      }
      .contact-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center;
        flex: none;
      }
      .contact-name {
        display: block;
        width: 100%;
        color: #000;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.2;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .message-content {
        flex: 1;
        padding: 16px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        overflow-y: auto;
      }
      .message-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .message {
        max-width: 80%;
        padding: 10px 16px;
        border-radius: 20px;
        font-size: 14px;
      }
      .message.received {
        align-self: flex-start;
        background: #e5e5ea;
        color: #000;
      }
      .message.sent {
        align-self: flex-end;
        background: #007aff;
        color: white;
      }
    `;
    document.head.appendChild(style);
  }

  addStoryEditorStyles() {
    if (document.getElementById('story-editor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'story-editor-styles';
    style.textContent = `
      .story-template {
        height: 100%;
        background: #000;
        position: relative;
        color: white;
      }
      .story-header {
        position: absolute;
        top: 16px;
        left: 16px;
        right: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 10;
      }
      .story-profile {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .story-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        object-fit: cover;
        object-position: center;
        flex: none;
      }
      .story-content {
        position: relative;
        height: 100%;
      }
      .story-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      .story-text {
        position: absolute;
        bottom: 40px;
        left: 16px;
        right: 16px;
        font-size: 18px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
    `;
    document.head.appendChild(style);
  }

  addNotificationEditorStyles() {
    if (document.getElementById('notification-editor-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-editor-styles';
    style.textContent = `
      .notification-template {
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        overflow: hidden;
      }
      .lock-screen {
        height: 100%;
        padding: 40px 20px;
        color: white;
        text-align: center;
        display: flex;
        flex-direction: column;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        position: relative;
      }
      /* Dark overlay */
      .lock-screen::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0);
        transition: background 0.4s ease;
        z-index: 1;
        pointer-events: none;
      }
      .lock-screen.dark-mode::before {
        background: rgba(0,0,0,0.55);
      }
      /* Film grain overlay */
      .lock-screen::after {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0;
        z-index: 2;
        pointer-events: none;
        transition: opacity 0.4s ease;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
        background-size: 128px 128px;
        mix-blend-mode: overlay;
      }
      .lock-screen.dark-mode::after {
        opacity: 1;
      }
      .lock-time, .lock-date, .notifications {
        position: relative;
        z-index: 3;
      }
      .lock-time {
        font-size: 72px;
        font-weight: 200;
        margin-bottom: 8px;
      }
      .lock-date {
        font-size: 16px;
        margin-bottom: 40px;
        opacity: 0.9;
      }
      .notifications {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: center;
      }
      .notification {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: rgba(255,255,255,0.9);
        border-radius: 16px;
        text-align: left;
        color: #000;
        transition: background 0.4s ease, backdrop-filter 0.4s ease;
      }
      .lock-screen.dark-mode .notification {
        background: rgba(30,30,30,0.65);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.12);
      }
      .lock-screen.dark-mode .notif-name {
        color: #fff;
      }
      .lock-screen.dark-mode .notif-message {
        color: rgba(255,255,255,0.7);
      }
      .notif-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center;
        flex: none;
      }
      .notif-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .notif-name {
        font-weight: 600;
        font-size: 14px;
        transition: color 0.4s ease;
      }
      .notif-message {
        font-size: 14px;
        opacity: 0.8;
        transition: color 0.4s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // ════════════════════════════════════════
  // MESSAGE AND NOTIFICATION MANAGEMENT
  // ════════════════════════════════════════

  renderMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.messages.forEach((message, index) => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message-item';
      messageElement.innerHTML = `
        <div class="message-item-header">
          <span class="message-type-label ${message.type}">${message.type === 'sent' ? 'You' : 'Them'}</span>
          <div class="message-item-actions">
            <button class="move-message-btn" onclick="app.moveMessage(${message.id}, -1)" ${index === 0 ? 'disabled' : ''} aria-label="Move message up">↑</button>
            <button class="move-message-btn" onclick="app.moveMessage(${message.id}, 1)" ${index === this.messages.length - 1 ? 'disabled' : ''} aria-label="Move message down">↓</button>
            <button class="remove-btn" onclick="app.removeMessage(${message.id})" aria-label="Remove message">×</button>
          </div>
        </div>
        <textarea class="message-input" placeholder="Enter message..." 
          onInput="app.updateMessageText(${message.id}, this.value)">${message.text}</textarea>
        <input type="datetime-local" class="time-input" 
          value="${message.time.toISOString().slice(0, 16)}"
          onChange="app.updateMessageTime(${message.id}, this.value)">
      `;
      container.appendChild(messageElement);
    });
    
    this.updateMessagePreview();
  }

  renderNotifications() {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.notifications.forEach(notification => {
      const notificationElement = document.createElement('div');
      notificationElement.className = 'notification-item';
      notificationElement.innerHTML = `
        <div class="notification-item-header">
          <span class="notification-sender-label">Notification</span>
          <button class="remove-btn" onclick="app.removeNotification(${notification.id})">×</button>
        </div>
        <input type="text" class="message-input" placeholder="Sender name..." 
          value="${notification.sender}"
          onInput="app.updateNotificationSender(${notification.id}, this.value)">
        <textarea class="notification-input" placeholder="Enter notification message..." 
          onInput="app.updateNotificationText(${notification.id}, this.value)">${notification.text}</textarea>
        <input type="datetime-local" class="time-input" 
          value="${notification.time.toISOString().slice(0, 16)}"
          onChange="app.updateNotificationTime(${notification.id}, this.value)">
      `;
      container.appendChild(notificationElement);
    });
    
    this.updateNotificationPreview();
  }

  addMessage(type) {
    const newMessage = {
      id: this.messageIdCounter++,
      type: type,
      text: type === 'sent' ? 'Your message here...' : 'Their message here...',
      time: new Date()
    };
    
    this.messages.push(newMessage);
    this.renderMessages();
  }

  addNotification() {
    const newNotification = {
      id: this.notificationIdCounter++,
      sender: 'Contact Name',
      text: 'New notification message here...',
      time: new Date()
    };
    
    this.notifications.push(newNotification);
    this.renderNotifications();
  }

  removeMessage(id) {
    this.messages = this.messages.filter(msg => msg.id !== id);
    this.renderMessages();
  }

  moveMessage(id, direction) {
    const currentIndex = this.messages.findIndex(message => message.id === id);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= this.messages.length) return;

    [this.messages[currentIndex], this.messages[nextIndex]] =
      [this.messages[nextIndex], this.messages[currentIndex]];
    this.renderMessages();
  }

  removeNotification(id) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    this.renderNotifications();
  }

  toggleLockScreenDark() {
    this.lockScreenDark = !this.lockScreenDark;
    const lockScreen = document.querySelector('.lock-screen');
    const toggle = document.getElementById('darkModeToggle');
    const label = toggle?.querySelector('.toggle-label');

    if (lockScreen) lockScreen.classList.toggle('dark-mode', this.lockScreenDark);
    if (toggle) toggle.classList.toggle('active', this.lockScreenDark);
    if (label) label.textContent = this.lockScreenDark ? 'On' : 'Off';
  }

  updateMessageText(id, text) {
    const message = this.messages.find(msg => msg.id === id);
    if (message) {
      message.text = text;
      this.updateMessagePreview();
    }
  }

  updateMessageTime(id, timeString) {
    const message = this.messages.find(msg => msg.id === id);
    if (message) {
      message.time = new Date(timeString);
      this.updateMessagePreview();
    }
  }

  updateNotificationSender(id, sender) {
    const notification = this.notifications.find(notif => notif.id === id);
    if (notification) {
      notification.sender = sender;
      this.updateNotificationPreview();
    }
  }

  updateNotificationText(id, text) {
    const notification = this.notifications.find(notif => notif.id === id);
    if (notification) {
      notification.text = text;
      this.updateNotificationPreview();
    }
  }

  updateNotificationTime(id, timeString) {
    const notification = this.notifications.find(notif => notif.id === id);
    if (notification) {
      notification.time = new Date(timeString);
      this.updateNotificationPreview();
    }
  }

  updateMessagePreview(username, text, time) {
    if (this.selectedTemplate !== 'message') return;

    const messageList = document.getElementById('messageList');
    const contactName = document.getElementById('messageContactName');
    const avatar = document.getElementById('messageAvatar');
    const messageContent = document.querySelector('.message-template .message-content');
    if (!messageList) return;

    const currentUsername = username ?? document.getElementById('usernameInput')?.value ?? '';
    const currentTime = time ?? document.getElementById('timeInput')?.value ?? '';

    if (contactName) {
      const displayName = currentUsername || 'Contact';
      contactName.textContent = displayName;
    }

    if (avatar && this.uploadedProfileImage) {
      avatar.src = this.uploadedProfileImage;
    }

    if (messageContent) {
      messageContent.style.backgroundImage = this.uploadedBackgroundImage
        ? `url(${this.uploadedBackgroundImage})`
        : '';
    }

    messageList.innerHTML = '';

    this.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.textContent = message.text;
        messageList.appendChild(messageElement);
      });
  }

  updateNotificationPreview(username, text, time) {
    if (this.selectedTemplate !== 'notification') return;

    const notificationsContainer = document.querySelector('.lock-screen .notifications');
    const lockTime = document.getElementById('lockTime');
    const lockDate = document.getElementById('lockDate');
    const lockScreenBackground = document.getElementById('lockScreenBackground');
    if (!notificationsContainer) return;

    const currentTime = time ?? document.getElementById('timeInput')?.value ?? '';
    const timeValue = new Date(currentTime);

    if (currentTime && !Number.isNaN(timeValue.getTime())) {
      if (lockTime) {
        lockTime.textContent = timeValue.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false
        });
      }
      if (lockDate) {
        lockDate.textContent = timeValue.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
    }

    if (lockScreenBackground) {
      lockScreenBackground.style.backgroundImage = this.uploadedBackgroundImage
        ? `url(${this.uploadedBackgroundImage})`
        : '';
    }

    notificationsContainer.innerHTML = '';

    this.notifications.forEach(notification => {
      const notificationElement = document.createElement('div');
      notificationElement.className = 'notification';

      const avatar = document.createElement('img');
      avatar.src = this.uploadedProfileImage || 'https://via.placeholder.com/40';
      avatar.alt = 'Avatar';
      avatar.className = 'notif-avatar';

      const content = document.createElement('div');
      content.className = 'notif-content';

      const name = document.createElement('span');
      name.className = 'notif-name';
      name.textContent = notification.sender;

      const message = document.createElement('span');
      message.className = 'notif-message';
      message.textContent = notification.text;

      content.append(name, message);
      notificationElement.append(avatar, content);
      notificationsContainer.appendChild(notificationElement);
    });
  }

  // ════════════════════════════════════════
  // SAVE AND SHARE FUNCTIONALITY
  // ════════════════════════════════════════

  async capturePhoneScreen() {
    const phoneScreen = document.getElementById('phoneScreen');
    if (!phoneScreen) {
      throw new Error('Phone screen not found');
    }

    try {
      const canvas = await html2canvas(phoneScreen, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: phoneScreen.offsetWidth,
        height: phoneScreen.offsetHeight
      });
      
      return canvas;
    } catch (error) {
      console.error('Error capturing screen:', error);
      throw error;
    }
  }

  async saveAsImage() {
    try {
      const canvas = await this.capturePhoneScreen();

      canvas.toBlob((blob) => {
        // 1) 기기에 다운로드
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chatfic-${this.selectedTemplate}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 2) base64로 앱 내 저장 (피드 + 마이페이지)
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          this.publishToFeed(dataUrl);
          URL.revokeObjectURL(url);
        };
        reader.readAsDataURL(blob);

        this.showNotification('저장되고 피드에 올라갔어요!', 'success');
      }, 'image/png', 0.95);

    } catch (error) {
      console.error('Save error:', error);
      this.showNotification('저장에 실패했어요. 다시 시도해주세요.', 'error');
    }
  }

  publishToFeed(dataUrl) {
    const profile = this.profileData;
    const typeLabel = { message: '채팅', story: '스토리', notification: '잠금화면' };
    const newPost = {
      id: Date.now(),
      username: profile.nickname || 'me',
      avatar: profile.avatar || '',
      image: dataUrl,
      type: this.selectedTemplate,
      series: document.getElementById('usernameInput')?.value || `내 ${typeLabel[this.selectedTemplate]}`,
      desc: `#chatfic #${this.selectedTemplate}`,
      likes: 0,
      comments: [],
      createdAt: Date.now(),
      reported: false,
      isMyPost: true,
    };

    // 피드 맨 앞에 삽입
    this.dummyFeed.unshift(newPost);
    // 내 작업물 목록에도 저장
    this.userPosts.unshift(newPost);
    try {
      // 이미지가 크면 localStorage 한도 초과할 수 있으므로 최대 20개만 유지
      const saveable = this.userPosts.slice(0, 20);
      localStorage.setItem('chatfic_user_posts', JSON.stringify(saveable));
    } catch(e) { /* storage full */ }
  }

  toggleShareMenu() {
    const shareMenu = document.getElementById('shareMenu');
    if (!shareMenu) return;
    
    this.shareMenuVisible = !this.shareMenuVisible;
    shareMenu.style.display = this.shareMenuVisible ? 'block' : 'none';
  }

  async shareToTikTok() {
    try {
      const canvas = await this.capturePhoneScreen();
      
      canvas.toBlob(async (blob) => {
        if (navigator.share) {
          try {
            const file = new File([blob], `chatfic-content.png`, { type: 'image/png' });
            await navigator.share({
              title: 'My Chatfic Creation',
              text: 'Check out what I made with Chatfic! #chatfic #creativecontent',
              files: [file]
            });
            this.showNotification('Shared successfully!', 'success');
          } catch (shareError) {
            this.fallbackShare('TikTok', blob);
          }
        } else {
          this.fallbackShare('TikTok', blob);
        }
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('TikTok share error:', error);
      this.showNotification('Failed to share to TikTok. Please try again.', 'error');
    }
    
    this.toggleShareMenu();
  }

  async shareToInstagram() {
    try {
      const canvas = await this.capturePhoneScreen();
      
      canvas.toBlob(async (blob) => {
        if (navigator.share) {
          try {
            const file = new File([blob], `chatfic-content.png`, { type: 'image/png' });
            await navigator.share({
              title: 'My Chatfic Creation',
              text: 'Created with Chatfic ✨ #chatfic #instagram #story',
              files: [file]
            });
            this.showNotification('Shared successfully!', 'success');
          } catch (shareError) {
            this.fallbackShare('Instagram', blob);
          }
        } else {
          this.fallbackShare('Instagram', blob);
        }
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Instagram share error:', error);
      this.showNotification('Failed to share to Instagram. Please try again.', 'error');
    }
    
    this.toggleShareMenu();
  }

  async shareToX() {
    try {
      const canvas = await this.capturePhoneScreen();
      const text = encodeURIComponent('Just created this amazing content with Chatfic! 🚀 #chatfic #creative');
      
      canvas.toBlob((blob) => {
        // For X, we'll use the text sharing since image sharing requires API
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank', 'width=600,height=400');
        this.showNotification('Opening X for sharing...', 'success');
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('X share error:', error);
      this.showNotification('Failed to share to X. Please try again.', 'error');
    }
    
    this.toggleShareMenu();
  }

  async shareToReddit() {
    try {
      const canvas = await this.capturePhoneScreen();
      const title = encodeURIComponent('Created this with Chatfic - What do you think?');
      
      canvas.toBlob((blob) => {
        // For Reddit, open the submit page
        const url = `https://www.reddit.com/submit?title=${title}`;
        window.open(url, '_blank');
        this.showNotification('Opening Reddit for sharing...', 'success');
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Reddit share error:', error);
      this.showNotification('Failed to share to Reddit. Please try again.', 'error');
    }
    
    this.toggleShareMenu();
  }

  fallbackShare(platform, blob) {
    // Create a temporary download for platforms that don't support direct sharing
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatfic-for-${platform.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification(`Image downloaded for ${platform} sharing!`, 'success');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '9999',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch(type) {
      case 'success':
        notification.style.background = '#10B981';
        break;
      case 'error':
        notification.style.background = '#EF4444';
        break;
      default:
        notification.style.background = '#3B82F6';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// ════════════════════════════════════════
// GLOBAL FUNCTIONS
// ════════════════════════════════════════

function startWithSelectedTemplate() {
  if (app) {
    // Go directly to editor with selected template
    app.selectTemplate(app.selectedTemplate);
  }
}

function goBack() {
  if (app) {
    app.showSection('hero');
  }
}

function backToTemplates() {
  if (!app) return;
  app.showSection('hero');
  document.getElementById('bottomNav').style.display = 'flex';
  ['bnHome','bnSearch','bnSeries','bnProfile'].forEach(id => document.getElementById(id)?.classList.remove('active'));
  document.getElementById('bnHome')?.classList.add('active');
  // 만들기 패널 명시적으로 살리고 템플릿 재초기화
  document.getElementById('panelCreate').style.display = 'block';
  document.getElementById('panelFeed').style.display = 'none';
  document.getElementById('tabCreate').classList.add('active');
  document.getElementById('tabFeed').classList.remove('active');
  app.mainTab = 'create';
  setTimeout(() => {
    app.initTemplateSelection();
    app.scrollToTemplate(app.currentTemplateIndex);
  }, 50);
}

function selectTemplate(templateType) {
  if (app) {
    app.selectTemplate(templateType);
  }
}

function navigateTo(page) {
  if (app) {
    app.navigateTo(page);
  }
}

function saveAsImage() {
  if (app) {
    app.saveAsImage();
  }
}

function toggleShareMenu() {
  if (app) {
    app.toggleShareMenu();
  }
}

function shareToTikTok() {
  if (app) {
    app.shareToTikTok();
  }
}

function shareToInstagram() {
  if (app) {
    app.shareToInstagram();
  }
}

function shareToX() {
  if (app) {
    app.shareToX();
  }
}

function shareToReddit() {
  if (app) {
    app.shareToReddit();
  }
}

function addMessage(type) {
  if (app) {
    app.addMessage(type);
  }
}

function addNotification() {
  if (app) {
    app.addNotification();
  }
}

function toggleLockScreenDark() {
  if (app) {
    app.toggleLockScreenDark();
  }
}

function onSearchInput(v) { if (app) app.onSearchInput(v); }
function clearSearch() { if (app) app.clearSearch(); }
function switchProfileTab(tab) { if (app) app.switchProfileTab(tab); }
function openFavModal() { if (app) app.openFavModal(); }
function closeFavModal(event) { if (app) app.closeFavModal(event); }
function saveFavSetting() { if (app) app.saveFavSetting(); }
function openProfileSettings() { if (app) app.openProfileSettings(); }
function closeProfileSettings(event) { if (app) app.closeProfileSettings(event); }
function saveProfileSettings() { if (app) app.saveProfileSettings(); }
function updateProfileAvatar(event) { if (app) app.updateProfileAvatar(event); }
function toggleLike() { if (app) app.toggleLike(); }
function focusCommentInput() { if (app) app.focusCommentInput(); }
function submitComment() { if (app) app.submitComment(); }
function openReportMenu() { if (app) app.openReportMenu(); }
function closeReportMenu(event) { if (app) app.closeReportMenu(event); }
function reportPost(reason) { if (app) app.reportPost(reason); }
function closePostModal(event) { if (app) app.closePostModal(event); }

function switchMainTab(tab) {
  if (app) app.switchMainTab(tab);
}

function setFeedFilter(filter, el) {
  document.querySelectorAll('.feed-filter').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  if (app) app.setFeedFilter(filter);
}

function openCreateSeriesModal() {
  if (app) app.openCreateSeriesModal();
}

function closeCreateSeriesModal(event) {
  if (app) app.closeCreateSeriesModal(event);
}

function confirmCreateSeries() {
  if (app) app.confirmCreateSeries();
}

function addEpisodeToSeries() {
  if (app) app.addEpisodeToSeries();
}

function closeSeriesDetail() {
  if (app) app.closeSeriesDetail();
}

// ════════════════════════════════════════
// INITIALIZE APP
// ════════════════════════════════════════

let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new ChatficApp();
});
