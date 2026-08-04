import { FOLDER_COLORS } from "@/constants/folder";

const MOCK_FOLDERS = [
  {
    name: "Documents",
    date: "April 24, 2021",
    count: 12,
    color: FOLDER_COLORS[0].value,
  },
  {
    name: "Project Alpha",
    date: "March 2, 2024",
    count: 8,
    color: FOLDER_COLORS[5].value,
  },
  {
    name: "Invoices",
    date: "Jan 15, 2025",
    count: 34,
    color: FOLDER_COLORS[3].value,
  },
  {
    name: "Vacation Photos",
    date: "Dec 8, 2023",
    count: 156,
    color: FOLDER_COLORS[9].value,
  },
  {
    name: "Client Contracts",
    date: "Feb 19, 2025",
    count: 5,
    color: FOLDER_COLORS[1].value,
  },
  {
    name: "Design Assets",
    date: "June 30, 2024",
    count: 47,
    color: FOLDER_COLORS[6].value,
  },
  {
    name: "Backups",
    date: "May 3, 2025",
    count: 2,
    color: FOLDER_COLORS[8].value,
  },
  {
    name: "Screenshots",
    date: "July 21, 2025",
    count: 89,
    color: FOLDER_COLORS[10].value,
  },
  {
    name: "Resume Drafts",
    date: "Nov 11, 2023",
    count: 4,
    color: FOLDER_COLORS[4].value,
  },
  {
    name: "Podcast Audio",
    date: "Aug 5, 2024",
    count: 21,
    color: FOLDER_COLORS[2].value,
  },
  {
    name: "Team Slides",
    date: "Sept 14, 2024",
    count: 16,
    color: FOLDER_COLORS[13].value,
  },
  {
    name: "Tax Documents",
    date: "April 1, 2025",
    count: 9,
    color: FOLDER_COLORS[7].value,
  },
  {
    name: "Old Projects",
    date: "Jan 30, 2022",
    count: 63,
    color: FOLDER_COLORS[15].value,
  },
  {
    name: "Wireframes",
    date: "Oct 17, 2024",
    count: 11,
    color: FOLDER_COLORS[11].value,
  },
  {
    name: "Music Library",
    date: "June 6, 2023",
    count: 210,
    color: FOLDER_COLORS[12].value,
  },
  {
    name: "Receipts",
    date: "March 28, 2025",
    count: 18,
    color: FOLDER_COLORS[14].value,
  },
  {
    name: "Case Studies",
    date: "May 19, 2024",
    count: 7,
    color: FOLDER_COLORS[3].value,
  },
  {
    name: "Certificates",
    date: "Feb 2, 2025",
    count: 3,
    color: FOLDER_COLORS[5].value,
  },
  {
    name: "Meeting Notes",
    date: "July 8, 2025",
    count: 40,
    color: FOLDER_COLORS[1].value,
  },
  {
    name: "Personal",
    date: "Sept 30, 2023",
    count: 28,
    color: FOLDER_COLORS[9].value,
  },
] as const;

