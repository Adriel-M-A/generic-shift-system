import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs'

export interface TabDef {
  value: string
  label: React.ReactNode
  content: React.ReactNode
}

interface TabsSectionProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  tabs: TabDef[]
  defaultValue?: string
  className?: string
}

export default function TabsSection({
  title,
  subtitle,
  tabs,
  defaultValue,
  className = ''
}: TabsSectionProps) {
  const defaultTab = defaultValue || (tabs.length ? tabs[0].value : '')

  if (!defaultTab) {
    return (
      <div
        className={`h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center ${className}`}
      >
        <div className="h-12 w-12 mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Acceso Restringido</h2>
        <p>No tienes permisos para ver esta sección.</p>
      </div>
    )
  }

  return (
    <div
      className={`p-8 h-full flex flex-col space-y-6 overflow-hidden bg-background ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>

      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="justify-start bg-transparent border-b rounded-none h-auto p-0 space-x-4 w-full">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="tabs-trigger-style">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto pt-6 custom-scrollbar">
          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="m-0 outline-none">
              {t.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
