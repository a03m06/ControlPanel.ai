import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Send,
  Zap,
  Layers,
  Bot,
  Check
} from 'lucide-react';

import { runControlPlane } from '../services/api';

export default function Conversation() {
  const { showToast, refreshReviews } = useOutletContext() || {};

  // Session & state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Input element refs for focusing
  const heroInputRef = useRef(null);
  const stickyInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isEvaluating]);

  // Handle submitting prompt
  const handleSendMessage = async (customPrompt = null) => {
    const promptToSend = (customPrompt || inputText).trim();

    if (!promptToSend || isEvaluating) return;

    setInputText('');

    // Add user message to conversation
    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: promptToSend,
      timestamp
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsEvaluating(true);

    // Measure actual frontend round-trip time
    const requestStart = performance.now();

    try {
      // Send the prompt to the REAL FastAPI ControlPlane backend.
      //
      // POST /api/control-plane
      //
      // The backend is responsible for:
      // - processing the prompt
      // - running the ControlPlane pipeline
      // - making the decision
      // - returning the final response
      const result = await runControlPlane(promptToSend);

      const requestLatencyMs = Math.round(performance.now() - requestStart);

      // ------------------------------------------------------------
      // Normalize the backend response.
      //
      // The primary expected response is:
      // {
      //   response: "...",
      //   decision: "...",
      //   reason: "...",
      //   evaluation: { ... }
      // }
      //
      // The fallbacks make the UI tolerant of equivalent field names
      // without changing the backend contract.
      // ------------------------------------------------------------

      const evaluation = result?.evaluation || {};

      const decision =
        result?.decision ||
        result?.final_decision ||
        evaluation?.decision ||
        'ALLOW';

      const botResponseText =
        result?.response ||
        result?.final_response ||
        result?.output ||
        result?.message ||
        'No response was returned by ControlPlane.';

      const reason =
        result?.reason ||
        evaluation?.reason ||
        '';

      // Prefer actual backend token usage when available.
      const tokenCount =
        result?.total_tokens ??
        evaluation?.total_tokens ??
        null;

      const botMsgId = `bot-${Date.now()}`;

      const newBotMsg = {
        id: botMsgId,
        sender: 'bot',
        text: botResponseText,

        // Actual browser round-trip time.
        latency: requestLatencyMs,

        // Actual backend token count when provided.
        tokenCount,

        // Keep the complete backend result attached to the message.
        // Other UI components can use this later for displaying
        // scores, issues, decisions, etc.
        evaluation: result
      };

      setMessages((prev) => [...prev, newBotMsg]);

      // Refresh the review queue if the backend created/changed
      // an escalated interaction.
      if (refreshReviews) {
        refreshReviews();
      }

      // Show result notification.
      if (showToast) {
        const normalizedDecision = String(decision).toUpperCase();

        showToast({
          type:
            normalizedDecision === 'ALLOW'
              ? 'success'
              : normalizedDecision === 'BLOCK'
                ? 'error'
                : 'info',

          title: `Response Evaluated: ${decision}`,

          message:
            reason ||
            (
              normalizedDecision === 'ALLOW'
                ? 'Response allowed by ControlPlane.'
                : normalizedDecision === 'BLOCK'
                  ? 'Response blocked by ControlPlane.'
                  : 'Response requires further review.'
            )
        });
      }
    } catch (err) {
      console.error('ControlPlane request failed:', err);

      if (showToast) {
        showToast({
          type: 'error',
          title: 'ControlPlane Error',
          message:
            err?.message ||
            'Failed to complete ControlPlane request.'
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-8rem)] justify-between">
      {/* Ambient Celestial Glow Background */}
      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_75%_55%_at_50%_40%,rgba(30,55,110,0.5)_0%,rgba(14,24,50,0.3)_40%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* 1. Empty State */}
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 max-w-2xl mx-auto w-full text-center animate-in fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-8">
            Where should we start?
          </h1>

          {/* Main Prompt Input Box (Single Line) */}
          <div className="w-full flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-2xl transition-all focus-within:border-blue-500/80 focus-within:ring-1 focus-within:ring-blue-500/40">
            <input
              ref={heroInputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isEvaluating}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <Send size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* 2. Active Conversation State */
        <div className="flex flex-1 flex-col justify-between w-full">
          {/* Session ID Pill */}
          <div className="flex justify-center pt-2 mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-1 text-[11px] font-mono text-[var(--text-muted)] shadow-xs">
              <span className="text-[var(--text-muted)]">SESSION ID:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                X8F-992A-B4C
              </span>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="space-y-6 max-w-4xl mx-auto w-full flex-1 pb-6">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div
                    key={msg.id}
                    className="flex items-start justify-end gap-3 animate-in fade-in"
                  >
                    <div className="flex flex-col items-end max-w-xl">
                      <div className="rounded-2xl rounded-tr-xs bg-blue-600 text-white border border-blue-500/40 px-5 py-4 text-sm shadow-md space-y-2">
                        <div>{msg.text}</div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                        <span>{msg.timestamp}</span>
                        <Check size={12} className="text-blue-500" />
                        <Check size={12} className="-ml-2 text-blue-500" />
                      </div>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs ring-2 ring-blue-500/20 shrink-0">
                      U
                    </div>
                  </div>
                );
              }

              // Bot Message
              return (
                <div
                  key={msg.id}
                  className="space-y-4 animate-in fade-in"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/20 shrink-0">
                      <Bot size={18} />
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-surface)]" />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 text-sm text-[var(--text-primary)] leading-relaxed shadow-lg">
                        <div className="whitespace-pre-line font-sans text-[13px] leading-relaxed text-[var(--text-primary)]">
                          {msg.text}
                        </div>

                        {/* Timing and Tokens metadata */}
                        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                          <div className="flex items-center gap-1">
                            <Zap size={13} className="text-blue-400" />

                            <span>
                              {msg.latency != null
                                ? `${(msg.latency / 1000).toFixed(2)}s`
                                : '—'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Layers size={13} className="text-purple-400" />

                            <span>
                              {msg.tokenCount != null
                                ? `${msg.tokenCount} tokens`
                                : '— tokens'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ControlPlane Loading Skeleton */}
            {isEvaluating && (
              <div className="flex items-start gap-3 animate-pulse">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
                  <Bot size={18} />
                </div>

                <div className="flex-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-3">
                  <div className="h-4 bg-[var(--bg-hover)] rounded w-3/4"></div>
                  <div className="h-4 bg-[var(--bg-hover)] rounded w-1/2"></div>

                  <div className="flex items-center gap-2 pt-2 text-xs text-blue-500 font-mono">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                    <span>
                      ControlPlane evaluating conversation prompt...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Prompt Input Bar (Single Line) */}
          <div className="sticky bottom-2 z-20 w-full pt-4 pb-2">
            <div className="max-w-4xl mx-auto flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-4 py-2.5 shadow-2xl">
              <input
                ref={stickyInputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Type a message..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isEvaluating}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <span>Send</span>
                <Send size={12} />
              </button>
            </div>

            <div className="text-center mt-2">
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                ControlPlane.ai intercepts and evaluates all prompt traffic prior to LLM execution.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}