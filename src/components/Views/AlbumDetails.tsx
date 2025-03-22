import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Якщо використовуєте axios для API запитів



interface AlbumData {
  id: number;
  title: string;
  year: number;
  coverUrl: string;
  artistId: number;
  artistName: string;
  numberOfSongs: number;
  albumDuration: string;
}

interface SongData {
  id: number;
  title: string;
  duration: string;
  artists: string[];
  album: string;
  url: string;
}

interface RelatedAlbumData {
  id: number;
  title: string;
  year: number;
  coverUrl: string;
}


interface RelatedArtistData {
  id: number;
  name: string;
  photoUrl: string | null; 
}

interface Playlist {
  id: number;
  name: string;
}



const formatDuration = (duration: string): string => {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  

 
  if (isNaN(hours) || hours === 0) {
    return `${minutes}:${seconds}`;
  }

  
  return `${hours} год ${minutes} хв ${seconds} с`;
};



  
const formatDurationToSeconds = (duration: string): number => {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};


const calculateTotalDuration = (songs: SongData[]): number => {
  return songs.reduce((total: number, song: SongData) => {
    return total + formatDurationToSeconds(song.duration); 
  }, 0);
};


const formatTotalDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  
  return `${hours} год ${minutes} хв`;
};





const api = axios.create({
  baseURL: 'http://localhost:5253/api',  // Правильний порт API
});




const AlbumDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<SongData[]>([]); // Масив пісень
  const [relatedAlbums, setRelatedAlbums] = useState<RelatedAlbumData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  
  const [hoveredSongId, setHoveredSongId] = useState<number | null>(null);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [relatedArtists, setRelatedArtists] = useState<RelatedArtistData[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const handleToggleMenu = () => setIsOpen(!isOpen);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]); // Ініціалізуємо як порожній масив


  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
const [selectedSong, setSelectedSong] = useState<SongData | null>(null); // Вибрана пісня для додавання до плейлиста
const [isArtistMenuOpen, setIsArtistMenuOpen] = useState(false);
const [isSongMenuOpen, setIsSongMenuOpen] = useState(false);

const [newPlaylistName, setNewPlaylistName] = useState('');

const [playlistName, setPlaylistName] = useState('');
  
  


const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false); // Стейт для меню плейлистів

const handleSongClick = (id: number) => {
  // Перехід на сторінку пісні за id
  navigate(`/songs/${id}`);
};

const api = axios.create({
  baseURL: 'http://localhost:5253/api',  // Set base URL here
});

const handleCreatePlaylist = async (e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault(); // Зупиняє стандартну поведінку

  if (!newPlaylistName.trim()) {
    alert('Будь ласка, введіть назву плейлиста!');
    return;
  }

  try {
    const response = await api.post("/playlists", { name: newPlaylistName });
    setPlaylists((prev) => [...prev, response.data]);
    setNewPlaylistName(''); // Очищаємо поле введення
    alert("Новий плейлист створено!");
  } catch (error) {
    console.error("Error creating playlist", error);
  }
};




