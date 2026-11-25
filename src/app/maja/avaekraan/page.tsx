"use client";

import { home } from "@/content";
import { homeModule } from "@/features/home";
import { LessonHouse } from "@/features/lessons";
import { RequireOs, useOs } from "@/features/os";

/** The Home screen house: 9 lessons on the Home screen replica. */
export default function HomeScreenHousePage() {
  return (
    <RequireOs>
      <HomeScreenHouse />
    </RequireOs>
  );
}

function HomeScreenHouse() {
  const { os } = useOs();
  return <LessonHouse house={home} module={homeModule} os={os!} />;
}
