/* eslint-disable react/prop-types */
export default function RatingStars({ value = 0 }) {
  const rounded = Math.round(value);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rounded} out of 5`}>
      {stars.map((star) => (
        <span key={`star-${star}`} className={star <= rounded ? 'text-amber-500' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </div>
  );
}
