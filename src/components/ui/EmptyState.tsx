import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
      <View className="mb-3 h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
        <Ionicons name="sparkles" size={18} color="#4338ca" />
      </View>
      <Text className="text-base font-bold text-slate-900">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-slate-600">{description}</Text>
      {action ? <View className="mt-3">{action}</View> : null}
    </View>
  );
}
