
import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../types';

interface SportsMatchData {
  matchId: string;
  team1Name: string;
  team1Score?: string;
  team1FlagUrl?: string;
  team2Name: string;
  team2Score?: string;
  team2FlagUrl?: string;
  status: string;
  venue?: string;
  date?: string;
  time?: string;
  summary?: string;
  isFinalMatch?: boolean;
  winningTeamName?: string;
}

interface SportsWidgetData {
  tournamentName?: string;
  matches?: SportsMatchData[];
  league?: string;
  matchTitle?: string;
  status?: string;
  scoreTeam1?: string;
  scoreTeam2?: string;
  venue?: string;
  summary?: string;
  source?: string;
  lastUpdated?: string;
  sportsUpdates?: Array<{ id: string; title: string; statusOrDate: string; summary?: string; linkUrl?: string; source?: string; }>;
  feedTitle?: string;
}

interface SportsWidgetProps {
  data: SportsWidgetData;
  language: Language;
}

const TeamFlag: React.FC<{ flagUrl?: string; teamName: string; language: Language; className?: string }> = ({ flagUrl, teamName, language, className = "w-5 h-auto sm:w-6" }) => {
  const S_flag = {
    flagAlt: language === Language.Urdu ? `${teamName} کا جھنڈا` : `${teamName} flag`,
  };
  if (flagUrl) {
    return <img src={flagUrl} alt={S_flag.flagAlt} className={`${className} inline-block align-middle rounded-sm object-contain`} />;
  }
  return (
    <span className={`${className} h-5 sm:h-6 inline-flex items-center justify-center bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-200 text-[10px] sm:text-xs rounded-sm align-middle leading-none`}
          style={{ fontVariantLigatures: 'none' }} // Prevent ligature issues with single letters
    >
      {teamName.substring(0, Math.min(3, teamName.indexOf(' ') > 0 ? teamName.indexOf(' ') : 3)).toUpperCase()}
    </span>
  );
};

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return <div className="confetti" style={style}></div>;
};

