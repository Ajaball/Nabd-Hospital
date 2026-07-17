import type { Metadata } from "next";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPublishedFaqs } from "@/lib/queries";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.faq.title,
  description: ar.metadata.faq.description,
};

type Faq = { id: string; category: string; questionAr: string; answerAr: string };

/** Group FAQs by category, preserving first-seen order. */
function groupByCategory(faqs: Faq[]): { category: string; items: Faq[] }[] {
  const groups: { category: string; items: Faq[] }[] = [];
  for (const faq of faqs) {
    let group = groups.find((g) => g.category === faq.category);
    if (!group) {
      group = { category: faq.category, items: [] };
      groups.push(group);
    }
    group.items.push(faq);
  }
  return groups;
}

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  const groups = groupByCategory(faqs);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeading as="h1" title={ar.faq.title} lead={ar.faq.lead} />
      <PulseTrace variant="rule" className="my-10" />

      {groups.length === 0 ? (
        <p className="rounded-lg border border-line bg-card p-6 text-muted-ink">
          {ar.faq.empty}
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="mb-2 text-lg font-semibold text-teal">{group.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {group.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.questionAr}</AccordionTrigger>
                    <AccordionContent>{item.answerAr}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
