import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Song {
  id: number;
  title: string;
  duration: string;
  albumTitle: string;
  artists: { $id: string; $values: string[] };  
  year: number;
  coverUrl: string;
  albumYear?: number;
  albumCoverUrl?: string;
  filePath?: string;
  lyrics?: string;  
}

interface Album {
  coverUrl: string;
  title: string;
  artistName: string;
  year: number;
}

interface RelatedAlbumData {
  id: number;
  coverUrl: string;
  title: string;
  year: number;
}

interface RelatedArtistData {
  id: number;
  name: string;
  photoUrl: string | null; 
}


interface RelatedSongData {
  id: number;
  title: string;
  duration: string;
  albumTitle: string;
  albumCoverUrl: string;
  albumYear: number;
  artists: { $id: string; $values: string[] };  
}

const SongDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [relatedSongs, setRelatedSongs] = useState<RelatedSongData[]>([]);
  const [relatedAlbums, setRelatedAlbums] = useState<RelatedAlbumData[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [artistId, setArtistId] = useState<string>('');
  const [relatedArtists, setRelatedArtists] = useState<RelatedArtistData[]>([]);


  useEffect(() => {
    const fetchSongAndAlbum = async () => {
      try {
        const songResponse = await fetch(`http://localhost:5253/api/songs/${id}`);
        if (!songResponse.ok) throw new Error("Song not found");
        const songData = await songResponse.json();

        const albumResponse = await fetch(`http://localhost:5253/api/albums/${songData.albumId}`);
        if (!albumResponse.ok) throw new Error("Album not found");
        const albumData = await albumResponse.json();

        const coverImageUrl = albumData.coverUrl?.startsWith("http")
          ? albumData.coverUrl
          : `http://localhost:5253/${albumData.coverUrl.replace(/^\/+/g, "")}`;

        setAlbum({
          coverUrl: coverImageUrl || "https://via.placeholder.com/150",
          title: albumData.title,
          artistName: albumData.albumArtists?.$values?.[0]?.artist?.name || "Unknown Artist",
          year: albumData.year,
        });

        setArtistId(albumData.albumArtists?.$values?.[0]?.artist?.id || '');

        setSong({
          id: songData.id,
          title: songData.title,
          duration: songData.duration,
          filePath: songData.filePath?.startsWith("http")
            ? songData.filePath
            : `http://localhost:5253/${songData.filePath?.replace(/^\/+/g, "")}`,
          albumTitle: albumData.title,
          artists: songData.artists || { $id: "", $values: [] },
          year: songData.year,
          coverUrl: songData.coverUrl,
          lyrics: songData.lyrics || '', 
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setSong(null);
        setAlbum(null);
      }
    };

    fetchSongAndAlbum();
  }, [id]);

  useEffect(() => {
    const fetchRelatedAlbums = async () => {
      try {
        const response = await fetch(`http://localhost:5253/api/artist/${artistId}/albums`);
        if (!response.ok) throw new Error("Related albums not found");

        const data = await response.json();
        const albums = data?.$values?.map((album: any) => ({
          id: album.id,
          title: album.title || 'Без назви',
          coverUrl: album.coverUrl?.startsWith("http")
            ? album.coverUrl
            : `http://localhost:5253/${album.coverUrl?.replace(/^\/+/g, "")}`,
          year: album.year || 'Немає року',
        })) || [];

        setRelatedAlbums(albums);
      } catch (error) {
        console.error("Error fetching related albums:", error);
        setRelatedAlbums([]);
      }
    };

    if (artistId) fetchRelatedAlbums();
  }, [artistId]);

  useEffect(() => {
    const fetchRelatedSongs = async () => {
      if (!artistId) return;

      try {
        const response = await fetch(`http://localhost:5253/api/artist/${artistId}/songs`);
        if (!response.ok) throw new Error("Related songs not found");

        const data = await response.json();
        const songs = data?.$values?.map((song: any) => ({
          id: song.id,
          title: song.title || 'Без назви',
          duration: song.duration || '00:00',
          albumTitle: song.albumTitle || 'Без альбому',
          albumCoverUrl: song.albumCoverUrl?.startsWith("http")
            ? song.albumCoverUrl
            : `http://localhost:5253/${song.albumCoverUrl?.replace(/^\/+/g, "")}`,
            albumYear: song.albumYear || null,
            artists: song.artists?.$values || [], 
        })) || [];

        setRelatedSongs(songs);
      } catch (error) {
        console.error("Error fetching related songs:", error);
        setRelatedSongs([]);
      }
    };

    fetchRelatedSongs();
  }, [artistId]);

  const handleBackButtonClick = () => {
    audioRef.current?.pause();
    navigate(-1);
  };

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
  
  const formatDuration = (duration: string) => {
    // Розділяємо на години, хвилини і секунди
    const timeParts = duration.split(':').map(Number);
  
    // Якщо у нас є лише хвилини і секунди, додаємо 0 годин
    if (timeParts.length === 2) {
      timeParts.unshift(0); // Додаємо 0 на початок
    }
  
    // Округлюємо значення і форматуємо результат
    const [hours, minutes, seconds] = timeParts;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  

  const togglePlayPause = (event: React.MouseEvent) => {
    event.preventDefault();
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(console.error);
      setIsPlaying(!isPlaying);
    }
  };

  
  const handleAlbumClick = (albumId: number) => {
    navigate(`/albums/${albumId}`);
  };
  

  
  const handleShowAllClick = () => {
    navigate(`/artist/${artistId}/albums`);
  };

 

  if (!song || !album) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="mt-10 px-10 max-w-[1400px] mx-auto flex gap-10">
      <div className="flex-1 ml-0">
        <div className="mb-6 relative">
          <img
            src="/images/arrowIcon.svg"
            alt="back"
            className="w-12 h-12 cursor-pointer absolute"
            style={{ top: '2px', left: '40px' }}
            onClick={handleBackButtonClick}
          />
        </div>

        {/* Album - Grey Info Block */}
        <div className="w-[1013px] h-[2170px] p-6 rounded-[10px] mb-6">
          <div className="w-[926px] h-[250px] p-6 rounded-[10px] mb-6 relative ml-0">
            <div className="flex gap-6">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-56 h-56 rounded-lg object-cover"
              />
              <div className="ml-8 flex flex-col w-full">
                <span
                  className="text-xl text-gray-400 mb-2"
                  style={{
                    marginTop: "12px",
                    color: "#FFF",
                    fontFamily: "Noto Sans",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "normal",
                  }}
                >
                  Song
                </span>
                <h1 className="text-white font-bold text-2xl mb-4">{song.title}</h1>
                <div className="flex items-center w-full h-[44px] rounded-[10px] bg-[rgba(186,214,235,0.20)] p-2 mb-4">
                  <div className="w-[4px] h-[44px] bg-[rgba(186,214,235,0.65)]"></div>
                  <div
                    className="w-10 h-10 rounded-full bg-lightgray bg-cover bg-center"
                    style={{ backgroundImage: `url("/images/default-avatar.png")` }}
                  ></div>
                  <div className="flex items-center gap-2 ml-2 w-full">
                    <span
                      className="text-lg"
                      style={{
                        color: "var(--Gray, #B3B3B3)",
                        textAlign: "center",
                        fontFamily: "Noto Sans",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "normal",
                      }}
                    >
                      {album.artistName}
                    </span>
                    <img
                      src="/images/Ellipses.svg"
                      alt="ellipses"
                      className="w-[6px] h-[6px] mx-[2px]"
                    />
                    <span
                      className="text-lg truncate"
                      style={{
                        maxWidth: '280px',
                        color: "var(--Gray, #B3B3B3)",
                        textAlign: "center",
                        fontFamily: "Noto Sans",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "normal",
                      }}
                      title={album.title}
                    >
                      {album.title}
                    </span>
                    <img
                      src="/images/Ellipses.svg"
                      alt="ellipses"
                      className="w-[6px] h-[6px] mx-[2px]"
                    />
                    <span
                      className="text-lg"
                      style={{
                        color: "var(--Gray, #B3B3B3)",
                        textAlign: "center",
                        fontFamily: "Noto Sans",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "normal",
                      }}
                    >
                      {album.year}
                    </span>
                    <img
                      src="/images/Ellipses.svg"
                      alt="ellipses"
                      className="w-[6px] h-[6px] mx-[2px]"
                    />
                    <span
                      className="text-lg"
                      style={{
                        color: "var(--Gray, #B3B3B3)",
                        textAlign: "center",
                        fontFamily: "Noto Sans",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "normal",
                      }}
                    >
                      {formatDuration(song.duration)}
                    </span>
                  </div>

                  
                </div>
                

                <div className="flex gap-4 mb-1">
                  <button className="px-1 py-2 rounded-[10px] flex items-center justify-center">
                    <img
                      src={isPlaying ? "/images/PauseIcon.svg" : "/images/PlayIcon.svg"}
                      alt={isPlaying ? "Pause" : "Play"}
                      className="w-11 h-11"
                      onClick={(event) => togglePlayPause(event)}
                    />
                  </button>
                  <button className="px-1 py-2 rounded-[10px] flex items-center justify-center">
                    <img
                      src="/images/AddCircle.svg"
                      alt="Add"
                      className="w-6 h-6"
                    />
                  </button>
                  <button className="px-1 py-2 rounded-[5px] flex items-center justify-center">
                    <div className="flex gap-1">
                      <img
                        src="/images/Container.svg"
                        alt="Container"
                        className="w-1 h-1"
                      />
                      <img
                        src="/images/Container.svg"
                        alt="Container"
                        className="w-1 h-1"
                      />
                      <img
                        src="/images/Container.svg"
                        alt="Container"
                        className="w-1 h-1"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="lyrics-container mt-6">

              
  
  <p
    className="lyrics-text"
    style={{
      color: "var(--Gray, #B3B3B3)",
      fontFamily: "Noto Sans",
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "36px", 
    }}
  >
    {song?.lyrics || 'Поки що нема слів'}
  </p>

  
</div>

{/* Related albums */}
<div className="w-[250px] flex flex-col items-start" style={{ marginTop: "24px"}} >
  <div className="flex justify-between items-center w-full" style={{ marginBottom: "24px" }}>
    <h2
      className="text-white text-left text-[32px] font-bold"
      style={{
        fontFamily: "Noto Sans",
        fontStyle: "normal",
        lineHeight: "normal",
        alignSelf: "stretch",
        marginBottom: "0", 
      }}
    >
      Альбоми
    </h2>

    {/* Кнопка "Показати всі" справа */}
    <div
      className="text-white" 
      onClick={handleShowAllClick}
      style={{
        color: "#B3B3B3",
        fontFamily: "Noto Sans",
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "normal",
        marginLeft: "780px", 
        whiteSpace: "nowrap", 
        cursor: "pointer", 
      }}
    >
      Показати всі
    </div>
  </div>

  {/* Flex контейнер для горизонтального расположения альбомов */}
  <div className="flex gap-6 overflow-x-auto pb-6">
    {relatedAlbums.length > 0 ? (
      
      relatedAlbums.slice(0, 5).map((relatedAlbum: RelatedAlbumData) => (
        <div
          key={relatedAlbum.id}
          onClick={() => handleAlbumClick(relatedAlbum.id)} 
          className="flex flex-col items-center p-4 rounded-[10px] bg-[rgba(186,214,235,0.20)] transition hover:bg-[rgba(186,214,235,0.30)]"
          style={{ width: "189px", height: "253px" }}
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
                {String(relatedAlbum.year)} 
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

    
  </div>

  
</div>



          </div>


       
        </div>

        {/* Spacer after music container */}
<div 
  style={{ 
    marginTop: "64px", 
    marginLeft: "44px", 
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
    marginLeft: "44px", 
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
        {artist.name || 'Без ім’я'} 
      </div>
    </div>
  ))}
</div>




        

        {/* Audio player */}
        <audio ref={audioRef} src={song?.filePath} />

      </div>

      <div className="w-[250px] flex flex-col items-center"style={{
      marginTop: "65px",
    }} >
  {/* Заголовок для популярних треків */}
  <div
    className="text-gray-500 text-center"
    style={{
      color: "var(--Gray, #B3B3B3)",
      textAlign: "center",
      fontFamily: "Noto Sans",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
      marginBottom: "1px",
    }}
  >
    Популярні треки
  </div>

  {/* Заголовок для альбому артиста */}
  <h2
    className="text-white text-center text-[32px] font-bold mb-6 mt-22"
    style={{
      marginTop: "8px",
      fontFamily: "Noto Sans",
      fontStyle: "normal",
      lineHeight: "normal",
      alignSelf: "stretch",
      marginBottom: "24px",
    }}
  >
    {album?.artistName || 'Без назви'}
  </h2>

  
  {/* Блоки альбомов, всего 5 блоков */}
<div className="flex flex-col gap-6 pb-6">
  {relatedSongs.length > 0 ? (
    relatedSongs.slice(0, 5).map((song) => (
      <div
        key={song.id}
        onClick={() => navigate(`/songs/${song.id}`)}
        className="flex flex-col items-center p-4 rounded-[10px] bg-[rgba(186,214,235,0.20)] transition hover:bg-[rgba(186,214,235,0.30)] cursor-pointer"
        style={{ width: "189px", height: "253px", marginBottom: "24px" }}
      >
        <img
          src={song.albumCoverUrl || '/images/default-cover.jpg'}
          alt={song.albumTitle || 'Без альбому'}
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
            marginTop: "8px" 
          }}
        >
          {song.title || 'Без назви'}
        </div>
        <div className="mt-4 text-white text-left flex items-center gap-1.25">
          {song.albumYear ? (
            <span
              style={{
                
                color: "var(--Gray, #B3B3B3)",
                fontFamily: "Noto Sans",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: 300,
                lineHeight: "normal",
                marginBottom: "6px" 
                
                
                
              }}
            >
              {String(song.albumYear)}
            </span>
          ) : (
            <span>Немає року</span>
          )}
          <img src="/images/Ellipses.svg" alt="ellipse" className="w-1 h-1"style={{  marginBottom: "6px" }}   
                 />
          <span
            title={song.albumTitle || 'Без альбому'} 
            style={{
              color: "var(--Gray, #B3B3B3)",
              fontFamily: "Noto Sans",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "normal",
              maxWidth: "100px", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              marginBottom: "6px" 
                
              
            }}
          >
            {song.albumTitle || 'Без альбому'}
          </span>
        </div>
      </div>
    ))
  ) : (
    <p>Нет альбомов для этого исполнителя</p>
  )}
</div>

</div>
</div>
    

  
   

  


  );
};

export default SongDetails;
