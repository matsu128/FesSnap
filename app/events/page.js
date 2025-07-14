"use client";
// イベントリストページ
import EventListMain from '../../components/organisms/EventListMain';
import { Suspense } from 'react';
 
export default function EventsPage() {
  return (
    <Suspense>
      <EventListMain />
    </Suspense>
  );
} 