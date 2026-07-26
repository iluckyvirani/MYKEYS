"use client";

import { motion } from "framer-motion";
import {
  Users,
  Home,
  Building2,
  TrendingUp,
  Shield,
  Star,
  MessageSquare,
} from "lucide-react";
import CountUp from "react-countup";
import type { AboutPageContent } from "@/lib/content/aboutDefaults";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/content/aboutDefaults";

const STAT_META = [
  { icon: Users, color: "from-blue-500 to-cyan-500" },
  { icon: Home, color: "from-green-500 to-emerald-500" },
  { icon: Building2, color: "from-purple-500 to-violet-500" },
  { icon: TrendingUp, color: "from-amber-500 to-orange-500" },
];

const METRIC_STYLES = [
  {
    card: "bg-linear-to-r from-green-500/20 to-emerald-500/20 border-green-500/30",
    label: "text-green-300",
    icon: "stars" as const,
  },
  {
    card: "bg-linear-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    label: "text-blue-300",
    icon: "message" as const,
  },
  {
    card: "bg-linear-to-r from-purple-500/20 to-violet-500/20 border-purple-500/30",
    label: "text-purple-300",
    icon: "shield" as const,
  },
];

export default function StatsSection({
  content = DEFAULT_ABOUT_CONTENT.stats,
}: {
  content?: AboutPageContent["stats"];
}) {
  const items = content.items?.length
    ? content.items
    : DEFAULT_ABOUT_CONTENT.stats.items;
  const achievements = content.achievements?.length
    ? content.achievements
    : DEFAULT_ABOUT_CONTENT.stats.achievements;
  const metrics = content.metrics?.length
    ? content.metrics
    : DEFAULT_ABOUT_CONTENT.stats.metrics;
  const milestones = content.milestones?.length
    ? content.milestones
    : DEFAULT_ABOUT_CONTENT.stats.milestones;

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {items.map((stat, index) => {
            const meta = STAT_META[index % STAT_META.length];
            const Icon = meta.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[5px] shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`w-16 h-16 bg-linear-to-r ${meta.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <div className="text-white">
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                    className="font-bold"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {stat.label}
                </h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Achievements */}
        <div className="bg-linear-to-r from-gray-900 to-black rounded-[5px] p-8 md:p-12 mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              {content.achievementsTitle}
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              {content.achievementsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-[5px] p-6 border border-white/20 hover:border-white/40 transition-colors duration-300"
              >
                <div className="text-3xl mb-4">{achievement.icon}</div>
                <div className="text-2xl font-bold text-white mb-2">
                  {achievement.value}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {achievement.title}
                </h4>
                <p className="text-gray-300 text-sm">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, index) => {
              const style = METRIC_STYLES[index % METRIC_STYLES.length];
              return (
                <div
                  key={index}
                  className={`rounded-[5px] p-6 border ${style.card}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {metric.value}
                      </div>
                      <div className={style.label}>{metric.label}</div>
                    </div>
                    {style.icon === "stars" && (
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                    {style.icon === "message" && (
                      <MessageSquare className="w-8 h-8 text-blue-300" />
                    )}
                    {style.icon === "shield" && (
                      <Shield className="w-8 h-8 text-purple-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {content.growthTitle}
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            {content.growthSubtitle}
          </p>

          <div className="relative">
            {/* Timeline */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center relative z-10"
                >
                  <div className="w-20 h-20 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {milestone.event}
                  </h4>
                  <p className="text-gray-600">
                    {milestone.properties} Properties
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
