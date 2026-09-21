import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Image as ImageIcon, Upload, X, Check, Trash2 } from 'lucide-react';
import { ReelroomVideo } from '../types';
import {
  isAdminLoggedIn,
  setAdminLoggedIn,
  demoVideo,
  parseYouTubeEmbed,
} from '../utils/storage';
import {
  verifyPassword,
  getDecryptedDemoHint,
  setCustomPassword,
  resetCustomPassword,
  getCustomPasswordHash,
} from '../utils/security';

interface StudioViewProps {
  videos: ReelroomVideo[];
  onVideoAdded: (newVideo: ReelroomVideo) => void;
  onVideoDeleted: (id: string) => void;
  onVideoUpdated?: (updatedVideo: ReelroomVideo) => void;
  onSelectVideo?: (video: ReelroomVideo) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  videos,
  onVideoAdded,
  onVideoDeleted,
  onVideoUpdated,
  onSelectVideo,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Security password management state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityNotice, setSecurityNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasCustomPassword, setHasCustomPassword] = useState<boolean>(!!getCustomPasswordHash());
  const [confirmResetPwd, setConfirmResetPwd] = useState(false);

  // Video deletion confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Library video thumbnail replacement
  const libraryThumbInputRef = useRef<HTMLInputElement>(null);
  const [targetLibraryVideoId, setTargetLibraryVideoId] = useState<string | null>(null);
  const [libraryUpdateNotice, setLibraryUpdateNotice] = useState<string | null>(null);
  const [tag, setTag] = useState('studio notes');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview('');
      return;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const autoYtThumbnail = useMemo(() => {
    if (!videoLink.trim()) return '';
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = videoLink.trim().match(ytRegex);
    return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
  }, [videoLink]);

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setAdminLoggedIn(true);
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('Incorrect password. Access denied.');
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityNotice(null);

    const trimmed = newPassword.trim();
    if (trimmed.length < 4) {
      setSecurityNotice({ message: 'Password must be at least 4 characters long.', type: 'error' });
      return;
    }

    if (trimmed !== confirmPassword.trim()) {
      setSecurityNotice({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    await setCustomPassword(trimmed);
    setHasCustomPassword(true);
    setNewPassword('');
    setConfirmPassword('');
    setSecurityNotice({
      message: 'Password successfully updated and stored as a secure cryptographic SHA-256 hash.',
      type: 'success',
    });
  };

  const handleExecuteResetPassword = () => {
    resetCustomPassword();
    setHasCustomPassword(false);
    setConfirmResetPwd(false);
    setSecurityNotice({
      message: 'Password reset to default encrypted key.',
      type: 'success',
    });
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLink = videoLink.trim();

    if (!cleanTitle) {
      setNotice({ message: 'Please enter a film title.', type: 'error' });
      return;
    }

    if (!cleanLink && !videoFile) {
      setNotice({
        message: 'Add a video link or choose a video file first.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalThumbnail =
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=85';

      if (thumbnailFile) {
        finalThumbnail = await readFileAsDataUrl(thumbnailFile);
      } else if (cleanLink) {
        // Auto-extract YouTube thumbnail if available
        const ytEmbed = parseYouTubeEmbed(cleanLink);
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = cleanLink.match(ytRegex);
        if (match && match[1]) {
          finalThumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
      }

      let finalVideoSrc = cleanLink || demoVideo;
      let isSessionOnly = false;

      if (videoFile) {
        finalVideoSrc = URL.createObjectURL(videoFile);
        isSessionOnly = true;
      }

      const newVideo: ReelroomVideo = {
        id: `custom-${Date.now()}`,
        title: cleanTitle,
        description: cleanDesc || 'A film from the studio.',
        thumbnail: finalThumbnail,
        videoSrc: finalVideoSrc,
        duration: 'new',
        date: 'Just now',
        tag: tag || 'new upload',
        sessionOnly: isSessionOnly,
      };

      onVideoAdded(newVideo);

      // Reset form
      setTitle('');
      setDescription('');
      setVideoLink('');
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview('');
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
      setTag('studio notes');

      setNotice({
        message: 'Published. Your new film is now at the top of the library.',
        type: 'success',
      });
    } catch {
      setNotice({
        message: 'Could not process the upload files. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="login-card">
        <div className="panel">
          <div className="eyebrow">Private space</div>
          <h1>Owner Studio</h1>
          <p>
            Upload a new film, update your library, and keep the room moving.
          </p>

          {authError && <div className="notice error">{authError}</div>}

          <form onSubmit={handleLogin} id="login-form">
            <div className="field">
              <label htmlFor="password">Studio password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="solid-btn" type="submit" disabled={isAuthenticating}>
              {isAuthenticating ? 'Verifying hash...' : 'Unlock studio'}
            </button>
          </form>

          <div className="demo-note" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>PASSWORDS ENCRYPTED (SHA-256 CRYPTOGRAPHIC HASH)</span>
            <span style={{ color: 'var(--muted)', fontSize: '10px' }}>
              DEMO ACCESS KEY: {getDecryptedDemoHint().toUpperCase()}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="studio-wrap">
      <div className="studio-header">
        <div>
          <div className="eyebrow">Owner dashboard</div>
          <h1>Make a new upload.</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="studio-badge">{videos.length} published</span>
          <button
            type="button"
            className="ghost-btn"
            onClick={handleLogout}
            title="Lock studio and exit"
          >
            Lock Studio
          </button>
        </div>
      </div>

      <div className="studio-grid">
        <div className="panel">
          <h2>Upload a film</h2>
          <p className="panel-intro">
            Add a hosted video link or choose a local video file. Your browser keeps
            this demo library on this device.
          </p>

          {notice && (
            <div className={`notice ${notice.type}`}>{notice.message}</div>
          )}

          <form onSubmit={handleUpload} id="upload-form">
            <div className="field">
              <label htmlFor="video-title">Title</label>
              <input
                id="video-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Give the film a name"
              />
            </div>

            <div className="field">
              <label htmlFor="video-description">Description</label>
              <textarea
                id="video-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="What should viewers know?"
              />
            </div>

            <div className="field">
              <label htmlFor="video-tag">Tag / Category</label>
              <input
                id="video-tag"
                name="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. studio notes, field trip, essay"
              />
            </div>

            <div className="field">
              <label htmlFor="video-link">
                Video link{' '}
                <span style={{ color: 'var(--dim)' }}>
                  (optional if using a file)
                </span>
              </label>
              <input
                id="video-link"
                name="videoLink"
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://... (direct .mp4 or YouTube)"
              />
              <span className="field-help">
                Direct .mp4 links or YouTube links work best. If both are added, the file
                wins.
              </span>
            </div>

            <div className="field">
              <label htmlFor="video-file">
                Video file <span style={{ color: 'var(--dim)' }}>(optional if using a video link)</span>
              </label>
              <div className="file-input">
                <input
                  id="video-file"
                  name="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setVideoFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="thumbnail-file">Video Thumbnail</label>
              <input
                ref={thumbnailInputRef}
                id="thumbnail-file"
                name="thumbnail"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setThumbnailFile(e.target.files[0]);
                  }
                }}
              />

              <div
                className={`thumbnail-upload-wrapper ${isDraggingThumbnail ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingThumbnail(true);
                }}
                onDragLeave={() => setIsDraggingThumbnail(false)}
                onDrop={handleThumbnailDrop}
              >
                {thumbnailPreview ? (
                  <div className="thumbnail-preview-card">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="thumbnail-preview-img"
                    />
                    <div className="thumbnail-preview-details">
                      <div className="thumbnail-preview-title">
                        {thumbnailFile?.name || 'Custom uploaded thumbnail'}
                      </div>
                      <div className="thumbnail-preview-meta">
                        {thumbnailFile ? `${(thumbnailFile.size / 1024).toFixed(1)} KB · Ready to publish` : 'Active preview'}
                      </div>
                      <div className="thumbnail-preview-actions">
                        <button
                          type="button"
                          id="change-thumbnail-btn"
                          className="upload-thumbnail-btn"
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                          onClick={() => thumbnailInputRef.current?.click()}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Thumbnail</span>
                        </button>
                        <button
                          type="button"
                          id="remove-thumbnail-btn"
                          className="ghost-btn"
                          style={{ height: '32px', fontSize: '11px', color: 'var(--coral, #ff715b)', borderRadius: '5px' }}
                          onClick={() => {
                            setThumbnailFile(null);
                            if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="thumbnail-dropzone">
                    <button
                      type="button"
                      id="upload-thumbnail-btn"
                      className="upload-thumbnail-btn"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload Video Thumbnail</span>
                    </button>
                    <span className="field-help" style={{ margin: 0 }}>
                      Drop image here or click to browse (JPG, PNG, WebP · 16:9 recommended)
                    </span>
                    {autoYtThumbnail && (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', background: '#191816', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                        <img
                          src={autoYtThumbnail}
                          alt="YouTube thumbnail preview"
                          style={{ width: '48px', height: '28px', objectFit: 'cover', borderRadius: '3px' }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--dim)' }}>
                          Using detected YouTube thumbnail by default unless you upload a custom one.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                className="solid-btn"
                type="submit"
                disabled={isSubmitting}
              >
                <Upload className="w-3.5 h-3.5" />
                {isSubmitting ? 'Publishing...' : 'Publish film'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Your library</h2>
          <p className="panel-intro">
            Manage the videos currently visible on the home page.
          </p>

          {libraryUpdateNotice && (
            <div className="notice success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check className="w-3.5 h-3.5" />
              <span>{libraryUpdateNotice}</span>
            </div>
          )}

          {/* Hidden file input for uploading thumbnail to library videos */}
          <input
            ref={libraryThumbInputRef}
            id="library-thumbnail-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file && targetLibraryVideoId) {
                const dataUrl = await readFileAsDataUrl(file);
                const targetVideo = videos.find((v) => v.id === targetLibraryVideoId);
                if (targetVideo && onVideoUpdated) {
                  onVideoUpdated({ ...targetVideo, thumbnail: dataUrl });
                  setLibraryUpdateNotice(`Thumbnail updated for "${targetVideo.title}"`);
                  setTimeout(() => setLibraryUpdateNotice(null), 4000);
                }
              }
              if (e.target) e.target.value = '';
            }}
          />

          <div className="manage-list">
            {videos.map((video) => (
              <div key={video.id} className="manage-item">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  style={{ cursor: onSelectVideo ? 'pointer' : 'default' }}
                  onClick={() => onSelectVideo && onSelectVideo(video)}
                />
                <div
                  className="manage-item-copy"
                  style={{ cursor: onSelectVideo ? 'pointer' : 'default' }}
                  onClick={() => onSelectVideo && onSelectVideo(video)}
                >
                  <strong>{video.title}</strong>
                  <span>
                    {video.date || 'Just now'} · {video.duration || '—'} ·{' '}
                    {video.tag || 'film'}
                  </span>
                </div>

                {/* Button to upload thumbnail for this specific video */}
                <button
                  type="button"
                  id={`upload-thumb-btn-${video.id}`}
                  className="ghost-btn"
                  style={{
                    fontSize: '11px',
                    height: '28px',
                    padding: '0 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexShrink: 0,
                    borderRadius: '5px',
                    color: 'var(--ink)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTargetLibraryVideoId(video.id);
                    libraryThumbInputRef.current?.click();
                  }}
                  title="Upload new thumbnail for this film"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload Thumbnail</span>
                </button>

                {confirmDeleteId === video.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="solid-btn"
                      style={{
                        background: 'var(--coral, #ff715b)',
                        color: '#fff',
                        fontSize: '11px',
                        height: '28px',
                        padding: '0 10px',
                        borderRadius: '5px',
                        fontWeight: 600,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onVideoDeleted(video.id);
                        setConfirmDeleteId(null);
                      }}
                      aria-label={`Confirm delete ${video.title}`}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      style={{
                        fontSize: '11px',
                        height: '28px',
                        padding: '0 8px',
                        borderRadius: '5px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(null);
                      }}
                      aria-label="Cancel delete"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(video.id);
                    }}
                    aria-label={`Delete ${video.title}`}
                    title="Delete film"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password & Security Configuration Panel */}
      <div className="panel" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Studio Security & Password</h2>
            <p className="panel-intro" style={{ marginBottom: '14px' }}>
              Passwords within files and storage are strictly encrypted as one-way SHA-256 cryptographic hashes.
              No plaintext passwords are ever committed or stored in source code.
            </p>
          </div>
          {hasCustomPassword && (
            confirmResetPwd ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--coral, #ff715b)' }}>Reset key?</span>
                <button
                  type="button"
                  className="solid-btn"
                  style={{
                    background: 'var(--coral, #ff715b)',
                    color: '#fff',
                    fontSize: '11px',
                    height: '30px',
                    padding: '0 8px',
                    borderRadius: '5px',
                  }}
                  onClick={handleExecuteResetPassword}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  style={{ fontSize: '11px', height: '30px', padding: '0 8px', borderRadius: '5px' }}
                  onClick={() => setConfirmResetPwd(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setConfirmResetPwd(true)}
                style={{ fontSize: '11px', height: '32px' }}
              >
                Reset to Default Encrypted Key
              </button>
            )
          )}
        </div>

        {securityNotice && (
          <div className={`notice ${securityNotice.type}`}>{securityNotice.message}</div>
        )}

        <form onSubmit={handleChangePassword} style={{ maxWidth: '440px' }}>
          <div className="field">
            <label htmlFor="new-password">New Studio Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 4 characters)"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              required
            />
          </div>

          <button className="solid-btn" type="submit" style={{ marginTop: '6px' }}>
            Encrypt & Update Password
          </button>
        </form>
      </div>
    </section>
  );
};
