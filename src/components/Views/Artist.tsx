import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ArtistData {
  id: number;
  name: string;
  bio: string;
}

const Artist = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`http://localhost:5253/api/artist/${id}`);
        if (!response.ok) {
          throw new Error('Artist not found');
        }
        const data: ArtistData = await response.json();
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist:', error);
        setArtist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  const handleGoToAlbums = () => {
    // Перехід до сторінки альбомів
    navigate(`/artist/${id}/albums`);
  };

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

  return (
    <div className="mt-10 flex justify-center">
      <div className="w-[600px] p-6 bg-gray-800 rounded-lg text-white">
        <h1 className="text-4xl font-bold mb-4">{artist.name}</h1>
        <p className="text-lg mb-4">{artist.bio}</p>
        <button
          onClick={handleGoToAlbums}
          className="w-full py-2 px-4 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-600"
        >
          Перейти до альбомів
        </button>
      </div>
    </div>
  );
};

export default Artist;
