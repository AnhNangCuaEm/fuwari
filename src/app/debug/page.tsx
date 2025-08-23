import { getCurrentUser } from "@/lib/auth-utils"
import { auth } from "@/lib/auth"

export default async function DebugPage() {
  const currentUser = await getCurrentUser()
  const session = await auth()
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Auth Info</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">From getCurrentUser()</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">From auth() session</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(session?.user, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Full Session</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <a 
          href="/api/auth/refresh" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          Test Refresh API
        </a>
        <a 
          href="/api/auth/status" 
          className="ml-4 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          Test Status API
        </a>
      </div>
    </div>
  )
}
