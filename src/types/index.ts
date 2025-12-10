// Barrel file for type exports
export type {
  BaseShape,
  ShapeType,
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
  LineShape,
  StampShape,
  StampSizePreset,
  SvgBackgroundShape,
  Shape,
} from './shape'

export type { ToolType, ModeType } from './tools'

export type { HistoryAction, HistoryEntry, HistoryState } from './history'

export type { AppState, CanvasDimensions } from './store'

export type { FillPoint } from './fill'

export type {
  TemplateCategory,
  TemplateSource,
  PathShape,
  TemplateShape,
  TemplateViewBox,
  TemplateDefinition,
  TemplateRegistry,
  TemplateLoadingState,
} from './template'

export type {
  GeneratorTheme,
  GeneratorStyle,
  GeneratorDifficulty,
  CompositionRules,
  MagicGeneratorConfig,
  ThemeShapeType,
  ThemeShapeDefinition,
  ThemeDefinition,
  DifficultyParams,
  GenerationMetadata,
  GenerationResult,
} from './generator'

export type {
  BackgroundType,
  BackgroundConfig,
  BackgroundState,
  NoneBackgroundConfig,
  SolidBackgroundConfig,
  GradientBackgroundConfig,
  GradientStop,
  GradientMode,
  SceneBackgroundConfig,
  SceneId,
  AnimatedBackgroundConfig,
  AnimationId,
  AnimationIntensity,
  BackgroundPreset,
} from './background'

export {
  DEFAULT_BACKGROUND,
  SOLID_PRESETS,
  GRADIENT_PRESETS,
  SCENE_PRESETS,
  ANIMATED_PRESETS,
  ALL_PRESETS,
} from './background'
