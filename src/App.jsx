import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  PartyPopper,
  Gift,
  Upload,
  Trash2,
  Heart,
  Volume2,
  VolumeX,
  Flame,
  Share2,
  Plus,
  Check,
  Play,
  Pause,
  Wand2,
  Cake,
  MessageSquareHeart,
  Image as ImageIcon,
  Settings,
  X,
  Save,
  Download,
  RotateCcw,
  Edit3,
  Eye,
  ShieldCheck,
  FileJson,
  Lock,
  LogOut,
  Globe,
  KeyRound
} from 'lucide-react';
import './App.css';

// Default Presets
const PRESET_WISHES = [
  "May your year ahead be filled with overflowing happiness, endless smiles, and beautiful surprises!",
  "Wishing you a day as brilliant, vibrant, and joyful as you make the lives of everyone around you!",
  "Cheers to another fantastic trip around the sun! May all your secret dreams come true today!",
  "Sending you endless love, tight hugs, and delicious sweet cake on your special day!",
  "May this birthday mark the start of an extraordinary chapter full of love and unforgettable memories!"
];

const DEFAULT_PHOTOS = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    caption: 'Celebrating Great Times! 🎉'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    caption: 'Pure Joy & Smiles 🎈'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    caption: 'Make a Wish! 🎂'
  }
];

const DEFAULT_GIFTS = [
  { id: '1', title: "Unbounded Health & Vitality 🌿", hint: "Tap to open!", detail: "Wishing you endless energy, good health, and peace of mind every single day!" },
  { id: '2', title: "Unforgettable Dreams Come True ✨", hint: "Tap to open!", detail: "May all your biggest ambitions and wildest wishes turn into reality this year!" },
  { id: '3', title: "A Lifetime of Boundless Happiness 💖", hint: "Tap to open!", detail: "Sending you infinite joy, hearty laughter, and unforgettable warm memories!" }
];

