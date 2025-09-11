"use client"

import * as React from "react"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = ({
  ...props
}: React.ComponentProps<"div"> & {
  content: React.ReactNode
  cursor?: boolean
}) => <div {...props} />

const ChartTooltipContent = ({
  ...props
}: React.ComponentProps<"div"> & {
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
}) => <div {...props} />

const ChartLegend = ({
  ...props
}: React.ComponentProps<"div"> & {
  content: React.ReactNode
}) => <div {...props} />

const ChartLegendContent = ({ ...props }: React.ComponentProps<"div">) => (
  <div {...props} />
)

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
