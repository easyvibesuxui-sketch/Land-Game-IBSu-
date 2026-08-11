export type PowerClass = "wired" | "self-powered" | "off-grid";

export type Device = {
  slug: string;
  name: string;
  index: string;
  group: PowerClass;
  groupLabel: string;
  tagline: string;
  summary: string;
  fitFor: string[];
  specs: { label: string; value: string }[];
  metric: { value: string; label: string };
  shape: "arch" | "capsule" | "wide" | "squircle" | "beveled" | "circle" | "tall";
  /**
   * Optional product photograph, e.g. "/devices/obd.webp" — a cut-out on
   * transparency, since it sits on the dark card with no plate behind it.
   *
   * Where it is set, the drawn SVG still plays the exploded state and
   * cross-fades into the photograph as the device assembles, so assembly
   * resolves onto the real hardware. Where it is absent the drawn art is the
   * finished state, so every device is complete with or without a file.
   */
  photo?: string;
};

export const GROUPS: { id: PowerClass; label: string; blurb: string }[] = [
  {
    id: "wired",
    label: "Wired",
    blurb:
      "Boxes that draw from the machine itself. Full telemetry — location, voltage, operating hours, CAN bus.",
  },
  {
    id: "self-powered",
    label: "Self-powered",
    blurb:
      "Their own cells. For attachments, trailers and plant with no supply of their own.",
  },
  {
    id: "off-grid",
    label: "Off-grid",
    blurb: "Sun, or nothing at all. Assets that will never see a wiring loom.",
  },
];

