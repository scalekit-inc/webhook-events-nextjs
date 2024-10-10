'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();

    async function fetchEvents() {
      try {
        const response = await fetch('/api/webhook/user-access');
        const data = await response.json();
        console.log('Raw API response:', data); // Log the raw API response

        if (Array.isArray(data.events)) {
          setEvents(data.events);
          console.log('Fetched events:', data.events);
        } else {
          console.error('API did not return an array:', data);
          setError('Received invalid data format from API');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to fetch events');
      }
    }
  }, []);

  // Log events whenever they change
  useEffect(() => {
    console.log('Current events state:', events);
  }, [events]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard Events</h2>
      {Array.isArray(events) && events.length > 0 ? (
        <ul className="space-y-4">
          {events.map((evnt: any, index: number) => (
            <li
              key={evnt.id || index}
              className="bg-gray-100 rounded-lg p-4 shadow"
            >
              <h3 className="text-xl font-semibold mb-2">
                {evnt.name || `Event ${index + 1}`}
              </h3>
              <pre className="bg-white p-3 rounded overflow-x-auto text-sm">
                {JSON.stringify(evnt, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No events to display</p>
      )}
    </div>
  );
}