useEffect(() => {
  const fetchAlbumDetails = async () => {
    try {
      const response = await axios.get(`/api/albums/${id}`);
      setAlbum(response.data);
      setSongs(response.data.songs || []);  // Забезпечуємо, що якщо пісні відсутні, ми встановлюємо порожній масив
      setLoading(false);
    } catch (error) {
      console.error("Error fetching album details", error);
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.get("/playlists");
      const playlistsData = response.data;
  
      // Перевіряємо, чи є поле $values і чи є воно масивом
      if (playlistsData && Array.isArray(playlistsData.$values)) {
        setPlaylists(playlistsData.$values);  // Встановлюємо масив плейлистів
      } else {
        console.error('Received data is not the expected format:', playlistsData);
      }
    } catch (error) {
      console.error("Error fetching playlists", error);
    }
  };
  
  
  
  

  fetchAlbumDetails();
  fetchPlaylists();
}, [id]); // Завжди викликається при зміні id



  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSubmenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsSubmenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch(`http://localhost:5253/api/albums/${id}`);
        if (!response.ok) throw new Error("Album not found");

        const data = await response.json();
        const coverImageUrl = data.coverUrl.startsWith("http")
          ? data.coverUrl
          : `http://localhost:5253/${data.coverUrl}`;

        const artistData = data.albumArtists?.$values?.[0]?.artist;

        const parsedAlbum: AlbumData = {
          id: data.id,
          title: data.title,
          year: data.year,
          coverUrl: coverImageUrl || "https://via.placeholder.com/150",
          artistId: artistData?.id || 0,
          artistName: artistData?.name || "Unknown Artist",
          numberOfSongs: data.songs?.$values?.length || 0,
          albumDuration: "0 год 0 хв", 
        };

        setAlbum(parsedAlbum);
        fetchSongs(parsedAlbum.id);
        fetchRelatedAlbums(parsedAlbum.artistId);
        
      } catch (error) {
        console.error("Error fetching album:", error);
        setAlbum(null);
      } finally {
        setLoading(false);
      }
    };

    

    const fetchRelatedAlbums = async (artistId: number) => {
      try {
        const response = await fetch(`http://localhost:5253/api/artist/${artistId}/albums`);
        if (!response.ok) throw new Error("Related albums not found");

        const data = await response.json();
        setRelatedAlbums(
          data["$values"].map((album: any) => ({
            id: album.id,
            title: album.title,
            coverUrl: album.coverUrl.startsWith("http")
              ? album.coverUrl
              : `http://localhost:5253${album.coverUrl}`,
              year: album.year,
          })).slice(0, 5)
        );
      } catch (error) {
        console.error("Error fetching related albums:", error);
      }
    };

    const fetchSongs = async (albumId: number) => {
      try {
        const response = await fetch(`http://localhost:5253/api/albums/${albumId}/songs`);
        if (!response.ok) throw new Error("Songs not found");
    
        const data = await response.json();
        const parsedSongs: SongData[] = data.$values.map((song: any) => ({
          id: song.id,
          title: song.title,
          duration: song.duration,
          artists: song.artists ? song.artists.$values : ["Unknown Artist"],
          url: song.filePath,
        }));
    
        setSongs(parsedSongs);
    
       
        const totalSeconds = parsedSongs.reduce((total, song) => {
          return total + formatDurationToSeconds(song.duration);
        }, 0);
    
        
        const formattedTime = formatTotalDuration(totalSeconds);
        setAlbum(prevAlbum => {
          if (prevAlbum === null) {
            
            return {
              albumDuration: formattedTime,
              id: 0,
              title: "",
              year: 0,
              coverUrl: "",
              artistId: 0,
              artistName: "Unknown Artist",
              numberOfSongs: 0,
            };
          }
        
          
          return {
            ...prevAlbum,
            albumDuration: formattedTime,
          };
        });
    
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
    

    fetchAlbum();
  }, [id]);




  

  

 useEffect(() => {
    const fetchRelatedArtists = async () => {
      try {
        const response = await fetch('http://localhost:5253/api/artist');
        if (!response.ok) throw new Error('Artists not found');
        
        const data = await response.json();

        const artists: RelatedArtistData[] = data.$values.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          photoUrl: null, 
        }));

        setRelatedArtists(artists); 
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

    fetchRelatedArtists();
  }, []); 

  const togglePlayPause = (event: React.MouseEvent, song: SongData) => {
    event.stopPropagation(); 

    if (currentSong?.id !== song.id) {
        // Зупиняємо попереднє аудіо
        if (audio instanceof HTMLAudioElement) {
            audio.pause();
            audio.currentTime = 0;
        }

        const newAudio = new Audio(song.url);
        setAudio(newAudio);
        setCurrentSong(song);

        newAudio.play().catch((error) => {
            console.error("Failed to play audio:", error);
            alert("Failed to load the audio. Please try again later.");
        });

        setIsPlaying(true);
    } else {
        if (audio instanceof HTMLAudioElement) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play().catch((error) => {
                    console.error("Failed to play audio:", error);
                    alert("Failed to load the audio. Please try again later.");
                });
                setIsPlaying(true);
            }
        }
    }
};

