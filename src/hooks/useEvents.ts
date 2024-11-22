import { useQuery } from '@tanstack/react-query';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Event } from '../types';
import { getNextOccurrences } from '../utils/dateUtils';

const fetchEvents = async () => {
  const eventsRef = ref(database, 'events');
  const snapshot = await get(eventsRef);
  
  if (!snapshot.exists()) {
    return [];
  }

  const allEvents: Event[] = [];
  
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    
    if (data) {
      if (data.recurrence && data.recurrence.frequency === 'weekly') {
        const nextDates = getNextOccurrences(data.recurrence.dayOfWeek, 4);
        nextDates.forEach((date, index) => {
          allEvents.push({
            id: `${childSnapshot.key}-${index}`,
            title: data.title,
            time: data.time,
            date: date,
            description: data.description,
            imageUrl: data.imageUrl,
            type: 'regular',
            recurrence: data.recurrence
          });
        });
      } else {
        allEvents.push({
          id: childSnapshot.key || '',
          title: data.title,
          time: data.time,
          date: data.date,
          description: data.description,
          imageUrl: data.imageUrl,
          type: data.type || 'special'
        });
      }
    }
  });
  
  return allEvents.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });
};