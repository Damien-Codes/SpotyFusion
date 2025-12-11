import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { X } from "lucide-react";
import type { PlaylistTrack, Playlist } from "../app/api/SpotifyApi";
import "../assets/QuizGame.css";

interface QuizGameProps {
  playlist: Playlist;
  tracks: PlaylistTrack[];
  onClose: () => void;
  onGameEnd: (score: number, playedTracks: PlaylistTrack[]) => void;
}

interface Question {
  correctTrack: PlaylistTrack;
  options: PlaylistTrack[];
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

interface SpotifyEmbedController {
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  loadUri: (uri: string, options?: { play?: boolean }) => void;
  destroy: () => void;
  addListener: (event: string, callback: (data: unknown) => void) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    SpotifyIframeApi?: SpotifyIFrameAPI;
  }
}

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 30;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const QuizGame = ({ playlist, tracks, onClose, onGameEnd }: QuizGameProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const questions = useMemo(() => {
    if (tracks.length < 4) return [];

    const shuffledTracks = shuffleArray(tracks);
    const questionsToGenerate = Math.min(
      TOTAL_QUESTIONS,
      shuffledTracks.length,
    );
    const generatedQuestions: Question[] = [];

    for (let i = 0; i < questionsToGenerate; i++) {
      const correctTrack = shuffledTracks[i];
      const wrongOptions = shuffleArray(
        shuffledTracks.filter((t) => t.id !== correctTrack.id),
      ).slice(0, 3);

      const options = shuffleArray([correctTrack, ...wrongOptions]);

      generatedQuestions.push({
        correctTrack,
        options,
      });
    }

    return generatedQuestions;
  }, [tracks]);

  const [playedTracks, setPlayedTracks] = useState<PlaylistTrack[]>([]);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const timerRef = useRef<number | null>(null);
  const nextQuestionTimerRef = useRef<number | null>(null);
  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const embedControllerRef = useRef<SpotifyEmbedController | null>(null);
  const iframeApiRef = useRef<SpotifyIFrameAPI | null>(null);
  const isApiLoadedRef = useRef(false);

  useEffect(() => {
    if (isApiLoadedRef.current) return;

    const existingScript = document.querySelector(
      'script[src="https://open.spotify.com/embed/iframe-api/v1"]',
    );
    if (existingScript) {
      if (window.SpotifyIframeApi) {
        iframeApiRef.current = window.SpotifyIframeApi;
        isApiLoadedRef.current = true;
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;

    window.onSpotifyIframeApiReady = (api: SpotifyIFrameAPI) => {
      iframeApiRef.current = api;
      window.SpotifyIframeApi = api;
      isApiLoadedRef.current = true;
    };

    document.body.appendChild(script);

    return () => {
      if (embedControllerRef.current) {
        embedControllerRef.current.destroy();
        embedControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (questions.length === 0 || !embedContainerRef.current) return;

    const currentQ = questions[currentQuestion];
    const spotifyUri = `spotify:track:${currentQ.correctTrack.id}`;

    const initializePlayer = () => {
      if (!iframeApiRef.current || !embedContainerRef.current) return;

      if (embedControllerRef.current) {
        embedControllerRef.current.loadUri(spotifyUri, { play: true });
        return;
      }

      embedContainerRef.current.innerHTML = "";

      iframeApiRef.current.createController(
        embedContainerRef.current,
        {
          uri: spotifyUri,
          width: "100%",
          height: 80,
        },
        (controller: SpotifyEmbedController) => {
          embedControllerRef.current = controller;

          controller.addListener("ready", () => {
            setIsPlayerReady(true);
            setTimeout(() => {
              controller.play();
            }, 500);
          });

          controller.addListener("playback_update", (data: unknown) => {
            const e = data as {
              data: { isPaused: boolean; isBuffering: boolean };
            };
            if (e.data && !e.data.isPaused && !e.data.isBuffering) {
              setIsPlayerReady(true);
            }
          });
        },
      );
    };

    const checkApiReady = setInterval(() => {
      if (iframeApiRef.current) {
        clearInterval(checkApiReady);
        initializePlayer();
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkApiReady);
    }, 5000);

    return () => {
      clearInterval(checkApiReady);
      clearTimeout(timeout);
    };
  }, [currentQuestion, questions]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsAnswered(true);
    setSelectedAnswer(null);
  }, []);

  useEffect(() => {
    if (isAnswered || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, isAnswered, questions.length, handleTimeUp]);

  const goToNextQuestion = useCallback(() => {
    const currentQ = questions[currentQuestion];
    const newPlayedTracks = [...playedTracks, currentQ.correctTrack];
    setPlayedTracks(newPlayedTracks);

    if (currentQuestion + 1 >= questions.length) {
      if (embedControllerRef.current) {
        embedControllerRef.current.pause();
      }
      onGameEnd(
        selectedAnswer === currentQ.correctTrack.id ? score + 1 : score,
        newPlayedTracks,
      );
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
    setTimeLeft(QUESTION_TIME);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsPlayerReady(false);
  }, [
    currentQuestion,
    questions,
    playedTracks,
    selectedAnswer,
    score,
    onGameEnd,
  ]);

  useEffect(() => {
    if (!isAnswered) return;

    if (embedControllerRef.current) {
      embedControllerRef.current.pause();
    }

    nextQuestionTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, 2000);

    return () => {
      if (nextQuestionTimerRef.current) {
        clearTimeout(nextQuestionTimerRef.current);
      }
    };
  }, [isAnswered, goToNextQuestion]);

  const handleAnswer = (trackId: string) => {
    if (isAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSelectedAnswer(trackId);
    setIsAnswered(true);

    const currentQ = questions[currentQuestion];
    if (trackId === currentQ.correctTrack.id) {
      setScore((prev) => prev + 1);
    }
  };

  const getButtonClass = (trackId: string) => {
    if (!isAnswered) return "quiz-answer-btn";

    const currentQ = questions[currentQuestion];
    if (trackId === currentQ.correctTrack.id) {
      return "quiz-answer-btn correct";
    }
    if (trackId === selectedAnswer) {
      return "quiz-answer-btn incorrect";
    }
    return "quiz-answer-btn";
  };



  if (questions.length === 0) {
    return (
      <div className="quiz-game-container">
        <div className="quiz-loading">
          <p>Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="quiz-game-container">
      <div className="quiz-header">
        <button className="quiz-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="quiz-playlist-name">{playlist.name}</h2>
        <div className="quiz-progress-indicator">
          <span>
            {currentQuestion + 1}/{questions.length}
          </span>
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="quiz-main">
        <div className="quiz-timer-container">
          <svg className="quiz-timer-svg" viewBox="0 0 100 100">
            <circle
              className="quiz-timer-bg"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="5"
            />
            <circle
              className="quiz-timer-progress"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 - (2 * Math.PI * 40 * timeLeft) / QUESTION_TIME}
            />
          </svg>
          <span className="quiz-timer-text">{timeLeft}</span>
        </div>

        <div className="quiz-score-pill">{score} pts</div>

        <div className="quiz-player-container">
          <div
            ref={embedContainerRef}
            className={`spotify-embed-container ${isPlayerReady ? "ready" : "loading"}`}
          />
          {!isPlayerReady && (
            <div className="player-loading-overlay">
              <span>Chargement...</span>
            </div>
          )}
        </div>

        <div className="quiz-answers">
          {currentQ.options.map((track) => (
            <button
              key={track.id}
              className={getButtonClass(track.id)}
              onClick={() => handleAnswer(track.id)}
              disabled={isAnswered}
            >
              {track.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
