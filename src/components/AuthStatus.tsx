'use client';

import { useAuth } from '@/lib/auth';
import { Shield, CheckCircle, XCircle, Key, User } from 'lucide-react';

export default function AuthStatus() {
  const { isAuthenticated, token, user } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Authorization Status
          </span>
        </div>
        <div className="flex items-center">
          {isAuthenticated ? (
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600 mr-1" />
          )}
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isAuthenticated
                ? 'text-green-800 bg-green-100'
                : 'text-red-800 bg-red-100'
            }`}
          >
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-xs text-gray-600">
        {/* API Authorization Token */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center mb-1">
            <Key className="h-3 w-3 mr-1 text-blue-600" />
            <span className="font-medium text-blue-800">API Authorization</span>
          </div>
          <div className="text-blue-700">
            <span className="font-medium">Token:</span> apollo-starter-kit
          </div>
          <div className="text-blue-700">
            <span className="font-medium">Header:</span> Authorization:
            apollo-starter-kit ✓
          </div>
        </div>

        {/* User Authentication Token */}
        <div
          className={`p-2 border rounded ${
            isAuthenticated
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center mb-1">
            <User
              className={`h-3 w-3 mr-1 ${
                isAuthenticated ? 'text-green-600' : 'text-gray-500'
              }`}
            />
            <span
              className={`font-medium ${
                isAuthenticated ? 'text-green-800' : 'text-gray-700'
              }`}
            >
              User Authentication
            </span>
          </div>
          <div className={isAuthenticated ? 'text-green-700' : 'text-gray-600'}>
            <span className="font-medium">Token:</span>{' '}
            {token ? `${token.substring(0, 20)}...` : 'None'}
          </div>
          <div className={isAuthenticated ? 'text-green-700' : 'text-gray-600'}>
            <span className="font-medium">Header:</span> User-Authorization:
            Bearer {token ? '✓' : '✗'}
          </div>
        </div>

        {/* User Info */}
        {isAuthenticated && user && (
          <div className="p-2 bg-purple-50 border border-purple-200 rounded">
            <div className="flex items-center mb-1">
              <User className="h-3 w-3 mr-1 text-purple-600" />
              <span className="font-medium text-purple-800">User Info</span>
            </div>
            <div className="text-purple-700">
              <span className="font-medium">Email:</span> {user.email}
            </div>
            {user.name && (
              <div className="text-purple-700">
                <span className="font-medium">Name:</span> {user.name}
              </div>
            )}
            {user.role && (
              <div className="text-purple-700">
                <span className="font-medium">Role:</span> {user.role}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
