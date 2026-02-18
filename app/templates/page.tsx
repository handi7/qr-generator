"use client";

import { motion } from "framer-motion";
import { ArrowRight, ContactRound, Link2, MessageCircle, Sparkles, Wifi } from "lucide-react";
import Link from "next/link";

const templates = [
  {
    title: "Free Text",
    subtitle: "Universal",
    description: "Create a QR code from any URL or custom text for campaigns, docs, and labels.",
    href: "/studio?template=text",
    accent: "from-primary/20 via-sky-400/15 to-emerald-300/10",
    icon: Link2,
    highlights: ["Instant setup", "Works everywhere", "Great for links"],
  },
  {
    title: "WiFi",
    subtitle: "Hospitality",
    description: "Let people connect to your network by scanning once instead of typing credentials.",
    href: "/studio?template=wifi",
    accent: "from-sky-500/20 via-cyan-400/15 to-primary/10",
    icon: Wifi,
    highlights: ["Faster check-in", "Fewer support asks", "Event-friendly"],
  },
  {
    title: "WhatsApp",
    subtitle: "Conversion",
    description: "Open a WhatsApp chat with prefilled text to speed up inquiries and sales.",
    href: "/studio?template=wa",
    accent: "from-emerald-500/20 via-green-400/15 to-teal-300/10",
    icon: MessageCircle,
    highlights: ["Prefilled message", "Higher engagement", "Simple CTA"],
  },
  {
    title: "Contact vCard",
    subtitle: "Networking",
    description: "Share complete contact details in one scan, including multiple phones and emails.",
    href: "/studio?template=contact",
    accent: "from-violet-500/20 via-indigo-400/15 to-sky-300/10",
    icon: ContactRound,
    highlights: ["Rich profile", "Mobile-friendly", "Save to contacts"],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function TemplatesPage() {
  return (
    <main className="relative min-h-[calc(100dvh-4rem)] overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-8%] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-6%] top-12 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-7xl"
      >
        <motion.div variants={item} className="mb-8 text-center sm:mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles size={14} />
            Choose Your Starting Point
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Templates built for real workflows
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/75 sm:text-base">
            Start from a purpose-built template, customize style in Studio, and export in seconds.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:gap-5">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <motion.article key={template.title} variants={item}>
                <Link
                  href={template.href}
                  className="group relative block overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:p-6"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${template.accent}`} />

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-primary/90">
                          {template.subtitle}
                        </p>
                        <h2 className="text-xl font-semibold">{template.title}</h2>
                      </div>

                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-background/80 text-primary">
                        <Icon size={18} />
                      </span>
                    </div>

                    <p className="text-sm text-foreground/75">{template.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {template.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full border border-foreground/10 bg-background/80 px-2.5 py-1 text-xs text-foreground/80"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Open in Studio
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </motion.section>
    </main>
  );
}
