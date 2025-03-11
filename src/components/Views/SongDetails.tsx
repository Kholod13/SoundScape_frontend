import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Song {
  id: number;
  title: string;
  duration: string;
  filePath: string;
  albumTitle: string;
  artists: { $id: string; $values: string[] }; // Оновлений тип
}

const SongDetails = () => {
  const { id } = useParams();
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await fetch(`http://localhost:5253/api/songs/${id}`);
        const data = await response.json();
        console.log(data);
        setSong(data);
      } catch (error) {
        console.error('Помилка завантаження пісні:', error);
      }
    };

    fetchSong();
  }, [id]);

  if (!song) {
    return <div className="text-white">Завантаження...</div>;
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">{song.title}</h1>
      
      <audio controls src={song.filePath} className="mb-4 w-full rounded-md shadow-lg">
        Ваш браузер не підтримує аудіо елемент.
      </audio>

      <p>
        <strong>Тривалість:</strong> {song.duration}
      </p>
      <p>
        <strong>Альбом:</strong> {song.albumTitle}
      </p>
      <p>
  <strong>Виконавець:</strong> {song.artists && song.artists.$values ? song.artists.$values.join(', ') : 'Немає виконавця'}
</p>




    </div>
  );
};

export default SongDetails;