const handleMenuClick = (song: SongData, e: React.MouseEvent) => {
  e.stopPropagation(); // Зупиняємо поширення події на інші елементи контейнера
  setSelectedSong(song);
  setIsMenuOpen(true); // Відкриваємо меню для пісні
};
const handleSongMenuClick = (song: SongData, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent event bubbling
  if (selectedSong?.id === song.id) {
    e.preventDefault(); // Виключаємо стандартну поведінку
    // If the song is already selected, toggle the menu
    setIsMenuOpen(!isMenuOpen);
    
    console.log("Menu clicked for song:", song); // Перевірка, чи передається пісня
  } else {
    // Otherwise, open the menu for the new selected song
    e.preventDefault(); // Виключаємо стандартну поведінку
    setSelectedSong(song);
    setIsMenuOpen(true);
  }
};




  const handlePlaylistMenuClick = (song: SongData, e: React.MouseEvent) => {
  e.stopPropagation(); // Зупиняємо поширення події на інші елементи контейнера
  setSelectedSong(song); // Зберігаємо вибрану пісню
  setIsPlaylistMenuOpen(true); // Відкриваємо меню для плейлистів
};

// Створення нового плейлисту


// Додавання пісні до вибраного плейлисту
const handleAddSongToPlaylist = async (playlistId: number) => {
  if (!selectedSong) return; // Перевірка на наявність вибраної пісні

  try {
    // Отримуємо поточний плейлист
    const playlistResponse = await api.get(`/playlists/${playlistId}`);
    const playlist = playlistResponse.data;

    console.log('Playlist Data:', playlist); // Перевірте, як виглядає playlist

    // Перевіряємо, чи існує songIds.$values і чи це масив
    if (playlist.songIds && Array.isArray(playlist.songIds.$values)) {
      // Додаємо нову пісню до існуючих пісень
      const updatedSongIds = [...playlist.songIds.$values, selectedSong.id];

      // Оновлюємо плейлист з новим масивом пісень
      await api.put(`/playlists/${playlistId}`, { SongIds: updatedSongIds });

      alert("Пісня додана до плейлиста!");
      setIsPlaylistMenuOpen(false); // Закриваємо меню після додавання пісні
    } else {
      // Якщо songIds.$values не масив, обробляємо помилку
      console.error('songIds.$values is not an array:', playlist.songIds.$values);
    }
  } catch (error) {
    console.error("Error adding song to playlist", error);
  }
};





  
  
  const handleBackButtonClick = () => {
    
    if (audio instanceof HTMLAudioElement) {
      audio.pause(); 
      setIsPlaying(false); 
    }
  
    navigate(-1); 
  };
  
  useEffect(() => {
    if (audio) {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
  
      if (audio instanceof HTMLAudioElement) {
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
      }
  
      return () => {
        if (audio instanceof HTMLAudioElement) {
          audio.removeEventListener("play", onPlay);
          audio.removeEventListener("pause", onPause);
          audio.pause();
          audio.currentTime = 0;  
        }
      };
    }
  }, [audio]);
  

  const handleNavigateToAlbum = () => {
    if (album?.artistId) {
      navigate(`/artist/${album.artistId}/albums`);
    }
  };

  const handleArtistMenuClick = (artistId: number, artistName: string) => {
  // Дія при натисканні на меню артиста
  navigate(`/artist/${artistId}`);
};
  


  if (loading) {
    return <div className="text-white text-center text-2xl mt-10">Loading...</div>;
  }

  if (!album) {
    return (
      <div className="text-white text-center text-2xl mt-10">
        <h1>Album not found</h1>
      </div>
    );
  }

  
  

  

  return (
    <div className="mt-10 px-10 max-w-[1400px] mx-auto flex gap-10">
  <div className="flex-1 ml-0">
    <div className="mb-6 relative">
      <img
        src="/images/arrowIcon.svg"
        alt="back"
        className="w-12 h-12 cursor-pointer absolute"
        style={{
          top: "2px", 
          left: "40px", 
        }}
        onClick={handleBackButtonClick} 
      />
    </div>
   
   


       
{/* Album details */}
<div className="w-[1013px] h-[2170px] p-6 rounded-[10px] mb-6">
  <div className="w-[926px] h-[250px] p-6 rounded-[10px] mb-6 relative ml-0">
    <div className="flex gap-6">
      <img
        src={album.coverUrl}
        alt={album.title}
        className="w-56 h-56 rounded-lg object-cover"
      />
      <div className="ml-8 flex flex-col w-full">
        <span className="text-xl text-gray-400 mb-1">Альбом</span>
        
        <h1
          className="text-white font-bold mb-4 album-title"
          title={album.title}
          style={{
            fontFamily: "Noto Sans",
            fontWeight: 700, 
            fontSize: "24px", 
            lineHeight: "normal",
            color: "#FFFFFF", 
            textAlign: "left", 
            display: "-webkit-box",
            WebkitLineClamp: 2, 
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis", 
            margin: 0, 
            padding: 0, 
            marginBottom: "16px", 
          }}
        >
          {album.title}
        </h1>

        <div className="flex items-center w-full h-[44px] rounded-[10px] bg-[rgba(186,214,235,0.20)] p-2 mb-6" style={{ marginBottom: "8px" }}>
          <div className="w-[4px] h-[44px] bg-[rgba(186,214,235,0.65)]"></div>
          <div
            className="w-10 h-10 rounded-full bg-lightgray bg-cover bg-center"
            style={{
              backgroundImage: `url("/images/default-avatar.png")`,
            }}
          ></div>
        

       


       
     
  

                  <div className="flex items-center gap-2 ml-2 w-full" >
                    <span
                      className="text-white"
                      style={{
                        fontFamily: "Noto Sans",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "normal",
                        color: "#B3B3B3", 
                        textAlign: "center", 
                      }}
                    >
                      {album.artistName}
                    </span>
                    <img src="/images/Ellipses.svg" alt="ellipse" className="w-1 h-1" />
                    <span
                      className="text-white"
                      style={{
                        fontFamily: "Noto Sans",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "normal",
                        color: "#B3B3B3", 
                        textAlign: "center",
                      }}
                    >
                      {album.year}
                    </span>
                    <img src="/images/Ellipses.svg" alt="ellipse" className="w-1 h-1" />
                    <span
  className="text-white"
  style={{
    fontFamily: "Noto Sans",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "normal",
    color: "#B3B3B3", 
    textAlign: "center",
  }}
>
  {album.numberOfSongs}{" "}
  {album.numberOfSongs === 1
    ? "пісня"
    : album.numberOfSongs > 1 && album.numberOfSongs < 5
    ? "пісні"
    : "пісень"}, {formatTotalDuration(calculateTotalDuration(songs))}
</span>

                  </div>
                </div>

                

                {/* New button section under the info bar */}
                <div className="flex gap-4 mb-6" >
                  <button className="px-1 py-2 rounded-[10px] flex items-center justify-center">
                    <img
                      src={isPlaying ? "/images/PauseIcon.svg" : "/images/PlayIcon.svg"}
                      alt={isPlaying ? "Pause" : "Play"}
                      className="w-11 h-11"
                      onClick={(event) => togglePlayPause(event, songs[0])}
                    />
                  </button>
                  <button className="px-1 py-2 rounded-[10px] flex items-center justify-center">
                    <img
                      src="/images/AddCircle.svg"
                      alt="Add"
                      className="w-6 h-6"
                    />
                  </button>
                  <div className="relative">
                 <div className="relative" ref={menuRef} style={{ marginTop: "20px" }}>
  <button
    className="px-1 py-2 rounded-[5px] flex items-center justify-center"
    onClick={() => setIsArtistMenuOpen(!isArtistMenuOpen)} // Відкриває/закриває меню для артиста
  >
    <div className="flex gap-1">
      <img src="/images/Container.svg" alt="Menu Dot" className="w-1 h-1" />
      <img src="/images/Container.svg" alt="Menu Dot" className="w-1 h-1" />
      <img src="/images/Container.svg" alt="Menu Dot" className="w-1 h-1" />
    </div>
  </button>

  {isArtistMenuOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-[#010326] border-radius-10px shadow-lg p-2 z-10">
      {/* Переглянути виконавця */}
      <div
        className="p-2 hover:bg-gray-700 cursor-pointer text-white rounded"
        onClick={() => navigate(`/artist/${album?.artistId}`)} // Перехід до сторінки артиста
      >
        Переглянути виконавця
      </div>

      {/* Показати всі альбоми виконавця */}
      <div
        className="p-2 hover:bg-gray-700 cursor-pointer text-white rounded"
        onClick={handleNavigateToAlbum} // Показує всі альбоми артиста
      >
        Показати всі альбоми виконавця
      </div>
    </div>
  )}
</div>
</div>

      
                </div>
              </div>
            </div>
          </div>

         {/* Music songs container */}
<div
  className="flex flex-col gap-6"
  style={{
    maxHeight: "1400px", 
    overflowY: "auto",   
    overflowX: "hidden", 
    paddingRight: "8px", 
    scrollbarWidth: "thin", 
    scrollbarColor: "transparent transparent", 
    width: "1013px", 
  }}
>
  {songs.map((song, index) => (
    <div
      key={song.id}
      className="flex items-center text-white text-xl mb-4"
      style={{
        display: "flex",
        padding: "16px",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "10px",
        alignSelf: "stretch",
        borderRadius: "10px",
        background: hoveredSongId === song.id || playingSongId === song.id
              ? "var(--alternative-background-20, rgba(186, 214, 235, 0.20))"
              : "rgba(45, 1, 64, 0.20)",
        fontFamily: "Noto Sans",
        fontSize: "24px",
        fontWeight: "400",
        textTransform: "uppercase",
      }}
      onMouseEnter={() => setHoveredSongId(song.id)}
      onMouseLeave={() => setHoveredSongId(null)}
      
    >
      {/* Іконка для відтворення/пауза */}
      <div
        onClick={(event) => {
          
          togglePlayPause(event, song);
        }} 
        style={{
          width: "40px",
          textAlign: "center",
          marginRight: "16px",
          cursor: "pointer",
        }}
      >
        {playingSongId === song.id ? (
          <img src="/images/PauseIcon.svg" alt="Pause" className="w-6 h-6" />
        ) : hoveredSongId === song.id ? (
          <img src="/images/donnar.svg" alt="Play" className="w-6 h-6" />
        ) : (
          <span style={{ fontSize: "24px", fontWeight: "700" }}>{index + 1}</span>
        )}
      </div>

      {/* Song title and artist */}
      <div className="flex flex-col items-start w-full">
      <div
       onClick={(e) => {
        e.stopPropagation(); // Переконатися, що не буде запущено інші обробники
        handleSongClick(song.id); // Викликаємо функцію з передачею ID пісні
      }} // Додаємо обробник кліку
          className="text-white"
          style={{
            fontFamily: "Noto Sans",
            fontWeight: "700",
            fontSize: "24px",
            lineHeight: "normal",
            textAlign: "left",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "4px",
            width: "754px",
          }}
        >
          {song.title}
        </div>

        <div
          className="text-gray-400"
          style={{
            fontFamily: "Noto Sans",
            fontWeight: "400",
            fontSize: "16px",
            lineHeight: "normal",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.artists.join(", ")}
        </div>
      </div>

      {/* Add + button */}
      <div
        className="flex items-center justify-center"
        style={{
          width: "25px",
          height: "25px",
          cursor: "pointer",
        }}
      >
        <img src="/images/AddCircle.svg" alt="Add" />
      </div>

      {/* Duration */}
      <div
        className="ml-auto"
        style={{
          fontFamily: "Noto Sans",
          fontWeight: "400",
          fontSize: "16px",
          lineHeight: "normal",
          marginLeft: "5px",
          whiteSpace: "nowrap", 
          overflow: "hidden",   
          textOverflow: "ellipsis", 
          width: "auto",       
          minWidth: "33px",     
          color: "var(--Gray, #B3B3B3)",  
        }}
      >
        {formatDuration(song.duration)}
      </div>

      {/* Container for the three dots */}
      <div
        className="relative ml-2 flex gap-1"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
         
          handleSongMenuClick(song, e);
        }}
      >
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            style={{
              width: '4px', // Size of the dot
              height: '4px',
              background: 'url("/images/Container.svg") no-repeat center center',
              backgroundSize: 'cover',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Only show the menu for the selected song */}
      {isMenuOpen && selectedSong?.id === song.id && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            backgroundColor: '#010326',
            borderRadius: '10px',
            padding: '10px',
            zIndex: 10,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              cursor: 'pointer',
              color: '#FFF',
              fontFamily: 'Noto Sans',
              fontSize: '16px',
              fontWeight: 400,
            }}
          >
            <span>Додати до плейлиста :</span>
            <div>
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => handleAddSongToPlaylist(playlist.id)} // Додати пісню до плейлиста
                    className="cursor-pointer text-white font-NotoSans text-[14px] py-[15px] transition-all duration-300 hover:bg-[rgba(186,214,235,0.20)] hover:text-black"
                    style={{
                      padding: '15px',
                      cursor: 'pointer',
                      color: '#FFF',
                      fontFamily: 'Noto Sans',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      borderBottom: index !== playlists.length - 1 ? '1px solid #FFF' : 'none', // Додаємо лінію, крім останнього елемента
                    }}
                  >
                    
                    {playlist.name}
                  </div>
                ))
              ) : (
                <div>
                  {/* Show the input field for creating a new playlist */}
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)} // Update playlist name
                    placeholder="Введіть назву плейлиста"
                    style={{
                      padding: '5px',
                      marginBottom: '10px',
                      color: '#FFF',
                      fontFamily: 'Noto Sans',
                      fontSize: '14px',
                      backgroundColor: '#333',
                      borderRadius: '5px',
                      width: '100%',
                    }}
                  />
                  <div
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCreatePlaylist(e)}
                    style={{
                      padding: '5px',
                      cursor: 'pointer',
                      color: '#FFF',
                      fontFamily: 'Noto Sans',
                      fontSize: '14px',
                      backgroundColor: '#333',
                      borderRadius: '5px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    Створити новий плейлист
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    
  ))}

  
  
