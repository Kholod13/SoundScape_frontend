import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Artist.css';
import TrackPlayer from '../TrackPlayer/TrackPlayer'; 

interface Album {
  title: string;
  year: string;
  image: string;
}

interface Single {
  title: string;
  year: string;
  image: string;
}

interface Concert {
  id: string;
  name: string;
  date: string;
  url: string;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  filePath: string;
  uploadDate: string;
  imageUrl: string;
}

const Artist = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<{ name: string; imageUrl: string } | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Single[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackEnded, setTrackEnded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { token } = useAuth();
  const audioRef = useRef(new Audio());

  const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;
  const VENUE_ID = "Za98xZG2Z67";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/artists/${id}`);

        if (!response.ok) {
          throw new Error('Artist not found');
        }
        const data = await response.json();
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist:', error);
        setArtist(null);
      }

    };

    const fetchAlbums = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/albums/artist/25`);
        const data = await response.json();
        const albumsArray = data.$values || [];
        if (Array.isArray(albumsArray)) {
          const mappedAlbums: Album[] = albumsArray.map((album: any) => ({
            title: album.title,
            year: album.releaseDate.split('-')[0],
            image: album.imageUrl,
          })).slice(0, 5);
          setAlbums(mappedAlbums);
        } else {
          console.error('Albums data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    const fetchSingles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/artists/25/singles`);
        const data = await response.json();
        const singlesArray = data.$values || [];
        if (Array.isArray(singlesArray)) {
          const mappedSingles: Single[] = singlesArray.map((single: any) => ({
            title: single.title,
            year: single.releaseDate.split('-')[0],
            image: single.imageUrl,
          }));
          setSingles(mappedSingles);
        } else {
          console.error('Singles data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching singles:', error);
      }
    };

    const fetchTracks = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/tracks`);
        const data = await response.json();
        const tracksArray = data.$values || [];
        console.log('Tracks Data:', data);
        if (Array.isArray(tracksArray)) {
          setTracks(tracksArray);
        } else {
          console.error('Tracks data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    const fetchSubscriptions = async () => {
      if (!token) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/api/artists/${id}/isSubscribed`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { isSubscribed } = response.data;
        setIsSubscribed(isSubscribed);
      } catch (error) {
        console.error("Помилка отримання підписок:", error);
      }
    };

    const fetchConcerts = async () => {
      try {
        const response = await axios.get(
          'https://app.ticketmaster.com/discovery/v2/events.json',
          {
            params: {
              venueId: VENUE_ID,
              apikey: API_KEY,
              sort: 'date,asc',
              size: 3,
            },
          }
        );

        //console.log('Concerts response:', response.data);

        const events = response.data._embedded?.events || [];
        const mappedConcerts = events.map((event: any) => ({
          id: event.id,
          name: event.name,
          date: event.dates.start.localDate,
          url: event.url,
        }));

        setConcerts(mappedConcerts);
      } catch (error) {
        console.error('Error fetching concerts:', error);
      }
    };
    fetchSubscriptions();
    fetchArtist();
    fetchAlbums();
    fetchSingles();
    fetchConcerts();
    fetchTracks();
    setLoading(false);
  }, [id]);


  const handlePlayPause = (filePath: string) => {
    if (currentTrack === filePath) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      audioRef.current.pause(); 
      audioRef.current.src = `${BASE_URL}${filePath}`;
      audioRef.current.play();
      setCurrentTrack(filePath);
      setIsPlaying(true);
      setTrackEnded(false);
    }
  };
  
  useEffect(() => {
    const handleEnded = () => {
      const currentIndex = tracks.findIndex((track) => track.filePath === currentTrack);
      const nextIndex = (currentIndex + 1) % tracks.length; 
  
      setCurrentTrack(tracks[nextIndex]?.filePath);
      setIsPlaying(true);
      setTrackEnded(false);
      audioRef.current.src = `${BASE_URL}${tracks[nextIndex]?.filePath}`;
      audioRef.current.play();
    };
  
    audioRef.current.addEventListener('ended', handleEnded);
  
    return () => {
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.pause();
    };
  }, [tracks, currentTrack]);
  
  

  useEffect(() => {
    const handleBeforeUnload = () => {
      audioRef.current.pause();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!artist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-6xl font-bold">Артиста не знайдено</h1>
      </div>
    );
  }

  const handleSubscription = async () => {
    if (!token) {
      console.error("Немає токена, не можна підписатися");
      return;
    }

    setLoading(true);

    try {
      if (isSubscribed) {
        await axios.delete(
          `${BASE_URL}/api/artists/${id}/unsubscribe`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${BASE_URL}/api/artists/${id}/subscribe`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setIsSubscribed((prev) => !prev);
    } catch (error) {
      console.error("Помилка підписки:", error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="mt-[40px] flex justify-center">
      <div className="flex w-[1320px] items-start gap-[100px] flex-shrink-0">
        <div>
          <div
            className="relative w-[751px] h-[490px] flex-shrink-0 rounded-[20px] mb-8"
            style={{
              background: `linear-gradient(0deg, rgba(0, 0, 0, 0.30) 0%, rgba(0, 0, 0, 0.30) 100%), url(${BASE_URL}${artist.imageUrl}) lightgray 50% / cover no-repeat`,
              borderRadius: '20px'
            }}
          >
            <div className="absolute top-4 left-4 text-white" style={{ fontFamily: 'Noto Sans', fontSize: '96px', fontWeight: 700, lineHeight: 'normal', textTransform: 'capitalize' }}>
              {artist.name}
            </div>
            <button
              onClick={handleSubscription}
              className={`subscribe-button-artist ${isSubscribed ? "subscribed" : ""} ${loading ? "disabled" : ""}`}
              disabled={loading}
            >
              {loading ? "Зачекайте..." : isSubscribed ? "Відписатися" : "Підписатися"}
            </button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Альбоми</h3>
            <Link to="/albums" className="text-gray-500">Показати всі</Link>
          </div>

          <div className="grid grid-cols-5 gap-4 max-w-[751px] mb-8">
            {albums.length > 0
              ? albums.slice(0, 5).map((album, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={`${BASE_URL}${album.image}`}
                    alt={album.title}
                    className="w-[125px] h-[125px] rounded-[10px] mb-2"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                  />
                  <div className="text-white text-center">
                    <p className="font-bold uppercase truncate"
                      style={{
                        maxWidth: '125px',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                      {album.title}
                    </p>
                    <p>{album.year}</p>
                  </div>
                </div>
              ))
              : <p className="text-gray-500 col-span-5 text-center">Немає альбомів</p>
            }
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Сингли</h3>
            <Link to="/singles" className="text-gray-500">Показати всі</Link>
          </div>

          <div className="grid grid-cols-5 gap-4 max-w-[751px]">
            {singles.length > 0
              ? singles.slice(0, 5).map((single, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={`${BASE_URL}${single.image}`}
                    alt={single.title}
                    className="w-[125px] h-[125px] rounded-[10px] mb-2"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                  />
                  <div className="text-white text-center">
                    <p className="font-bold uppercase truncate"
                      style={{
                        maxWidth: '125px',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                      {single.title}
                    </p>
                    <p>{single.year}</p>
                  </div>
                </div>
              ))
              : <p className="text-gray-500 col-span-5 text-center">Немає синглів</p>
            }
          </div>

        </div>
        <div className="flex flex-col justify-center items-center gap-4 p-4 rounded-[10px]">
          <h3 className="text-2xl font-bold mb-4 self-start">Популярні</h3>


          {tracks
            .filter(track => track.artist.trim().toLowerCase() === artist.name.trim().toLowerCase())
            .slice(0, 5)
            .map((track, index) => {
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-4 w-[408px] rounded-[10px] ${currentTrack === track.filePath && isPlaying
                      ? 'bg-[rgba(186,214,235,0.65)]'
                      : trackEnded && currentTrack === track.filePath
                        ? 'bg-[rgba(186,214,235,0.20)]'
                        : 'bg-[rgba(186,214,235,0.20)]'
                    }`}
                >
                  <span className="text-white">{index + 1}</span>
                  <img
                    src={`${BASE_URL}${track.imageUrl}` || '/images/placeholder.png'}
                    alt={track.title}
                    className="w-[50px] h-[50px] rounded-[10px]"
                  />
                  <span
                    className="text-white flex-grow truncate max-w-[150px]"
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {track.title}
                  </span>

                  <button onClick={() => handlePlayPause(track.filePath)}>
                    <img
                      src={
                        currentTrack === track.filePath && isPlaying
                          ? '/images/PauseIcon.svg'
                          : trackEnded && currentTrack === track.filePath
                            ? '/images/PlayIcon.svg'
                            : '/images/PlayIcon.svg'
                      }
                      alt={isPlaying ? 'Pause' : trackEnded ? 'Stopped' : 'Play'}
                      className="w-[34px] h-[34px]"
                    />
                  </button>
                  <button>
                    <img src={'/images/AddCircle.svg'} alt={'Add to playlist'} className="w-[24px] h-[24px]" />
                  </button>
                  <button className="flex items-center gap-0.5">
                    <img src={'/images/Container.svg'} alt={'.'} className="w-[4px] h-[4px]" />
                    <img src={'/images/Container.svg'} alt={'.'} className="w-[4px] h-[4px]" />
                    <img src={'/images/Container.svg'} alt={'.'} className="w-[4px] h-[4px]" />
                  </button>
                </div>
              );
            })
          }

          {currentTrack && (
            <TrackPlayer
              track={`${BASE_URL}${currentTrack}`}
              trackTitle={tracks.find(track => track.filePath === currentTrack)?.title || ''}
              trackArtist={tracks.find(track => track.filePath === currentTrack)?.artist || ''}
              trackCover={tracks.find(track => track.filePath === currentTrack)?.imageUrl || '/images/placeholder.png'}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onTrackEnd={() => setTrackEnded(true)}
              onPreviousTrack={() => {
                const currentIndex = tracks.findIndex(track => track.filePath === currentTrack);
                if (currentIndex > 0) {
                  const previousTrack = tracks[currentIndex - 1];
                  setCurrentTrack(previousTrack.filePath);
                  setIsPlaying(true);
                }
              }}
              onNextTrack={() => {
                const currentIndex = tracks.findIndex(track => track.filePath === currentTrack);
                if (currentIndex < tracks.length - 1) {
                  const nextTrack = tracks[currentIndex + 1];
                  setCurrentTrack(nextTrack.filePath);
                  setIsPlaying(true);
                }
              }}
            />
          )}

          <h3 className="text-2xl font-bold mb-4 mt-16 self-start w-full">Концерти</h3>
          <div className="flex flex-col gap-4 w-full">
            {concerts.length > 0 ? (
              concerts.map((concert) => {
                const date = new Date(concert.date);
                const day = date.getDate();
                const month = date.toLocaleString('default', { month: 'long' });
                const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
                const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={concert.id} className="p-4 bg-[rgba(186,214,235,0.20)] rounded-[10px] flex items-center">
                    <div className="flex flex-col items-center mr-4">
                      <span className="text-4xl font-bold">{day}</span>
                      <div className="w-full border-t-2 border-white my-1"></div>
                      <span className="text-lg">{month}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold">{concert.name}</h3>
                      <p>{dayOfWeek}, {time}</p>
                      <a
                        href={concert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:underline"
                      >
                        Детальніше
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Концертів поки немає</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;