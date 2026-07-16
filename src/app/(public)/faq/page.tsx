import type { Metadata } from "next";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getFaqsByCategory } from "@/lib/services/public";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.faq.title,
  description: ar.metadata.faq.description,
};

export default async function FaqPage() {
  const groups = await getFaqsByCategory();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.faq.title}
        </h1>
        <p className="mt-4 text-lg leading-loose text-muted-ink">{ar.faq.lead}</p>
      </header>

      {groups.length > 0 ? (
        <div className="mt-10 space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="mb-2 text-lg font-semibold text-teal">
                {group.category}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {group.items.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.questionAr}</AccordionTrigger>
                    <AccordionContent>{faq.answerAr}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-line bg-card p-8 text-center text-muted-ink">
          {ar.faq.empty}
        </p>
      )}
    </div>
  );
}
