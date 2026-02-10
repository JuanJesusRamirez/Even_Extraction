import EventsList from '@/components/EventsList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Polymarket Geopolitical Events
          </h1>
          <p className="text-gray-600">
            Real-time prediction market data for geopolitical events
          </p>
        </div>
        <EventsList />
      </div>
    </div>
  );
}
