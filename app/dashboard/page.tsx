'use client';

import { useEffect, useState } from 'react';

interface Event {
  id?: string;
  data?: {
    email?: string;
    name?: string;
    given_name?: string;
    created?: string;
  };
  meta?: {
    created?: string;
  };
  [key: string]: any;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchEvents();

    async function fetchEvents() {
      try {
        const response = await fetch('/api/webhook/user-access');
        const data = await response.json();

        if (Array.isArray(data.events)) {
          setEvents(data.events);
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

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedEvents);
    if (expandedEvents.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvents(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard Events</h2>
      {Array.isArray(events) && events.length > 0 ? (
        <ul className="space-y-4">
          {events.map((event: Event, index: number) => (
            <li
              key={event.id || index}
              className="bg-white rounded-lg p-4 shadow border border-gray-200 hover:border-blue-300 transition-colors duration-200"
            >
              <div
                className="cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {event.data?.name ||
                        event.data?.given_name ||
                        'Unnamed Event'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {event.data?.email && <p>📧 {event.data.email}</p>}
                      {(event.meta?.created || event.data?.created) && (
                        <p>
                          🕒{' '}
                          {formatDate(
                            event.meta?.created || event.data?.created,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-blue-500">
                    {expandedEvents.has(index) ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {expandedEvents.has(index) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <pre className="bg-gray-50 p-3 rounded overflow-x-auto text-sm text-gray-800">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No events to display</p>
      )}
    </div>
  );
}
