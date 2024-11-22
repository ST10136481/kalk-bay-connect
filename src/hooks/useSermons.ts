import { useQuery } from '@tanstack/react-query';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Sermon } from '../types';

const fetchSermons = async () => {
  const sermonsRef = ref(database, 'sermons');
  const snapshot = await get(sermonsRef);
  
  if (!snapshot.exists()) {
    return [];
  }

  const sermonsData: Sermon[] = [];
  
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    if (data) {
      sermonsData.push({
        id: childSnapshot.key || '',
        title: data.title || 'Untitled Sermon',
        date: data.date || new Date().toISOString(),
        audioUrl: data.audioUrl || '',
        description: data.description || ''
      });
    }
  });

  return sermonsData.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const useSermons = () => {
  return useQuery({
    queryKey: ['sermons'],
    queryFn: fetchSermons,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });
};