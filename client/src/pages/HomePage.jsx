import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EyeLogo from '../components/consultation/EyeLogo';

/* ---------------------------------------------------------------------- */
/* Small shared hooks/components                                          */
/* ---------------------------------------------------------------------- */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visible];
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0'
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function CountUp({ target, className = '' }) {
  const [ref, visible] = useReveal();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    let raf;
    const duration = 1400;
    let start = null;
    function step(ts) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible, target]);

  return (
    <b ref={ref} className={className}>
      {value.toLocaleString()}
    </b>
  );
}

/* ---------------------------------------------------------------------- */
/* Icons (inline, no external icon font needed for these decorative ones) */
/* ---------------------------------------------------------------------- */

const Icon = {
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  glasses: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M9 18h6M9 18l2-9h4" />
    </svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4Z" />
    </svg>
  ),
  shieldCheck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  lab: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.7L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  sun: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  kids: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  drop: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 21c3-1 5-3 6-6l9-9-3-3-9 9c-3 1-5 3-6 6Z" />
      <path d="m16 5 3 3" />
    </svg>
  ),
  pin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  menu: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
};

/* ---------------------------------------------------------------------- */
/* Data                                                                    */
/* ---------------------------------------------------------------------- */

const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#optical', label: 'Optical' },
  { href: '#process', label: 'How It Works' },
  { href: '#testimonials', label: 'Patients' },
  { href: '#faq', label: 'FAQ' },
];

const SERVICES = [
  {
    icon: Icon.eye,
    title: 'LASIK & Laser Correction',
    desc: 'Bladeless, custom-mapped procedures that correct myopia, hyperopia and astigmatism — most patients see clearly the next day.',
    tag: 'Most requested',
  },
  {
    icon: Icon.search,
    title: 'Comprehensive Eye Exams',
    desc: 'Full diagnostic workups — refraction, pressure, retina imaging — to catch issues years before symptoms appear.',
  },
  {
    icon: Icon.sun,
    title: 'Cataract Surgery',
    desc: 'Micro-incision lens replacement with premium intraocular lens options, done as day surgery with rapid recovery.',
  },
  {
    icon: Icon.shield,
    title: 'Dry Eye & Allergy Care',
    desc: 'Targeted therapy plans for chronic dryness, irritation and seasonal allergy flare-ups — relief that actually lasts.',
  },
  {
    icon: Icon.kids,
    title: 'Pediatric Vision Care',
    desc: "Gentle, kid-friendly exams and myopia-control programs to protect your child's eyesight as they grow.",
  },
  {
    icon: Icon.drop,
    title: 'Diabetic Retinopathy Screening',
    desc: 'Retinal imaging and monitoring programs built for patients managing diabetes long-term.',
  },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Book & register', desc: "Reserve a slot online or by phone. You'll get a unique patient ID at check-in." },
  { num: '02', title: 'Full diagnostic exam', desc: 'Vision, pressure and retina checks with same-day results reviewed by your doctor.' },
  { num: '03', title: 'Personalised plan', desc: 'Glasses, treatment or surgery — recommended based on your exam, not a sales script.' },
  { num: '04', title: 'Fitted & followed up', desc: 'Collect your glasses or complete your procedure, with scheduled follow-up care.' },
];

const STATS = [
  { target: 18400, label: 'Eyes examined' },
  { target: 6200, label: 'Glasses dispensed' },
  { target: 2100, label: 'Laser procedures' },
  { target: 12, label: 'Years in practice' },
];

const TESTIMONIALS = [
  {
    quote:
      'I put off LASIK for six years out of nerves. The team walked me through every step — the procedure itself took less than fifteen minutes.',
    name: 'Ayesha R.',
    role: 'LASIK patient',
    color: 'bg-sky-600',
  },
  {
    quote: "My son's eye tests used to be a battle. Here they made it feel like a game — and caught his astigmatism early.",
    name: 'Farhan M.',
    role: 'Parent, pediatric care',
    color: 'bg-amber-600',
  },
  {
    quote: 'Ordered progressive lenses and had them fitted within two days. The optical staff actually know how to size a frame properly.',
    name: 'Sana K.',
    role: 'Optical patient',
    color: 'bg-sky-900',
  },
];

