import SimulatorPage from "../../components/SimulatorPage";
import { getDictionary } from "../../lib/getDictionary";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === "en" ? "en" : "es";
  const dict = await getDictionary(locale);

  return <SimulatorPage dict={dict} locale={locale} />;
}