import { type Firestore, doc, runTransaction, query, collection, where, onSnapshot, type Unsubscribe, type Timestamp } from "firebase/firestore";
import type { Question, Answer, Session } from "$lib/types";

async function scoreAnswer(db: Firestore, answer: Answer, currentQuestion: Question, sessionId: string, questionStartedAt: Timestamp) {
    let correct = false;
    if (currentQuestion.type === 'quiz' || currentQuestion.type === 'tf') {
        correct = answer.chosenAnswerId === currentQuestion.correctAnswerId;
    } else if (currentQuestion.type === 'type') {
        correct = answer.typedAnswer?.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    }

    const timeTaken = answer.answeredAt.toMillis() - questionStartedAt.toMillis();
    const ratio = Math.min(1, Math.max(0, timeTaken / (currentQuestion.timeLimit * 1000)));
    const maxPoints = 1000;
    const points = correct ? Math.floor(maxPoints * (1 - ratio)) + 1 : 0;

    const answerRef = doc(db, 'sessions', sessionId, 'answers', answer.id);
    const playerRef = doc(db, 'sessions', sessionId, 'players', answer.playerId);

    await runTransaction(db, async (transaction) => {
        const playerDoc = await transaction.get(playerRef);
        const currentScore = playerDoc.data()?.score ?? 0;
        transaction.update(playerRef, { score: currentScore + points, pointsEarned: points });
        transaction.update(answerRef, { isCorrect: correct, scored: true, pointsEarned: points });
    });
}

export function listenToAnswers(
    db: Firestore,
    session: Session,
    questions: Question[],
    questionId: string,
    onAnswersChange: (answers: Answer[]) => void
): Unsubscribe {
    const unsub = onSnapshot(
        query(
            collection(db, 'sessions', session.id, 'answers'),
            where('questionId', '==', questionId)
        ),
        (snap) => {
            const answers = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Answer);
            console.log(answers);
            console.log(session);
            onAnswersChange(answers);
            console.log("after onanswerchange")
            console.log(session);
            if (!session.questionStartedAt) return;
            for (const answer of answers) {
                const currentQuestion = questions.find((q) => q.id === questionId);
                console.log(currentQuestion)
                if (!currentQuestion) return;
                if (!answer.scored && (currentQuestion.type === 'type' || currentQuestion.type === 'quiz' || currentQuestion.type === 'tf')) {
                    scoreAnswer(db, answer, currentQuestion, session.id, session.questionStartedAt);
                }
            }
        }
    );
    return unsub;
}
