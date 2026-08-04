"use client";

import Link from "next/link";

import { type Variants, motion } from "framer-motion";
import {
  ArrowRight,
  FileDown,
  FileJson,
  HardDrive,
  Link2,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import Icon from "@/components/Shared/Icon";
import HeroQr from "@/components/hero-qr";
import { templates } from "@/constants/template.data";

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

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Opt-in via the `featured` flag rather than a positional slice, so adding a
// template is a decision about whether it belongs here — not a silent omission.
const featuredTemplates = templates.filter((template) => template.featured);

export default function HomePageClient() {
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
            GaweQR gives you a beautiful workflow to generate links, WiFi access, WhatsApp messages,
            contact cards, and email. Scan a QR you already have — even a QRIS — to restyle it
            without retyping a thing. Every style setting stays in the URL, so your designs are easy
            to reuse and share.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Link
              href="/studio?template=text"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-primary/30 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Start Creating
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/studio?scan=1"
              className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background/70 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-foreground/5"
            >
              <ScanLine size={16} />
              Scan a QR
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground/65 sm:text-sm"
          >
            <li className="inline-flex items-center gap-1.5">
              <UserRoundCheck size={14} className="text-primary" />
              No sign-up needed
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              Nothing leaves your device
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Link2 size={14} className="text-primary" />
              Designs shareable via URL
            </li>
            <li className="inline-flex items-center gap-1.5">
              <FileDown size={14} className="text-primary" />
              Free PNG, SVG, JPEG &amp; WEBP export
            </li>
          </motion.ul>
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
                <p className="text-lg font-semibold">Contact QR</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-500">
                Ready to scan
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <div className="mx-auto h-40 w-40 rounded-2xl border border-foreground/10 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(25,194,160,0.18),rgba(66,103,178,0.25),rgba(25,194,160,0.18))] p-3">
                <div className="h-full w-full rounded-xl bg-background/90 p-2.5">
                  <HeroQr className="h-full w-full text-foreground" />
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
        <motion.h2 variants={item} className="mb-5 text-xl font-semibold sm:text-2xl">
          What You Can Generate
        </motion.h2>

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
                  <h3 className="mb-2 text-base font-semibold">{template.title}</h3>
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
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto mt-16 w-full max-w-7xl"
      >
        <motion.h2 variants={item} className="mb-5 text-xl font-semibold sm:text-2xl">
          How It Works
        </motion.h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Start fresh or scan",
              description:
                "Pick a template — link, WiFi, WhatsApp, contact, or email — or scan a code you already have with the camera, an image, or a paste.",
            },
            {
              step: "2",
              title: "Style it in Studio",
              description:
                "Tune colors, dot shapes, corners, and margins with a live preview of every change. Scanning keeps your style and swaps only the content.",
            },
            {
              step: "3",
              title: "Download, share, or save",
              description:
                "Export in PNG, SVG, JPEG, or WEBP, or keep it in My QR to reopen later. Every style setting stays in the URL, so anyone opening your link sees the same design.",
            },
          ].map((step) => (
            <motion.div
              key={step.step}
              variants={item}
              className="rounded-2xl border border-foreground/10 bg-background/70 p-5 backdrop-blur"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
                {step.step}
              </span>
              <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-foreground/70">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto mt-16 w-full max-w-7xl"
      >
        <motion.h2 variants={item} className="mb-2 text-xl font-semibold sm:text-2xl">
          Your Codes Stay Yours
        </motion.h2>

        <motion.p variants={item} className="mb-5 max-w-2xl text-sm text-foreground/70">
          Save the codes you use often and pick them up again later. There is no account, and no
          server holding any of it.
        </motion.p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: HardDrive,
              title: "Saved on your device",
              description:
                "Keep codes in My QR, rename them, and reopen any of them in Studio exactly as you left them — logo included.",
            },
            {
              icon: FileJson,
              title: "Backup and restore",
              description:
                "Export everything to a JSON file and load it back on another browser. Clearing your browsing data is the only thing that can remove them.",
            },
            {
              icon: ShieldCheck,
              title: "No accounts, ever",
              description:
                "Nothing you scan or save is uploaded. Saved codes are stored unencrypted in this browser, so delete them on a shared computer.",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="rounded-2xl border border-foreground/10 bg-background/70 p-5 backdrop-blur"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon size={18} />
              </span>
              <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
              <p className="text-sm text-foreground/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="mt-6 flex justify-center">
          <Link
            href="/my-qr"
            className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background/70 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-foreground/5"
          >
            Open My QR
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
          <h2 className="text-2xl font-semibold">Ready to ship your next QR campaign?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/75 sm:text-base">
            Start with one template, tweak colors and shapes, then download instantly in PNG, SVG,
            JPEG, or WEBP.
          </p>
          <Link
            href="/studio?template=text"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-primary/25 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Launch Generator
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
