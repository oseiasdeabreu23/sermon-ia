'use client';

export default function DebugPage() {
  const vars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `✅ (${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.slice(0, 10)}...)` : '❌ UNDEFINED',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ UNDEFINED',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ UNDEFINED',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ UNDEFINED',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ UNDEFINED',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ UNDEFINED',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🔍 Firebase Configuration Debug</h1>
        
        <div className="space-y-4">
          {Object.entries(vars).map(([key, value]) => (
            <div key={key} className="p-4 bg-gray-50 rounded border border-gray-200">
              <div className="font-mono text-sm">
                <div className="font-bold text-gray-900">{key}</div>
                <div className={typeof value === 'string' && value.includes('❌') ? 'text-red-600' : 'text-green-600'}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-900 text-sm">
            <strong>Como compartilhar:</strong> Tire uma screenshot desta página e envie para o desenvolvedor.
          </p>
        </div>

        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:underline">← Voltar para Home</a>
        </div>
      </div>
    </div>
  );
}
