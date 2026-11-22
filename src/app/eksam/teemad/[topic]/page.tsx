import { notFound } from "next/navigation";
import { ExamRunner } from "@/features/exam/ExamRunner";
import { isTopic } from "@/features/exam/score";

export default async function ExamTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!isTopic(topic)) notFound();
  return <ExamRunner topic={topic} />;
}
