// פס התקדמות עם אחוזים ו"3 מתוך 8"
export default function ProgressBar({ done, total, large }) {
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className={large ? 'progress large' : 'progress'}>
      <div className="progress-track">
        <div className={percent === 100 ? 'progress-fill full' : 'progress-fill'} style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-text">
        {total ? `${done}/${total} · ${percent}%` : 'ריקה'}
      </span>
    </div>
  );
}
