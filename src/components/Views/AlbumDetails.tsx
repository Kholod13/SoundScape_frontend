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
  url: string; // Додаємо поле для URL
}

interface RelatedAlbumData {
  id: number;
  title: string;
  coverUrl: string;
}

const AlbumDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [relatedAlbums, setRelatedAlbums] = useState<RelatedAlbumData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0); // Для зберігання загального часу в секундах
  const [audio] = useState(new Audio()); // Додаємо об'єкт аудіо
  const [currentSong, setCurrentSong] = useState<SongData | null>(null); // Поточна пісня для програвання

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch(`http://localhost:5253/api/albums/${id}`);
        if (!response.ok) {
          throw new Error("Album not found");
        }

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
          albumDuration: "1:30:45", // Загальний час альбому буде вирахуватись з треків
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
        if (!response.ok) {
          throw new Error("Related albums not found");
        }

        const data = await response.json();
        setRelatedAlbums(
          data["$values"].map((album: any) => ({
            id: album.id,
            title: album.title,
            coverUrl: album.coverUrl.startsWith("http")
              ? album.coverUrl
              : `http://localhost:5253${album.coverUrl}`,
          })).slice(0, 5)
        );
      } catch (error) {
        console.error("Error fetching related albums:", error);
      }
    };
 
    const fetchSongs = async (albumId: number) => {
      try {
        const response = await fetch(`http://localhost:5253/api/albums/${albumId}/songs`);
        if (!response.ok) {
          throw new Error("Songs not found");
        }

        const data = await response.json();
        const parsedSongs: SongData[] = data.$values.map((song: any) => ({
          id: song.id,
          title: song.title,
          duration: song.duration,
          artists: song.artists ? song.artists.$values : ["Unknown Artist"],
          url: song.url, // URL пісні
        }));

        setSongs(parsedSongs);

        // Підрахунок загальної тривалості всіх треків
        const totalSeconds = parsedSongs.reduce((total, song) => {
          return total + convertDurationToSeconds(song.duration);
        }, 0);

        setTotalDuration(totalSeconds); // Встановлюємо загальний час альбому в секундах
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchAlbum();
  }, [id]);

  // Функція для перетворення тривалості у секунди
  const convertDurationToSeconds = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  // Функція для форматування тривалості пісні
  const formatDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map(Number);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  // Функція для програвання або паузи пісні
  const togglePlayPause = (song: SongData) => {
    if (isPlaying && currentSong?.id === song.id) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setCurrentSong(song);
      audio.src = song.url; // Встановлюємо URL пісні
      audio.play();
      setIsPlaying(true);
    }
  };
  
  // Додати подію для автоматичного перемикання на наступну пісню
  useEffect(() => {
    audio.addEventListener("ended", () => {
      const nextSongIndex = songs.findIndex(s => s.id === currentSong?.id) + 1;
      if (nextSongIndex < songs.length) {
        setCurrentSong(songs[nextSongIndex]);
        audio.src = songs[nextSongIndex].url;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    });
  
    return () => {
      audio.removeEventListener("ended", () => {}); // Очищуємо слухач при розмонтажі
    };
  }, [currentSong, audio, songs]);
  

  if (loading) {
    return <div className="text-white text-center text-2xl mt-10">Loading...</div>;
  }

  if (!album) {
    return (
      <div className="text-white text-center text-2xl mt-10">
        <h1>Альбом не знайдено</h1>
      </div>
    );
  }

  return (
    <div className="mt-10 px-10 max-w-[1400px] mx-auto flex gap-10">
      <div className="flex-1 ml-0">
        <div className="mb-6">
          <img
            src="/images/arrowIcon.svg"
            alt="back"
            className="w-12 h-12 cursor-pointer"
            onClick={() => navigate(-1)}
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
                <h1 className="text-white text-3xl font-bold mb-4">{album.title}</h1>

                <div className="flex items-center w-full h-[44px] rounded-[10px] bg-[rgba(186,214,235,0.20)] p-2 mb-6">
                  <div className="w-[4px] h-[44px] bg-[rgba(186,214,235,0.65)]"></div>
                  <div
                    className="w-10 h-10 rounded-full bg-lightgray bg-cover bg-center"
                    style={{
                      backgroundImage: `url("/images/default-avatar.png")`,
                    }}
                  ></div>
                  <div className="flex items-center gap-2 ml-2 w-full">
                    <span
                      className="text-white"
                      style={{
                        fontFamily: "Noto Sans",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "normal",
                        color: "#B3B3B3", // This applies the gray color to the text
                        textAlign: "center", // Center-aligns the text
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
                        color: "#B3B3B3", // Gray color for year
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
                        color: "#B3B3B3", // Gray color for song count and album duration
                        textAlign: "center",
                      }}
                    >
                      {album.numberOfSongs} пісень, {formatDuration(album.albumDuration)}
                    </span>
                  </div>
                </div>

                {/* New button section under the info bar */}
                <div className="flex gap-4 mb-6">
                  <button className="px-1 py-2 rounded-[10px] hover:bg-blue-600 flex items-center justify-center">
                    <img
                      src={isPlaying ? "/images/PauseIcon.svg" : "/images/PlayIcon.svg"}
                      alt={isPlaying ? "Pause" : "Play"}
                      className="w-11 h-11"
                      onClick={() => togglePlayPause(songs[0])} // Потрібно змінити на пісню, яку хочемо програвати
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
          <div className="flex flex-col gap-6">
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
                  background: "rgba(45, 1, 64, 0.20)", 
                  fontFamily: "Noto Sans",
                  fontSize: "24px",
                  fontWeight: "400",
                  textTransform: "uppercase", 
                }}
              >
                {/* Song number */}
                <div
                  className="text-white"
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    width: "40px",
                    textAlign: "center",
                    marginRight: "16px", 
                  }}
                >
                  {index + 1}
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
                    marginLeft: "10px", 
                  }}
                >
                  <img
                    src="/images/AddCircle.svg"
                    alt="Add"
                  />
                </div>

                 {/* Duration */}
                 <div
                  className="ml-auto text-white"
                  style={{
                    fontFamily: "Noto Sans",
                    fontWeight: "400",
                    fontSize: "16px",
                    lineHeight: "normal",
                  }}
                >
                  {formatDuration(song.duration)}
                </div>


                {/* Space for 3 Container SVGs with gap */}
                <div className="ml-2 flex gap-1">
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      background: "url('/images/Container.svg') no-repeat center center",
                      backgroundSize: "cover",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      background: "url('/images/Container.svg') no-repeat center center",
                      backgroundSize: "cover",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      background: "url('/images/Container.svg') no-repeat center center",
                      backgroundSize: "cover",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related albums */}
      <div className="w-[250px] flex flex-col items-center">
        <h2 className="text-white text-lg font-semibold mb-6 mt-22 text-center">Альбоми</h2>
        <div className="flex flex-col gap-6 pb-6">
          {relatedAlbums.length > 0 ? (
            relatedAlbums.map((relatedAlbum: RelatedAlbumData) => (
              <div
                key={relatedAlbum.id}
                className="flex flex-col items-center p-4 rounded-[10px] bg-[rgba(186,214,235,0.20)] transition hover:bg-[rgba(186,214,235,0.30)]"
                style={{ width: "189px", height: "253px", marginBottom: "24px" }}
                onClick={() => navigate(`/albums/${relatedAlbum.id}`)}
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
                  }}
                >
                  {relatedAlbum.title}
                </div>
              </div>
            ))
          ) : (
            <div className="text-white">Немає альбомів для цього артиста</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetails; 
