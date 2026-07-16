export function NavigationIcon({ name, className = "size-5" }) {
  const paths = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    applications: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="3" />
        <path d="M9 5V3h6v2M8 10h8M8 14h5" />
      </>
    ),
    analytics: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    logout: (
      <>
        <path d="M14 5V3H5v18h9v-2M10 12h11M17 8l4 4-4 4" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    inbox: (
      <>
        <path d="M4 5h16l2 10H15l-2 3h-2l-2-3H2L4 5Z" />
        <path d="M4 11h16" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V9M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} fill-none stroke-current stroke-[1.8]`}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