</div>

     {/* Footer container */}
  <div style={{ marginLeft: "5px", marginTop: "25px", color: "#B3B3B3", fontSize: "14px", lineHeight: "1.5" }}>
    <div>18 квітня {album.year} р.</div>
    <div>© {album.year} {album.artistName}</div>
    <div>℗ {album.year} {album.artistName}</div>
  </div>

   {/* Spacer after music container */}
<div 
  style={{ 
    marginTop: "64px", 
    
    color: "#FFF", 
    fontFamily: "Noto Sans", 
    fontSize: "32px", 
    fontWeight: "700" 
  }}
>
  Рекомендуємо
</div>

{/* Контейнер для артистів */}
<div 
  style={{ 
    marginTop: "24px", 
     
    display: "flex", 
    gap: "32px", 
    flexWrap: "wrap", 
    justifyContent: "flex-start",
    width: "1100px",   
  
  }}
>
  {relatedArtists.slice(0, 5).map((artist, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        flexDirection: "column", 
        padding: "16px",
        alignItems: "center",
        gap: "10px",
        borderRadius: "10px",
        background: "rgba(186, 214, 235, 0.20)",
        flex: "1 0 182px",  
        maxWidth: "182px",  
        flexShrink: 0,     
        boxSizing: "border-box", 
      }}
    >
      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "150px",
          background: artist.photoUrl
            ? `url(${artist.photoUrl}) lightgray 50% / cover no-repeat` 
            : "lightgray", 
        }}
      ></div>
      <div
        style={{
          marginTop: "4px", 
          textAlign: "center",
          fontFamily: "Noto Sans",
          fontWeight: 700,
          fontSize: "14px",
          color: "#fff",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap", 
        }}
      >
        {artist.name || 'Без ім’я'} {/* Відображаємо ім’я артиста */}
      </div>
    </div>
  ))}
