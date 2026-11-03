import React from 'react';
import { Gamepad2, ArrowRight, Zap, Flame } from 'lucide-react';
import { SUPPORTED_GAMES } from '../data/games';

interface GamesSectionProps {
  onSelectGame: (gameId: string) => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({ onSelectGame }) => {
  return (
    <section id="games" className="py-14 lg:py-20 bg-[#08080a] border-t border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span>SUPPORTED PLATFORMS</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Popular Games Available for Top-Up
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            Click any title to load it into the payment form instantly. Top-ups delivered directly to
            your in-game account.
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORTED_GAMES.filter((g) => g.id !== 'custom_game').map((game) => {
            const isUnavailable = Boolean(game.unavailable);
            return (
              <div
                key={game.id}
                onClick={() => {
                  if (!isUnavailable) {
                    onSelectGame(game.id);
                  }
                }}
                className={`relative rounded-xl border p-5 transition-all duration-200 ${
                  isUnavailable
                    ? 'opacity-40 cursor-not-allowed border-zinc-800/50 bg-[#0e0e13]/50'
                    : 'cursor-pointer group border-zinc-800 bg-[#0e0e13] hover:border-red-500/50 hover:bg-[#131218]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-red-400 uppercase">
                      {game.category}
                    </span>
                    <h3
                      className={`font-display text-base font-bold mt-0.5 transition-colors ${
                        isUnavailable
                          ? 'text-zinc-500 line-through'
                          : 'text-white group-hover:text-red-400'
                      }`}
                    >
                      {game.name}
                    </h3>
                  </div>
                  {isUnavailable ? (
                    <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase">
                      Unavailable
                    </span>
                  ) : game.popular ? (
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                      HOT
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">{game.placeholderUid}</span>
                  {isUnavailable ? (
                    <span className="text-[11px] font-semibold text-zinc-500">Unavailable</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>Top Up</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