const FAQS = [
  {
    q: 'Do I need a referral to book an eye exam?',
    a: "No referral needed. You can book a comprehensive eye exam directly with us, whether it's your first visit or a routine annual check.",
  },
  {
    q: 'How do I know if I am a candidate for LASIK?',
    a: 'Candidacy depends on your corneal thickness, prescription stability and overall eye health. We run a dedicated pre-LASIK screening — free with your consultation — to confirm before you commit.',
  },
  {
    q: 'How long does it take to get new glasses?',
    a: 'Most single-vision and bifocal prescriptions are ground and fitted in our in-house lab within 48 hours. Specialty progressive or high-index lenses may take slightly longer.',
  },
  {
    q: 'Can I bring my child in for their first eye test?',
    a: 'Absolutely — we recommend a first vision screening by age four, and earlier if you notice squinting, eye-rubbing or sitting too close to screens. Our pediatric exams are designed to be quick and low-stress.',
  },
  {
    q: 'What should I bring to my first appointment?',
    a: 'Bring your current glasses or contact lenses (if any), a list of any medications, and your ID. If you have a previous prescription or eye report, that helps us track changes over time.',
  },
];

const FRAMES = [
  { style: 'round', label: 'Round Classic', color: '#0c4a6e', fill: '#e0f2fe' },
  { style: 'angular', label: 'Angular Bold', color: '#b45309', fill: '#fef3c7' },
  { style: 'oval', label: 'Soft Oval', color: '#0284c7', fill: '#e0f2fe' },
  { style: 'square', label: 'Reading Squares', color: '#0c4a6e', fill: '#f8fafc' },
];

/* ---------------------------------------------------------------------- */
/* Sub-components                                                         */
/* ---------------------------------------------------------------------- */

