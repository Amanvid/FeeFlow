export default function TeacherHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Login Help</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">What the 401 Error Means</h2>
            <p className="text-blue-700">
              The "401 Unauthorized" error is actually a <strong>good sign</strong>! It means:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
              <li>The login page is working correctly</li>
              <li>The API endpoint is responding</li>
              <li>The authentication system is functioning</li>
              <li>Only the <strong>username/password combination is incorrect</strong></li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">How to Find Correct Credentials</h2>
            <p className="text-yellow-700 mb-3">
              To find the correct teacher login credentials, you have several options:
            </p>
            <ol className="list-decimal list-inside text-yellow-700 space-y-2">
              <li>Check the Google Sheets "Teachers" sheet for usernames and passwords</li>
              <li>Try the admin login at <code className="bg-yellow-100 px-2 py-1 rounded">/login</code></li>
              <li>Look for default credentials in the project documentation</li>
              <li>Check environment variables for test credentials</li>
            </ol>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Test the Login Now</h2>
            <p className="text-green-700 mb-3">
              You can test the teacher login right now by visiting:
            </p>
            <div className="bg-white p-3 rounded border">
              <code className="text-green-600">http://localhost:9002/teacher/login</code>
            </div>
            <p className="text-green-700 mt-3">
              Try these common test credentials:
            </p>
            <ul className="list-disc list-inside text-green-700 space-y-1">
              <li><strong>Username:</strong> teacher1 / <strong>Password:</strong> password123</li>
              <li><strong>Username:</strong> admin / <strong>Password:</strong> admin123</li>
              <li><strong>Username:</strong> test / <strong>Password:</strong> test123</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Still Having Issues?</h2>
            <p className="text-gray-700">
              If you're still having trouble, check:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Google Sheets API is properly configured</li>
              <li>Environment variables are set correctly</li>
              <li>The "Teachers" sheet exists in your Google Spreadsheet</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/teacher/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Teacher Login
          </a>
        </div>
      </div>
    </div>
  );
}