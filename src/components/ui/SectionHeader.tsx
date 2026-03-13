import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export function SectionHeader({ title, subtitle, eyebrow }: SectionHeaderProps) {
  return (
    <View className="mb-3">
      {eyebrow ? (
        <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.5px] text-indigo-600">{eyebrow}</Text>
      ) : null}
      <Text className="text-xl font-extrabold tracking-tight text-slate-900">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm leading-5 text-slate-600">{subtitle}</Text> : null}
    </View>
  );
}
