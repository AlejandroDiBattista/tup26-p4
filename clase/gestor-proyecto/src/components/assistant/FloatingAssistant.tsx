import { useCallback, useRef, useState } from 'react'
import { ArrowUp, Bot, ExternalLink, LoaderCircle, MessageCircle, Plus, X } from 'lucide-react'
import { useAssistant } from '../../hooks/useAssistant'
import { useAssistantShortcut } from '../../hooks/useAssistantShortcut'
import { shortcutModifier } from '../layout/navigation'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Alert } from '../ui/alert'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty'
import { Message, MessageContent } from '../ui/message'
import { Bubble, BubbleContent } from '../ui/bubble'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '../ui/input-group'
import AssistantMarkdown from './AssistantMarkdown'
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '../ui/message-scroller'

// Presenta el asistente flotante y conserva la conversación al navegar.
export function FloatingAssistant({ actualizar }: { actualizar: () => Promise<unknown> }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const campo = useRef<HTMLTextAreaElement>(null)
  const chat = useAssistant(actualizar)
  const abrir = useCallback(() => setAbierto(true), [])
  useAssistantShortcut(abrir, campo)

  // Envía el texto escrito sin perderlo cuando está vacío.
  function enviar() {
    const mensaje = texto.trim()
    if (!mensaje || chat.esperando) return
    setTexto('')
    void chat.enviar(mensaje)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {abierto && (
        <Card
          as="section"
          role="dialog"
          aria-label="Asistente de Trama"
          className="assistant-chat mb-3 flex gap-0 py-0 h-[min(38rem,calc(100dvh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        >
          <CardHeader
            as="header"
            className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 [.border-b]:pb-3"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-900 text-white">
              <Bot size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle as="h2" className="text-sm font-semibold leading-5">
                Asistente de Trama
              </CardTitle>
              <CardDescription as="p" className="text-xs text-zinc-500">
                Consultá y organizá tu trabajo
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Nueva conversación"
              aria-label="Nueva conversación"
              disabled={chat.esperando}
              onClick={chat.limpiar}
            >
              <Plus size={16} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar asistente"
              onClick={() => setAbierto(false)}
            >
              <X size={16} />
            </Button>
          </CardHeader>
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-4 px-4 py-5">
                  {chat.mensajes.length === 0 && (
                    <Empty className="min-h-64 gap-3 rounded-none px-4 py-0 text-sm text-zinc-500">
                      <EmptyMedia className="mb-0 grid size-10 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
                        <MessageCircle size={20} aria-hidden="true" />
                      </EmptyMedia>
                      <EmptyTitle className="font-semibold tracking-normal text-zinc-900">
                        ¿En qué te puedo ayudar?
                      </EmptyTitle>
                      <EmptyDescription className="text-sm leading-5 text-zinc-500">
                        Podés pedirme que busque tareas, asigne responsables o actualice proyectos.
                      </EmptyDescription>
                    </Empty>
                  )}
                  {chat.mensajes.map((mensaje) => (
                    <MessageScrollerItem
                      key={mensaje.id}
                      messageId={mensaje.id}
                      scrollAnchor={mensaje.autor === 'usuario'}
                    >
                      <Message align={mensaje.autor === 'usuario' ? 'end' : 'start'}>
                        <MessageContent>
                          <Bubble
                            align={mensaje.autor === 'usuario' ? 'end' : 'start'}
                            variant={mensaje.autor === 'usuario' ? 'muted' : 'ghost'}
                          >
                            <BubbleContent className="leading-relaxed">
                              {mensaje.autor === 'asistente' ? (
                                <AssistantMarkdown texto={mensaje.texto} />
                              ) : (
                                <span className="whitespace-pre-wrap">{mensaje.texto}</span>
                              )}
                            </BubbleContent>
                          </Bubble>
                          {mensaje.destino && (
                            <Button
                              variant="ghost"
                              type="button"
                              className="inline-flex h-auto w-fit items-center gap-1 p-0 text-xs font-medium text-zinc-600 underline underline-offset-4 hover:bg-transparent hover:text-zinc-950"
                              onClick={() => chat.abrir(mensaje.destino!.ruta)}
                            >
                              {mensaje.destino.etiqueta}
                              <ExternalLink size={12} />
                            </Button>
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                  {chat.esperando && (
                    <p role="status" className="flex items-center gap-2 text-sm text-zinc-500">
                      <LoaderCircle size={15} className="animate-spin" />
                      Consultando…
                    </p>
                  )}
                  {chat.error && (
                    <Alert className="block rounded-lg border-0 bg-red-50 p-3 text-sm text-red-700">
                      {chat.error}
                    </Alert>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
          <form
            className="p-4 pt-2"
            onSubmit={(event) => {
              event.preventDefault()
              enviar()
            }}
          >
            <InputGroup className="assistant-composer h-auto flex-col items-stretch rounded-2xl bg-zinc-100 shadow-none">
              <InputGroupTextarea
                ref={campo}
                aria-label="Mensaje para el asistente"
                placeholder="Escribí tu consulta…"
                rows={2}
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    enviar()
                  }
                }}
                className="max-h-32 min-h-16 px-3 py-3 text-sm"
              />
              <InputGroupAddon align="block-end" className="justify-end p-2 pt-0">
                <Button
                  type="submit"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Enviar mensaje"
                  disabled={!texto.trim() || chat.esperando}
                >
                  <ArrowUp size={16} />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </Card>
      )}
      <Button
        type="button"
        size="icon-lg"
        className="ml-auto flex size-12 rounded-full shadow-lg"
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente'}
        title={abierto ? 'Cerrar asistente' : `Abrir asistente (${shortcutModifier()} A)`}
        aria-expanded={abierto}
        onClick={() => {
          setAbierto(!abierto)
          if (!abierto) requestAnimationFrame(() => campo.current?.focus())
        }}
      >
        {abierto ? <X size={19} /> : <MessageCircle size={20} />}
      </Button>
    </div>
  )
}
