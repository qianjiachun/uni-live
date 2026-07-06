import { LiveRoomClient } from "@/components/live/LiveRoomClient";

interface PageProps {
  searchParams: Promise<{
    video?: string;
    danmaku?: string;
    layoutMode?: string;
    lineCount?: string;
    grid?: string;
    showType?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <LiveRoomClient
      shareVideo={params.video ?? null}
      shareDanmaku={params.danmaku ?? null}
      shareLayoutMode={params.layoutMode ?? null}
      shareLineCount={params.lineCount ?? null}
      shareGrid={params.grid ?? null}
      legacyShowType={params.showType ?? null}
    />
  );
}
