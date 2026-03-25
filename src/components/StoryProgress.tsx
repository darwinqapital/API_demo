import { type StageInfo, type DemoStage } from '../types/wedbush'

interface Props {
  stages: StageInfo[]
  currentStage: DemoStage
  completedStages: DemoStage[]
  onStageClick: (stage: DemoStage) => void
}

export function StoryProgress({ stages, currentStage, completedStages, onStageClick }: Props) {
  return (
    <nav className="story-progress" aria-label="Demo stages">
      {stages.map((stage, i) => {
        const isActive = stage.id === currentStage
        const isCompleted = completedStages.includes(stage.id)
        const cls = [
          'story-step',
          isActive && 'story-step--active',
          isCompleted && 'story-step--completed',
        ].filter(Boolean).join(' ')

        return (
          <button
            key={stage.id}
            className={cls}
            onClick={() => onStageClick(stage.id)}
            aria-current={isActive ? 'step' : undefined}
            type="button"
          >
            <span className="story-step__dot" aria-hidden="true" />
            <span>
              {i + 1}. {stage.label}
            </span>
            {isCompleted && <span className="sr-only">(completed)</span>}
          </button>
        )
      })}
    </nav>
  )
}
