import { Link } from '@remix-run/react';
import { Nav } from './nav';

export function AuthNotice() {
    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-row">
            <Nav />
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Sign In Required</h2>
                    <p className="text-gray-300 mb-6 text-center">
                        You must be signed in to access this page. If you don't have an account, you can create one for free.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link
                            to="/login"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded text-center transition-colors"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 