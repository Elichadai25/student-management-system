"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

type Submission = {
    id: string;
    assignmentId: string;
    studentId: string;
    fileName: string;
    fileUrl: string;
    submittedAt?: unknown;
    status?: string;
    grade?: string;
    feedback?: string;
};

type Assignment = {
    title: string;
    subject: string;
};

type SubmissionDisplay = Submission & {
    assignmentTitle: string;
    subject: string;
};

export default function StudentSubmissionsPage() {
    const [submissions, setSubmissions] = useState<SubmissionDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError("You must be logged in to view your submissions.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // Get submissions belonging to this student
                const submissionsQuery = query(
                    collection(db, "submissions"),
                    where("studentId", "==", user.uid)
                );

                const submissionsSnapshot =
                    await getDocs(submissionsQuery);

                const submissionData: Submission[] =
                    submissionsSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...(doc.data() as Omit<Submission, "id">),
                    }));

                // Get assignment information
                const result: SubmissionDisplay[] = [];

                for (const submission of submissionData) {
                    let assignmentTitle = "Assignment";
                    let subject = "General";

                    if (submission.assignmentId) {
                        const assignmentSnapshot = await getDocs(
                            query(
                                collection(db, "assignments"),
                                where(
                                    "__name__",
                                    "==",
                                    submission.assignmentId
                                )
                            )
                        );

                        if (!assignmentSnapshot.empty) {
                            const assignment =
                                assignmentSnapshot.docs[0].data() as Assignment;

                            assignmentTitle =
                                assignment.title || "Assignment";

                            subject = assignment.subject || "General";
                        }
                    }

                    result.push({
                        ...submission,
                        assignmentTitle,
                        subject,
                    });
                }

                setSubmissions(result);
            } catch (err) {
                console.error("Error loading submissions:", err);

                setError(
                    "Unable to load your submissions. Please check your Firebase permissions."
                );
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const getStatusStyle = (status?: string) => {
        switch (status?.toLowerCase()) {
            case "graded":
                return "bg-green-100 text-green-700";

            case "late":
                return "bg-red-100 text-red-700";

            case "submitted":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Submissions
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View the assignments you have submitted.
                        </p>
                    </div>

                    <Link
                        href="/student/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl bg-white p-10 text-center shadow">
                        <p className="text-gray-600">
                            Loading your submissions...
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    submissions.length === 0 &&
                    !error && (
                        <div className="rounded-xl bg-white p-12 text-center shadow">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl">
                                📤
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">
                                No submissions yet
                            </h2>

                            <p className="mt-2 text-gray-600">
                                You have not submitted any assignments yet.
                            </p>

                            <Link
                                href="/student/assignments"
                                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                View Assignments
                            </Link>
                        </div>
                    )}

                {/* Submission Cards */}
                {!loading && submissions.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {submissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Subject + Icon */}
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                        {submission.subject}
                                    </span>

                                    <span className="text-2xl">
                                        📄
                                    </span>
                                </div>

                                {/* Assignment */}
                                <h2 className="text-xl font-bold text-gray-900">
                                    {submission.assignmentTitle}
                                </h2>

                                {/* File */}
                                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        Submitted File
                                    </p>

                                    <p className="mt-1 truncate font-medium text-gray-800">
                                        {submission.fileName ||
                                            "Uploaded file"}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="mt-5">
                                    <p className="mb-2 text-sm text-gray-500">
                                        Status
                                    </p>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                                            submission.status
                                        )}`}
                                    >
                                        {submission.status ||
                                            "Submitted"}
                                    </span>
                                </div>

                                {/* Grade */}
                                <div className="mt-5">
                                    <p className="text-sm text-gray-500">
                                        Grade
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-gray-900">
                                        {submission.grade || "Not graded"}
                                    </p>
                                </div>

                                {/* Feedback */}
                                {submission.feedback && (
                                    <div className="mt-5 rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm font-semibold text-gray-700">
                                            Teacher Feedback
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {submission.feedback}
                                        </p>
                                    </div>
                                )}

                                {/* Open File */}
                                {submission.fileUrl && (
                                    <a
                                        href={submission.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 block w-full rounded-lg border border-blue-600 px-4 py-3 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
                                    >
                                        📎 Open Submitted File
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}