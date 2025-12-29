// MusicFlow - Reproductor de Música Moderno
class MusicPlayer {
    constructor() {
        this.songs = [];
        this.albums = new Map();
        this.artists = new Map();
        this.currentSong = null;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.volume = 0.5;
        this.queue = [];
        this.currentView = 'all';
        
        this.initializeElements();
        this.bindEvents();
        this.setupDragAndDrop();
    }

    initializeElements() {
        // Audio element
        this.audio = document.getElementById('audioPlayer');
        
        // File input
        this.fileInput = document.getElementById('fileInput');
        
        // Main sections
        this.welcomeSection = document.getElementById('welcomeSection');
        this.musicLibrary = document.getElementById('musicLibrary');
        this.albumDetail = document.getElementById('albumDetail');
        
        // Content grids
        this.albumsGrid = document.getElementById('albumsGrid');
        this.artistsGrid = document.getElementById('artistsGrid');
        this.songsList = document.getElementById('songsList');
        
        // Player controls
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Progress controls
        this.progressContainer = document.querySelector('.progress-container');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        
        // Volume controls
        this.volumeSlider = document.getElementById('volumeSlider');
        this.muteBtn = document.getElementById('muteBtn');
        this.volumePercentage = document.getElementById('volumePercentage');
        
        // Track info
        this.currentTrackTitle = document.getElementById('currentTrackTitle');
        this.currentTrackArtist = document.getElementById('currentTrackArtist');
        this.currentTrackCover = document.getElementById('currentTrackCover');
        
        // Filter tabs
        this.filterTabs = document.querySelectorAll('.filter-tab');
        
        // Search
        this.searchInput = document.getElementById('searchInput');
        
        // Queue
        this.queueBtn = document.getElementById('queueBtn');
        this.queueSidebar = document.getElementById('queueSidebar');
        this.closeQueue = document.getElementById('closeQueue');
        this.queueContent = document.getElementById('queueContent');
        
        // Theme selector
        this.themeBtn = document.getElementById('themeBtn');
        this.themeDropdown = document.getElementById('themeDropdown');
        this.themeOptions = document.querySelectorAll('.theme-option');
    }

