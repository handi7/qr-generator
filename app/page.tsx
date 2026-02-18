"use client";

import Icon from "@/components/Shared/Icon";
import { templates } from "@/constants/template.data";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const featuredTemplates = templates.slice(0, 4);

export default function Home() {
  return (
    <main className="relative min-h-[calc(100dvh-4rem)] overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[-8%] top-8 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000,transparent_90%)]" />
      </div>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
      >
        <div className="space-y-6">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            <Sparkles size={14} />
            Fast, custom, and shareable
          </motion.span>

          <motion.h1
            variants={item}
            className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Build QR codes that feel crafted, not generic.
          </motion.h1>

          <motion.p variants={item} className="max-w-xl text-sm text-foreground/75 sm:text-base">
            QR Studio gives you a beautiful workflow to generate links, WiFi access, WhatsApp
            messages, and contact cards. Every style setting stays in the URL, so your designs are
            easy to reuse and share.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Link
              href="/studio?template=text"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Start Creating
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/studio?template=contact"
              className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background/70 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-foreground/5"
            >
              Try Contact vCard
            </Link>
          </motion.div>
        </div>

        <motion.div variants={item} className="relative mx-auto w-full max-w-lg">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 0.8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/75 p-6 shadow-xl shadow-primary/10 backdrop-blur"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground/65">Live Preview</p>
                <h2 className="text-lg font-semibold">Contact QR</h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-500">
                Ready to scan
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <div className="mx-auto h-40 w-40 rounded-2xl border border-foreground/10 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(25,194,160,0.18),rgba(66,103,178,0.25),rgba(25,194,160,0.18))] p-3">
                <div className="h-full w-full rounded-xl bg-background/90 p-3">
                  <div className="grid h-full w-full grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`rounded-sm ${idx % 2 === 0 || idx % 7 === 0 ? "bg-foreground" : "bg-foreground/20"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-foreground/80">
                <p className="font-medium text-foreground">John Doe</p>
                <p>Senior Developer at Acme Inc.</p>
                <p>+123 456 789</p>
                <p>john@acme.dev</p>
                <p className="truncate">https://acme.dev</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto mt-16 w-full max-w-7xl"
      >
        <motion.h3 variants={item} className="mb-5 text-xl font-semibold sm:text-2xl">
          What You Can Generate
        </motion.h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredTemplates.map((template) => {
            return (
              <motion.div key={template.title} variants={item}>
                <Link
                  href={template.href}
                  className="group block rounded-2xl border border-foreground/10 bg-background/70 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={template.icon} size={18} />
                  </span>
                  <h4 className="mb-2 text-base font-semibold">{template.title}</h4>
                  <p className="text-sm text-foreground/70">{template.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div variants={item} className="mt-6 flex justify-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background/70 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-foreground/5"
          >
            View All Templates
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-16 w-full max-w-5xl"
      >
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-sky-400/10 to-emerald-300/15 px-6 py-8 text-center backdrop-blur sm:px-8">
          <h5 className="text-2xl font-semibold">Ready to ship your next QR campaign?</h5>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/75 sm:text-base">
            Start with one template, tweak colors and shapes, then download instantly in PNG, SVG,
            JPEG, or WEBP.
          </p>
          <Link
            href="/?template=text"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Launch Generator
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