function FrameIllustration({ style, color, fill }) {
  if (style === 'oval') {
    return (
      <svg viewBox="0 0 140 60" fill="none" className="h-auto w-full max-w-[130px]">
        <path d="M10 30a24 18 0 1 1 48 0 24 18 0 1 1-48 0Z" stroke={color} strokeWidth="3" fill={fill} />
        <path d="M82 30a24 18 0 1 1 48 0 24 18 0 1 1-48 0Z" stroke={color} strokeWidth="3" fill={fill} />
        <path d="M58 30h24" stroke={color} strokeWidth="3" />
        <path d="M10 24 2 20M130 24l8-4" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (style === 'angular') {
    return (
      <svg viewBox="0 0 140 60" fill="none" className="h-auto w-full max-w-[130px]">
        <rect x="6" y="16" width="48" height="28" rx="4" stroke={color} strokeWidth="3" fill={fill} />
        <rect x="86" y="16" width="48" height="28" rx="4" stroke={color} strokeWidth="3" fill={fill} />
        <path d="M54 28h32" stroke={color} strokeWidth="3" />
        <path d="M6 24-2 20M134 24l8-4" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (style === 'square') {
    return (
      <svg viewBox="0 0 140 60" fill="none" className="h-auto w-full max-w-[130px]">
        <rect x="8" y="12" width="46" height="38" rx="6" stroke={color} strokeWidth="3" fill={fill} />
        <rect x="86" y="12" width="46" height="38" rx="6" stroke={color} strokeWidth="3" fill={fill} />
        <path d="M54 30h32" stroke={color} strokeWidth="3" />
        <path d="M8 26 0 22M132 26l8-4" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <path d="M14 40h34M92 40h34" stroke={color} strokeWidth="1.5" opacity="0.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 140 60" fill="none" className="h-auto w-full max-w-[130px]">
      <rect x="8" y="14" width="46" height="34" rx="14" stroke={color} strokeWidth="3" fill={fill} />
      <rect x="86" y="14" width="46" height="34" rx="14" stroke={color} strokeWidth="3" fill={fill} />
      <path d="M54 30h32" stroke={color} strokeWidth="3" />
      <path d="M8 26 0 22M132 26l8-4" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
        open ? 'border-sky-400 shadow-sm' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-gray-900"
      >
        <span>{item.q}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            open ? 'rotate-[135deg] bg-sky-600 text-white' : 'bg-sky-100 text-sky-700'
          }`}
        >
          <Icon.plus className="h-3.5 w-3.5" />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="max-w-[62ch] px-6 pb-6 text-sm leading-relaxed text-gray-500">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50 font-home text-slate-900">
      {/* ================= NAV ================= */}
      <nav
        className={`sticky top-0 z-40 overflow-hidden backdrop-blur-2xl backdrop-saturate-[2.2] transition-all duration-500 ${
          scrolled ? 'bg-white/35 shadow-[0_12px_40px_-14px_rgba(15,23,42,0.35)]' : 'bg-white/18'
        }`}
      >
        {/* Glassy sheen: bright top edge, soft interior glow, dark bottom rim for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/5 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-900/15 to-transparent" />
        <div className="pointer-events-none absolute -left-1/4 -top-1/2 h-[220%] w-1/2 -skew-x-12 bg-gradient-to-r from-white/40 to-transparent blur-2xl" />

        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <EyeLogo className="h-8 w-11" />
            <span className="font-display text-[1.05rem] font-semibold leading-tight text-sky-950">
              Usman Laser
              <span className="block font-home text-[0.62rem] font-medium uppercase tracking-wider text-slate-500">
                Eye Clinic &amp; Optical
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="group relative py-1 text-slate-700 hover:text-slate-900">
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-sky-600 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-sky-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-800 hover:shadow-md"
            >
              Login
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white md:hidden"
            aria-label="Open menu"
          >
            <Icon.menu className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 flex h-full w-[78vw] max-w-[320px] flex-col gap-1 bg-white p-6 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="mb-4 flex h-9 w-9 items-center justify-center self-end rounded-lg border border-gray-200"
            aria-label="Close menu"
          >
            <Icon.close className="h-4 w-4" />
          </button>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-gray-100 py-3.5 font-semibold text-slate-800"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-sky-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </div>

      {/* ================= HERO ================= */}
      <header id="top" className="relative overflow-hidden pb-20 pt-14 sm:pt-16">
        <div
          className="pointer-events-none absolute -inset-x-[10%] -top-[20%] z-0 h-[640px]"
          style={{
            background:
              'radial-gradient(600px 340px at 18% 18%, rgba(14,165,233,0.16), transparent 70%), radial-gradient(520px 320px at 82% 8%, rgba(245,158,11,0.14), transparent 70%)',
          }}
        />
        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-2 pr-3.5 text-xs font-semibold text-sky-950 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.2)]" />
              Now booking — new patient slots open
            </span>

            <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-balance sm:text-[3.2rem] lg:text-[4rem]">
              Clear sight,{' '}
              <em className="not-italic bg-[linear-gradient(to_bottom,transparent_62%,#e0f2fe_62%)] italic text-sky-700">
                crafted care.
              </em>
            </h1>

            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-slate-500">
              Laser eye treatment, comprehensive diagnostics, and a full optical dispensary under one roof — led by
              Dr. Usman and a team that treats your vision like it's the only pair of eyes that matter. Because it
              is.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2.5 rounded-full bg-sky-600 px-6.5 py-4 text-[0.95rem] font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.32)] transition-all duration-300 hover:-translate-y-1 hover:bg-sky-700 hover:shadow-[0_16px_32px_rgba(14,165,233,0.4)]"
              >
                Book a Consultation
                <Icon.arrow className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-6.5 py-4 text-[0.95rem] font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-md"
              >
                Explore Services
              </a>
            </div>

            <div className="mt-11 flex flex-wrap gap-8">
              <div>
                <b className="block font-display text-[1.7rem] text-sky-950">18k+</b>
                <span className="text-xs text-slate-500">Eyes examined</span>
              </div>
              <div>
                <b className="block font-display text-[1.7rem] text-sky-950">
                  4.9<span className="text-base">/5</span>
                </b>
                <span className="text-xs text-slate-500">Patient rating</span>
              </div>
              <div>
                <b className="block font-display text-[1.7rem] text-sky-950">12+</b>
                <span className="text-xs text-slate-500">Years in practice</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative mx-auto aspect-square w-full max-w-[340px] lg:max-w-[480px]">
            <div className="motion-safe:animate-[spin_40s_linear_infinite] absolute inset-0 rounded-full border border-dashed border-sky-400/30" />
            <div className="motion-safe:animate-[spin_55s_linear_infinite_reverse] absolute inset-[34px] rounded-full border border-dashed border-amber-400/25" />

            <div className="absolute inset-16 flex items-center justify-center rounded-full shadow-[0_24px_60px_rgba(15,23,42,0.14)] ring-1 ring-white/60 [background:radial-gradient(circle_at_32%_28%,#ffffff,#f0f9ff_60%,#e0f2fe)]">
              <svg viewBox="0 0 200 200" fill="none" className="h-[78%] w-[78%]">
                <path
                  d="M10 100C34 55 66 32 100 32C134 32 166 55 190 100C166 145 134 168 100 168C66 168 34 145 10 100Z"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />
                <circle cx="100" cy="100" r="46" fill="url(#irisGrad)" />
                <circle cx="100" cy="100" r="20" fill="#04121f" />
                <defs>
                  <radialGradient id="irisGrad" cx="0.4" cy="0.35" r="0.75">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="55%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0c4a6e" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <div className="motion-safe:animate-[bob_6s_ease-in-out_infinite] absolute -left-[4%] top-[4%] flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold shadow-md sm:-left-[6%]">
              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-sky-100 text-sky-700">
                <Icon.eye className="h-4 w-4" />
              </span>
              20/20 in 1 visit
            </div>
            <div className="motion-safe:animate-[bob_6s_ease-in-out_infinite_1.4s] absolute -right-[4%] bottom-[10%] flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold shadow-md sm:-right-[8%]">
              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-amber-100 text-amber-700">
                <Icon.glasses className="h-4 w-4" />
              </span>
              Glasses in 48h
            </div>
            <div className="motion-safe:animate-[bob_6s_ease-in-out_infinite_2.8s] absolute -bottom-[4%] left-[12%] flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold shadow-md">
              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-sky-100 text-sky-700">
                <Icon.shield className="h-4 w-4" />
              </span>
              Certified specialists
            </div>
          </Reveal>
        </div>
      </header>

      {/* ================= TRUST STRIP ================= */}
      <div className="border-y border-gray-200 bg-white py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 sm:px-6">
          {[
            { icon: Icon.shieldCheck, label: 'Board-certified ophthalmologists' },
            { icon: Icon.calendar, label: 'Same-week appointments' },
            { icon: Icon.lab, label: 'In-house optical lab' },
            { icon: Icon.clock, label: 'Results while you wait' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
              <t.icon className="h-[18px] w-[18px] shrink-0 text-sky-700" />
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ================= SERVICES ================= */}
      <section id="services" className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-[620px]">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-700 before:h-px before:w-5.5 before:bg-sky-600">
              What we treat
            </span>
            <h2 className="mt-3.5 font-display text-[2.1rem] font-semibold text-balance sm:text-[2.5rem]">
              Every part of your vision, covered.
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-slate-500">
              From routine checkups to advanced laser correction, our clinic combines diagnostic precision with a
              calm, unhurried bedside manner.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 70}
                className="group rounded-[20px] border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl"
              >
                <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-sky-600 group-hover:text-white">
                  <s.icon className="h-6.5 w-6.5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                {s.tag && (
                  <span className="mt-4 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-amber-700">
                    {s.tag}
                  </span>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OPTICAL SHOWCASE ================= */}
      <section id="optical" className="bg-sky-50 py-24 sm:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="grid grid-cols-2 gap-4.5">
            {FRAMES.map((f, i) => (
              <div
                key={f.label}
                className={`flex flex-col items-center gap-3.5 rounded-[22px] border border-gray-200 bg-white px-5 pb-5 pt-6.5 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  i === 1 ? 'mt-6.5' : i === 2 ? '-mt-6.5' : ''
                }`}
              >
                <FrameIllustration style={f.style} color={f.color} fill={f.fill} />
                <span className="text-xs font-semibold text-slate-500">{f.label}</span>
              </div>
            ))}
          </Reveal>

          <Reveal delay={100}>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-700">
              In-house optical
            </span>
            <h2 className="mt-3.5 font-display text-[2.1rem] font-semibold text-balance sm:text-[2.5rem]">
              Your prescription, fitted &amp; finished on-site.
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-slate-500">
              No sending your prescription elsewhere. Our dispensary carries frames for every face shape and
              budget, ground and fitted by our own lab technicians.
            </p>

            <ul className="mt-7 flex flex-col gap-5">
              {[
                {
                  title: 'Precision lens grinding',
                  desc: 'Single vision, bifocal, progressive and anti-glare — cut to your exact refraction.',
                },
                {
                  title: '48-hour turnaround',
                  desc: 'Most standard prescriptions are ready to collect within two working days.',
                },
                {
                  title: 'Doctor-to-dispensary handoff',
                  desc: "Your ophthalmologist's notes go straight to our opticians — nothing lost in translation.",
                },
              ].map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-sky-100 text-sky-700">
                    <Icon.check className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">{f.title}</h4>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section id="process" className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-[620px] text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-700">How it works</span>
            <h2 className="mt-3.5 font-display text-[2.1rem] font-semibold text-balance sm:text-[2.5rem]">
              From first visit to clear vision.
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-slate-500">
              A straightforward path, whether you're here for a routine check or considering laser correction.
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 gap-9 md:grid-cols-4 md:gap-6">
            <div className="absolute inset-x-[8%] top-[26px] hidden h-px [background-image:repeating-linear-gradient(to_right,#e2e8f0_0_8px,transparent_8px_16px)] md:block" />
            {PROCESS_STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 90} className="group relative text-left">
                <div className="relative z-10 mb-4.5 flex h-13 w-13 items-center justify-center rounded-full border-[1.5px] border-sky-500 bg-white font-display text-lg font-semibold text-sky-700 shadow-[0_0_0_6px_#f8fafc] transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  {s.num}
                </div>
                <h4 className="text-base font-semibold text-slate-900">{s.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section
        className="py-18 text-white"
        style={{
          background:
            'radial-gradient(700px 300px at 15% 0%, rgba(14,165,233,0.35), transparent 65%), radial-gradient(500px 260px at 90% 100%, rgba(245,158,11,0.22), transparent 65%), #0c4a6e',
        }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-7 px-5 text-center sm:px-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <CountUp target={s.target} className="block font-display text-[clamp(2.2rem,4vw,3rem)] font-semibold" />
              <span className="text-[0.82rem] text-sky-100/70">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section id="testimonials" className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-[620px] text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-700">Patient stories</span>
            <h2 className="mt-3.5 font-display text-[2.1rem] font-semibold text-balance sm:text-[2.5rem]">
              Trusted with thousands of pairs of eyes.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 90}
                className="flex flex-col gap-4.5 rounded-[20px] border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              >
                <div className="flex gap-0.5 text-amber-500">{'★★★★★'}</div>
                <p className="text-[0.95rem] leading-relaxed text-slate-800">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto flex items-center gap-3">
                  <span
                    className={`flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-white ${t.color}`}
                  >
                    {t.name[0]}
                  </span>
                  <div>
                    <b className="block text-sm">{t.name}</b>
                    <span className="text-xs text-slate-500">{t.role}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="bg-sky-50 py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-[620px] text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-700">Questions</span>
            <h2 className="mt-3.5 font-display text-[2.1rem] font-semibold text-balance sm:text-[2.5rem]">
              Frequently asked questions.
            </h2>
          </Reveal>

          <Reveal className="mx-auto flex max-w-[780px] flex-col gap-3">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================= CTA BAND ================= */}
      <section className="px-3 py-20 sm:px-6 sm:py-24">
        <Reveal
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] px-8 py-18 text-center text-white sm:px-10"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 55%, #0c4a6e 100%)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(400px 200px at 85% 15%, rgba(245,158,11,0.35), transparent 70%)' }}
          />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-[640px] font-display text-[clamp(1.8rem,3.6vw,2.5rem)] font-semibold text-balance text-white">
              Your next appointment could save your sight.
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-[1.02rem] text-sky-50/85">
              Same-week slots available — walk out with a diagnosis, a plan, and if you need them, glasses fitted
              within 48 hours.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-6.5 py-4 text-[0.95rem] font-semibold text-sky-700 shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-sky-50"
              >
                Book a Consultation
              </Link>
              <a
                href="tel:+924212345678"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/40 px-6.5 py-4 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/10"
              >
                Call the Clinic
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="contact" className="bg-slate-950 pt-16 text-white/70">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2.5 font-display text-[1.05rem] font-semibold text-white">
                <EyeLogo className="h-7.5 w-10" />
                Usman Laser Eye Clinic
              </div>
              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-white/50">
                Comprehensive eye care and a full optical dispensary, built around precise diagnostics and unhurried
                attention.
              </p>
            </div>

            <div>
              <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Clinic</h5>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#optical" className="hover:text-white">Optical Dispensary</a></li>
                <li><a href="#process" className="hover:text-white">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white">Patient Stories</a></li>
              </ul>
            </div>

            <div>
              <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Support</h5>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Visit Us</h5>
              <ul className="flex flex-col gap-3.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <Icon.pin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  <span>
                    Main Boulevard, Gulberg III,
                    <br />
                    Lahore, Pakistan
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon.phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  <span>+92 42 1234 5678</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon.calendar className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  <span>Mon&ndash;Sat, 9:00 AM&ndash;8:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-white/45">
            <span>&copy; {new Date().getFullYear()} Usman Laser Eye Clinic. All rights reserved.</span>
            <span>
              <a href="#faq" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                Privacy Policy
              </a>{' '}
              &middot;{' '}
              <a href="#faq" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                Terms of Service
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