// Festive Floating Balloons Background Component
const FloatingBalloons = () => {
  const colors = ['#ff3b8d', '#9d4edd', '#ffc107', '#00f2fe', '#ff416c', '#4ade80'];
  return (
    <div className="balloons-container">
      {Array.from({ length: 14 }).map((_, i) => {
        const color = colors[i % colors.length];
        const left = Math.random() * 95;
        const duration = 12 + Math.random() * 10;
        const delay = Math.random() * 5;
        const size = 35 + Math.random() * 25;

        return (
          <div
            key={i}
            className="balloon-item"
            style={{
              left: `${left}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              '--balloon-color': color,
              width: `${size}px`,
              height: `${size * 1.2}px`
            }}
          >
            <div className="balloon-body" style={{ backgroundColor: color }}></div>
            <div className="balloon-string"></div>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  // Routing & Authentication state
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname + window.location.hash);
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('bw_admin_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Configurable content state with localStorage persistence
  const [recipientName, setRecipientName] = useState(() => localStorage.getItem('bw_recipientName') || 'Nishanth');
  const [customWishText, setCustomWishText] = useState(() => localStorage.getItem('bw_customWishText') || 'Wishing you the happiest birthday ever! May your day be filled with sparkle, magic, and boundless joy.');
  const [wishesList, setWishesList] = useState(() => {
    const saved = localStorage.getItem('bw_wishesList');
    return saved ? JSON.parse(saved) : PRESET_WISHES;
  });
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('bw_photos');
    return saved ? JSON.parse(saved) : DEFAULT_PHOTOS;
  });
  const [giftsList, setGiftsList] = useState(() => {
    const saved = localStorage.getItem('bw_giftsList');
    return saved ? JSON.parse(saved) : DEFAULT_GIFTS;
  });

  // Admin Panel states
  const [adminTab, setAdminTab] = useState('general'); // 'general', 'photos', 'wishes', 'gifts', 'data'
  const [toastMsg, setToastMsg] = useState('');

  // Editing state for Wishes & Gifts in Admin Panel
  const [editWishIdx, setEditWishIdx] = useState(null);
  const [editWishText, setEditWishText] = useState('');
  const [editGiftIdx, setEditGiftIdx] = useState(null);
  const [editGiftTitle, setEditGiftTitle] = useState('');
  const [editGiftHint, setEditGiftHint] = useState('');
  const [editGiftDetail, setEditGiftDetail] = useState('');

  // New Gift input state for Admin Panel
  const [newGiftTitle, setNewGiftTitle] = useState('');
  const [newGiftHint, setNewGiftHint] = useState('');
  const [newGiftDetail, setNewGiftDetail] = useState('');

  // Interactive feature states
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [isBlowing, setIsBlowing] = useState(false);
  const [openedGifts, setOpenedGifts] = useState({});
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');
  const [newWishInput, setNewWishInput] = useState('');
  const [flyingPhotos, setFlyingPhotos] = useState([]);

  // Audio synthesizer refs
  const audioCtxRef = useRef(null);
  const musicTimeoutsRef = useRef([]);
  const isMusicPlayingRef = useRef(false);

  // Listen to URL changes for /admin route
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.hash);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const isAdminRoute = currentPath.toLowerCase().includes('/admin') || currentPath.toLowerCase().includes('#admin');

  // Auto-save state changes to localStorage
  useEffect(() => { localStorage.setItem('bw_recipientName', recipientName); }, [recipientName]);
  useEffect(() => { localStorage.setItem('bw_customWishText', customWishText); }, [customWishText]);
  useEffect(() => { localStorage.setItem('bw_wishesList', JSON.stringify(wishesList)); }, [wishesList]);
  useEffect(() => { localStorage.setItem('bw_photos', JSON.stringify(photos)); }, [photos]);
  useEffect(() => { localStorage.setItem('bw_giftsList', JSON.stringify(giftsList)); }, [giftsList]);

  useEffect(() => {
    if (!isAdminRoute) {
      triggerConfetti();
    }
  }, [isAdminRoute]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'Nishanth@2362') {
      setIsAuthenticated(true);
      sessionStorage.setItem('bw_admin_auth', 'true');
      setPasswordError('');
      setPasswordInput('');
      showToast('Logged in as Admin 🔓');
    } else {
      setPasswordError('Incorrect password! Please try again.');
      showToast('Incorrect Admin Password ❌');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bw_admin_auth');
    showToast('Logged out of Admin Panel 🔒');
  };

  const navigateToWebsite = () => {
    window.location.hash = '';
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleBlowCandles = () => {
    setIsBlowing(true);
    setTimeout(() => {
      setCandlesLit([false, false, false]);
      setIsBlowing(false);
      triggerConfetti();
    }, 1200);
  };

  const handleRelightCandles = () => {
    setCandlesLit([true, true, true]);
  };

  const spawnFlyingPhoto = (url, caption) => {
    const colors = ['#ff3b8d', '#9d4edd', '#ffc107', '#00f2fe', '#ff416c', '#4ade80', '#c77dff'];
    const newFlyingItem = {
      id: Date.now() + Math.random(),
      url,
      caption,
      left: Math.random() * 75 + 10,
      duration: 10 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setFlyingPhotos((prev) => [...prev, newFlyingItem]);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target.result;
        const caption = photoCaptionInput || file.name.replace(/\.[^/.]+$/, "") || 'Sweet Memory ❤️';
        setPhotos((prev) => [
          {
            id: Date.now().toString() + Math.random(),
            url: photoUrl,
            caption
          },
          ...prev
        ]);
        spawnFlyingPhoto(photoUrl, caption);
        triggerConfetti();
      };
      reader.readAsDataURL(file);
    });
    setPhotoCaptionInput('');
    showToast('Photo uploaded successfully! 📸');
  };

  const handleFlyPhoto = (photo) => {
    spawnFlyingPhoto(photo.url, photo.caption);
    triggerConfetti();
  };

  const handleReleaseAllBalloons = () => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        spawnFlyingPhoto(photo.url, photo.caption);
      }, index * 350);
    });
    triggerConfetti();
  };

  const handleDeletePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast('Photo removed 🗑️');
  };

  const handleAddWish = (e) => {
    e.preventDefault();
    if (!newWishInput.trim()) return;
    setWishesList((prev) => [newWishInput.trim(), ...prev]);
    setNewWishInput('');
    triggerConfetti();
    showToast('New wish added to feed! 💌');
  };

  const toggleGift = (index) => {
    setOpenedGifts((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
    triggerConfetti();
  };

  // Synthesizer Music Toggle & Full Song Player
  const stopMusic = () => {
    isMusicPlayingRef.current = false;
    musicTimeoutsRef.current.forEach((t) => clearTimeout(t));
    musicTimeoutsRef.current = [];
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlayingMusic(false);
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      stopMusic();
      showToast('Music stopped 🔇');
    } else {
      setIsPlayingMusic(true);
      isMusicPlayingRef.current = true;
      playFullBirthdaySong();
      showToast('Playing full Happy Birthday song 🎶');
    }
  };

  const playFullBirthdaySong = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Full Happy Birthday Note Frequencies (G4, A4, C5, B4, D5, G5, E5, F5)
      const fullSongNotes = [
        // Phrase 1: Happy Birthday to You
        { note: 392.00, duration: 0.35, pause: 0.05 },
        { note: 392.00, duration: 0.35, pause: 0.05 },
        { note: 440.00, duration: 0.70, pause: 0.05 },
        { note: 392.00, duration: 0.70, pause: 0.05 },
        { note: 523.25, duration: 0.70, pause: 0.05 },
        { note: 493.88, duration: 1.20, pause: 0.40 },

        // Phrase 2: Happy Birthday to You
        { note: 392.00, duration: 0.35, pause: 0.05 },
        { note: 392.00, duration: 0.35, pause: 0.05 },
        { note: 440.00, duration: 0.70, pause: 0.05 },
        { note: 392.00, duration: 0.70, pause: 0.05 },
        { note: 587.33, duration: 0.70, pause: 0.05 },
        { note: 523.25, duration: 1.20, pause: 0.40 },

        // Phrase 3: Happy Birthday dear [Star]
        { note: 392.00, duration: 0.35, pause: 0.05 },
        { note: 392.00, duration: 0.35, pause: 0.05 },
        { note: 783.99, duration: 0.70, pause: 0.05 },
        { note: 659.25, duration: 0.70, pause: 0.05 },
        { note: 523.25, duration: 0.70, pause: 0.05 },
        { note: 493.88, duration: 0.70, pause: 0.05 },
        { note: 440.00, duration: 1.10, pause: 0.40 },

        // Phrase 4: Happy Birthday to You!
        { note: 698.46, duration: 0.35, pause: 0.05 },
        { note: 698.46, duration: 0.35, pause: 0.05 },
        { note: 659.25, duration: 0.70, pause: 0.05 },
        { note: 523.25, duration: 0.70, pause: 0.05 },
        { note: 587.33, duration: 0.70, pause: 0.05 },
        { note: 523.25, duration: 1.50, pause: 0.80 },
      ];

      let accumulatedDelay = 0;

      fullSongNotes.forEach(({ note, duration, pause }) => {
        const tId = setTimeout(() => {
          if (!isMusicPlayingRef.current || !audioCtxRef.current) return;

          const mainOsc = ctx.createOscillator();
          const subOsc = ctx.createOscillator();
          const mainGain = ctx.createGain();

          mainOsc.type = 'sine';
          subOsc.type = 'triangle';

          mainOsc.frequency.value = note;
          subOsc.frequency.value = note / 2; // Warm sub-octave bass line

          mainGain.gain.setValueAtTime(0.20, ctx.currentTime);
          mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

          mainOsc.connect(mainGain);
          subOsc.connect(mainGain);
          mainGain.connect(ctx.destination);

          mainOsc.start();
          subOsc.start();
          mainOsc.stop(ctx.currentTime + duration);
          subOsc.stop(ctx.currentTime + duration);
        }, accumulatedDelay * 1000);

        musicTimeoutsRef.current.push(tId);
        accumulatedDelay += duration + (pause || 0.05);
      });

      // Loop song automatically until user clicks stop
      const loopTimeoutId = setTimeout(() => {
        if (isMusicPlayingRef.current) {
          playFullBirthdaySong();
        }
      }, accumulatedDelay * 1000);

      musicTimeoutsRef.current.push(loopTimeoutId);

    } catch (e) {
      console.log('Audio playback error', e);
    }
  };

  // Admin Panel Action Handlers
  const handleSaveWish = (index) => {
    if (!editWishText.trim()) return;
    const updated = [...wishesList];
    updated[index] = editWishText.trim();
    setWishesList(updated);
    setEditWishIdx(null);
    showToast('Wish updated successfully! ✨');
  };

  const handleDeleteWish = (index) => {
    setWishesList((prev) => prev.filter((_, i) => i !== index));
    showToast('Wish deleted 🗑️');
  };

  const handleAddGift = (e) => {
    e.preventDefault();
    if (!newGiftTitle.trim()) return;
    const newGiftObj = {
      id: Date.now().toString(),
      title: newGiftTitle.trim(),
      hint: newGiftHint.trim() || 'Tap to open!',
      detail: newGiftDetail.trim() || 'Wishing you infinite happiness and joy!'
    };
    setGiftsList((prev) => [...prev, newGiftObj]);
    setNewGiftTitle('');
    setNewGiftHint('');
    setNewGiftDetail('');
    showToast('New Gift Box created! 🎁');
  };

  const handleSaveGift = (index) => {
    if (!editGiftTitle.trim()) return;
    const updated = [...giftsList];
    updated[index] = {
      ...updated[index],
      title: editGiftTitle.trim(),
      hint: editGiftHint.trim() || 'Tap to open!',
      detail: editGiftDetail.trim() || 'Wishing you infinite happiness!'
    };
    setGiftsList(updated);
    setEditGiftIdx(null);
    showToast('Gift Box updated! 🎁');
  };

  const handleDeleteGift = (index) => {
    setGiftsList((prev) => prev.filter((_, i) => i !== index));
    showToast('Gift Box deleted 🗑️');
  };

  const handleExportJSON = () => {
    const data = {
      recipientName,
      customWishText,
      wishesList,
      photos,
      giftsList
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `birthday_setup_${recipientName.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Config exported as JSON! 📥');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.recipientName) setRecipientName(imported.recipientName);
        if (imported.customWishText) setCustomWishText(imported.customWishText);
        if (Array.isArray(imported.wishesList)) setWishesList(imported.wishesList);
        if (Array.isArray(imported.photos)) setPhotos(imported.photos);
        if (Array.isArray(imported.giftsList)) setGiftsList(imported.giftsList);
        showToast('Config imported successfully! 🚀');
        triggerConfetti();
      } catch (err) {
        showToast('Failed to parse JSON file ❌');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all settings and content to default?")) {
      setRecipientName('Nishanth');
      setCustomWishText('Wishing you the happiest birthday ever! May your day be filled with sparkle, magic, and boundless joy.');
      setWishesList(PRESET_WISHES);
      setPhotos(DEFAULT_PHOTOS);
      setGiftsList(DEFAULT_GIFTS);
      localStorage.clear();
      showToast('Reset to default preset settings 🔄');
      triggerConfetti();
    }
  };

  // IF USER IS ON THE /admin ROUTE
  if (isAdminRoute) {
    return (
      <div className="birthday-app admin-route-container">
        <FloatingBalloons />

        {/* Global Toast Notification */}
        {toastMsg && (
          <div className="toast-notification animate-pop">
            <Sparkles size={18} className="text-gold" />
            <span>{toastMsg}</span>
          </div>
        )}

        {!isAuthenticated ? (
          /* Password Login Screen */
          <div className="login-card-container">
            <div className="login-card glass-panel animate-pop">
              <div className="login-header">
                <div className="login-icon-badge">
                  <KeyRound size={32} className="text-pink" />
                </div>
                <h2>Admin Portal Access</h2>
                <p>Please enter the secret admin password to customize content.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="login-form">
                <div className="form-group">
                  <label>Admin Password:</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="admin-input password-input"
                    autoFocus
                    required
                  />
                </div>

                {passwordError && (
                  <div className="login-error-alert animate-pop">
                    <span>{passwordError}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary login-btn">
                  <Lock size={18} /> Unlock Admin Panel
                </button>
              </form>

              <div className="login-footer">
                <button className="btn-secondary" onClick={navigateToWebsite}>
                  <Globe size={18} /> Go to Birthday Website
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Full Admin Panel Page */
          <div className="admin-page-modal glass-panel animate-pop">
            {/* Top Bar */}
            <div className="admin-header">
              <div className="admin-title">
                <ShieldCheck size={26} className="text-pink" />
                <h2>Website Admin Control Panel</h2>
              </div>
              <div className="admin-top-actions">
                <button className="btn-secondary" onClick={navigateToWebsite}>
                  <Globe size={18} /> View Website 🌐
                </button>
                <button className="delete-btn" onClick={handleAdminLogout}>
                  <LogOut size={16} /> Logout 🔒
                </button>
              </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="admin-tabs">
              <button
                className={`tab-btn ${adminTab === 'general' ? 'active' : ''}`}
                onClick={() => setAdminTab('general')}
              >
                👤 General & Theme
              </button>
              <button
                className={`tab-btn ${adminTab === 'photos' ? 'active' : ''}`}
                onClick={() => setAdminTab('photos')}
              >
                🖼️ Photos ({photos.length})
              </button>
              <button
                className={`tab-btn ${adminTab === 'wishes' ? 'active' : ''}`}
                onClick={() => setAdminTab('wishes')}
              >
                💬 Wishes ({wishesList.length})
              </button>
              <button
                className={`tab-btn ${adminTab === 'gifts' ? 'active' : ''}`}
                onClick={() => setAdminTab('gifts')}
              >
                🎁 Gifts ({giftsList.length})
              </button>
              <button
                className={`tab-btn ${adminTab === 'data' ? 'active' : ''}`}
                onClick={() => setAdminTab('data')}
              >
                💾 Export & Reset
              </button>
            </div>

            {/* Admin Content Body */}
            <div className="admin-body">
              {/* TAB 1: GENERAL */}
              {adminTab === 'general' && (
                <div className="admin-section">
                  <h3>General Greeting Settings</h3>
                  <div className="form-group">
                    <label>Recipient Name (Birthday Star):</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Nishanth"
                      className="admin-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Hero Tagline / Subtitle Message:</label>
                    <textarea
                      value={customWishText}
                      onChange={(e) => setCustomWishText(e.target.value)}
                      rows={3}
                      placeholder="Enter custom wish description..."
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-quick-actions">
                    <button className="btn-primary" onClick={triggerConfetti}>
                      <PartyPopper size={18} /> Test Confetti Explosion 🎉
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PHOTOS */}
              {adminTab === 'photos' && (
                <div className="admin-section">
                  <h3>Manage Photo Gallery & Flying Balloons</h3>

                  <div className="admin-upload-box glass-panel">
                    <h4>Upload New Photo:</h4>
                    <div className="upload-inputs">
                      <input
                        type="text"
                        placeholder="Optional photo caption..."
                        value={photoCaptionInput}
                        onChange={(e) => setPhotoCaptionInput(e.target.value)}
                        className="caption-input"
                      />
                      <label className="upload-btn">
                        <Upload size={18} />
                        <span>Browse Files</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        className="release-all-btn"
                        onClick={handleReleaseAllBalloons}
                      >
                        <span>Fly All Photo Balloons 🎈</span>
                      </button>
                    </div>
                  </div>

                  <div className="admin-photo-list">
                    {photos.map((photo) => (
                      <div key={photo.id} className="admin-photo-item glass-panel">
                        <img src={photo.url} alt={photo.caption} />
                        <div className="admin-photo-info">
                          <input
                            type="text"
                            value={photo.caption}
                            onChange={(e) => {
                              const newCaption = e.target.value;
                              setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, caption: newCaption } : p));
                            }}
                            className="admin-input"
                          />
                        </div>
                        <div className="admin-item-actions">
                          <button className="fly-btn" onClick={() => handleFlyPhoto(photo)} title="Fly balloon">
                            Fly 🎈
                          </button>
                          <button className="delete-btn" onClick={() => handleDeletePhoto(photo.id)} title="Delete photo">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WISHES */}
              {adminTab === 'wishes' && (
                <div className="admin-section">
                  <h3>Manage Birthday Wishes</h3>

                  <form onSubmit={handleAddWish} className="wish-form">
                    <input
                      type="text"
                      placeholder="Write new birthday wish message..."
                      value={newWishInput}
                      onChange={(e) => setNewWishInput(e.target.value)}
                      className="wish-input"
                    />
                    <button type="submit" className="btn-primary">
                      <Plus size={18} /> Add Wish
                    </button>
                  </form>

                  <div className="admin-wishes-list">
                    {wishesList.map((wish, idx) => (
                      <div key={idx} className="admin-wish-item glass-panel">
                        {editWishIdx === idx ? (
                          <div className="inline-edit-box">
                            <input
                              type="text"
                              value={editWishText}
                              onChange={(e) => setEditWishText(e.target.value)}
                              className="admin-input"
                            />
                            <button className="save-btn" onClick={() => handleSaveWish(idx)}>
                              <Save size={16} /> Save
                            </button>
                            <button className="cancel-btn" onClick={() => setEditWishIdx(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="admin-wish-text">“{wish}”</p>
                            <div className="admin-item-actions">
                              <button
                                className="edit-btn"
                                onClick={() => { setEditWishIdx(idx); setEditWishText(wish); }}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button className="delete-btn" onClick={() => handleDeleteWish(idx)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GIFTS */}
              {adminTab === 'gifts' && (
                <div className="admin-section">
                  <h3>Manage Surprise Gift Boxes</h3>

                  <form onSubmit={handleAddGift} className="add-gift-form glass-panel">
                    <h4>Create New Gift Box:</h4>
                    <input
                      type="text"
                      placeholder="Gift Box Title (e.g. Dream Trip ✨)..."
                      value={newGiftTitle}
                      onChange={(e) => setNewGiftTitle(e.target.value)}
                      className="admin-input"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Hint text (e.g. Tap to open!)..."
                      value={newGiftHint}
                      onChange={(e) => setNewGiftHint(e.target.value)}
                      className="admin-input"
                    />
                    <textarea
                      placeholder="Unwrapped Secret Gift Message..."
                      value={newGiftDetail}
                      onChange={(e) => setNewGiftDetail(e.target.value)}
                      className="admin-textarea"
                      rows={2}
                    />
                    <button type="submit" className="btn-primary">
                      <Plus size={18} /> Add Gift Box 🎁
                    </button>
                  </form>

                  <div className="admin-gifts-list">
                    {giftsList.map((gift, idx) => (
                      <div key={gift.id || idx} className="admin-gift-item glass-panel">
                        {editGiftIdx === idx ? (
                          <div className="inline-edit-box flex-column">
                            <input
                              type="text"
                              value={editGiftTitle}
                              onChange={(e) => setEditGiftTitle(e.target.value)}
                              className="admin-input"
                              placeholder="Title"
                            />
                            <input
                              type="text"
                              value={editGiftHint}
                              onChange={(e) => setEditGiftHint(e.target.value)}
                              className="admin-input"
                              placeholder="Hint"
                            />
                            <textarea
                              value={editGiftDetail}
                              onChange={(e) => setEditGiftDetail(e.target.value)}
                              className="admin-textarea"
                              rows={2}
                              placeholder="Secret message"
                            />
                            <div className="admin-item-actions">
                              <button className="save-btn" onClick={() => handleSaveGift(idx)}>
                                <Save size={16} /> Save Gift
                              </button>
                              <button className="cancel-btn" onClick={() => setEditGiftIdx(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="admin-gift-info">
                              <h4>🎁 {gift.title}</h4>
                              <p><small>Hint: {gift.hint}</small></p>
                              <p className="text-muted">{gift.detail}</p>
                            </div>
                            <div className="admin-item-actions">
                              <button
                                className="edit-btn"
                                onClick={() => {
                                  setEditGiftIdx(idx);
                                  setEditGiftTitle(gift.title);
                                  setEditGiftHint(gift.hint);
                                  setEditGiftDetail(gift.detail);
                                }}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button className="delete-btn" onClick={() => handleDeleteGift(idx)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: DATA & EXPORT */}
              {adminTab === 'data' && (
                <div className="admin-section">
                  <h3>Configuration Export & Preset Backup</h3>
                  <p className="section-desc">Download your customized birthday configuration as a JSON file or import a saved setup.</p>

                  <div className="data-tools-grid">
                    <button className="data-btn export-btn" onClick={handleExportJSON}>
                      <Download size={22} />
                      <div>
                        <strong>Export Setup as JSON</strong>
                        <small>Download current settings, photos, & wishes</small>
                      </div>
                    </button>

                    <label className="data-btn import-btn">
                      <FileJson size={22} />
                      <div>
                        <strong>Import Setup JSON</strong>
                        <small>Load a saved configuration file</small>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <button className="data-btn reset-btn" onClick={handleResetDefaults}>
                      <RotateCcw size={22} />
                      <div>
                        <strong>Reset Factory Defaults</strong>
                        <small>Clear all custom changes and restore defaults</small>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // STANDARD PUBLIC BIRTHDAY CELEBRATION PAGE (NO ADMIN BUTTON ON RIGHT)
  return (
    <div className="birthday-app">
      <FloatingBalloons />

      {/* Flying Photo Balloons Overlay */}
      <div className="flying-photos-container">
        {flyingPhotos.map((item) => (
          <div
            key={item.id}
            className="flying-photo-item"
            style={{
              left: `${item.left}%`,
              animationDuration: `${item.duration}s`,
              '--balloon-color': item.color
            }}
            onAnimationEnd={() => {
              setFlyingPhotos((prev) => prev.filter((p) => p.id !== item.id));
            }}
          >
            <div className="flying-balloon-head" style={{ backgroundColor: item.color }}></div>
            <div className="flying-string"></div>
            <div className="flying-polaroid">
              <img src={item.url} alt={item.caption} />
              <span>{item.caption}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Audio Control Only (NO Admin button on main page) */}
      <div className="floating-top-controls">
        <button
          className={`audio-btn ${isPlayingMusic ? 'playing' : ''}`}
          onClick={toggleMusic}
          title={isPlayingMusic ? "Pause Music" : "Play Birthday Tune"}
        >
          {isPlayingMusic ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span>{isPlayingMusic ? 'Playing 🎵' : 'Play Music 🎶'}</span>
        </button>
      </div>

      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="toast-notification animate-pop">
          <Sparkles size={18} className="text-gold" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <header className="hero-header">
        <div className="sparkle-badge">
          <Sparkles className="icon-sparkle" size={18} />
          <span>CELEBRATING A SPECIAL DAY</span>
        </div>

        <h1 className="hero-title animate-pop">
          Happy Birthday, <span className="highlight-text">{recipientName}</span>! ✨
        </h1>

        {/* Name Edit Bar */}
        <div className="name-edit-bar glass-panel">
          <div className="input-group">
            <label>Birthday Star Name:</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter name..."
            />
          </div>
          <button className="celebrate-btn" onClick={triggerConfetti}>
            <PartyPopper size={20} />
            Blow Party Popper!
          </button>
        </div>

        <p className="hero-subtitle">
          "{customWishText}"
        </p>
      </header>

      {/* Main Grid Content */}
      <main className="content-container">

        {/* Section 1: Animated Interactive Cake */}
        <section className="card-section glass-panel cake-section">
          <div className="section-title">
            <Cake size={26} className="text-pink" />
            <h2>Interactive Birthday Cake</h2>
          </div>
          <p className="section-desc">Make a secret wish and blow out the candles!</p>

          <div className="cake-wrapper">
            <div className="cake-display">
              <div className="candles-row">
                {candlesLit.map((isLit, idx) => (
                  <div key={idx} className="candle">
                    {isLit && (
                      <div className={`flame ${isBlowing ? 'blowing' : ''}`}>
                        <Flame size={20} color="#ff9e00" fill="#ffc107" />
                      </div>
                    )}
                    <div className="stick"></div>
                  </div>
                ))}
              </div>

              <div className="cake-tier tier-top">
                <div className="drip-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="drip"></span>
                  ))}
                </div>
              </div>
              <div className="cake-tier tier-middle"></div>
              <div className="cake-tier tier-bottom"></div>
              <div className="cake-plate"></div>
            </div>

            <div className="cake-actions">
              {candlesLit.some(Boolean) ? (
                <button
                  className={`btn-primary ${isBlowing ? 'blowing-active' : ''}`}
                  onClick={handleBlowCandles}
                  disabled={isBlowing}
                >
                  <Wand2 size={20} />
                  {isBlowing ? 'Blowing Candle Wind... 💨' : 'Blow Out Candles 🎂'}
                </button>
              ) : (
                <button className="btn-secondary animate-pop" onClick={handleRelightCandles}>
                  <Flame size={20} />
                  Relight Candles 🔥
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Photo Memories Gallery */}
        <section className="card-section glass-panel gallery-section">
          <div className="section-title">
            <ImageIcon size={26} className="text-purple" />
            <h2>Photo Memories & Upload</h2>
          </div>
          <p className="section-desc">Upload cherished moments and photos to light up the wall!</p>

          {/* Photo Upload Controls */}
          <div className="upload-box glass-panel">
            <div className="upload-inputs">
              <input
                type="text"
                placeholder="Add a sweet photo caption..."
                value={photoCaptionInput}
                onChange={(e) => setPhotoCaptionInput(e.target.value)}
                className="caption-input"
              />
              <label className="upload-btn">
                <Upload size={20} />
                <span>Upload Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                className="release-all-btn"
                onClick={handleReleaseAllBalloons}
                title="Release all memory photos into the sky!"
              >
                <span>Fly All Photo Balloons 🎈✨</span>
              </button>
            </div>
          </div>

          {/* Photo Cards Grid */}
          <div className="photo-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-card animate-pop">
                <div className="img-container">
                  <img src={photo.url} alt={photo.caption} />
                  <button
                    className="delete-photo-btn"
                    onClick={() => handleDeletePhoto(photo.id)}
                    title="Delete photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="photo-caption">
                  <span>{photo.caption}</span>
                  <button
                    className="fly-btn"
                    onClick={() => handleFlyPhoto(photo)}
                    title="Attach balloon and fly upwards!"
                  >
                    Fly 🎈
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Birthday Wishes Feed & Interactive Add */}
        <section className="card-section glass-panel wishes-section">
          <div className="section-title">
            <MessageSquareHeart size={26} className="text-gold" />
            <h2>Words of Birthday Wishes</h2>
          </div>
          <p className="section-desc">Add your heartfelt messages and animated greetings!</p>

          <form onSubmit={handleAddWish} className="wish-form">
            <input
              type="text"
              placeholder="Write your custom birthday message..."
              value={newWishInput}
              onChange={(e) => setNewWishInput(e.target.value)}
              className="wish-input"
            />
            <button type="submit" className="btn-primary">
              <Plus size={20} />
              Send Wish 💌
            </button>
          </form>

          <div className="wishes-grid">
            {wishesList.map((wish, idx) => (
              <div key={idx} className="wish-card glass-panel animate-pop">
                <div className="wish-quote-mark">“</div>
                <p className="wish-text">{wish}</p>
                <div className="wish-footer">
                  <span className="wish-from">With Warm Love ❤️</span>
                  <Sparkles size={16} className="text-gold" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Surprise Gift Boxes */}
        <section className="card-section glass-panel gifts-section">
          <div className="section-title">
            <Gift size={26} className="text-cyan" />
            <h2>Surprise Gift Boxes</h2>
          </div>
          <p className="section-desc">Tap on any gift box to unwrap your special birthday surprise!</p>

          <div className="gifts-grid">
            {giftsList.map((gift, idx) => (
              <div
                key={gift.id || idx}
                className={`gift-box glass-panel ${openedGifts[idx] ? 'opened' : ''}`}
                onClick={() => toggleGift(idx)}
              >
                {!openedGifts[idx] ? (
                  <div className="gift-closed">
                    <Gift size={48} className="gift-icon animate-float" />
                    <span>Gift Box #{idx + 1}</span>
                    <small>{gift.hint || 'Tap to open!'}</small>
                  </div>
                ) : (
                  <div className="gift-opened animate-pop">
                    <PartyPopper size={36} className="text-gold" />
                    <h3>{gift.title}</h3>
                    <p>{gift.detail || "Wishing you endless joy every single day!"}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer-bar">
        <p>Crafted with ❤️ for an Unforgettable Birthday Celebration ✨</p>
      </footer>
    </div>
  );
}