    bindEvents() {
        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Player controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        this.progressContainer.addEventListener('click', (e) => this.seekTo(e));
        
        // Volume controls
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchFilter(e.target.dataset.filter));
        });
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Queue controls
        this.queueBtn.addEventListener('click', () => this.toggleQueue());
        this.closeQueue.addEventListener('click', () => this.toggleQueue());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Theme selector
        this.themeBtn.addEventListener('click', () => this.toggleThemeDropdown());
        this.themeOptions.forEach(option => {
            option.addEventListener('click', (e) => this.changeTheme(e.target.closest('.theme-option').dataset.theme));
        });
        
        // Close theme dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.themeBtn.contains(e.target) && !this.themeDropdown.contains(e.target)) {
                this.themeDropdown.classList.remove('show');
            }
        });
    }

    setupDragAndDrop() {
        const uploadZone = document.querySelector('.upload-zone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('drag-over'), false);
        });

        uploadZone.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const files = e.dataTransfer.files;
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.processFiles(files);
    }

    async processFiles(files) {
        const mp3Files = Array.from(files).filter(file => 
            file.type === 'audio/mp3' || file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
        );

        if (mp3Files.length === 0) {
            this.showNotification('Por favor selecciona archivos MP3 válidos', 'error');
            return;
        }

        this.showNotification(`Procesando ${mp3Files.length} archivos...`, 'info');

        for (const file of mp3Files) {
            await this.processSingleFile(file);
        }

        this.organizeMusic();
        this.renderLibrary();
        this.showLibrary();
        
        this.showNotification(`${mp3Files.length} canciones agregadas exitosamente`, 'success');
    }

    async processSingleFile(file) {
        return new Promise((resolve) => {
            jsmediatags.read(file, {
                onSuccess: (tag) => {
                    const song = this.createSongObject(file, tag);
                    this.songs.push(song);
                    this.loadSongDuration(song).then(() => resolve());
                },
                onError: (error) => {
                    console.warn('Error reading metadata for', file.name, error);
                    // Create song with basic info even if metadata reading fails
                    const song = this.createSongObject(file, null);
                    this.songs.push(song);
                    this.loadSongDuration(song).then(() => resolve());
                }
            });
        });
    }

    async loadSongDuration(song) {
        return new Promise((resolve) => {
            const tempAudio = new Audio();
            tempAudio.preload = 'metadata';
            
            const cleanup = () => {
                tempAudio.removeEventListener('loadedmetadata', onLoaded);
                tempAudio.removeEventListener('error', onError);
                tempAudio.removeEventListener('canplaythrough', onLoaded);
                tempAudio.src = '';
                tempAudio.load();
            };
            
            const onLoaded = () => {
                if (tempAudio.duration && !isNaN(tempAudio.duration) && tempAudio.duration !== Infinity) {
                    song.duration = tempAudio.duration;
                } else {
                    song.duration = 0;
                }
                cleanup();
                resolve();
            };
            
            const onError = () => {
                song.duration = 0;
                cleanup();
                resolve();
            };
            
            tempAudio.addEventListener('loadedmetadata', onLoaded);
            tempAudio.addEventListener('canplaythrough', onLoaded);
            tempAudio.addEventListener('error', onError);
            
            // Timeout fallback
            setTimeout(() => {
                if (song.duration === undefined) {
                    song.duration = 0;
                    cleanup();
                    resolve();
                }
            }, 3000);
            
            tempAudio.src = song.url;
        });
    }

    createSongObject(file, tag) {
        const tags = tag?.tags || {};
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        
        // Extract artwork
        let artwork = null;
        if (tags.picture) {
            const { data, format } = tags.picture;
            const byteArray = new Uint8Array(data);
            const blob = new Blob([byteArray], { type: format });
            artwork = URL.createObjectURL(blob);
        }

        const song = {
            id: this.generateId(),
            file: file,
            url: URL.createObjectURL(file),
            title: tags.title || fileName,
            artist: tags.artist || 'Artista Desconocido',
            album: tags.album || 'Álbum Desconocido',
            year: tags.year || '',
            track: tags.track || '',
            genre: tags.genre || '',
            duration: 0, // Will be set when audio loads
            artwork: artwork,
            fileName: file.name
        };

        return song;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    organizeMusic() {
        // Clear existing collections
        this.albums.clear();
        this.artists.clear();

        // Group by albums and artists
        this.songs.forEach(song => {
            // Albums
            if (!this.albums.has(song.album)) {
                this.albums.set(song.album, {
                    name: song.album,
                    artist: song.artist,
                    year: song.year,
                    artwork: song.artwork,
                    songs: []
                });
            }
            this.albums.get(song.album).songs.push(song);

            // Artists
            if (!this.artists.has(song.artist)) {
                this.artists.set(song.artist, {
                    name: song.artist,
                    albums: new Set(),
                    songs: [],
                    artwork: song.artwork
                });
            }
            const artist = this.artists.get(song.artist);
            artist.albums.add(song.album);
            artist.songs.push(song);
        });

        // Sort albums by track number
        this.albums.forEach(album => {
            album.songs.sort((a, b) => {
                const trackA = parseInt(a.track) || 999;
                const trackB = parseInt(b.track) || 999;
                return trackA - trackB;
            });
        });
    }

    renderLibrary() {
        this.renderAlbums();
        this.renderArtists();
        this.renderSongs();
    }

    renderAlbums() {
        this.albumsGrid.innerHTML = '';
        
        Array.from(this.albums.values()).forEach(album => {
            const albumCard = this.createAlbumCard(album);
            this.albumsGrid.appendChild(albumCard);
        });
    }

    createAlbumCard(album) {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.onclick = () => this.showAlbumDetail(album);

        const defaultArtwork = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNDA0MDQwIi8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTE2LjU2OSA2MCAxMzAgNzMuNDMxNSAxMzAgOTBWMTEwQzEzMCAxMjYuNTY5IDExNi41NjkgMTQwIDEwMCAxNDBDODMuNDMxNSAxNDAgNzAgMTI2LjU2OSA3MCAxMTBWOTBDNzAgNzMuNDMxNSA4My40MzE1IDYwIDEwMCA2MFoiIGZpbGw9IiM2QTZBNkEiLz4KPC9zdmc+';

        card.innerHTML = `
            <div class="album-cover">
                <img src="${album.artwork || defaultArtwork}" alt="${album.name}" onerror="this.src='${defaultArtwork}'">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="album-title">${album.name}</div>
            <div class="album-artist">${album.artist}</div>
        `;

        return card;
    }

    renderArtists() {
        this.artistsGrid.innerHTML = '';
        
        Array.from(this.artists.values()).forEach(artist => {
            const artistCard = this.createArtistCard(artist);
            this.artistsGrid.appendChild(artistCard);
        });
    }

    createArtistCard(artist) {
        const card = document.createElement('div');
        card.className = 'album-card'; // Reusing album card styles
        card.onclick = () => this.showArtistSongs(artist);

        const defaultArtwork = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNDA0MDQwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzZBNkE2QSIvPgo8cGF0aCBkPSJNNjAgMTQwQzYwIDEyMC4xMTggNzYuMTE4IDEwNCA5NiAxMDRIMTA0QzEyMy44ODIgMTA0IDE0MCAxMjAuMTE4IDE0MCAxNDBWMTYwSDYwVjE0MFoiIGZpbGw9IiM2QTZBNkEiLz4KPC9zdmc+';

        card.innerHTML = `
            <div class="album-cover">
                <img src="${artist.artwork || defaultArtwork}" alt="${artist.name}" onerror="this.src='${defaultArtwork}'" style="border-radius: 50%;">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="album-title">${artist.name}</div>
            <div class="album-artist">${artist.albums.size} álbum${artist.albums.size !== 1 ? 'es' : ''}</div>
        `;

        return card;
    }

    renderSongs() {
        this.songsList.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const songItem = this.createSongItem(song, index);
            this.songsList.appendChild(songItem);
        });
    }

    createSongItem(song, index) {
        const item = document.createElement('div');
        item.className = 'song-item';
        item.onclick = () => this.playSong(index);

        const defaultArtwork = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNDA0MDQwIi8+CjxwYXRoIGQ9Ik0yNCAyMEMyNi4yMDkxIDIwIDI4IDIxLjc5MDkgMjggMjRWMjZDMjggMjguMjA5MSAyNi4yMDkxIDMwIDI0IDMwQzIxLjc5MDkgMzAgMjAgMjguMjA5MSAyMCAyNlYyNEMyMCAyMS43OTA5IDIxLjc5MDkgMjAgMjQgMjBaIiBmaWxsPSIjNkE2QTZBIi8+Cjwvc3ZnPg==';

        item.innerHTML = `
            <div class="song-cover">
                <img src="${song.artwork || defaultArtwork}" alt="${song.title}" onerror="this.src='${defaultArtwork}'">
            </div>
            <div class="song-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <div class="song-duration">${this.formatTime(song.duration)}</div>
            <div class="song-actions">
                <button onclick="event.stopPropagation(); player.addToQueue('${song.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;

        return item;
    }

    showLibrary() {
        this.welcomeSection.style.display = 'none';
        this.musicLibrary.style.display = 'block';
        this.albumDetail.style.display = 'none';
    }

    showAlbumDetail(album) {
        this.albumDetail.style.display = 'block';
        this.musicLibrary.style.display = 'none';
        
        // Update album detail view
        document.getElementById('albumCoverLarge').src = album.artwork || this.getDefaultArtwork();
        document.getElementById('albumTitle').textContent = album.name;
        document.getElementById('albumArtist').textContent = album.artist;
        document.getElementById('albumYear').textContent = album.year || 'Año desconocido';
        document.getElementById('albumTrackCount').textContent = `${album.songs.length} canción${album.songs.length !== 1 ? 'es' : ''}`;
        
        // Add event listener for play album button
        const playAlbumBtn = document.querySelector('.play-album-btn');
        if (playAlbumBtn) {
            playAlbumBtn.onclick = () => this.playAlbum(album);
        }
        
        // Render album tracks
        const albumTracks = document.getElementById('albumTracks');
        albumTracks.innerHTML = `
            <div class="track-header">
                <span>#</span>
                <span>Título</span>
                <span><i class="far fa-clock"></i></span>
                <span></span>
            </div>
        `;
        
        album.songs.forEach((song, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.onclick = () => this.playAlbumSong(album, index);
            
            trackItem.innerHTML = `
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
                <div class="song-duration">${this.formatTime(song.duration)}</div>
                <div class="song-actions">
                    <button onclick="event.stopPropagation(); player.addToQueue('${song.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            
            albumTracks.appendChild(trackItem);
        });
    }

    playAlbum(album) {
        if (album.songs.length > 0) {
            this.playAlbumSong(album, 0);
            this.showNotification(`Reproduciendo álbum: ${album.name}`, 'success');
        }
    }

    showArtistSongs(artist) {
        // Similar to showAlbumDetail but for artist
        this.currentView = 'artist';
        this.renderSongs(artist.songs);
    }

    switchFilter(filter) {
        this.currentView = filter;
        
        // Update active tab
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        // Show/hide content based on filter
        this.albumsGrid.style.display = filter === 'albums' || filter === 'all' ? 'grid' : 'none';
        this.artistsGrid.style.display = filter === 'artists' || filter === 'all' ? 'grid' : 'none';
        this.songsList.style.display = filter === 'all' ? 'block' : 'none';
    }

    playSong(index) {
        this.currentIndex = index;
        this.currentSong = this.songs[index];
        this.loadCurrentSong();
        this.play();
        this.updateNowPlaying();
        this.updateQueue();
    }

    playAlbumSong(album, trackIndex) {
        const song = album.songs[trackIndex];
        const globalIndex = this.songs.findIndex(s => s.id === song.id);
        this.playSong(globalIndex);
    }

    loadCurrentSong() {
        if (!this.currentSong) return;
        
        this.audio.src = this.currentSong.url;
        this.audio.load();
    }

    play() {
        if (this.currentSong) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
            }).catch(error => {
                console.error('Error playing audio:', error);
                this.showNotification('Error al reproducir la canción', 'error');
            });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    togglePlayPause() {
        if (!this.currentSong) {
            if (this.songs.length > 0) {
                this.playSong(0);
            }
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    previousTrack() {
        if (this.songs.length === 0) return;
        
        let newIndex;
        if (this.isShuffled) {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.songs.length - 1;
        }
        
        this.playSong(newIndex);
    }

    nextTrack() {
        if (this.songs.length === 0) return;
        
        let newIndex;
        if (this.isShuffled) {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            newIndex = this.currentIndex < this.songs.length - 1 ? this.currentIndex + 1 : 0;
        }
        
        this.playSong(newIndex);
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active', this.isShuffled);
        this.showNotification(`Aleatorio ${this.isShuffled ? 'activado' : 'desactivado'}`, 'info');
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        
        const icon = this.repeatBtn.querySelector('i');
        if (this.repeatMode === 'one') {
            icon.className = 'fas fa-redo-alt';
        } else {
            icon.className = 'fas fa-redo';
        }
        
        const modeText = {
            'none': 'desactivado',
            'all': 'activado (todas)',
            'one': 'activado (una)'
        };
        
        this.showNotification(`Repetir ${modeText[this.repeatMode]}`, 'info');
    }

    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all' || this.currentIndex < this.songs.length - 1) {
            this.nextTrack();
        } else {
            this.pause();
        }
    }

    seekTo(e) {
        if (!this.currentSong) return;
        
        const rect = this.progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * this.audio.duration;
        
        this.audio.currentTime = newTime;
    }

    setVolume(value) {
        this.volume = value / 100;
        
        // Crear contexto de audio para amplificación si no existe
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
        }
        
        // Aplicar ganancia (permite hasta 200% = 2.0)
        this.gainNode.gain.value = this.volume;
        
        // Actualizar indicador de porcentaje
        this.volumePercentage.textContent = `${Math.round(value)}%`;
        
        // Marcar como boosted si es mayor a 100%
        if (value > 100) {
            this.volumePercentage.classList.add('boosted');
        } else {
            this.volumePercentage.classList.remove('boosted');
        }
        
        // Actualizar icono del botón de mute
        const icon = this.muteBtn.querySelector('i');
        if (this.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else if (this.volume <= 1.0) {
            icon.className = 'fas fa-volume-up';
        } else {
            // Icono especial para volumen amplificado
            icon.className = 'fas fa-volume-up';
            icon.style.color = 'var(--primary-color)';
        }
        
        // Mostrar notificación para volumen amplificado
        if (value > 100 && !this.lastVolumeNotification || 
            (this.lastVolumeNotification && Date.now() - this.lastVolumeNotification > 2000)) {
            this.showNotification(`Volumen amplificado: ${Math.round(value)}%`, 'warning');
            this.lastVolumeNotification = Date.now();
        }
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            this.volumeSlider.value = 0;
            this.muteBtn.querySelector('i').className = 'fas fa-volume-mute';
        } else {
            this.audio.volume = this.volume;
            this.volumeSlider.value = this.volume * 100;
            this.setVolume(this.volume * 100);
        }
    }

    updateDuration() {
        if (this.currentSong) {
            this.currentSong.duration = this.audio.duration;
            this.totalTime.textContent = this.formatTime(this.audio.duration);
        }
    }

    updateProgress() {
        if (!this.audio.duration) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        this.currentTime.textContent = this.formatTime(this.audio.currentTime);
    }

    updatePlayButton() {
        const icon = this.playPauseBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    updateNowPlaying() {
        if (!this.currentSong) return;
        
        this.currentTrackTitle.textContent = this.currentSong.title;
        this.currentTrackArtist.textContent = this.currentSong.artist;
        this.currentTrackCover.src = this.currentSong.artwork || this.getDefaultArtwork();
    }

    addToQueue(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (song) {
            this.queue.push(song);
            this.updateQueue();
            this.showNotification(`"${song.title}" agregada a la cola`, 'success');
        }
    }

    updateQueue() {
        if (this.queue.length === 0) {
            this.queueContent.innerHTML = '<p class="queue-empty">No hay canciones en la cola</p>';
            return;
        }
        
        this.queueContent.innerHTML = '';
        this.queue.forEach((song, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            if (song.id === this.currentSong?.id) {
                queueItem.classList.add('current');
            }
            
            queueItem.innerHTML = `
                <div class="queue-item-cover">
                    <img src="${song.artwork || this.getDefaultArtwork()}" alt="${song.title}">
                </div>
                <div class="queue-item-info">
                    <div class="queue-item-title">${song.title}</div>
                    <div class="queue-item-artist">${song.artist}</div>
                </div>
            `;
            
            queueItem.onclick = () => {
                const globalIndex = this.songs.findIndex(s => s.id === song.id);
                this.playSong(globalIndex);
            };
            
            this.queueContent.appendChild(queueItem);
        });
    }

    toggleQueue() {
        this.queueSidebar.classList.toggle('open');
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderLibrary();
            return;
        }
        
        const filteredSongs = this.songs.filter(song =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.album.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderSongs(filteredSongs);
    }

    renderSongs(songsToRender = this.songs) {
        this.songsList.innerHTML = '';
        
        songsToRender.forEach((song, index) => {
            const songItem = this.createSongItem(song, this.songs.indexOf(song));
            this.songsList.appendChild(songItem);
        });
    }

    handleKeyboard(e) {
        // Prevent shortcuts when typing in search
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'KeyS':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleShuffle();
                }
                break;
            case 'KeyR':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleRepeat();
                }
                break;
        }
    }

    handleAudioError(e) {
        console.error('Audio error:', e);
        this.showNotification('Error al cargar el archivo de audio', 'error');
        this.nextTrack(); // Skip to next track on error
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getDefaultArtwork() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNDA0MDQwIi8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTE2LjU2OSA2MCAxMzAgNzMuNDMxNSAxMzAgOTBWMTEwQzEzMCAxMjYuNTY5IDExNi41NjkgMTQwIDEwMCAxNDBDODMuNDMxNSAxNDAgNzAgMTI2LjU2OSA3MCAxMTBWOTBDNzAgNzMuNDMxNSA4My40MzE1IDYwIDEwMCA2MFoiIGZpbGw9IiM2QTZBNkEiLz4KPC9zdmc+';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Theme functions
    toggleThemeDropdown() {
        this.themeDropdown.classList.toggle('show');
    }

    changeTheme(theme) {
        // Remove current theme
        document.body.removeAttribute('data-theme');
        
        // Apply new theme
        if (theme !== 'luxury') {
            document.body.setAttribute('data-theme', theme);
        }
        
        // Update active option
        this.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
        
        // Close dropdown
        this.themeDropdown.classList.remove('show');
        
        // Save theme preference
        localStorage.setItem('luxe-audio-theme', theme);
        
        // Show notification
        const themeNames = {
            'luxury': 'Luxury Gold',
            'dark': 'Azabache',
            'blue': 'Ocean Blue',
            'purple': 'Royal Purple'
        };
        
        this.showNotification(`Tema cambiado a ${themeNames[theme]}`, 'success');
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('luxe-audio-theme') || 'luxury';
        this.changeTheme(savedTheme);
    }

    // Initialize volume
    init() {
        this.audio.volume = this.volume;
        this.volumeSlider.value = this.volume * 100;
        this.loadSavedTheme();
    }
}

