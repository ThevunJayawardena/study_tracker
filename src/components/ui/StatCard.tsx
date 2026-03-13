import { ReactNode } from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  accent?: string;
  rightContent?: ReactNode;
}

export function StatCard({ label, value, helper, accent = "#2563eb", rightContent }: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</Text>
        <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
      </View>
      <Text className="text-2xl font-bold text-slate-900">{value}</Text>
      {helper ? <Text className="mt-1 text-sm text-slate-500">{helper}</Text> : null}
      {rightContent ? <View className="mt-3">{rightContent}</View> : null}
    </View>
  );
}
