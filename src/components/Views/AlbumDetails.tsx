import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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









const AlbumDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [relatedAlbums, setRelatedAlbums] = useState<RelatedAlbumData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const { albumId } = useParams();  
  const [hoveredSongId, setHoveredSongId] = useState<number | null>(null);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);

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
      onClick={() => navigate(`/songs/${song.id}`)} 
    >
      {/* Іконка для відтворення/пауза */}
      <div
            onClick={(event) => togglePlayPause(event, song)} 
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



      {/* Space for 3 Container SVGs with gap */}
      <div className="ml-2 flex gap-1">
        {[1, 2, 3].map((_, idx) => (
          <div
            key={idx}
            style={{
              width: "4px",
              height: "4px",
              background: "url('/images/Container.svg') no-repeat center center",
              backgroundSize: "cover",
            }}
          ></div>
        ))}
      </div>
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
  <div style={{ marginTop: "64px", color: "#FFF", fontFamily: "Noto Sans", fontSize: "32px", fontWeight: "700" }}>
    Рекомендуємо
  </div>

  <div style={{ marginTop: "24px", display: "flex", gap: "24px" }}>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          padding: "16px",
          alignItems: "center",
          gap: "10px",
          borderRadius: "10px",
          background: "rgba(186, 214, 235, 0.20)",
        }}
      >
        <div
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "150px",
            background: "url('/path-to-image.jpg') lightgray 50% / cover no-repeat",
          }}
        ></div>
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
