
import { Firestore, getDoc, doc, query, where, collection, onSnapshot } from "firebase/firestore";
import type { Session, Quiz, Question } from "$lib/types";


interface InitializeSessionResult {
    session: Session | null;
    error: string;
    loading: boolean;
    quiz: Quiz | null;
    questions: Question[]
}

export async function initializeSession(
    db: Firestore,
    sessionId: string
): Promise<InitializeSessionResult> {
    try {
        const snap = await getDoc(doc(db, "sessions", sessionId));

        if (!snap.exists()) {
            return {
                session: null,
                error: "Session not found",
                loading: false,
                quiz: null,
                questions: []
            };
        }

        const session = {
            id: sessionId,
            ...snap.data(),
        } as Session;
        const quizDoc = await getDoc(doc(db, 'quizzes', session.quizId));
        if (!quizDoc.exists()) {
            return {
                error: 'Quiz not found',
                loading: false,
                session: null,
                quiz: null,
                questions: []
            }
        }
        const quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;

        const questions = [...(quiz.questions ?? [])].sort((a, b) => a.order - b.order);

        return {
            session,
            error: "",
            loading: false,
            quiz,
            questions
        };
    } catch (err) {
        console.log(err)
        return {
            session: null,
            error: err instanceof Error ? err.message : "Unknown error",
            loading: false,
            quiz: null,
            questions: []
        };
    }
}