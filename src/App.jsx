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
  CheckCircle2,
  Play,
  Pause,
  Wand2,
  Cake,
  MessageSquareHeart,
  Image as ImageIcon
} from 'lucide-react';
import './App.css';

// Preset Warm Birthday Wishes
const PRESET_WISHES = [
  "May your year ahead be filled with overflowing happiness, endless smiles, and beautiful surprises!",
  "Wishing you a day as brilliant, vibrant, and joyful as you make the lives of everyone around you!",
  "Cheers to another fantastic trip around the sun! May all your secret dreams come true today!",
  "Sending you endless love, tight hugs, and delicious sweet cake on your special day!",
  "May this birthday mark the start of an extraordinary chapter full of love and unforgettable memories!"
];

// Festive Balloons Component
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
  // Configurable state for the recipient & creator
  const [recipientName, setRecipientName] = useState('Alex');
  const [customWishText, setCustomWishText] = useState('Wishing you the happiest birthday ever! May your day be filled with sparkle, magic, and boundless joy.');
  const [wishesList, setWishesList] = useState(PRESET_WISHES);
  const [newWishInput, setNewWishInput] = useState('');

  // Interactive feature states
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [isBlowing, setIsBlowing] = useState(false);
  const [poppedBalloonsCount, setPoppedBalloonsCount] = useState(0);
  const [openedGifts, setOpenedGifts] = useState({});
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Photos state (includes initial default placeholders + user uploads)
  const [photos, setPhotos] = useState([
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
  ]);
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');

  // Audio synthesizer setup for happy birthday melody (procedural audio)
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Initial Confetti Explosion on load
    triggerConfetti();
  }, []);

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

  // Flying balloon photos state
  const [flyingPhotos, setFlyingPhotos] = useState([]);

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
        // Trigger photo balloon flight upwards!
        spawnFlyingPhoto(photoUrl, caption);
        triggerConfetti();
      };
      reader.readAsDataURL(file);
    });
    setPhotoCaptionInput('');
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
  };

  const handleAddWish = (e) => {
    e.preventDefault();
    if (!newWishInput.trim()) return;
    setWishesList((prev) => [newWishInput.trim(), ...prev]);
    setNewWishInput('');
    triggerConfetti();
  };

  const toggleGift = (index) => {
    setOpenedGifts((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
    triggerConfetti();
  };

  // Simple Synthesizer Music Toggle
  const toggleMusic = () => {
    if (isPlayingMusic) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingMusic(false);
    } else {
      setIsPlayingMusic(true);
      playMelody();
    }
  };

  const playMelody = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const notes = [
        { note: 264, duration: 0.4 }, { note: 264, duration: 0.4 },
        { note: 297, duration: 0.8 }, { note: 264, duration: 0.8 },
        { note: 352, duration: 0.8 }, { note: 330, duration: 1.2 },

        { note: 264, duration: 0.4 }, { note: 264, duration: 0.4 },
        { note: 297, duration: 0.8 }, { note: 264, duration: 0.8 },
        { note: 396, duration: 0.8 }, { note: 352, duration: 1.2 }
      ];

      let delay = 0;
      notes.forEach(({ note, duration }) => {
        setTimeout(() => {
          if (!audioCtxRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = note;
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, delay * 1000);
        delay += duration + 0.1;
      });

      setTimeout(() => {
        setIsPlayingMusic(false);
      }, delay * 1000 + 500);
    } catch (e) {
      console.log('Audio playback failed', e);
    }
  };

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

      {/* Floating Audio Controls */}
      <button
        className={`audio-btn ${isPlayingMusic ? 'playing' : ''}`}
        onClick={toggleMusic}
        title={isPlayingMusic ? "Pause Music" : "Play Birthday Tune"}
      >
        {isPlayingMusic ? <Volume2 size={24} /> : <VolumeX size={24} />}
        <span>{isPlayingMusic ? 'Playing Tune 🎵' : 'Play Music 🎶'}</span>
      </button>

      {/* Hero Header */}
      <header className="hero-header">
        <div className="sparkle-badge">
          <Sparkles className="icon-sparkle" size={18} />
          <span>CELEBRATING A SPECIAL DAY</span>
        </div>

        <h1 className="hero-title animate-pop">
          Happy Birthday, <span className="highlight-text">{recipientName}</span>! ✨
        </h1>

        {/* Editable Name & Tagline Inputs */}
        <div className="name-edit-bar glass-panel">
          <div className="input-group">
            <label>Name of Birthday Star:</label>
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
              {/* Candles */}
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

              {/* Cake Structure */}
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
            {[
              { title: "Unbounded Health & Vitality 🌿", hint: "Tap to open!" },
              { title: "Unforgettable Dreams Come True ✨", hint: "Tap to open!" },
              { title: "A Lifetime of Boundless Happiness 💖", hint: "Tap to open!" }
            ].map((gift, idx) => (
              <div
                key={idx}
                className={`gift-box glass-panel ${openedGifts[idx] ? 'opened' : ''}`}
                onClick={() => toggleGift(idx)}
              >
                {!openedGifts[idx] ? (
                  <div className="gift-closed">
                    <Gift size={48} className="gift-icon animate-float" />
                    <span>Gift Box #{idx + 1}</span>
                    <small>{gift.hint}</small>
                  </div>
                ) : (
                  <div className="gift-opened animate-pop">
                    <PartyPopper size={36} className="text-gold" />
                    <h3>{gift.title}</h3>
                    <p>Wishing you endless joy every single day!</p>
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
