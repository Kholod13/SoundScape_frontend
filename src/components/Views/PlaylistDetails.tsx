import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface SongData {
  id: number;
  title: string;
  duration: string; // Формат "MM:SS"
  filePath: string;
  artists: {
    $values: string[];
  };
  albumTitle: string;
  albumYear: string;
  coverUrl: string;
  albumCoverUrl?: string;  // Відображає обкладинку альбому, якщо є
  coverImageUrl?: string;  // Для обкладинок пісень
}

interface PlaylistData {
  id: number;
  name: string;
  songIds: {
    $values: number[];
  };
}

interface RelatedArtistData {
  id: number;
  name: string;
  photoUrl: string | null; 
}

interface RelatedAlbumData {
  id: number;
  title: string;
  coverUrl: string | null;
  year: string | null;
}

// Функція для обчислення загальної тривалості всіх пісень
const formatDurationToSeconds = (duration: string): number => {
  const timeParts = duration.split(":").map(Number);

  if (timeParts.length === 2) {
    timeParts.unshift(0); // Додаємо 0 годин, якщо їх немає
  }

  const [hours, minutes, seconds] = timeParts;
  return (hours * 3600) + (minutes * 60) + seconds;
};

// Функція для обчислення загальної тривалості пісень
const calculateTotalDuration = (songs: SongData[]): number => {
  return songs.reduce((total: number, song: SongData) => {
    return total + formatDurationToSeconds(song.duration); 
  }, 0);
};

// Функція для форматування тривалості в часи і хвилини
const formatTotalDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  // Якщо години дорівнюють 0, не відображаємо їх
  return `${hours > 0 ? `${hours} год ` : ""}${minutes} хв`;
};

const PlaylistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [songs, setSongs] = useState<SongData[]>([]);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false); // Состояние для отслеживания (плей или пауза)
  const [relatedArtists, setRelatedArtists] = useState<RelatedArtistData[]>([]); // Используем RelatedArtistData
  const [relatedAlbums, setRelatedAlbums] = useState<RelatedAlbumData[]>([]);
  const [artistId, setArtistId] = useState<string>('');
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Стартуємо з першої пісні
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Стан для аудіо елементу
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0); // Для збереження поточного часу

 




  const togglePlayPause = (index: number) => {
    if (currentSongIndex === index && audio) {
      // Якщо та сама пісня
      if (isPlaying) {
        // Зберігаємо поточний час при паузі
        setCurrentTime(audio.currentTime);
        audio.pause();
        setIsPlaying(false);
      } else {
        // Відновлюємо пісню з того ж місця
        audio.currentTime = currentTime; // Відновлюємо поточний час
        audio.play();
        setIsPlaying(true);
      }
    } else {
      // Якщо вибрана інша пісня
      if (audio) {
        // Зупиняємо поточну пісню
        audio.pause();
      }
  
      // Створюємо новий аудіо об'єкт для нової пісні
      const newAudio = new Audio(songs[index].filePath);
      setAudio(newAudio);
      setCurrentSongIndex(index);
      setIsPlaying(true);
  
      // Якщо ми повертаємось до попередньої пісні, встановлюємо currentTime на 0
      newAudio.currentTime = 0;
      newAudio.play();
  
      // Встановлюємо поточний час в 0 для нової пісні
      setCurrentTime(0);
  
      // Коли пісня закінчиться, переходимо до наступної
      newAudio.onended = () => {
        const nextSongIndex = (index + 1) % songs.length;
        setCurrentSongIndex(nextSongIndex);
        setAudio(new Audio(songs[nextSongIndex].filePath));
        setCurrentTime(0); // Якщо хочеш, щоб пісня відновлювалась з початку
      };
    }
  };
  
  
  
  
  
  


    const handleSongSelect = (index: number) => {
      const selectedSong = songs[index];
      const newAudio = new Audio(selectedSong.filePath);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
      setCurrentSongIndex(index);
    };

    const playAllSongs = () => {
      if (songs.length === 0) return; // Якщо немає пісень, нічого не робимо
    
      // Якщо вже грає пісня, ставимо її на паузу
      if (isPlaying && audio) {
        setCurrentTime(audio.currentTime); // Зберігаємо поточний час
        audio.pause();
        setIsPlaying(false);
      } else {
        // Якщо пісня не грає, запускаємо першу пісню
        const newAudio = new Audio(songs[currentSongIndex].filePath);
        setAudio(newAudio);
        newAudio.currentTime = currentTime; // Відновлюємо поточний час
        newAudio.play();
        setIsPlaying(true);
    
        // Після завершення поточної пісні переходимо до наступної
        newAudio.onended = () => {
          const nextSongIndex = (currentSongIndex + 1) % songs.length; // Зациклюємо плейлист
          setCurrentSongIndex(nextSongIndex);
    
          // Створюємо новий аудіо об'єкт для наступної пісні і відтворюємо її
          const nextAudio = new Audio(songs[nextSongIndex].filePath);
          setAudio(nextAudio);
          nextAudio.play();
        };
      }
    };
    
    
    
    
  

  const playNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length); // Перемикаємось на наступну пісню, якщо досягли кінця — повертаємось на початок
  };


  useEffect(() => {
    axios.get(`http://localhost:5253/api/playlists/${id}`).then((response) => {
      const playlistData = response.data;
      setPlaylist(playlistData);

      const songIds = playlistData.songIds?.$values || [];
      if (songIds.length > 0) {
        Promise.all(
          songIds.map((songId: number) =>
            axios.get(`http://localhost:5253/api/songs/${songId}`).then((res) => res.data)
          )
        )
        .then((songsData) => {
          setSongs(songsData);

          // Устанавливаем ID первого артиста (если есть)
          if (songsData.length > 0 && songsData[0].artists.$values.length > 0) {
            setArtistId(songsData[0].artists.$values[0]); 
          }
        })
        .catch((err) => console.error("Ошибка при загрузке песен:", err));
      }
    });
  }, [id]);

  useEffect(() => {
    console.log("ID артиста:", artistId); // Проверяем, получен ли artistId
    if (!artistId) return;
  
    axios.get(`http://localhost:5253/api/artist/${artistId}/albums`)
      .then((response) => {
        console.log("Полученные альбомы:", response.data); // Для проверки данных
        const albums = response.data?.$values?.map((album: any) => ({
          id: album.id,
          title: album.title || "Без названия",
          coverUrl: album.coverUrl?.startsWith("http")
            ? album.coverUrl
            : `http://localhost:5253${album.coverUrl?.replace(/^\/+/g, "")}`, // Убедитесь, что путь правильный
          year: album.year || "Нет года",
        })) || [];
  
        setRelatedAlbums(albums);
      })
      .catch((error) => {
        console.error("Ошибка при получении альбомов:", error.response || error);
        setRelatedAlbums([]); // Можно сбросить альбомы, если произошла ошибка
      });
  }, [artistId]);
  
  
  
  
  


  useEffect(() => {
    const fetchRelatedArtists = async () => {
      try {
        const response = await fetch('http://localhost:5253/api/artist');
        if (!response.ok) throw new Error('Артисты не найдены');
        
        const data = await response.json();

        const artists: RelatedArtistData[] = data.$values.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          photoUrl: null, 
        }));

        setRelatedArtists(artists); 
      } catch (error) {
        console.error('Ошибка при получении артистов:', error);
      }
    };

    fetchRelatedArtists();
  }, []); 


  useEffect(() => {
    if (songs.length > 0 && isPlaying && audio) {
      audio.play();
      audio.onended = playNextSong; // Коли пісня закінчиться, переходимо до наступної
    }
  }, [isPlaying, currentSongIndex, songs, audio]);


    const handleAlbumClick = (albumId: number) => {
      navigate(`/albums/${albumId}`);
    };
    
    
    const handleShowAllClick = () => {
      navigate(`/artist/${artistId}/albums`);
    };

  // Функція для обчислення шляху до обкладинки
  const formatCoverUrl = (coverImagePath: string | undefined): string | null => {
    if (!coverImagePath) {
      return null; // Повертаємо null, якщо немає шляху до зображення
    }
  
    return coverImagePath.replace("C:\\Users\\roman\\Source\\Repos\\SoundScape7\\wwwroot\\coverImages\\", "http://localhost:5253/");
  };

  return (
    <div className="mt-10 px-10 max-w-[1400px] mx-auto flex items-center flex-col">
      {/* Основний контейнер для всього контенту */}
      <div className="flex w-full items-center justify-between">
        <div className="flex-shrink-0">
          <img src="/images/logo.svg" alt="playlist icon" className="w-[250px] h-[250px]" />
        </div>
  
        <div className="ml-8 flex flex-col w-full">
          <span className="text-gray-400 text-sm mb-1">Плейлист</span>
          <h1 className="text-white font-bold text-2xl mb-6">{playlist?.name}</h1>
          <div className="flex items-center bg-[rgba(186,214,235,0.20)] p-2 max-w-[380px] max-h-[44px] rounded-sm border-l-4 border-[rgba(186,214,235,0.65)]">
            <div className="w-10 h-10 rounded-full bg-lightgray bg-cover bg-center"></div>
            <div className="flex items-center gap-2 ml-3 text-gray-300">
              <span>Nickname</span>
              <img src="/images/Ellipses.svg" alt="ellipse" className="w-1 h-1" />
              <span>2024</span>
              <img src="/images/Ellipses.svg" alt="ellipse" className="w-1 h-1" />
              <span>
                {songs.length}{" "}
                {songs.length === 1 ? "пісня" : songs.length > 1 && songs.length < 5 ? "пісні" : "пісень"}
              </span>
              <span>{formatTotalDuration(calculateTotalDuration(songs))}</span>
            </div>
          </div>
  
          <div className="mt-6 flex items-center">
          <button onClick={playAllSongs} className="play-button">
  <img src={isPlaying ? "/images/PauseIcon.svg" : "/images/PlayIcon.svg"} alt={isPlaying ? "Pause" : "Play"} />
</button>

            <img src="/images/AddCircle.svg" alt="Add" className="w-[24px] h-[24px] mx-4 cursor-pointer" />
            <img src="/images/Ellipses.svg" alt="Ellipses" className="w-1 h-1 mx-0.5" />
            <img src="/images/Ellipses.svg" alt="Ellipses" className="w-1 h-1 mx-0.5" />
            <img src="/images/Ellipses.svg" alt="Ellipses" className="w-1 h-1 mx-0.5" />
          </div>
        </div>
      </div>
  
      <div className="mt-10"></div>
  
      <div className="space-y-4 w-full">
  {songs.map((song, index) => (
    <div
      key={song.id}
      className="flex items-center gap-4 p-4 rounded-lg"
      style={{
        background: "rgba(45, 1, 64, 0.20)",  // фон для контейнера
        borderRadius: "20px",
        opacity: 0.66,
      }}
      onMouseEnter={() => setHoveredIndex(index)}  // показуємо плей, коли курсор над піснею
      onMouseLeave={() => setHoveredIndex(null)}  // приховуємо плей, коли курсор покидає пісню
    >
      <button
        onClick={() => togglePlayPause(index)} // передаємо index
        className="flex items-center justify-center bg-transparent border-none cursor-pointer"
      >
        <img
          src="/images/PlayIcon.svg"
          alt="Play"
          className={`w-[44px] h-[44px] ${currentSongIndex === index && isPlaying ? 'hidden' : ''} ${hoveredIndex === index ? 'block' : 'hidden'}`}  // Плей кнопка видима тільки при наведенні
        />
      </button>
      
            <div className="text-white text-2xl font-bold mr-5">{index + 1}</div>
            <div className="flex items-center gap-4 w-full">
              {/* Використовуємо albumCoverUrl, якщо воно є, інакше використовуємо coverImageUrl */}
              <img
                src={song.albumCoverUrl ? song.albumCoverUrl : formatCoverUrl(song.coverImageUrl) || undefined} // Якщо src є null, не буде додано атрибут src
                alt={song.title}
                className="w-[150px] h-[150px] rounded-lg"
              />
              <div className="flex flex-col items-start">
              <span className="text-white text-xl font-bold ml-5" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {song.title}
  </span>
  <span className="text-sm text-gray-400 ml-5 mt-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {song.artists.$values.join(", ")}
  </span>
              </div>

              
              <div className="ml-[600px] flex items-center gap-4 justify-center w-full">
                {/* Плюсик замінений на таймер */}
                <img src="/images/AddCircle.svg" alt="Add" className="w-[34px] h-[34px] mx-4 cursor-pointer" />
                {/* Таймер */}
  <div
    className="mr-3 text-white"
    style={{
      color: '#FFF',
      textAlign: 'center',
      fontFamily: '"Noto Sans"',
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: 'normal',
    }}
  >
    {song.duration}
  </div>
                {/* Три крапки */}
                <div className="flex items-center gap-1">
                  <img src="/images/Container.svg" alt="Container" className="w-[5px] h-[5px]" />
                  <img src="/images/Container.svg" alt="Container" className="w-[5px] h-[5px]" />
                  <img src="/images/Container.svg" alt="Container" className="w-[5px] h-[5px]" />
                </div>
              </div>
            </div>
          </div>

          
        ))}

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
    width: "calc(100% - 88px)",   // Враховуємо відступи для країв
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
        marginRight: i === relatedArtists.length - 1 ? "40px" : "0", // відступ для останнього елемента
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
        {artist.name || 'Без ім’я'} 
      </div>
    </div>

    
  ))}
</div>

   
</div>

 
</div>


      
  );
};

export default PlaylistDetails;
