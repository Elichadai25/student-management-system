import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-4">
                    Student Management System
                </h1>

                <p className="text-gray-600 mb-6">
                    Welcome to the Student Management System
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/login"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </main>
    );
}