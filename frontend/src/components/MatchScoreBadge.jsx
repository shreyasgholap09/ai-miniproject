import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score, size = 'md' }) => {
  const percent = Math.round(score * 100);
  
  let badgeClass = 'score-low';
  let label = 'Low Likelihood';
  
  if (percent >= 80) {
    badgeClass = 'score-high';
    label = 'Strong Potential Match';
  } else if (percent >= 60) {
    badgeClass = 'score-medium';
    label = 'Moderate Candidate';
  }

  const padding = size === 'lg' ? 'px-3 py-2 fs-6' : 'px-2 py-1 small';

  return (
    <div className={`score-pill ${badgeClass} ${padding}`} title={`${percent}% Overall Similarity Score`}>
      <Sparkles size={size === 'lg' ? 16 : 13} />
      <span>{percent}% Match</span>
    </div>
  );
};

export default MatchScoreBadge;
