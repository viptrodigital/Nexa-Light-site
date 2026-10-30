// The four product divisions. `category` must match the product category
// stored in the database (admin panel → Categories).
export type Division = {
  slug: string;
  category: string;
  short: string;
  number: string;
  tagline: string;
  intro: string;
  applications: string[];
  capabilities: { title: string; text: string }[];
};

export const DIVISIONS: Division[] = [
  {
    slug: "facade-lighting",
    category: "Facade Lighting",
    short: "Facade",
    number: "01",
    tagline: "Wall washers, grazers and linear profiles for building exteriors.",
    intro:
      "Exterior lighting systems that reveal the form, texture and rhythm of a building after dark. From uniform wall washing to tight grazing on stone and glass, every luminaire is specified for outdoor duty and controlled glare.",
    applications: ["Commercial towers", "Hotels & hospitality", "Heritage & institutional buildings", "Retail frontages", "Bridges & infrastructure", "Residential facades"],
    capabilities: [
      { title: "Precise optics", text: "Narrow to wide beam options and asymmetric lenses to place light on the surface, not the sky." },
      { title: "Built for exteriors", text: "Weather-sealed aluminium housings with ingress ratings suited to permanent outdoor installation." },
      { title: "Dynamic control", text: "Static white or colour-changing versions with DMX / DALI control on request." },
    ],
  },
  {
    slug: "fiber-optic-lighting",
    category: "Fiber Optic Lighting",
    short: "Fiber Optic",
    number: "02",
    tagline: "Star ceilings, pool fibres and showcase lighting.",
    intro:
      "Fibre optic systems move light, not electricity: the light engine sits safely out of sight while the fibres carry illumination to ceilings, water and display cases. Ideal where heat, maintenance access or water make conventional fittings impractical.",
    applications: ["Star-sky ceilings", "Home theatres & lounges", "Swimming pools & spas", "Museum & jewellery showcases", "Hospitality interiors", "Feature walls"],
    capabilities: [
      { title: "No voltage at the point of light", text: "Fibre ends carry no electricity or heat, which suits pools, spas and delicate displays." },
      { title: "Remote light engine", text: "The illuminator is installed in an accessible location, so maintenance never disturbs the finished ceiling or pool." },
      { title: "Effects on demand", text: "Twinkle, colour change and dimming effects controlled from the light source." },
    ],
  },
  {
    slug: "landscape-lighting",
    category: "Landscape Lighting",
    short: "Landscape",
    number: "03",
    tagline: "Path lights, bollards, spikes and underwater fittings.",
    intro:
      "Outdoor lighting for gardens, pathways and open spaces that guides people safely and brings planting and water features to life, while keeping glare and upward light spill under control.",
    applications: ["Gardens & lawns", "Pathways & driveways", "Parks & public spaces", "Resorts & villas", "Water features & pools", "Building perimeters"],
    capabilities: [
      { title: "Wayfinding & safety", text: "Low-level path lights and bollards that light the ground where people walk." },
      { title: "Durable outdoor finishes", text: "Corrosion-resistant bodies and sealed optics for year-round exposure." },
      { title: "Discreet by day", text: "Compact forms that sit quietly in the landscape until the lights come on." },
    ],
  },
  {
    slug: "indoor-architectural-lighting",
    category: "Indoor Architectural Lighting",
    short: "Indoor",
    number: "04",
    tagline: "Downlights, track spots, cove and suspended linear lighting.",
    intro:
      "Architectural interior lighting that balances visual comfort with precise accenting: concealed coves, low-glare downlights, flexible track spots and suspended linear systems for workspaces, hospitality and homes.",
    applications: ["Offices & workspaces", "Hotels & restaurants", "Retail & showrooms", "Residences", "Galleries & museums", "Lobbies & corridors"],
    capabilities: [
      { title: "Visual comfort", text: "Deep-set optics and glare control so the space is lit, not the eye." },
      { title: "Accurate colour", text: "High colour-rendering LEDs that show materials, finishes and skin tones as they are." },
      { title: "Integrated design", text: "Recessed, surface, track and suspended options that disappear into the architecture." },
    ],
  },
];

export const divisionBySlug = (slug: string) => DIVISIONS.find((d) => d.slug === slug);
export const divisionByCategory = (category: string) => DIVISIONS.find((d) => d.category === category);
export const divisionHref = (category: string) => {
  const d = divisionByCategory(category);
  return d ? `/products/${d.slug}` : `/products?cat=${encodeURIComponent(category)}`;
};

