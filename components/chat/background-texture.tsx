import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

type Props = {
  color: string;
};

// Granulado sutil de fondo (puntitos repetidos vía patrón SVG) para dar textura sin
// pesar como una imagen; se reusa en chat, catálogo, carrito y admin con distintos colores.
export function BackgroundTexture({ color }: Props) {
  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        <Pattern id="grain" width={16} height={16} patternUnits="userSpaceOnUse">
          <Circle cx={2} cy={2} r={1} fill={color} />
          <Circle cx={10} cy={7} r={1} fill={color} />
          <Circle cx={5} cy={12} r={1} fill={color} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#grain)" />
    </Svg>
  );
}
