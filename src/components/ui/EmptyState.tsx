import { ReactNode } from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <Text className="text-base font-semibold text-slate-900">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-slate-600">{description}</Text>
      {action ? <View className="mt-3">{action}</View> : null}
    </View>
  );
}
