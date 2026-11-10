import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Separator } from '../ui/separator'

const markdownComponents: Components = {
  // Abre los enlaces externos de las respuestas en otra pestaña.
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // Presenta las tablas de Markdown con el componente compartido.
  table: ({ children }) => <Table className="w-auto">{children}</Table>,
  // Conserva el encabezado semántico de las tablas.
  thead: ({ children }) => <TableHeader className="[&_tr]:border-0">{children}</TableHeader>,
  // Agrupa las filas del cuerpo de las tablas.
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  // Mantiene las filas estáticas de las respuestas sin efecto de selección.
  tr: ({ children }) => (
    <TableRow className="border-0 transition-none hover:bg-transparent">{children}</TableRow>
  ),
  // Conserva el tamaño y el ajuste de línea de los encabezados.
  th: ({ children }) => (
    <TableHead scope="col" className="h-auto whitespace-normal font-bold">
      {children}
    </TableHead>
  ),
  // Permite que el texto largo de una celda se ajuste al ancho del chat.
  td: ({ children }) => <TableCell className="whitespace-normal">{children}</TableCell>,
  // Renderiza los separadores del mensaje con shadcn.
  hr: () => <Separator />,
}

// Presenta las respuestas del asistente como Markdown sin interpretar HTML.
export default function AssistantMarkdown({ texto }: { texto: string }) {
  return (
    <div className="assistant-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={markdownComponents}>
        {texto}
      </ReactMarkdown>
    </div>
  )
}
