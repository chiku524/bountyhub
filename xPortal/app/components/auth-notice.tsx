import { Link } from '@remix-run/react';
import { Nav } from './nav';

interface AuthNoticeProps {
    message?: string;
}

export function AuthNotice({ message = "You need to be logged in to access this feature." }: AuthNoticeProps) {
    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-row">
            <Nav />
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Sign In Required</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    {message} Please <Link to="/login" className="font-medium underline hover:text-blue-600">log in</Link> or <Link to="/signup" className="font-medium underline hover:text-blue-600">sign up</Link> to continue.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 