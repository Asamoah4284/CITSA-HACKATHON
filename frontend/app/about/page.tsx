"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Globe, Users, TrendingUp, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const values = [
  {
    icon: Heart,
    title: "Community First",
    description:
      "We believe in the power of community to transform lives and create lasting impact across Africa and beyond.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Connecting African entrepreneurs with customers worldwide, breaking down barriers and building bridges.",
  },
  {
    icon: Users,
    title: "Empowerment",
    description: "Every transaction empowers an entrepreneur, supports a family, and strengthens a community.",
  },
  {
    icon: TrendingUp,
    title: "Sustainable Growth",
    description: "Building sustainable businesses that create long-term value for entrepreneurs and their communities.",
  },
]

const team = [
  {
    name: "Adaora Okonkwo",
    role: "Founder & CEO",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Former Goldman Sachs analyst turned social entrepreneur, passionate about African economic empowerment.",
  },
  {
    name: "Kofi Mensah",
    role: "Head of Technology",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Ex-Google engineer with 10+ years building scalable platforms for emerging markets.",
  },
  {
    name: "Fatima Al-Rashid",
    role: "Head of Community",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Community builder and cultural anthropologist, expert in African diaspora networks.",
  },
  {
    name: "Thabo Mthembu",
    role: "Head of Partnerships",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Former McKinsey consultant specializing in African market expansion and strategic partnerships.",
  },
]

const achievements = [
  { icon: Users, label: "Entrepreneurs Supported", value: "2,500+" },
  { icon: Globe, label: "Countries Reached", value: "54" },
  { icon: TrendingUp, label: "Revenue Generated", value: "$2.3M+" },
  { icon: Award, label: "Awards Won", value: "12" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 growth-arc">
            Empowering Africa's
            <span className="text-[var(--color-accent-primary)]"> Next Generation</span>
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Kola is more than a marketplace—it's a movement. We're building the infrastructure for African
            entrepreneurship to thrive on the global stage, one story at a time.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <div className="prose prose-lg text-[var(--color-text-primary)] space-y-4">
                <p>
                  Africa is home to the world's youngest and most dynamic population. Yet too many brilliant
                  entrepreneurs lack access to global markets, mentorship, and the capital needed to scale their dreams.
                </p>
                <p>
                  We're changing that. Kola creates direct connections between African entrepreneurs and global
                  customers, while building a community of patrons who don't just buy products—they invest in stories,
                  support dreams, and share in success.
                </p>
                <p>
                  Through our innovative "Entrepreneur's Circle" system, every purchase becomes an investment in
                  someone's future, every referral amplifies their reach, and every success story inspires the next
                  generation.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square relative overflow-hidden rounded-2xl">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="African entrepreneurs"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 growth-arc">Our Values</h2>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              The principles that guide everything we do, from product development to community building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-glow bg-[var(--color-surface)] border-[var(--color-border)] h-full">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-accent-primary)]/10 rounded-lg mb-4">
                      <value.icon className="h-6 w-6 text-[var(--color-accent-primary)]" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Achievements */}
        <motion.section
          className="mb-20 py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Our Impact So Far</h2>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Numbers that tell the story of our growing community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-accent-primary)]/10 rounded-lg mb-4">
                  <achievement.icon className="h-8 w-8 text-[var(--color-accent-primary)]" />
                </div>
                <div className="font-mono text-3xl font-bold text-[var(--color-accent-primary)] mb-2">
                  {achievement.value}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 growth-arc">Meet Our Team</h2>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Passionate individuals from across Africa and the diaspora, united by a shared vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-glow bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
                  <div className="aspect-square relative">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-semibold mb-1">{member.name}</h3>
                    <p className="text-[var(--color-accent-primary)] text-sm font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Join the Movement</h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Whether you're an entrepreneur ready to share your story or someone who believes in supporting African
            innovation, there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white px-8 py-4"
              >
                Start Supporting
              </Button>
            </Link>
            <Link href="/join">
              <Button
                variant="outline"
                size="lg"
                className="border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white px-8 py-4 bg-transparent"
              >
                Become an Entrepreneur
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
