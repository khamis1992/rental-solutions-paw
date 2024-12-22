import { useUserStats } from "./hooks/useUserStats";

export const UserStats = () => {
  const { data, isLoading, error } = useUserStats();

  if (isLoading) return <div>Loading user statistics...</div>;
  if (error) return <div>Error loading user statistics</div>;

  return (
    <div className="space-y-2">
      <p>Total Customers: {data?.customerCount}</p>
      <p>Total Admins: {data?.adminCount}</p>
    </div>
  );
};