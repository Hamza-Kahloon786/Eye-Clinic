export default function EyeLogo({ className = 'h-10 w-14' }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 30C2 30 22 6 50 6C78 6 98 30 98 30C98 30 78 54 50 54C22 54 2 30 2 30Z"
        stroke="#1e3a8a"
        strokeWidth="4"
      />
      <circle cx="50" cy="30" r="16" fill="#1e3a8a" />
      <circle cx="45" cy="25" r="4" fill="white" />
    </svg>
  );
}
