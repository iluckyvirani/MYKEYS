"use client";

import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Headphones,
  Globe,
  Users,
  Building2,
  Shield,
  TrendingUp,
  Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactCardsProps {
  supportPhone: string;
  supportEmail: string;
  supportDescription: string;
}

export default function ContactCards({
  supportPhone,
  supportEmail,
  supportDescription,
}: ContactCardsProps) {
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "General Support",
      details: supportPhone,
      description: supportDescription,
      color: "from-blue-500 to-cyan-500",
      action: `tel:${supportPhone.replace(/\s/g, "")}`,
      buttonText: "Call Now"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Live Chat",
      details: "Available 24/7",
      description: "Instant support via chat",
      color: "from-green-500 to-emerald-500",
      action: "#live-chat",
      buttonText: "Start Chat"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      details: supportEmail,
      description: "Response within 24 hours",
      color: "from-purple-500 to-violet-500",
      action: `mailto:${supportEmail}`,
      buttonText: "Send Email"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Our Office",
      details: "123 Property Street, London",
      description: "Headquarters",
      color: "from-amber-500 to-orange-500",
      action: "#location",
      buttonText: "Get Directions"
    },
  ];


  return (
    <div className="space-y-8">
      {/* Main Contact Cards */}
      <div className="space-y-6">
        {contactInfo.map((info, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[5px] shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 bg-linear-to-r ${info.color} rounded-lg flex items-center justify-center`}>
                <div className="text-white">
                  {info.icon}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.description}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-4">{info.details}</p>
            <a href={info.action}>
              <Button 
                variant="outline" 
                className={`w-full border-${info.color.split('from-')[1].split('-')[0]}-300 text-${info.color.split('from-')[1].split('-')[0]}-700 hover:bg-${info.color.split('from-')[1].split('-')[0]}-50`}
              >
                {info.buttonText}
              </Button>
            </a>
          </motion.div>
        ))}
      </div>

 

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-linear-to-r from-red-500/10 to-orange-500/10 rounded-[5px] p-6 border border-red-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Emergency Contact</h4>
            <p className="text-sm text-gray-600">For urgent safety issues</p>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="text-2xl font-bold text-red-600">+44 800 123 456</div>
          <p className="text-sm text-gray-600">Available 24/7 for safety emergencies only</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-red-300 text-red-700 hover:bg-red-50"
        >
          <Phone className="w-4 h-4 mr-2" />
          Emergency Call
        </Button>
      </motion.div>
    </div>
  );
}