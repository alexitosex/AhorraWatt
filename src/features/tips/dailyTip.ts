const tips = [
  "Desconecta cargadores y aparatos en standby: siguen consumiendo aunque estén apagados.",
  "Ajusta el aire acondicionado a 24 °C o más: cada grado menos aumenta el consumo.",
  "Cambia focos incandescentes por LED: dan la misma luz con mucha menos energía.",
  "Revisa el empaque del refrigerador: si no cierra bien, el motor trabaja de más.",
  "Lava con carga completa y agua fría: calentar agua es lo que más energía usa.",
  "Apaga las luces de los cuartos vacíos y aprovecha la luz natural durante el día.",
];

export function dailyTip(date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / 86_400_000,
  );
  return tips[dayOfYear % tips.length];
}