// Questions buyers and specifiers ask most often, shown on each division page
// (and marked up as FAQ structured data).
export const DIVISION_FAQS: Record<string, { q: string; a: string }[]> = {
  "facade-lighting": [
    {
      q: "What is the difference between a wall washer and a wall grazer?",
      a: "A wall washer sits a little away from the wall and spreads light evenly across a flat surface. A grazer is mounted close to the wall with a narrow beam, so light skims the surface and brings out the texture of stone, brick or cladding. Many facades use both.",
    },
    {
      q: "Can facade lights change colour?",
      a: "Yes. Most of our facade fixtures are available in single colour (warm or neutral white), RGB or RGBW. Colour-changing versions are usually controlled over DMX512, and some can also be dimmed over DALI.",
    },
    {
      q: "What IP rating should an outdoor facade light have?",
      a: "For fixtures exposed to rain we recommend IP65 or higher. Fixtures that sit in the ground or may be splashed or submerged should be IP67 or IP68.",
    },
    {
      q: "Do you help with lighting layouts for a building?",
      a: "Yes. Share your elevations or photos of the building and our team will suggest fixture positions, beam angles and wattages, and share the datasheets for your consultant or contractor.",
    },
  ],
  "fiber-optic-lighting": [
    {
      q: "How does a fibre optic star ceiling work?",
      a: "A light engine (illuminator) sends light through hundreds of thin optical fibres. The fibre ends are pushed through the ceiling board to create the stars. The fibres carry only light, so there is no heat or electricity at the ceiling.",
    },
    {
      q: "Is fibre optic lighting safe for swimming pools?",
      a: "Yes, that is one of its main advantages. The illuminator stays in a dry, accessible place and only the fibre ends go into the pool area, so no electrical parts are in or near the water.",
    },
    {
      q: "Can I get a twinkle or colour-changing effect?",
      a: "Yes. Twinkle wheels, colour change and dimming are handled at the light source, so the effect can be changed later without touching the ceiling.",
    },
    {
      q: "How many fibres do I need for my ceiling?",
      a: "It depends on the ceiling area and how dense you want the stars. Send us the room size and we will recommend the number of fibres, their diameters and a suitable light source.",
    },
  ],
  "landscape-lighting": [
    {
      q: "How far apart should bollard lights be placed along a path?",
      a: "As a rule of thumb, bollards are spaced roughly 3 to 5 metres apart, depending on their height, light output and how evenly you want the path lit. We can suggest spacing once we know the path width and fixture you prefer.",
    },
    {
      q: "What IP rating do garden and landscape lights need?",
      a: "Lights above ground should be at least IP65. Spike lights in planted beds and anything near water should be IP67, and lights that sit underwater need IP68.",
    },
    {
      q: "What colour temperature works best for gardens?",
      a: "Warm white (around 2700K to 3000K) is the most popular choice for gardens and homes because it looks soft and natural. Neutral white (4000K) is often used for public spaces and car parks.",
    },
    {
      q: "Do you supply post top and pole lights for campuses and townships?",
      a: "Yes. Our range includes post top lanterns, decorative pole lights and architectural pole lights in several wattages, suitable for campuses, resorts, parks and residential townships.",
    },
  ],
  "indoor-architectural-lighting": [
    {
      q: "What is the difference between a COB downlight and an SMD downlight?",
      a: "A COB downlight uses a single concentrated LED chip behind a reflector or lens, which gives a punchy, controlled beam that suits accent and feature lighting. An SMD downlight spreads many small LEDs across a diffuser for softer, wider general lighting.",
    },
    {
      q: "What CRI should I choose for interiors?",
      a: "CRI 90 or above is recommended for homes, hotels and retail because colours, skin tones and finishes look natural. For galleries, jewellery and premium retail, CRI 95 to 97 is a better choice.",
    },
    {
      q: "Which beam angle is right for a spotlight?",
      a: "Narrow beams (around 15° to 24°) highlight artwork, products and architectural details. Wider beams (36° to 60°) are better for general lighting of rooms and corridors.",
    },
    {
      q: "How do I choose the right cut-out size?",
      a: "Each product page lists the cut-out where it is known, for example 75 mm. Choose the fixture that matches your false-ceiling opening, or ask us and we will suggest options for your existing cut-outs.",
    },
  ],
};
