"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe,
  Building2,
  TrendingUp,
  Hotel,
  Shield,
  Zap,
  MessageSquare
} from "lucide-react";
// import Image from "next/image";

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Alex Morgan",
      role: "CEO & Founder",
      bio: "Former real estate tech executive with 15+ years experience",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      expertise: ["Real Estate Tech", "Business Strategy", "Growth"],
      icon: <Building2 className="w-5 h-5" />
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Ex-Google engineer specializing in marketplace platforms",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w-400&h=400&fit=crop",
      expertise: ["Platform Architecture", "AI/ML", "Security"],
      icon: <Zap className="w-5 h-5" />
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Operations",
      bio: "Built operations for two successful proptech startups",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      expertise: ["Process Optimization", "Customer Experience", "Scaling"],
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      name: "Jessica Williams",
      role: "Head of Trust & Safety",
      bio: "Former compliance officer with major property firm",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
      expertise: ["Verification", "Fraud Prevention", "Legal Compliance"],
      icon: <Shield className="w-5 h-5" />
    },
  ];

  const advisors = [
    {
      name: "David Park",
      title: "Real Estate Investor",
      company: "Park Capital Group",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    },
    {
      name: "Lisa Thompson",
      title: "Tech Entrepreneur",
      company: "Former Airbnb Executive",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
    },
    {
      name: "Robert Kim",
      title: "Legal Expert",
      company: "Property Law Specialist",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            Meet Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The People Behind
            <span className="block text-purple-600">The Platform</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A diverse team of experts passionate about transforming property transactions
          </p>
        </motion.div>

        {/* Core Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-[5px] shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  {/* <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  /> */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-green-600 font-medium">{member.role}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      {member.icon}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

                  {/* Expertise */}
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-500">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advisors */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Advisors</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Industry experts guiding our vision and strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advisors.map((advisor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-[5px] p-6 hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    {/* <Image
                      src={advisor.image}
                      alt={advisor.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    /> */}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{advisor.name}</h4>
                    <p className="text-sm text-gray-600">{advisor.title}</p>
                    <p className="text-sm text-green-600">{advisor.company}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Strategy
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Industry
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Network
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Company Values */}
        <div className="bg-linear-to-r from-gray-900 to-black rounded-[5px] p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Our Values</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Trust & Transparency",
                description: "Complete transparency in pricing, terms, and processes",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Direct Connections",
                description: "Eliminating middlemen for better deals and faster decisions",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Accessibility",
                description: "Making property transactions accessible to everyone",
                color: "from-purple-500 to-violet-500"
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-[5px] p-6 border border-white/20"
              >
                <div className={`w-12 h-12 bg-linear-to-r ${value.color} rounded-lg flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{value.title}</h4>
                <p className="text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}