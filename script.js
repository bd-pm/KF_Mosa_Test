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
    this.init();
  }

  init() {
    this.bindEvents();
    this.initTemplateSelection();
    this.setInitialTemplate();
    this.showSection('hero');
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
    // Hide all sections
    const sections = ['hero', 'templates', 'editor', 'series', 'explore'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) {
        element.style.display = 'none';
      }
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }

    // Show/hide top navigation based on section
    const topNav = document.getElementById('topNav');
    if (topNav) {
      topNav.style.display = sectionId === 'hero' ? 'none' : 'flex';
    }

    this.currentSection = sectionId;
  }

  navigateTo(page) {
    // Update navigation states
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[onclick*="${page}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Show corresponding section
    switch(page) {
      case 'create':
        this.showSection('hero');
        break;
      case 'series':
        this.showSection('series');
        break;
      case 'explore':
        this.showSection('explore');
        break;
    }
  }

  selectTemplate(templateType) {
    this.selectedTemplate = templateType;
    this.showSection('editor');
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
      }
      .notif-message {
        font-size: 14px;
        opacity: 0.8;
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
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chatfic-${this.selectedTemplate}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Image saved successfully!', 'success');
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Save error:', error);
      this.showNotification('Failed to save image. Please try again.', 'error');
    }
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
  if (app) {
    app.showSection('hero');
  }
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

function createSeries() {
  // Create series functionality
  console.log('Creating new series...');
}

// ════════════════════════════════════════
// INITIALIZE APP
// ════════════════════════════════════════

let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new ChatficApp();
});
