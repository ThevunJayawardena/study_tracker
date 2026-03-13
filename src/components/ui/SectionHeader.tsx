import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="mb-3">
      <Text className="text-lg font-semibold text-slate-900">{title}</Text>
      {subtitle ? <Text className="mt-0.5 text-sm text-slate-500">{subtitle}</Text> : null}
    </View>
  );
}