function Drive() {
  return (
    <section className="space-y-8 p-8 px-4 py-8 md:px-8">
      <h2 className="text-xl font-semibold">My Files</h2>
      <div className="flex flex-wrap">
        {MOCK_FOLDERS.map((folder, i) => (
          <div
            className="rounded-lg p-6 transition hover:bg-muted active:scale-95"
            key={i}
          >
            <FolderTile
              name={folder.name}
              date={folder.date}
              count={folder.count}
              color={folder.color}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Drive;

interface FolderTileProps {
  name: string;
  date: string;
  count?: number;
  color?: string; // base fill color, defaults to gold
}

function FolderTile({ name, date, count, color = "#FFCE3C" }: FolderTileProps) {
  const gradientId = `folder-gradient-${color.replace("#", "")}`;
  const clipId = `clip-${gradientId}`;

  return (
    <div className="flex w-32 flex-col items-center">
      <div className="relative h-20 w-28 overflow-hidden rounded-md">
        <svg viewBox="0 0 112 80" className="h-full w-full">
          <defs>
            {/* Front panel gradient (glossy, brighter) */}
            <linearGradient
              id={gradientId}
              x1="56"
              y1="8"
              x2="56"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={shade(color, 12)} />
              <stop offset="55%" stopColor={color} />
              <stop offset="100%" stopColor={shade(color, -10)} />
            </linearGradient>

            {/* Back panel gradient (subtler, slightly darker overall) */}
            <linearGradient
              id={`${gradientId}-back`}
              x1="56"
              y1="0"
              x2="56"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={shade(color, -5)} />
              <stop offset="100%" stopColor={shade(color, -20)} />
            </linearGradient>

            <clipPath id={clipId}>
              <path d="M52 8L46.7333 2.73333C44.9829 0.983035 42.6088 -0.00017858 40.1333 2.43289e-08H5.33333C2.38781 2.43289e-08 0 2.38781 0 5.33333C0 5.33333 0 71.7212 0 74.6667C0 77.6122 2.38781 80 5.33333 80H106.667C109.612 80 112 77.6122 112 74.6667V13.3333C112 10.3878 109.612 8 106.667 8H52Z" />
            </clipPath>
          </defs>

          {/* Back panel — now gradient */}
          <path
            d="M52 8L46.7333 2.73333C44.9829 0.983035 42.6088 -0.00017858 40.1333 2.43289e-08H5.33333C2.38781 2.43289e-08 0 2.38781 0 5.33333C0 5.33333 0 71.7212 0 74.6667C0 77.6122 2.38781 80 5.33333 80H106.667C109.612 80 112 77.6122 112 74.6667V13.3333C112 10.3878 109.612 8 106.667 8H52Z"
            fill={`url(#${gradientId}-back)`}
          />

          {/* Paper sliver — clipped, short strip near the tab gap */}
          <rect
            x="4"
            y="10"
            width="104"
            height="16"
            rx="0"
            fill="#FFFFFF"
            clipPath={`url(#${clipId})`}
          />

          {/* Front panel */}
          <path
            d="M52 8L46.7333 13.2667C44.9829 15.017 42.6088 16.0002 40.1333 16H0V74.6667C0 77.6122 2.38781 80 5.33333 80C5.33333 80 103.721 80 106.667 80C109.612 80 112 77.6122 112 74.6667V13.3333C112 10.3878 109.612 8 106.667 8H52Z"
            fill={`url(#${gradientId})`}
          />

          {/* Bottom edge shading */}
          <path
            d="M5.25024 79.992C6.50024 79.992 106.75 79.992 106.75 79.992C108 79.99 109.5 79.49 110.47 78.392L110.1 78.57C109 78.992 108.5 78.99 108.055 78.992L4.14931 78.992C3.50024 78.99 3.00024 78.99 2.00036 78.572L1.53027 78.39C2.50024 79.49 4.00024 79.992 5.25024 79.992Z"
            fill={shade(color, -50)}
          />

          {/* White highlight on tab */}
          <path
            d="M47.596 14.404L54 8H52L46.7333 13.2667C44.9829 15.017 42.6088 16.0002 40.1333 16H0V17.3333H40.524C43.1765 17.3335 45.7205 16.2797 47.596 14.404V14.404Z"
            fill="#FFFFFF"
            opacity="0.4"
          />

          {count !== undefined && (
            <text x="10" y="68" fontSize="14" fill={shade(color, -60)}>
              {count}
            </text>
          )}
        </svg>
      </div>

      <p className="mt-3 text-center text-sm text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  );
}

// Simple hex color shader — darkens/lightens a hex color by percent
function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return (
    "#" +
    (0x1000000 + clamp(R) * 0x10000 + clamp(G) * 0x100 + clamp(B))
      .toString(16)
      .slice(1)
  );
}
