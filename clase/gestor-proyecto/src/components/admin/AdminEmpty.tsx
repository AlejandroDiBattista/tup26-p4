import type { LucideIcon } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'

type Props = {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; run: () => void }
}

// Explica un listado vacío y ofrece una acción para continuar.
export function AdminEmpty({ icon: Icon, title, description, action }: Props) {
  return (
    <Empty className="rounded-none py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={action.run}>
            {action.label}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