const SportsWidget: React.FC<SportsWidgetProps> = ({ data, language }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<React.CSSProperties[]>([]);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.matches && data.matches.some(match => match.isFinalMatch && match.winningTeamName && match.status?.toLowerCase().includes('finished'))) {
      setShowCelebration(true);
    } else {
      setShowCelebration(false);
    }
  }, [data.matches]);

  useEffect(() => {
    if (showCelebration) {
      const pieces: React.CSSProperties[] = [];
      const colors = ['#FFD700', '#FF69B4', '#00A968', '#0077B6', '#FF4500', '#9400D3', '#32CD32', '#1E90FF'];
      for (let i = 0; i < 70; i++) { // Generate 70 confetti pieces
        pieces.push({
          left: `${Math.random() * 100}%`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: `${Math.random() * 2.5}s`, // Stagger animation start
          transform: `rotateZ(${Math.random() * 360}deg) rotateY(${Math.random() * 180}deg) scale(${0.6 + Math.random() * 0.7})`,
          height: `${5 + Math.random() * 8}px`, // Slightly smaller pieces
          width: `${3 + Math.random() * 5}px`,
          opacity: 0.9, // Initial opacity
        });
      }
      setConfettiPieces(pieces);
      const timer = setTimeout(() => setShowCelebration(false), 4500); // Stop confetti after 4.5 seconds
      return () => clearTimeout(timer);
    } else {
      setConfettiPieces([]);
    }
  }, [showCelebration]);

  const S = {
    live: language === Language.Urdu ? "براہ راست" : "LIVE",
    finished: language === Language.Urdu ? "ختم شدہ" : "Finished",
    upcoming: language === Language.Urdu ? "آنے والا" : "Upcoming",
    final: language === Language.Urdu ? "فائنل" : "Final",
    wonTheTournament: language === Language.Urdu ? "نے ٹورنامنٹ جیت لیا!" : "won the tournament!",
    venueLabel: language === Language.Urdu ? "مقام:" : "Venue:",
    summaryLabel: language === Language.Urdu ? "خلاصہ:" : "Summary:",
    sourceLabel: language === Language.Urdu ? "ماخذ:" : "Source:",
    lastUpdatedLabel: language === Language.Urdu ? "آخری تازہ کاری:" : "Last updated:",
    team: language === Language.Urdu ? "ٹیم" : "Team",
    score: language === Language.Urdu ? "سکور" : "Score",
    status: language === Language.Urdu ? "سٹیٹس" : "Status",
    details: language === Language.Urdu ? "تفصیلات" : "Details",
    noMatches: language === Language.Urdu ? "کوئی میچ دستیاب نہیں۔" : "No matches available.",
    recentUpdates: language === Language.Urdu ? "حالیہ اپڈیٹس" : "Recent Updates",
  };

  const formatStatusText = (status: string, isFinal?: boolean, winningTeam?: string): string => {
    if (isFinal && winningTeam && status.toLowerCase().includes('finished')) {
      return `${S.final}: ${winningTeam} ${S.wonTheTournament}`;
    }
    if (status.toLowerCase().includes('live')) return S.live;
    if (status.toLowerCase().includes('finished')) return status.replace(/finished\s*-\s*/i, `${S.finished} - `);
    if (status.toLowerCase().includes('upcoming')) return `${S.upcoming} ${status.replace(/upcoming:?\s*/i, '').trim()}`;
    return status;
  };
  
  const getStatusClass = (status: string): string => {
    if (status.toLowerCase().includes('live')) return "text-red-500 dark:text-red-400 font-semibold";
    if (status.toLowerCase().includes('upcoming')) return "text-blue-600 dark:text-blue-400";
    return "text-gray-700 dark:text-gray-300";
  };


  if (data.matches && data.matches.length > 0) {
    return (
      <div ref={widgetRef} className={`widget-card sports-widget relative p-3 sm:p-4 border rounded-lg shadow-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mb-4 sm:mb-6 overflow-hidden ${language === Language.Urdu ? 'urdu-text' : ''}`}>
        {showCelebration && (
          <div className="confetti-container">
            {confettiPieces.map((style, index) => (
              <ConfettiPiece key={index} style={style} />
            ))}
          </div>
        )}
        {data.tournamentName && (
          <h2 className={`text-lg sm:text-xl font-bold text-secnto-blue dark:text-secnto-green mb-3 sm:mb-4 text-center ${language === Language.Urdu ? 'urdu-text' : ''}`}>{data.tournamentName}</h2>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th scope="col" className={`px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{S.team} 1</th>
                <th scope="col" className={`px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{S.score}</th>
                <th scope="col" className={`px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{S.team} 2</th>
                <th scope="col" className={`px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{S.status}</th>
                <th scope="col" className={`px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{S.details}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-500">
              {data.matches.map((match) => (
                <tr key={match.matchId} className={`hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-100 ${match.isFinalMatch && match.winningTeamName && match.status?.toLowerCase().includes('finished') ? 'bg-secnto-green/10 dark:bg-secnto-green-dark/20' : ''}`}>
                  <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${match.winningTeamName === match.team1Name ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'} ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center">
                      <TeamFlag flagUrl={match.team1FlagUrl} teamName={match.team1Name} language={language} className={`w-5 h-auto sm:w-6 ${language === Language.Urdu ? 'ml-2' : 'mr-2'}`} />
                      {match.team1Name}
                    </div>
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 text-center`}>
                    {match.team1Score || '-'} <span className="text-gray-400 dark:text-gray-500 mx-1">vs</span> {match.team2Score || '-'}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${match.winningTeamName === match.team2Name ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'} ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center">
                      <TeamFlag flagUrl={match.team2FlagUrl} teamName={match.team2Name} language={language} className={`w-5 h-auto sm:w-6 ${language === Language.Urdu ? 'ml-2' : 'mr-2'}`} />
                      {match.team2Name}
                    </div>
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap text-xs ${getStatusClass(match.status)} ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
                    {formatStatusText(match.status, match.isFinalMatch, match.winningTeamName)}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
                    {match.date && <div>{match.date} {match.time && `(${match.time})`}</div>}
                    {match.venue && <div className="truncate max-w-[100px] sm:max-w-[150px]" title={match.venue}>{match.venue}</div>}
                    {match.summary && <div className="text-[10px] italic truncate max-w-[100px] sm:max-w-[150px]" title={match.summary}>{match.summary}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(data.source || data.lastUpdated) && (
          <div className={`mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
            {data.source && <span>{S.sourceLabel} {data.source}</span>}
            {data.source && data.lastUpdated && <span className="mx-1">|</span>}
            {data.lastUpdated && <span>{S.lastUpdatedLabel} {data.lastUpdated}</span>}
          </div>
        )}
      </div>
    );
  }

  // Fallback to simpler card display if data.matches is not available or empty
  // This handles the older structure or general sports news.
  return (
    <div className={`widget-card sports-widget p-3 sm:p-4 border rounded-lg shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mb-4 sm:mb-6 ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
      {data.league && (
        <p className={`text-xs sm:text-sm font-semibold text-secnto-blue dark:text-secnto-green mb-1.5 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{data.league}</p>
      )}
      
      {data.matchTitle && (
        <div className={`mb-2 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">{data.matchTitle}</h3>
        </div>
      )}

      {data.status && (
        <p className={`text-xs sm:text-sm mb-2 ${getStatusClass(data.status)} ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{formatStatusText(data.status)}</p>
      )}
      
      {(data.scoreTeam1 || data.scoreTeam2) && (
        <div className={`space-y-1 mb-2 text-sm sm:text-base ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
          {data.scoreTeam1 && (
            <p className="font-medium text-gray-700 dark:text-gray-200">{data.scoreTeam1}</p>
          )}
          {data.scoreTeam2 && (
            <p className="font-medium text-gray-700 dark:text-gray-200">{data.scoreTeam2}</p>
          )}
        </div>
      )}

      {data.summary && (
        <p className={`text-xs text-gray-600 dark:text-gray-400 mb-1.5 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
          {data.summary}
        </p>
      )}
      
      {data.venue && (
        <p className={`text-xs text-gray-500 dark:text-gray-400 mb-1.5 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
          <span className="font-medium">{S.venueLabel}</span> {data.venue}
        </p>
      )}

      {data.sportsUpdates && data.sportsUpdates.length > 0 && (
        <div className="mt-2">
          <h4 className={`text-sm font-semibold mb-1 ${language === Language.Urdu ? 'urdu-text' : ''}`}>{data.feedTitle || S.recentUpdates}</h4>
          <ul className="space-y-1 text-xs">
            {data.sportsUpdates.map(update => (
              <li key={update.id} className="border-b border-gray-100 dark:border-gray-600 pb-1 mb-1 last:border-b-0">
                <strong className={`${language === Language.Urdu ? 'urdu-text' : ''}`}>{update.title}</strong> ({update.statusOrDate})
                {update.summary && <p className={`italic text-gray-500 dark:text-gray-400 ${language === Language.Urdu ? 'urdu-text' : ''}`}>{update.summary}</p>}
                {update.linkUrl && <a href={update.linkUrl} target="_blank" rel="noopener noreferrer" className="text-secnto-blue dark:text-secnto-green hover:underline text-[10px]">Details</a>}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {(!data.matches || data.matches.length === 0) && !data.league && !data.matchTitle && (!data.sportsUpdates || data.sportsUpdates.length === 0) && (
          <p className={`text-sm text-gray-500 dark:text-gray-400 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>{S.noMatches}</p>
      )}

      {(data.source || data.lastUpdated) && (
        <div className={`mt-2 pt-2 border-t border-gray-200 dark:border-gray-500 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 ${language === Language.Urdu ? 'text-right' : 'text-left'}`}>
          {data.source && <span>{S.sourceLabel} {data.source}</span>}
          {data.source && data.lastUpdated && <span className="mx-1">|</span>}
          {data.lastUpdated && <span>{S.lastUpdatedLabel} {data.lastUpdated}</span>}
        </div>
      )}
    </div>
  );
};

export default SportsWidget;
