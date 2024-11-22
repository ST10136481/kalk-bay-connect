import { useQuery } from '@tanstack/react-query';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Event } from '../types';
import { useAuth } from './useAuth';

const fetchUserEvents = async (userId: string) => {
  if (!userId) return [];

  const userEventsRef = ref(database, `userEvents/${userId}`);
  const snapshot = await get(userEventsRef);
  
  if (!snapshot.exists()) return [];

  const eventIds = Object.values(snapshot.val());
  const eventsRef = ref(database, 'events');
  const eventsSnapshot = await get(eventsRef);
  
  if (!eventsSnapshot.exists()) return [];

  const allEvents = eventsSnapshot.val();
  return eventIds
    .map((id: string) => ({
      id,
      ...allEvents[id]
    }))
    .filter(Boolean) as Event[];
};

export const useUserEvents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userEvents', user?.uid],
    queryFn: () => fetchUserEvents(user?.uid || ''),
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });
};