// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

function updateHeader() {
  const scrollY = window.scrollY;
  if (scrollY > 60) {
    header.classList.add('header--scrolled');
  } else {
    header.classList.remove('header--scrolled');
  }
  lastScroll = scrollY;
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('.service-card[data-scroll]').forEach(card => {
  card.addEventListener('click', () => {
    const target = document.querySelector(card.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });

      // Activate corresponding academic/infografia tab
      const tabAttr = card.dataset.tab;
      if (tabAttr) {
        setTimeout(() => {
          if (target.id === 'trabajos') {
            document.querySelectorAll('.academic-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.academic-panel').forEach(p => p.classList.remove('active'));
            const tab = document.querySelector(`.academic-tab[data-tab="${tabAttr}"]`);
            if (tab) tab.classList.add('active');
            const panel = document.getElementById(`panel-${tabAttr}`);
            if (panel) panel.classList.add('active');
          } else if (target.id === 'infografias') {
            const tabs = document.getElementById('infografiaTabs');
            if (tabs) {
              const tabBtn = tabs.querySelector(`.slider-tab[data-filter="${tabAttr}"]`);
              if (tabBtn) tabBtn.click();
            }
          }
        }, 400);
      }
    }
  });
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// YouTube player
const playerDiv = document.getElementById('playerVideo');
const videoPlayBtn = document.getElementById('videoPlayBtn');
const videoRewindBtn = document.getElementById('videoRewindBtn');
const videoForwardBtn = document.getElementById('videoForwardBtn');
const videoMuteBtn = document.getElementById('videoMuteBtn');
const videoProgress = document.getElementById('videoProgress');
const videoProgressFill = document.getElementById('videoProgressFill');
const videoProgressThumb = document.getElementById('videoProgressThumb');
const videoTime = document.getElementById('videoTime');
const playerTag = document.getElementById('playerTag');
const playerTitle = document.getElementById('playerTitle');
const playerDesc = document.getElementById('playerDesc');
const playerCounter = document.getElementById('playerCounter');
let player;
let isPlaying = true;
let isMuted = true;
let progressTimer = null;

function formatTime(s) {
  if (isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('playerVideo', {
    videoId: 'oF2kvlStwQE',
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    },
    events: {
      onStateChange: onPlayerStateChange,
      onReady: onPlayerReady
    }
  });
}

function onPlayerReady() {
  updateProgress();
}

function onPlayerStateChange(event) {
  isPlaying = event.data === YT.PlayerState.PLAYING;
  updatePlayBtn();
  if (isPlaying) {
    startProgressTimer();
  } else {
    stopProgressTimer();
  }
}

function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(updateProgress, 250);
}

function stopProgressTimer() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function updateProgress() {
  if (!player || !player.getCurrentTime) return;
  const current = player.getCurrentTime();
  const duration = player.getDuration();
  if (duration > 0) {
    const pct = (current / duration) * 100;
    videoProgressFill.style.width = `${pct}%`;
    videoProgressThumb.style.left = `${pct}%`;
  }
  if (videoTime) {
    videoTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }
}

function updatePlayBtn() {
  if (!videoPlayBtn) return;
  videoPlayBtn.innerHTML = isPlaying
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function updateMuteBtn() {
  if (!videoMuteBtn) return;
  videoMuteBtn.innerHTML = isMuted
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>';
}

if (videoPlayBtn) {
  videoPlayBtn.addEventListener('click', () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });
}

if (videoRewindBtn) {
  videoRewindBtn.addEventListener('click', () => {
    if (!player) return;
    const t = player.getCurrentTime();
    player.seekTo(Math.max(0, t - 10), true);
  });
}

if (videoForwardBtn) {
  videoForwardBtn.addEventListener('click', () => {
    if (!player) return;
    const t = player.getCurrentTime();
    const d = player.getDuration();
    player.seekTo(Math.min(d, t + 10), true);
  });
}

if (videoMuteBtn) {
  videoMuteBtn.addEventListener('click', () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      isMuted = false;
    } else {
      player.mute();
      isMuted = true;
    }
    updateMuteBtn();
  });
}

