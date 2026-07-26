export type HomeHeroContent = {
  title: string;
  titleHighlight: string;
  subtitle: string;
};

export type HomeCategoryItem = {
  id: string;
  title: string;
  description: string;
  features: string[];
  link: string;
  /** Lucide icon key: Home | Clock | TrendingUp */
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

export type HomeCategoriesContent = {
  badge: string;
  title: string;
  subtitle: string;
  items: HomeCategoryItem[];
};

export type HomeFeaturedContent = {
  badge: string;
  title: string;
  subtitle: string;
};

export type HomeTestimonialItem = {
  id: string;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
  propertyType: string;
};

export type HomeBarStat = {
  value: string;
  label: string;
};

export type HomeTestimonialsContent = {
  title: string;
  subtitle: string;
  items: HomeTestimonialItem[];
  barStats: HomeBarStat[];
};

export type HomeStatItem = {
  id: string;
  value: string;
  label: string;
  description: string;
  /** Tailwind gradient classes e.g. from-green-500 to-emerald-600 */
  color: string;
  /** Lucide icon key */
  icon: string;
};

export type HomeAdditionalStat = {
  value: string;
  label: string;
  icon: string;
};

export type HomeStatsContent = {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  items: HomeStatItem[];
  additionalStats: HomeAdditionalStat[];
};

export type HomeFaqContent = {
  title: string;
  subtitle: string;
};

export type HomeContent = {
  hero: HomeHeroContent;
  categories: HomeCategoriesContent;
  featured: HomeFeaturedContent;
  testimonials: HomeTestimonialsContent;
  stats: HomeStatsContent;
  faq: HomeFaqContent;
};

export const HOME_SECTIONS = [
  "hero",
  "categories",
  "featured",
  "testimonials",
  "stats",
  "faq",
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number];

export const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    title: "Find Your Perfect",
    titleHighlight: "Dream Property",
    subtitle:
      "Discover properties seamlessly. Buy, Short rent (nightly bookings), or Long Term Rent (2+ months minimum). No hidden fees, just transparent real estate solutions.",
  },
  categories: {
    badge: "Property Categories",
    title: "Explore Property Options",
    subtitle:
      "Whether you want to buy, rent short-term, or find a long-term home, we have the perfect option for you",
    items: [
      {
        id: "buy",
        title: "Buy",
        description:
          "Find your dream home with our extensive collection of properties for sale",
        features: [
          "Wide selection of properties",
          "Detailed listings with photos",
          "Price negotiation options",
          "Legal documentation support",
        ],
        link: "/buy",
        icon: "Home",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      {
        id: "long-rent",
        title: "Rent",
        description:
          "Secure your perfect rental home with transparent terms and fair pricing",
        features: [
          "Affordable monthly rates",
          "Flexible lease terms",
          "Verified landlords",
          "Maintenance support included",
        ],
        link: "/rent/whole-property",
        icon: "TrendingUp",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      {
        id: "short-rent",
        title: "Short Stay",
        description:
          "Book furnished apartments and homes for short stays with flexibility",
        features: [
          "Flexible booking periods",
          "Fully furnished options",
          "Quick check-in process",
          "24/7 customer support",
        ],
        link: "/rent/short-rent",
        icon: "Clock",
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      },
    ],
  },
  featured: {
    badge: "Featured Properties",
    title: "Properties For Every Need",
    subtitle:
      "Choose from short rents or long term rentals. Find exactly what fits your requirements.",
  },
  testimonials: {
    title: "Trusted by Thousands",
    subtitle: "Real stories from real users who found success on MYKEYS",
    items: [
      {
        id: "1",
        name: "Priya Sharma",
        role: "Property Buyer",
        image: "👩‍💼",
        content:
          "MYKEYS made finding my dream apartment so easy! The listings are detailed, verified, and the entire process was transparent.",
        rating: 5,
        propertyType: "Bought a 2BHK in Bengaluru",
      },
      {
        id: "2",
        name: "Rajesh Kumar",
        role: "Property Owner",
        image: "👨‍💼",
        content:
          "Listing my property on MYKEYS was effortless. I got qualified tenants quickly and the payment system is very reliable.",
        rating: 5,
        propertyType: "Listed 3 properties",
      },
      {
        id: "3",
        name: "Anita Desai",
        role: "Service User",
        image: "👩‍🚀",
        content:
          "The service booking system is incredible! Found a plumber in minutes, and the work quality was exceptional.",
        rating: 5,
        propertyType: "Booked 5+ services",
      },
      {
        id: "4",
        name: "Vikram Patel",
        role: "Service Provider",
        image: "👨‍🔧",
        content:
          "MYKEYS has transformed my plumbing business. I get consistent bookings and fair rates. Highly recommended for service providers!",
        rating: 5,
        propertyType: "Electrician, 100+ jobs",
      },
    ],
    barStats: [
      { value: "10K+", label: "Active Users" },
      { value: "5K+", label: "Properties Listed" },
      { value: "500+", label: "Service Providers" },
      { value: "4.9★", label: "Average Rating" },
    ],
  },
  stats: {
    badge: "Our Achievements",
    title: "Trusted by Thousands",
    titleHighlight: "of Happy Clients",
    subtitle:
      "Years of excellence in delivering premium real estate solutions with unmatched customer satisfaction.",
    items: [
      {
        id: "1",
        value: "1,548+",
        label: "Properties Sold",
        description: "Successful transactions",
        color: "from-green-500 to-emerald-600",
        icon: "Building2",
      },
      {
        id: "2",
        value: "25+",
        label: "Awards Gained",
        description: "Industry recognition",
        color: "from-blue-500 to-cyan-600",
        icon: "Award",
      },
      {
        id: "3",
        value: "9+",
        label: "Years Experience",
        description: "Trusted expertise",
        color: "from-purple-500 to-violet-600",
        icon: "Clock",
      },
      {
        id: "4",
        value: "98%",
        label: "Client Satisfaction",
        description: "Happy customers",
        color: "from-amber-500 to-orange-600",
        icon: "Users",
      },
    ],
    additionalStats: [
      { value: "500+", label: "Properties Listed", icon: "Home" },
      { value: "24/7", label: "Support Available", icon: "ShieldCheck" },
      { value: "4.9", label: "Average Rating", icon: "Star" },
      { value: "50+", label: "Cities Covered", icon: "Globe" },
    ],
  },
  faq: {
    title: "Questions from our community",
    subtitle:
      "Clear answers for guests and property owners using MYKEYS — from fees to bookings.",
  },
};