export const devices: Device[] = [
  {
    slug: "core",
    name: "CORE",
    index: "001",
    group: "wired",
    groupLabel: "Active · wired",
    tagline: "Reads the machine, not just the map.",
    summary:
      "Developed for vehicles where vehicle data, CAN bus information and usage analysis are what matter. CORE records and evaluates CAN bus data such as operating hours, speed and fuel consumption.",
    fitFor: ["Excavators", "Wheel loaders", "Attachments"],
    specs: [
      { label: "Digital in", value: "1× positive trigger (ignition detection)" },
      { label: "Digital in", value: "3× negative trigger, normal use" },
      { label: "Analog in", value: "1× 0 V – 16 V · 1× 0 V – 30 V" },
      { label: "Digital out", value: "1× open drain, internal interlock, 150 mA max" },
      { label: "Reads", value: "Operating hours · speed · fuel consumption" },
    ],
    metric: { value: "CAN", label: "Bus level data" },
    photo: "/devices/core.webp",
    shape: "arch",
  },
  {
    slug: "edge",
    name: "EDGE",
    index: "002",
    group: "wired",
    groupLabel: "Active · wired",
    tagline: "Plug it in. Walk away.",
    summary:
      "EDGE connects to the power source of your construction machine via plug-and-play, which makes it suitable for equipment that already has its own supply. Focused on the essentials: live location, voltage and operating hours.",
    fitFor: ["Large machines", "Excavators", "Wheel loaders"],
    specs: [
      { label: "Install", value: "Plug-and-play to machine power" },
      { label: "Requires", value: "Equipment with its own power supply" },
      { label: "Reads", value: "Live location · voltage · operating hours" },
    ],
    metric: { value: "3", label: "Wires to nothing" },
    shape: "tall",
  },
  {
    slug: "lite",
    name: "LITE",
    index: "003",
    group: "wired",
    groupLabel: "Active · wired",
    tagline: "Only where it is. Nothing else.",
    summary:
      "The solution for machinery where only the real-time GPS position is required. A compact, easy-to-install box wired straight to the battery. No maintenance monitoring, no driving-behaviour detection — location, fast.",
    fitFor: ["Fast deployment", "Rental fleets", "Any machine with a battery"],
    specs: [
      { label: "Install", value: "Direct battery connection" },
      { label: "Reads", value: "Real-time GPS position" },
      { label: "Omits", value: "Maintenance monitoring · driving behaviour" },
    ],
    metric: { value: "1", label: "Job, done exactly" },
    photo: "/devices/lite.webp",
    shape: "wide",
  },
  {
    slug: "obd",
    name: "OBD",
    index: "004",
    group: "wired",
    groupLabel: "Active · plug-in",
    tagline: "The port is already there.",
    summary:
      "A plug-and-play tracker for anything with an OBD interface — vans, trucks and cars. It also suits construction machinery and attachments such as vibratory plates and shovels.",
    fitFor: ["Vans", "Trucks", "Cars", "Attachments"],
    specs: [
      { label: "Install", value: "OBD-II port, plug-and-play" },
      { label: "Tools", value: "None" },
      { label: "Also fits", value: "Machines and attachments" },
    ],
    metric: { value: "0", label: "Tools to fit it" },
    photo: "/devices/obd.webp",
    shape: "squircle",
  },
  {
    slug: "link",
    name: "LINK",
    index: "005",
    group: "self-powered",
    groupLabel: "Active · self-powered",
    tagline: "For everything that was never wired.",
    summary:
      "Suitable for medium-sized construction equipment or attachments that have no power supply of their own. LINK uses LTE-M and NB-IoT to transmit data straight to the platform.",
    fitFor: ["Vibratory plates", "Shovels", "Attachments"],
    specs: [
      { label: "Network", value: "LTE-M + NB-IoT" },
      { label: "Power", value: "Internal — no host supply needed" },
      { label: "Transmits", value: "Direct to the IoT platform" },
    ],
    metric: { value: "2", label: "Radio networks" },
    photo: "/devices/link.webp",
    shape: "squircle",
  },
  {
    slug: "link-mini",
    name: "LINK mini",
    index: "006",
    group: "self-powered",
    groupLabel: "Active · self-powered",
    tagline: "Ninety grams of certainty.",
    summary:
      "The smallest member of the family, on the same networks as its larger sibling. IP68 and IK06 rated, with a Sony GNSS chipset reading GPS, GLONASS and Galileo down to roughly a metre.",
    fitFor: ["Small attachments", "Tight mountings", "Anything that moves"],
    specs: [
      { label: "Weight", value: "90 g" },
      { label: "Size", value: "84 × 63 × 24 mm" },
      { label: "Battery", value: "Lithium" },
      { label: "Rating", value: "IP68 · IK06" },
      { label: "Sensor", value: "3-axis accelerometer" },
      { label: "GNSS", value: "Sony CXD5605 — GPS, GLONASS, Galileo" },
      { label: "Accuracy", value: "≈ 1 m, 2D RMS" },
      { label: "Sensitivity", value: "−147 dBm cold · −161 dBm hot start" },
      { label: "Temperature", value: "−30 °C … +60 °C" },
      { label: "Network", value: "LTE-M Cat-M1 · NB-IoT Cat-NB1/NB2" },
    ],
    metric: { value: "90g", label: "All in" },
    shape: "capsule",
  },
  {
    slug: "volt",
    name: "VOLT",
    index: "007",
    group: "self-powered",
    groupLabel: "Active · long-life",
    tagline: "Five years without a thought.",
    summary:
      "Built for trailers on the construction site. Up to five years of battery life, LTE CAT M1/NB1 with 2G fallback, and up to four months of operation with no external power at all.",
    fitFor: ["Trailers", "Attachments", "Cars and trucks"],
    specs: [
      { label: "Battery life", value: "Up to 5 years" },
      { label: "Without external power", value: "Up to 4 months" },
      { label: "Network", value: "LTE CAT M1 / NB1, 2G fallback" },
    ],
    metric: { value: "5y", label: "Battery life" },
    photo: "/devices/volt.webp",
    shape: "wide",
  },
  {
    slug: "dot",
    name: "DOT",
    index: "008",
    group: "self-powered",
    groupLabel: "Bluetooth",
    tagline: "Eight years of quiet.",
    summary:
      "A Bluetooth tag for locating attachments and small machines with no power supply of their own. Eight years of operation at a ten-second transmission interval — for construction firms, landlords and workshops.",
    fitFor: ["Vibratory plates", "Small machines", "Workshops"],
    specs: [
      { label: "Battery life", value: "8 years at 10 s interval" },
      { label: "TX power", value: "7 dB, accelerometer off" },
      { label: "Radio", value: "Bluetooth" },
      { label: "Power needed from host", value: "None" },
    ],
    metric: { value: "8y", label: "At 10s interval" },
    shape: "capsule",
  },
  {
    slug: "solar",
    name: "SOLAR",
    index: "009",
    group: "off-grid",
    groupLabel: "Solar",
    tagline: "It runs on the weather.",
    summary:
      "A solar-powered tracker for containers, construction fences and other non-electrified assets. Live GPS for real-time position, plus movement alarms when the asset starts or stops moving.",
    fitFor: ["Containers", "Construction fences", "Non-electrified assets"],
    specs: [
      { label: "Power", value: "Solar" },
      { label: "Reads", value: "Live GPS position" },
      { label: "Alarms", value: "Movement start / stop" },
      { label: "Wiring", value: "None" },
    ],
    metric: { value: "∞", label: "While the sun is up" },
    photo: "/devices/solar.webp",
    shape: "beveled",
  },
  {
    slug: "tag",
    name: "TAG",
    index: "010",
    group: "off-grid",
    groupLabel: "Passive",
    tagline: "No battery. No radio. Still tracked.",
    summary:
      "Passive tags need no power supply at all. Held against a phone or scanned with the app, they open the individual device profile — for drills, leaf blowers, chainsaws and everything else too small for a box.",
    fitFor: ["Drills", "Leaf blowers", "Chainsaws", "Hand tools"],
    specs: [
      { label: "Power", value: "None" },
      { label: "Scan", value: "QR — two-dimensional code, read by the app" },
      { label: "Scan", value: "NFC — hold the phone against the device" },
      { label: "Opens", value: "The individual device profile" },
    ],
    metric: { value: "0", label: "Power required" },
    photo: "/devices/tag.webp",
    shape: "circle",
  },
];

export const bySlug = (slug: string) => devices.find((d) => d.slug === slug);

export const byGroup = (group: PowerClass) =>
  devices.filter((d) => d.group === group);