// Initialize the music player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
    window.player.init();
});

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-color);
        border-radius: var(--radius-medium);
        padding: 16px 20px;
        box-shadow: var(--shadow-large);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        border-left: 4px solid var(--primary-color);
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-success {
        border-left-color: var(--primary-color);
    }

    .notification-error {
        border-left-color: #ef4444;
    }

    .notification-warning {
        border-left-color: #f59e0b;
    }

    .notification-info {
        border-left-color: var(--accent-blue);
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);
    }

    .notification-content i {
        font-size: 18px;
    }

    .notification-success .notification-content i {
        color: var(--primary-color);
    }

    .notification-error .notification-content i {
        color: #ef4444;
    }

    .notification-warning .notification-content i {
        color: #f59e0b;
    }

    .notification-info .notification-content i {
        color: var(--accent-blue);
    }

    /* Drag and drop styles */
    .upload-zone.drag-over {
        border-color: var(--primary-color);
        background: linear-gradient(135deg, rgba(29, 185, 84, 0.2) 0%, rgba(30, 215, 96, 0.2) 100%);
        transform: translateY(-4px);
        box-shadow: var(--shadow-large);
    }

    /* Playing animation */
    @keyframes playing {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.3); }
    }

    .playing-indicator {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .playing-indicator span {
        width: 3px;
        height: 16px;
        background: var(--primary-color);
        border-radius: 1px;
        animation: playing 1s infinite;
    }

    .playing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .playing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