</div>
</div>
</div>





      

      {/* Related albums */}
<div className="w-[250px] flex flex-col items-center" style={{ marginLeft: "100px" }}>
  <h2
    className="text-white text-center text-[32px] font-bold mb-6 mt-22"
    style={{
      marginTop: "58px",
      fontFamily: "Noto Sans",
      fontStyle: "normal",
      lineHeight: "normal",
      alignSelf: "stretch",
      marginBottom: "24px",
    }}
  >
    Альбоми
  </h2>

  <div className="flex flex-col gap-6 pb-6">
    {relatedAlbums.length > 0 ? (
      relatedAlbums.map((relatedAlbum: RelatedAlbumData) => (
        <div
          key={relatedAlbum.id}
          className="flex flex-col items-center p-4 rounded-[10px] bg-[rgba(186,214,235,0.20)] transition hover:bg-[rgba(186,214,235,0.30)]"
          style={{ width: "189px", height: "253px", marginBottom: "24px" }}
          onClick={() => {
            
            if (audio instanceof HTMLAudioElement) {
              audio.pause();
              setIsPlaying(false);
            }
            navigate(`/albums/${relatedAlbum.id}`);
          }}
        >
          <img
            src={relatedAlbum.coverUrl}
            alt={relatedAlbum.title}
            className="w-[150px] h-[150px] object-cover rounded-md mb-1"
          />
          <div
            className="text-white text-left overflow-hidden"
            style={{
              fontFamily: "Noto Sans, sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "24px",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textTransform: "uppercase", 
              width: "151px", 
              wordBreak: "break-word", 
              hyphens: "auto", 
            }}
          >
            {relatedAlbum.title}
          </div>

          {/* Відступ 4px вниз для тексту і рік альбома */}
          <div className="mt-4 text-white text-left flex items-center gap-4" style={{ marginTop: "7px", marginRight: "25px" }}>
            {relatedAlbum && relatedAlbum.year ? (
              <span
                style={{
                  fontFamily: "Noto Sans, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "16px",
                }}
              >
                {String(relatedAlbum.year)} {/* Перетворюємо число в рядок */}
              </span>
            ) : (
              <span>Немає року</span> 
            )}

            <img src="/images/Ellipses.svg" alt="ellipse" className="w-2 h-2" />

            <span
              style={{
                fontFamily: "Noto Sans, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "16px",
              }}
            > 
              Альбом
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className="text-white">Немає альбомів для цього артиста</div>
    )}

    {/* Кнопка "Показати всі" */}
    <div
      className="mt-6 flex justify-center items-center gap-10"
      style={{
        color: "#B3B3B3", 
        textAlign: "center",
        fontFamily: "Noto Sans",
        fontSize: "16px",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "normal",
        marginTop: "2px", 
      }}
    >
      <span
        onClick={() => navigate(`/artist/${album?.artistId}/albums`)} 
        style={{ cursor: "pointer" }}
      >
        Показати всі
      </span>
    </div>
  </div>
</div>



    </div>
  );
};

export default AlbumDetails; 
