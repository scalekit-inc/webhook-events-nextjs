'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState('events');
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Toggle expansion of an item
  const toggleExpand = (id: string | number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Fetch data based on the selected view (events or users)
  useEffect(() => {
    if (view === 'events') {
      fetchEvents();
    } else if (view === 'users') {
      fetchUsers();
    }

    async function fetchEvents() {
      try {
        const response = await fetch('/api/webhook/user-access');
        const data = await response.json();
        console.log('Raw API response:', data);

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

    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        console.log('Raw API response:', data);

        if (Array.isArray(data.users)) {
          setUsers(data.users);
          console.log('Fetched users:', data.users);
        } else {
          console.error('API did not return an array:', data);
          setError('Received invalid data format from API');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      }
    }
  }, [view]); // Fetch data whenever the view changes

  // Log events or users whenever they change
  useEffect(() => {
    if (view === 'events') {
      console.log('Current events state:', events);
    } else if (view === 'users') {
      console.log('Current users state:', users);
    }
  }, [events, users, view]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>

      {/* Buttons to toggle between Events and Users */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setView('events')}
          className={`px-6 py-2 rounded-md font-medium text-base transition-colors ${
            view === 'events'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setView('users')}
          className={`ml-4 px-6 py-2 rounded-md font-medium text-base transition-colors ${
            view === 'users'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Users
        </button>
      </div>

      {/* Render Events or Users based on selected view */}
      {view === 'events' ? (
        <div>
          {Array.isArray(events) && events.length > 0 ? (
            <ul className="space-y-4">
              {[...events].reverse().map((evnt: any, index: number) => {
                const itemId = evnt.id || `event-${index}`;
                const isExpanded = expandedItems.has(itemId);
                return (
                  <li
                    key={itemId}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {` ${evnt.data.type} for ${evnt.data.data.email} ` ||
                          `Event ${evnt}`}
                      </h3>
                      <button
                        onClick={() => toggleExpand(itemId)}
                        className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                    {isExpanded && (
                      <pre className="mt-3 bg-gray-50 p-3 rounded overflow-x-auto text-sm text-gray-700 border border-gray-100">
                        {JSON.stringify(evnt, null, 2)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No events to display</p>
          )}
        </div>
      ) : (
        <div>
          {Array.isArray(users) && users.length > 0 ? (
            <ul className="space-y-4">
              {[...users].reverse().map((user: any, index: number) => {
                const itemId = user.id || `user-${index}`;
                const isExpanded = expandedItems.has(itemId);
                return (
                  <li
                    key={itemId}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {user.name || `User ${index + 1}`}
                      </h3>
                      <button
                        onClick={() => toggleExpand(itemId)}
                        className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                    {isExpanded && (
                      <pre className="mt-3 bg-gray-50 p-3 rounded overflow-x-auto text-sm text-gray-700 border border-gray-100">
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No users to display</p>
          )}
        </div>
      )}
    </div>
  );
}
