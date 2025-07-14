"use client";
import { Suspense } from "react";
import AdminMain from '../../components/organisms/AdminMain';
 
export default function AdminPage() {
  return (
    <Suspense>
      <AdminMain />
    </Suspense>
  );
} 