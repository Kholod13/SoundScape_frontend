import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface AlbumData {
  id: number;
  title: string;
  year: number;
  coverUrl: string;
  artistName: string;
  numberOfSongs: number;
  albumDuration: string; // Час альбому (формат, наприклад, "1:30:45")
}

const Albums = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [artistName, setArtistName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumResponse = await fetch(`http://localhost:5253/api/artist/${id}/albums`);
        const artistResponse = await fetch(`http://localhost:5253/api/artist/${id}`);
        
        if (!albumResponse.ok || !artistResponse.ok) {
          throw new Error('Albums or artist not found');
        }

        const albumsData = await albumResponse.json();
        const artistData = await artistResponse.json();

        setArtistName(artistData.name);
        setAlbums(
          albumsData["$values"].map((album: any) => ({
            id: album.id,
            title: album.title,
            year: album.year,
            coverUrl: album.coverUrl 
              ? `http://localhost:5253${album.coverUrl}`
              : 'https://via.placeholder.com/150'
          }))
        );
      } catch (error) {
        console.error('Error fetching albums or artist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [id]);

  if (loading) {
    return <div className="text-white text-center text-2xl mt-10">Loading...</div>;
  }

  return (
    <div className="mt-10 px-10 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img 
          src="/images/arrowIcon.svg" 
          alt="back" 
          className="w-16 h-16 cursor-pointer" 
          onClick={() => navigate(-1)}
        />
        <h1 className="text-white text-4xl font-bold font-sans capitalize">
          {artistName}
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-6">
        {albums.map((album) => (
          <div 
            key={album.id} 
            className="flex flex-col items-center p-4 rounded-[10px] bg-[rgba(186,214,235,0.20)] transition hover:bg-[rgba(186,214,235,0.30)] cursor-pointer"
            onClick={() => navigate(`/albums/${album.id}`)} // Замінили тут /album на /albums
          >
            <img 
              src={album.coverUrl} 
              alt={album.title} 
              className="w-40 h-40 object-cover rounded-md mb-1 sm:w-32 sm:h-32" 
            />
            <h2 
              className="max-w-[151px] overflow-hidden text-white truncate font-bold uppercase mb-1 self-stretch"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                fontFamily: 'Noto Sans',
                fontSize: '16px',
                fontStyle: 'normal',
                lineHeight: 'normal'
              }}
            >
              {album.title}
            </h2>
            <p className="self-stretch text-left text-gray-300 text-sm flex items-center">
              <span>{album.year}</span>
              <img 
                src="/images/Container.svg" 
                alt="separator" 
                className="mx-1"  
              />
              <span>Альбом</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Albums;
