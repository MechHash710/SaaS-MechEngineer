# UI Components Design System

Este documento serve como referência de uso dos componentes base do Design System.

## Button (`Button.tsx`)

Botão base com variantes e estados.

```tsx
import { Button } from '@/components/ui';

// Variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Estados e Props
<Button loading>Salvando...</Button>
<Button disabled>Inativo</Button>
<Button fullWidth>Largura Total</Button>
<Button icon={<Icon />}>Com Ícone</Button>
```

## Select (`Select.tsx`)

Select customizado compatível com React Hook Form.

```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'sp', label: 'São Paulo, SP' },
  { value: 'rj', label: 'Rio de Janeiro, RJ' },
];

<Select 
  label="Estado"
  options={options}
  placeholder="Selecione um estado"
  description="Estado para base de cálculo GHI"
  error="Campo obrigatório" // Mostra erro
  tooltip="Informação extra ao lado do label" 
/>
```

## Modal (`Modal.tsx`)

Overlay centralizado com backdrop blur e tecla ESC para fechar.

```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

const Example = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Configurações Avançadas"
        size="md" // sm | md | lg
      >
        <p>Conteúdo do modal...</p>
      </Modal>
    </>
  );
};
```

## Toast (`Toast.tsx`)

Alertas flutuantes auto-dispensáveis no canto inferior direito.

```tsx
// 1. Envolver a aplicação com o Provider no App.tsx ou main.tsx
import { ToastProvider } from '@/components/ui';

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

// 2. Uso dentro dos componentes
import { useToast, Button } from '@/components/ui';

const Example = () => {
  const toast = useToast();

  return (
    <div className="flex gap-2">
      <Button onClick={() => toast.success('Salvo com sucesso!')}>Sucesso</Button>
      <Button variant="danger" onClick={() => toast.error('Falha de conexão')}>Erro</Button>
      <Button variant="secondary" onClick={() => toast.warning('Atenção: Sobrecarga', 'Aviso')}>Atenção</Button>
      <Button variant="ghost" onClick={() => toast.info('Nova atualização disponível')}>Info</Button>
    </div>
  );
};
```

## DataTable (`DataTable.tsx`)

Tabela para visualização de dados em formato lista, com flexibilidade usando Render Props.

```tsx
import { DataTable } from '@/components/ui';

const data = [
  { id: 1, name: 'João', role: 'Engenheiro' },
  { id: 2, name: 'Ana', role: 'Arquiteta' }
];

const columns = [
  { key: 'id', header: 'ID', className: 'w-16 text-center' },
  { key: 'name', header: 'Nome do Profissional' },
  { 
    key: 'role', 
    header: 'Função', 
    render: (row) => <span className="font-bold">{row.role}</span> 
  }
];

<DataTable 
  data={data} 
  columns={columns} 
  emptyMessage="Nenhum usuário cadastrado."
/>
```
