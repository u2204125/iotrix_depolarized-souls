"use client"

import React from "react"
import { Helmet } from "react-helmet"

export default function PageHead({ title = "Manager Dashboard — IOTrix" }) {
  // Simple neon glyph SVG as favicon (data URL) to avoid external files
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <defs>
      <linearGradient id='g' x1='0' x2='1'>
        <stop offset='0' stop-color='#00F5A0' />
        <stop offset='1' stop-color='#00C2FF' />
      </linearGradient>
      <filter id='f' x='-20%' y='-20%' width='140%' height='140%'>
        <feGaussianBlur stdDeviation='2' result='b' />
        <feMerge><feMergeNode in='b'/><feMergeNode in='SourceGraphic'/></feMerge>
      </filter>
    </defs>
    <rect width='100' height='100' rx='20' fill='#071026' />
    <g filter='url(#f)'>
      <circle cx='35' cy='50' r='18' fill='url(#g)' opacity='0.95' />
      <path d='M54 34c6 6 6 18 0 24-6 6-18 6-24 0' stroke='url(#g)' stroke-width='4' fill='none' stroke-linecap='round' stroke-linejoin='round' />
    </g>
  </svg>
  `

  const favicon = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="icon" href={favicon} />
      <meta name="theme-color" content="#071026" />
    </Helmet>
  )
}
