'use client';

import { useState } from 'react';
import { FlowerData } from '@/types/flower';

const getBackgroundColor = (description: string): string => {
  const colorMap: { [key: string]: string } = {
    red: 'bg-red-50',
    pink: 'bg-pink-50',
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50',
    white: 'bg-gray-50',
    violet: 'bg-purple-50',
    lavender: 'bg-purple-50',
    gold: 'bg-yellow-50',
    silver: 'bg-gray-100',
    crimson: 'bg-red-50',
    magenta: 'bg-pink-50',
    coral: 'bg-orange-50',
  };

  const description_lower = description.toLowerCase();
  for (const [color, bgClass] of Object.entries(colorMap)) {
    if (description_lower.includes(color)) {
      return bgClass;
    }
  }
  
  return 'bg-green-50'; // Default to light green for plants without specific color mentions
};

export default function Home() {
  const [filters, setFilters] = useState({
    climate: '',
    sunExposure: '',
    wateringNeeds: '',
    soilType: '',
    bloomingSeason: '',
    hardiness: '',
    searchQuery: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [recommendations, setRecommendations] = useState<FlowerData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      climate: '',
      sunExposure: '',
      wateringNeeds: '',
      soilType: '',
      bloomingSeason: '',
      hardiness: '',
      searchQuery: ''
    });
    setRecommendations([]);
    setError('');
  };

  const isFormValid = Object.values(filters).some(value => value !== '');

  const filterOptions = {
    climate: [
      { value: 'Mediterranean', label: 'Mediterranean' },
      { value: 'Tropical', label: 'Tropical' },
      { value: 'Desert', label: 'Desert' },
      { value: 'Continental', label: 'Continental' },
      { value: 'Temperate', label: 'Temperate' }
    ],
    sunExposure: [
      { value: 'Full Sun', label: 'Full Sun' },
      { value: 'Partial Sun', label: 'Partial Sun' },
      { value: 'Shade', label: 'Shade' }
    ],
    wateringNeeds: [
      { value: 'High', label: 'High - Regular watering' },
      { value: 'Moderate', label: 'Moderate - Weekly watering' },
      { value: 'Low', label: 'Low - Drought tolerant' }
    ],
    soilType: [
      { value: 'Well-draining', label: 'Well-draining' },
      { value: 'Clay', label: 'Clay' },
      { value: 'Sandy', label: 'Sandy' },
      { value: 'Loamy', label: 'Loamy' }
    ],
    bloomingSeason: [
      { value: 'Spring', label: 'Spring' },
      { value: 'Summer', label: 'Summer' },
      { value: 'Fall', label: 'Fall' },
      { value: 'Winter', label: 'Winter' }
    ],
    hardiness: [
      { value: '1-4', label: 'Very Cold (Zones 1-4)' },
      { value: '5-7', label: 'Cold (Zones 5-7)' },
      { value: '8-10', label: 'Warm (Zones 8-10)' },
      { value: '11-13', label: 'Hot (Zones 11-13)' }
    ]
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Flower Recommender</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="e.g., red flowers, shade loving, drought resistant..."
              className="w-full p-2 border rounded"
            />
          </div>

          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <select
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="">Select {key.replace(/([A-Z])/g, ' $1').toLowerCase()}...</option>
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex-1 bg-blue-500 text-white p-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Finding flowers...' : 'Find Flowers'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recommended Flowers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((flower) => (
              <div 
                key={flower.id} 
                className={`border rounded-lg p-4 shadow-sm ${getBackgroundColor(flower.description)}`}
              >
                <h3 className="text-xl font-semibold mb-2">{flower.name}</h3>
                <p className="text-gray-600 italic mb-2">{flower.scientificName}</p>
                <p className="mb-4">{flower.description}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Climate: {flower.climate.join(', ')}</p>
                  <p>Sun Exposure: {flower.sunExposure}</p>
                  <p>Watering Needs: {flower.wateringNeeds}</p>
                  <p>Soil Type: {flower.soilType}</p>
                  <p>Blooming Season: {flower.bloomingSeason.join(', ')}</p>
                  <p>Hardiness Zones: {flower.hardiness}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