if (videoProgress) {
  let isDragging = false;

  function seekFromEvent(e) {
    if (!player) return;
    const rect = videoProgress.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const duration = player.getDuration();
    player.seekTo(pct * duration, true);
  }

  videoProgress.addEventListener('mousedown', (e) => {
    isDragging = true;
    seekFromEvent(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) seekFromEvent(e);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  videoProgress.addEventListener('touchstart', (e) => {
    isDragging = true;
    seekFromEvent(e);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (isDragging) seekFromEvent(e);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
}

const playlistContainer = document.getElementById('playlistItems');

if (playlistContainer) {
  playlistContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.playlist-item');
    if (!item) return;

    const allItems = playlistContainer.querySelectorAll('.playlist-item');
    const index = Array.from(allItems).indexOf(item);

    allItems.forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    const videoId = item.dataset.videoId;
    const tag = item.dataset.tag;
    const title = item.dataset.title;
    const desc = item.dataset.desc;

    if (player && player.loadVideoById) {
      player.loadVideoById(videoId);
      isPlaying = true;
      updatePlayBtn();
    }

    if (playerTag) playerTag.textContent = tag;
    if (playerTitle) playerTitle.textContent = title;
    if (playerDesc) playerDesc.textContent = desc;
    if (playerCounter) {
      playerCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(allItems.length).padStart(2, '0')}`;
    }
  });
}

// Academic tabs
document.querySelectorAll('.academic-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.academic-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.academic-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`panel-${tab.dataset.tab}`);
    if (panel) panel.classList.add('active');
  });
});

// === SLIDER SYSTEM ===
class Slider {
  constructor(el, dotsId) {
    this.el = el;
    this.track = el.querySelector('.slider-track');
    this.items = [...this.track.children];
    this.leftArrow = el.querySelector('.slider-arrow--left');
    this.rightArrow = el.querySelector('.slider-arrow--right');
    this.dotsContainer = dotsId ? document.getElementById(dotsId) : null;
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoPlayTimer = null;
    this.itemWidth = 0;
    this.gap = 16;

    this.init();
  }

  getItemsPerView() {
    const w = window.innerWidth;
    if (w < 480) return 1;
    if (w < 768) return 2;
    if (w < 1024) return 3;
    return 4;
  }

  init() {
    this.itemsPerView = this.getItemsPerView();
    this.originalCount = this.items.length;

    this.createDots();

    // Clone items for infinite loop
    const clonesBefore = [];
    const clonesAfter = [];
    for (let i = 0; i < this.itemsPerView; i++) {
      clonesAfter.push(this.items[i % this.originalCount].cloneNode(true));
      clonesBefore.push(this.items[(this.originalCount - 1 - i) % this.originalCount].cloneNode(true));
    }
    clonesBefore.reverse();
    clonesBefore.forEach(c => this.track.prepend(c));
    clonesAfter.forEach(c => this.track.appendChild(c));

    this.allItems = [...this.track.children];
    this.totalItems = this.allItems.length;
    this.currentIndex = this.itemsPerView; // start after cloned items

    this.updateWidths();
    this.goTo(this.currentIndex, false);
    this.startAutoPlay();
    this.bindEvents();
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.originalCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        const targetIndex = this.itemsPerView + i;
        this.goTo(targetIndex);
      });
      this.dotsContainer.appendChild(dot);
    }
  }

  updateDots() {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.children;
    const realIndex = ((this.currentIndex - this.itemsPerView) % this.originalCount + this.originalCount) % this.originalCount;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === realIndex);
    }
  }

  updateWidths() {
    this.itemsPerView = this.getItemsPerView();
    const rect = this.el.getBoundingClientRect();
    this.gap = window.innerWidth < 480 ? 12 : 16;
    this.itemWidth = (rect.width - this.gap * (this.itemsPerView - 1)) / this.itemsPerView;

    this.allItems.forEach(item => {
      item.style.flex = `0 0 ${this.itemWidth}px`;
    });
    this.track.style.gap = `${this.gap}px`;

    this.totalWidth = this.allItems.length * (this.itemWidth + this.gap) - this.gap;
  }

  goTo(index, animate = true) {
    if (this.isAnimating && animate) return;
    this.isAnimating = true;

    this.currentIndex = index;
    const offset = -this.currentIndex * (this.itemWidth + this.gap);
    this.track.style.transition = animate ? 'transform .5s cubic-bezier(.25,.1,.25,1)' : 'none';
    this.track.style.transform = `translateX(${offset}px)`;
    this.updateDots();

    const onEnd = () => {
      this.isAnimating = false;
      // Loop check - if at cloned area, jump back
      if (this.currentIndex >= this.originalCount + this.itemsPerView) {
        this.currentIndex = this.itemsPerView;
        this.goTo(this.currentIndex, false);
      } else if (this.currentIndex < this.itemsPerView) {
        this.currentIndex = this.originalCount + this.itemsPerView - 1;
        this.goTo(this.currentIndex, false);
      }
    };

    if (animate) {
      this.track.addEventListener('transitionend', onEnd, { once: true });
    } else {
      this.isAnimating = false;
    }
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => this.next(), 4000);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  bindEvents() {
    if (this.leftArrow) this.leftArrow.addEventListener('click', () => this.prev());
    if (this.rightArrow) this.rightArrow.addEventListener('click', () => this.next());

    this.el.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.el.addEventListener('mouseleave', () => this.startAutoPlay());

    // Touch support
    let startX = 0;
    let isDragging = false;

    this.el.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = false;
    }, { passive: true });

    this.el.addEventListener('touchmove', (e) => {
      const diff = Math.abs(e.touches[0].clientX - startX);
      if (diff > 10) isDragging = true;
    }, { passive: true });

    this.el.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? this.prev() : this.next();
      }
    }, { passive: true });

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updateWidths();
        this.goTo(this.currentIndex, false);
      }, 200);
    });
  }
}

// Init sliders
const infografiaSlider = document.getElementById('infografiaSlider');
const cvSlider = document.getElementById('cvSlider');
if (infografiaSlider) { infografiaSlider.__slider = new Slider(infografiaSlider, 'infografiaDots'); }
if (cvSlider) { cvSlider.__slider = new Slider(cvSlider, 'cvDots'); }

// Infografía tabs filter
const infografiaTabs = document.getElementById('infografiaTabs');
const infografiaSliderEl = document.getElementById('infografiaSlider');

if (infografiaTabs) {
  const originalTrack = document.getElementById('infografiaTrack');
  infografiaTabs._allItems = [...originalTrack.children];

  infografiaTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.slider-tab');
    if (!tab) return;

    infografiaTabs.querySelectorAll('.slider-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    const matching = infografiaTabs._allItems.filter(item => item.dataset.category === filter);
    if (!matching.length) return;

    if (infografiaSliderEl.__slider) infografiaSliderEl.__slider.stopAutoPlay();

    const currentTrack = infografiaSliderEl.querySelector('.slider-track');
    const newTrack = document.createElement('div');
    newTrack.className = 'slider-track';
    newTrack.id = 'infografiaTrack';
    matching.forEach(item => newTrack.appendChild(item.cloneNode(true)));
    currentTrack.parentNode.replaceChild(newTrack, currentTrack);

    requestAnimationFrame(() => {
      infografiaSliderEl.__slider = new Slider(infografiaSliderEl, 'infografiaDots');
    });
  });
}

// WhatsApp floating
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappChat = document.getElementById('whatsappChat');
const whatsappClose = document.getElementById('whatsappClose');
const whatsappSend = document.getElementById('whatsappSend');
const whatsappMsg = document.getElementById('whatsappMsg');

if (whatsappBtn && whatsappChat) {
  whatsappBtn.addEventListener('click', () => {
    whatsappChat.classList.toggle('open');
  });
}

if (whatsappClose && whatsappChat) {
  whatsappClose.addEventListener('click', () => {
    whatsappChat.classList.remove('open');
  });
}

if (whatsappSend && whatsappMsg) {
  const sendWhatsApp = () => {
    const msg = whatsappMsg.value.trim();
    if (!msg) {
      whatsappMsg.focus();
      return;
    }
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/573001234567?text=${encoded}`, '_blank');
    whatsappMsg.value = '';
    whatsappChat.classList.remove('open');
  };

  whatsappSend.addEventListener('click', sendWhatsApp);

  whatsappMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendWhatsApp();
    }
  });
}
