"use client";
import dynamic from 'next/dynamic'

const Dashboard = dynamic(
  () => import('./_component/dashboard'),
  { ssr: false }
)

const Page = () => {
  return <Dashboard />;
};

export default Page;
