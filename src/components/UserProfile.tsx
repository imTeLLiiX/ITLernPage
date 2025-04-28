'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@prisma/client';

interface UserProfileProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
}

export default function UserProfile({ user, onUpdate }: UserProfileProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await onUpdate(formData);
      setSuccess('Profil erfolgreich aktualisiert');
      setIsEditing(false);
    } catch (err) {
      setError('Fehler beim Aktualisieren des Profils');
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bitte melden Sie sich an, um Ihr Profil zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Profil</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <p className="mt-1 text-lg">{user.name || 'Nicht angegeben'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">E-Mail</h3>
            <p className="mt-1 text-lg">{user.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Rolle</h3>
            <p className="mt-1 text-lg capitalize">{user.role.toLowerCase()}</p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Profil bearbeiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 