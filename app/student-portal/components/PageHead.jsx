"use client"

import React from 'react'
import { Helmet } from 'react-helmet'

export default function StudentPageHead({ title = 'Student Portal — IOTrix' }) {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='20' fill='#071026' />
    <circle cx='50' cy='50' r='24' fill='#FF758C' opacity='0.9' />
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
